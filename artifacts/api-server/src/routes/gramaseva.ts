import {
  createHmac,
  randomBytes,
  timingSafeEqual,
} from "node:crypto";
import { Router, type IRouter, type Request, type Response } from "express";
import {
  CheckEligibilityBody,
  CheckEligibilityResponse,
  CreateSchemeBody,
  CreateSchemeResponse,
  DeactivateSchemeParams,
  GetAdminSessionResponse,
  GetAdminSummaryResponse,
  GetCategoriesResponse,
  GetSchemeParams,
  GetSchemeResponse,
  GetSchemesByCategoryParams,
  GetSchemesByCategoryResponse,
  ListAdminSchemesResponse,
  ListSchemesQueryParams,
  ListSchemesResponse,
  LoginAdminBody,
  LoginAdminBody,
  LoginAdminResponse,
  LogoutAdminResponse,
  ReportSchemeInformationBody,
  ReportSchemeInformationResponse,
  SearchSchemesQueryParams,
  SearchSchemesResponse,
  UpdateSchemeBody,
  UpdateSchemeParams,
  UpdateSchemeResponse,
  AskAssistantBody,
  AskAssistantResponse,
  type EligibilityInput,
  type Scheme,
} from "@workspace/api-zod";
import {
  getScheme,
  listSchemes,
  newSchemeId,
  saveScheme,
  sqlite,
  verifyAdminPassword,
} from "../lib/gramaseva-db";

const router: IRouter = Router();
const SESSION_COOKIE = "gramaseva_admin";
const SESSION_TTL_SECONDS = 8 * 60 * 60;
const sessionSecret = process.env.SESSION_SECRET;
const loginAttempts = new Map<string, { count: number; resetAt: number }>();

function signSession(payload: string): string {
  if (!sessionSecret) throw new Error("SESSION_SECRET is not configured.");
  return createHmac("sha256", sessionSecret).update(payload).digest("base64url");
}

function getCookie(req: Request, name: string): string | undefined {
  const cookieHeader = req.headers.cookie;
  if (!cookieHeader) return undefined;
  const prefix = `${name}=`;
  const part = cookieHeader.split(";").map((item) => item.trim()).find((item) => item.startsWith(prefix));
  return part?.slice(prefix.length);
}

function hasAdminSession(req: Request): boolean {
  const value = getCookie(req, SESSION_COOKIE);
  if (!value || !sessionSecret) return false;
  const [payload, signature] = value.split(".");
  if (!payload || !signature) return false;

  const expected = Buffer.from(signSession(payload));
  const received = Buffer.from(signature);
  if (expected.length !== received.length || !timingSafeEqual(expected, received)) {
    return false;
  }

  try {
    const session = JSON.parse(Buffer.from(payload, "base64url").toString("utf8")) as {
      expiresAt?: number;
      nonce?: string;
    };
    return typeof session.expiresAt === "number" &&
      session.expiresAt > Date.now() &&
      typeof session.nonce === "string";
  } catch {
    return false;
  }
}

function setSessionCookie(res: Response): void {
  const payload = Buffer.from(
    JSON.stringify({
      expiresAt: Date.now() + SESSION_TTL_SECONDS * 1000,
      nonce: randomBytes(18).toString("base64url"),
    }),
  ).toString("base64url");
  const signature = signSession(payload);
  const secure = process.env.NODE_ENV === "production" ? "; Secure" : "";
  res.setHeader(
    "Set-Cookie",
    `${SESSION_COOKIE}=${payload}.${signature}; HttpOnly; SameSite=Strict; Path=/api/admin; Max-Age=${SESSION_TTL_SECONDS}${secure}`,
  );
}

function clearSessionCookie(res: Response): void {
  const secure = process.env.NODE_ENV === "production" ? "; Secure" : "";
  res.setHeader(
    "Set-Cookie",
    `${SESSION_COOKIE}=; HttpOnly; SameSite=Strict; Path=/api/admin; Max-Age=0${secure}`,
  );
}

