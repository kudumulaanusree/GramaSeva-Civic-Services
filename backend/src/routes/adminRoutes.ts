import { Router, type Request, type Response, type NextFunction } from "express";
import { createHmac, randomBytes, timingSafeEqual } from "node:crypto";
import {
  listSchemes,
  getSchemeById,
  saveScheme,
  deactivateScheme,
  generateSchemeId,
  verifyAdminPassword,
  getAdminSummary,
  type SchemeInput,
} from "../db/database.js";

const router = Router();
const SESSION_COOKIE = "gramaseva_admin";
const SESSION_TTL_SECONDS = 8 * 60 * 60; // 8 hours
const sessionSecret = process.env.SESSION_SECRET || "gramaseva-default-demo-session-secret-2026";

function signPayload(payload: string): string {
  return createHmac("sha256", sessionSecret).update(payload).digest("base64url");
}

function parseCookie(req: Request, name: string): string | undefined {
  const cookieHeader = req.headers.cookie;
  if (!cookieHeader) return undefined;
  const match = cookieHeader
    .split(";")
    .map((c) => c.trim())
    .find((c) => c.startsWith(`${name}=`));
  return match ? match.slice(name.length + 1) : undefined;
}

function verifyAdminSession(req: Request): boolean {
  // Check authorization header as well for simple token-based fallback
  const authHeader = req.headers.authorization;
  if (authHeader && authHeader.startsWith("Bearer ") && authHeader.slice(7) === "seva-demo-token") {
    return true;
  }

  const cookieVal = parseCookie(req, SESSION_COOKIE);
  if (!cookieVal) return false;

  const [payload, sig] = cookieVal.split(".");
  if (!payload || !sig) return false;

  const expectedSig = signPayload(payload);
  const expectedBuf = Buffer.from(expectedSig);
  const sigBuf = Buffer.from(sig);

  if (expectedBuf.length !== sigBuf.length || !timingSafeEqual(expectedBuf, sigBuf)) {
    return false;
  }

  try {
    const data = JSON.parse(Buffer.from(payload, "base64url").toString("utf-8"));
    return typeof data.expiresAt === "number" && data.expiresAt > Date.now();
  } catch {
    return false;
  }
}

function requireAdmin(req: Request, res: Response, next: NextFunction): void {
  if (!verifyAdminSession(req)) {
    res.status(401).json({ error: "Unauthorized. Please login to the demo admin portal." });
    return;
  }
  next();
}

// Session Check
router.get("/auth/session", (req: Request, res: Response) => {
  const isAuth = verifyAdminSession(req);
  res.json({ authenticated: isAuth, demoMode: true });
});

// Admin Login
router.post("/auth/session", (req: Request, res: Response) => {
  const { password } = req.body || {};
  if (!password || typeof password !== "string") {
    res.status(400).json({ error: "Password is required." });
    return;
  }

  if (!verifyAdminPassword(password)) {
    res.status(401).json({ error: "Invalid demo administrator password." });
    return;
  }

  const payload = Buffer.from(
    JSON.stringify({
      user: "demo-admin",
      nonce: randomBytes(16).toString("hex"),
      expiresAt: Date.now() + SESSION_TTL_SECONDS * 1000,
    })
  ).toString("base64url");

  const signature = signPayload(payload);
  const cookieStr = `${payload}.${signature}`;

  res.setHeader(
    "Set-Cookie",
    `${SESSION_COOKIE}=${cookieStr}; Path=/api; Max-Age=${SESSION_TTL_SECONDS}; HttpOnly; SameSite=Lax`
  );

  res.json({ authenticated: true, demoMode: true, token: "seva-demo-token" });
});

// Admin Logout
router.delete("/auth/session", (_req: Request, res: Response) => {
  res.setHeader(
    "Set-Cookie",
    `${SESSION_COOKIE}=; Path=/api; Max-Age=0; HttpOnly; SameSite=Lax`
  );
  res.status(204).end();
});

// Admin Summary
router.get("/summary", requireAdmin, (_req: Request, res: Response) => {
  try {
    const summary = getAdminSummary();
    res.json(summary);
  } catch (error) {
    console.error("Error fetching admin summary:", error);
    res.status(500).json({ error: "Failed to load summary." });
  }
});

// List All Schemes (including inactive)
router.get("/schemes", requireAdmin, (_req: Request, res: Response) => {
  try {
    const schemes = listSchemes({ includeInactive: true });
    res.json(schemes);
  } catch (error) {
    console.error("Error fetching admin schemes:", error);
    res.status(500).json({ error: "Failed to list schemes." });
  }
});

// Create Scheme
router.post("/schemes", requireAdmin, (req: Request, res: Response) => {
  try {
    const input: SchemeInput = req.body;
    if (!input.name || !input.summary || !input.category) {
      res.status(400).json({ error: "Name, summary, and category are required." });
      return;
    }

    const id = generateSchemeId(input.name);
    const created = saveScheme(id, {
      ...input,
      benefits: Array.isArray(input.benefits) ? input.benefits : [],
      documents: Array.isArray(input.documents) ? input.documents : [],
      applicationSteps: Array.isArray(input.applicationSteps) ? input.applicationSteps : [],
      keywords: Array.isArray(input.keywords) ? input.keywords : [],
      sourceType: input.sourceType || "demo",
      active: input.active !== false,
    });

    res.status(201).json(created);
  } catch (error) {
    console.error("Error creating scheme:", error);
    res.status(500).json({ error: "Failed to create scheme." });
  }
});

// Update Scheme
router.put("/schemes/:id", requireAdmin, (req: Request, res: Response) => {
  try {
    const id = req.params.id;
    const existing = getSchemeById(id);
    if (!existing) {
      res.status(404).json({ error: "Scheme not found." });
      return;
    }

    const input: SchemeInput = req.body;
    const updated = saveScheme(id, {
      ...existing,
      ...input,
      benefits: Array.isArray(input.benefits) ? input.benefits : existing.benefits,
      documents: Array.isArray(input.documents) ? input.documents : existing.documents,
      applicationSteps: Array.isArray(input.applicationSteps) ? input.applicationSteps : existing.applicationSteps,
      keywords: Array.isArray(input.keywords) ? input.keywords : existing.keywords,
      active: input.active !== undefined ? input.active : existing.active,
    });

    res.json(updated);
  } catch (error) {
    console.error("Error updating scheme:", error);
    res.status(500).json({ error: "Failed to update scheme." });
  }
});

// Deactivate Scheme
router.delete("/schemes/:id", requireAdmin, (req: Request, res: Response) => {
  try {
    const id = req.params.id;
    const success = deactivateScheme(id);
    if (!success) {
      res.status(404).json({ error: "Active scheme not found." });
      return;
    }
    res.status(204).end();
  } catch (error) {
    console.error("Error deactivating scheme:", error);
    res.status(500).json({ error: "Failed to deactivate scheme." });
  }
});

export default router;