function requireAdmin(req: Request, res: Response, next: () => void): void {
  if (!hasAdminSession(req)) {
    res.status(401).json({ error: "Sign in to the demo admin area first." });
    return;
  }
  next();
}

function safeOfficialUrl(url: string | null | undefined): boolean {
  if (!url) return true;
  try {
    const parsed = new URL(url);
    return parsed.protocol === "https:" &&
      (parsed.hostname === "india.gov.in" ||
        parsed.hostname === "gov.in" ||
        parsed.hostname.endsWith(".gov.in"));
  } catch {
    return false;
  }
}

function normalizeInput(body: unknown, res: Response): ReturnType<typeof CreateSchemeBody.parse> | null {
  const parsed = CreateSchemeBody.safeParse(body);
  if (!parsed.success) {
    res.status(400).json({ error: parsed.error.message });
    return null;
  }
  if (!safeOfficialUrl(parsed.data.officialUrl)) {
    res.status(400).json({
      error: "Only HTTPS government-domain links may be marked as official.",
    });
    return null;
  }
  if (parsed.data.officialUrl && parsed.data.sourceType !== "verified") {
    res.status(400).json({
      error: "Mark a scheme as verified before adding an official link.",
    });
    return null;
  }
  return parsed.data;
}

const categoryNames: Record<string, string> = {
  agriculture: "Agriculture",
  education: "Education",
  health: "Health",
  housing: "Housing",
  employment: "Employment",
  "women-child": "Women & Child Welfare",
  pension: "Pension & Social Security",
  scholarships: "Scholarships",
  "skill-development": "Skill Development",
  "financial-support": "Financial Support",
};

function eligibilityReasons(
  scheme: Scheme,
  input: EligibilityInput,
): { score: number; reasons: string[] } {
  const reasons: string[] = [];
  let score = 0;
  const category = scheme.category;
  const jobSearch = input.occupation?.toLowerCase().includes("job") ||
    input.occupation?.toLowerCase().includes("unemploy") ||
    input.employmentStatus?.toLowerCase().includes("unemploy");

  if (input.farmer || input.occupation?.toLowerCase().includes("farm")) {
    if (category === "agriculture") {
      score += 6;
      reasons.push("You indicated that you are a farmer or work in agriculture.");
    }
  }
  if (input.student && (category === "education" || category === "scholarships")) {
    score += 6;
    reasons.push("You indicated that you are a student.");
  }
  if ((input.seniorCitizen || (input.age !== undefined && input.age >= 60)) &&
      category === "pension") {
    score += 6;
    reasons.push("You indicated that you may be in the senior-citizen age group.");
  }
  if (input.housingNeed && category === "housing") {
    score += 7;
    reasons.push("You indicated that you are looking for housing support.");
  }
  if (jobSearch && (category === "employment" || category === "skill-development")) {
    score += 5;
    reasons.push("You indicated that you are looking for work or training.");
  }
  if (input.disability && category === "pension") {
    score += 2;
    reasons.push("Some social-support programmes may have disability-related criteria.");
  }
  if (input.gender?.toLowerCase() === "female" && category === "women-child") {
    score += 3;
    reasons.push("This category includes programmes intended for women and families.");
  }
  if (input.rural && ["agriculture", "housing", "employment", "financial-support"].includes(category)) {
    score += 2;
    reasons.push("You indicated that you live in a rural area.");
  }
  if (input.annualIncome !== undefined && category === "financial-support") {
    score += 1;
    reasons.push("Some support programmes use household-income criteria; verify the rules locally.");
  }
  return { score, reasons };
}

const assistantSynonyms: Array<{ terms: string[]; add: string[] }> = [
  { terms: ["farmer", "farming", "agriculture", "రైతు", "వ్యవసాయ", "किसान", "खेती"], add: ["agriculture", "farmer", "రైతు", "किसान"] },
  { terms: ["student", "education", "school", "college", "scholarship", "విద్యార్థి", "విద్య", "छात्र", "शिक्षा"], add: ["education", "student", "scholarship", "విద్య", "छात्रवृत्ति"] },
  { terms: ["housing", "house", "home", "ఇల్లు", "గృహ", "आवास", "घर"], add: ["housing", "home", "rural", "ఆవాస్", "आवास"] },
  { terms: ["health", "hospital", "medical", "ఆరోగ్యం", "వైద్య", "स्वास्थ्य", "अस्पताल"], add: ["health", "hospital", "medical", "ఆరోగ్యం", "स्वास्थ्य"] },
  { terms: ["job", "work", "employment", "రोजगार", "ఉపాధి", "काम", "रोजगार"], add: ["employment", "job", "work", "rural", "ఉపాధి", "रोजगार"] },
  { terms: ["pension", "senior", "old age", "వృద్ధ", "పెన్షన్", "पेंशन", "वृद्ध"], add: ["pension", "senior", "social security", "పెన్షన్", "वृद्धावस्था"] },
  { terms: ["women", "woman", "child", "महिला", "మహిళ", "बच्चा"], add: ["women", "child", "household", "మహిళ", "महिला"] },
  { terms: ["skill", "training", "course", "నైపుణ్య", "శిక్షణ", "कौशल", "प्रशिक्षण"], add: ["skill", "training", "employment", "నైపుణ్యం", "कौशल"] },
];

const assistantStopWords = new Set([
  "which", "schemes", "scheme", "are", "available", "for", "me", "i", "need",
  "what", "the", "how", "can", "apply", "about", "tell", "please", "నాకు",
  "కావాలి", "ఏమైనా", "எனக்கு", "के", "लिए", "क्या", "हैं", "मुझे",
]);

function assistantSearch(message: string): Scheme[] {
  const normalized = message.trim().toLocaleLowerCase();
  const queryTerms = normalized
    .split(/[\s,.;!?।]+/)
    .filter((term) => term.length > 1 && !assistantStopWords.has(term));
  const expanded = new Set(queryTerms);
  for (const synonym of assistantSynonyms) {
    if (synonym.terms.some((term) => normalized.includes(term))) {
      synonym.add.forEach((term) => expanded.add(term));
    }
  }

  const schemes = listSchemes();
  const ranked = schemes
    .map((scheme) => {
      const searchText = [
        scheme.name,
        scheme.nameTe,
        scheme.nameHi,
        scheme.summary,
        scheme.summaryTe,
        scheme.summaryHi,
        scheme.description,
        scheme.category,
        scheme.keywords.join(" "),
      ].join(" ").toLocaleLowerCase();
      const matched = [...expanded].filter((term) => searchText.includes(term));
      return { scheme, score: matched.length };
    })
    .filter((entry) => entry.score > 0)
    .sort((left, right) => right.score - left.score || left.scheme.name.localeCompare(right.scheme.name));
  return ranked.slice(0, 5).map((entry) => entry.scheme);
}

router.get("/schemes", (req, res): void => {
  const parsed = ListSchemesQueryParams.safeParse(req.query);
  if (!parsed.success) {
    res.status(400).json({ error: parsed.error.message });
    return;
  }
  const schemes = listSchemes({ query: parsed.data.q, category: parsed.data.category });
  if (parsed.data.sort === "name") schemes.sort((a, b) => a.name.localeCompare(b.name));
  res.json(ListSchemesResponse.parse(schemes));
});

router.get("/schemes/search", (req, res): void => {
  const parsed = SearchSchemesQueryParams.safeParse(req.query);
  if (!parsed.success) {
    res.status(400).json({ error: parsed.error.message });
    return;
  }
  const results = listSchemes({ query: parsed.data.q });
  res.json(SearchSchemesResponse.parse(results));
});

router.get("/categories", (_req, res): void => {
  const rows = sqlite.prepare(`
    SELECT c.id, c.label, c.icon, COUNT(s.id) AS count
    FROM categories c
    LEFT JOIN schemes s ON s.category = c.id AND s.active = 1
    GROUP BY c.id, c.label, c.icon
    ORDER BY c.label
  `).all() as Array<{ id: string; label: string; icon: string; count: number }>;
  res.json(GetCategoriesResponse.parse(rows));
});

router.get("/schemes/category/:category", (req, res): void => {
  const parsed = GetSchemesByCategoryParams.safeParse(req.params);
  if (!parsed.success) {
    res.status(400).json({ error: parsed.error.message });
    return;
  }
  const results = listSchemes({ category: parsed.data.category });
  res.json(GetSchemesByCategoryResponse.parse(results));
});

router.get("/schemes/:id", (req, res): void => {
  const parsed = GetSchemeParams.safeParse(req.params);
  if (!parsed.success) {
    res.status(400).json({ error: parsed.error.message });
    return;
  }
  const scheme = getScheme(parsed.data.id);
  if (!scheme || !scheme.active) {
    res.status(404).json({ error: "Scheme not found." });
    return;
  }
  res.json(GetSchemeResponse.parse(scheme));
});

router.post("/eligibility/check", (req, res): void => {
  const parsed = CheckEligibilityBody.safeParse(req.body);
  if (!parsed.success) {
    res.status(400).json({ error: parsed.error.message });
    return;
  }
  const matches = listSchemes()
    .map((scheme) => ({ scheme, ...eligibilityReasons(scheme, parsed.data) }))
    .filter((match) => match.score > 0)
    .sort((a, b) => b.score - a.score || a.scheme.name.localeCompare(b.scheme.name))
    .slice(0, 8)
    .map(({ scheme, score, reasons }) => ({
      scheme,
      relevance: Math.min(100, score * 12),
      reasons,
    }));
  res.json(CheckEligibilityResponse.parse(matches));
});

router.post("/assistant/query", (req, res): void => {
  const parsed = AskAssistantBody.safeParse(req.body);
  if (!parsed.success) {
    res.status(400).json({ error: parsed.error.message });
    return;
  }
  const schemes = assistantSearch(parsed.data.message);
  const language = parsed.data.language;
  const answer = schemes.length === 0
    ? language === "te"
      ? "ఈ ప్రశ్నకు సరిపడే నమూనా సమాచారం కనబడలేదు. మీ సమీప ప్రభుత్వ సేవా కేంద్రాన్ని సంప్రదించండి."
      : language === "hi"
        ? "इस प्रश्न से मेल खाती नमूना जानकारी नहीं मिली। अपने नज़दीकी सरकारी सेवा केंद्र से संपर्क करें।"
        : "I couldn't find a matching sample record. Please ask your nearest government service centre."
    : language === "te"
      ? `${schemes.length} సంబంధిత పథకాల నమూనా సమాచారం కనుగొన్నాను. అర్హత మరియు దరఖాస్తు వివరాలను అధికారిక శాఖ వద్ద నిర్ధారించండి.`
      : language === "hi"
        ? `${schemes.length} संबंधित योजनाओं की नमूना जानकारी मिली। पात्रता और आवेदन विवरण आधिकारिक विभाग से जाँचें।`
        : `I found ${schemes.length} relevant scheme sample${schemes.length === 1 ? "" : "s"}. Please verify eligibility and application details with the official department.`;
  res.json(AskAssistantResponse.parse({ answer, schemes }));
});

router.post("/reports", (req, res): void => {
  const parsed = ReportSchemeInformationBody.safeParse(req.body);
  if (!parsed.success) {
    res.status(400).json({ error: parsed.error.message });
    return;
  }
  if (!getScheme(parsed.data.schemeId)) {
    res.status(404).json({ error: "Scheme not found." });
    return;
  }
  const result = sqlite
    .prepare("INSERT INTO reports (scheme_id, message) VALUES (?, ?)")
    .run(parsed.data.schemeId, parsed.data.message.trim());
  res.status(201).json(
    ReportSchemeInformationResponse.parse({
      id: Number(result.lastInsertRowid),
      received: true,
    }),
  );
});

router.get("/admin/auth/session", (req, res): void => {
  res.json(GetAdminSessionResponse.parse({
    authenticated: hasAdminSession(req),
    demoMode: true,
  }));
});

router.post("/admin/auth/session", (req, res): void => {
  const parsed = LoginAdminBody.safeParse(req.body);
  if (!parsed.success) {
    res.status(400).json({ error: parsed.error.message });
    return;
  }
  const now = Date.now();
  const key = req.ip ?? "unknown";
  const attempts = loginAttempts.get(key);
  if (attempts && attempts.resetAt > now && attempts.count >= 10) {
    res.status(429).json({ error: "Too many attempts. Please wait before trying again." });
    return;
  }
  if (!sessionSecret) {
    res.status(503).json({ error: "Admin sessions are not configured." });
    return;
  }
  if (!verifyAdminPassword(parsed.data.password)) {
    if (!attempts || attempts.resetAt <= now) {
      loginAttempts.set(key, { count: 1, resetAt: now + 15 * 60 * 1000 });
    } else {
      attempts.count += 1;
    }
    res.status(401).json({ error: "That demo password did not match." });
    return;
  }
  loginAttempts.delete(key);
  setSessionCookie(res);
  res.json(LoginAdminResponse.parse({ authenticated: true, demoMode: true }));
});

router.delete("/admin/auth/session", (_req, res): void => {
  clearSessionCookie(res);
  res.sendStatus(204);
});

router.get("/admin/summary", requireAdmin, (_req, res): void => {
  const total = sqlite.prepare("SELECT COUNT(*) AS count FROM schemes").get() as { count: number };
  const active = sqlite.prepare("SELECT COUNT(*) AS count FROM schemes WHERE active = 1").get() as { count: number };
  const categoryCount = sqlite.prepare("SELECT COUNT(*) AS count FROM categories").get() as { count: number };
  res.json(GetAdminSummaryResponse.parse({
    total: total.count,
    active: active.count,
    categories: categoryCount.count,
  }));
});

router.get("/admin/schemes", requireAdmin, (_req, res): void => {
  res.json(ListAdminSchemesResponse.parse(listSchemes({ includeInactive: true })));
});

router.post("/admin/schemes", requireAdmin, (req, res): void => {
  const input = normalizeInput(req.body, res);
  if (!input) return;
  const id = newSchemeId(input.name);
  const scheme = saveScheme(id, input);
  res.status(201).json(CreateSchemeResponse.parse(scheme));
});

router.put("/admin/schemes/:id", requireAdmin, (req, res): void => {
  const params = UpdateSchemeParams.safeParse(req.params);
  if (!params.success) {
    res.status(400).json({ error: params.error.message });
    return;
  }
  if (!getScheme(params.data.id)) {
    res.status(404).json({ error: "Scheme not found." });
    return;
  }
  const input = normalizeInput(req.body, res);
  if (!input) return;
  res.json(UpdateSchemeResponse.parse(saveScheme(params.data.id, input)));
});

router.delete("/admin/schemes/:id", requireAdmin, (req, res): void => {
  const params = DeactivateSchemeParams.safeParse(req.params);
  if (!params.success) {
    res.status(400).json({ error: params.error.message });
    return;
  }
  const result = sqlite
    .prepare("UPDATE schemes SET active = 0 WHERE id = ? AND active = 1")
    .run(params.data.id);
  if (result.changes === 0) {
    res.status(404).json({ error: "Active scheme not found." });
    return;
  }
  res.status(204).end();
});

export default router;
