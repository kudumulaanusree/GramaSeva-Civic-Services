import {
  Scheme,
  SchemeInput,
  Category,
  EligibilityInput,
  EligibilityMatch,
  AssistantResponse,
  AdminSummary,
  Language,
} from "../types";

import {
  categoriesList,
  seedSchemes,
  getCategoriesWithCounts,
  getStoredSchemes,
  saveStoredSchemes,
  getSchemeByIdLocal,
  searchSchemesLocal,
  checkEligibilityLocal,
  askAssistantLocal,
} from "../data/mockData";

const API_BASE = import.meta.env.VITE_API_URL || "/api";

async function safeFetchJson<T>(url: string, options?: RequestInit): Promise<T | null> {
  try {
    const res = await fetch(url, options);
    const contentType = res.headers.get("content-type");
    if (res.ok && contentType && contentType.includes("application/json")) {
      return (await res.json()) as T;
    }
  } catch (error) {
    // API is unreachable or returned non-JSON (e.g. index.html fallback)
  }
  return null;
}

export async function fetchSchemes(params?: {
  q?: string;
  category?: string;
  sort?: string;
}): Promise<Scheme[]> {
  const query = new URLSearchParams();
  if (params?.q) query.set("q", params.q);
  if (params?.category) query.set("category", params.category);
  if (params?.sort) query.set("sort", params.sort);

  const data = await safeFetchJson<Scheme[]>(`${API_BASE}/schemes?${query.toString()}`);
  if (data && Array.isArray(data)) {
    return data;
  }

  return searchSchemesLocal({
    query: params?.q,
    category: params?.category,
    sort: params?.sort,
  });
}

export async function fetchSchemeById(id: string): Promise<Scheme> {
  const data = await safeFetchJson<Scheme>(`${API_BASE}/schemes/${id}`);
  if (data && data.id) {
    return data;
  }

  const scheme = getSchemeByIdLocal(id);
  if (!scheme) {
    throw new Error("Scheme not found");
  }
  return scheme;
}

export async function searchSchemes(q: string): Promise<Scheme[]> {
  const data = await safeFetchJson<Scheme[]>(`${API_BASE}/schemes/search?q=${encodeURIComponent(q)}`);
  if (data && Array.isArray(data)) {
    return data;
  }

  return searchSchemesLocal({ query: q });
}

export async function fetchCategories(): Promise<Category[]> {
  const data = await safeFetchJson<Category[]>(`${API_BASE}/categories`);
  if (data && Array.isArray(data)) {
    return data;
  }

  return getCategoriesWithCounts();
}

export async function checkEligibility(
  input: EligibilityInput
): Promise<EligibilityMatch[]> {
  const data = await safeFetchJson<EligibilityMatch[]>(`${API_BASE}/eligibility/check`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(input),
  });
  if (data && Array.isArray(data)) {
    return data;
  }

  return checkEligibilityLocal(input);
}

export async function askAssistant(
  message: string,
  language: Language
): Promise<AssistantResponse> {
  const data = await safeFetchJson<AssistantResponse>(`${API_BASE}/assistant/query`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ message, language }),
  });
  if (data && data.answer) {
    return data;
  }

  return askAssistantLocal(message, language);
}

export async function submitReport(
  schemeId: string,
  message: string
): Promise<{ id: number; received: boolean }> {
  const data = await safeFetchJson<{ id: number; received: boolean }>(`${API_BASE}/reports`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ schemeId, message }),
  });
  if (data && data.received) {
    return data;
  }

  try {
    const existing = JSON.parse(localStorage.getItem("gramaseva_reports") || "[]");
    const newReport = {
      id: Date.now(),
      schemeId,
      message,
      createdAt: new Date().toISOString(),
    };
    existing.push(newReport);
    localStorage.setItem("gramaseva_reports", JSON.stringify(existing));
  } catch {}

  return { id: Date.now(), received: true };
}

// Admin APIs
export async function checkAdminSession(): Promise<{ authenticated: boolean }> {
  const token = localStorage.getItem("gramaseva_admin_token");
  if (!token) return { authenticated: false };

  const data = await safeFetchJson<{ authenticated: boolean }>(`${API_BASE}/admin/auth/session`, {
    credentials: "include",
    headers: { Authorization: `Bearer ${token}` },
  });
  if (data) return data;

  return { authenticated: token === "demo-admin-token" };
}

export async function loginAdmin(
  password: string
): Promise<{ authenticated: boolean; token?: string }> {
  try {
    const res = await fetch(`${API_BASE}/admin/auth/session`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ password }),
      credentials: "include",
    });
    const contentType = res.headers.get("content-type");
    if (res.ok && contentType?.includes("application/json")) {
      const data = await res.json();
      if (data.token) {
        localStorage.setItem("gramaseva_admin_token", data.token);
      }
      return data;
    }
  } catch {}

  if (password === "seva-demo" || password === "admin") {
    const token = "demo-admin-token";
    localStorage.setItem("gramaseva_admin_token", token);
    return { authenticated: true, token };
  }

  throw new Error("Invalid administrator password (try 'seva-demo')");
}

export async function logoutAdmin(): Promise<void> {
  localStorage.removeItem("gramaseva_admin_token");
  try {
    await fetch(`${API_BASE}/admin/auth/session`, {
      method: "DELETE",
      credentials: "include",
    });
  } catch {}
}

export async function fetchAdminSummary(): Promise<AdminSummary> {
  const token = localStorage.getItem("gramaseva_admin_token");
  const headers: Record<string, string> = {};
  if (token) headers["Authorization"] = `Bearer ${token}`;

  const data = await safeFetchJson<AdminSummary>(`${API_BASE}/admin/summary`, {
    credentials: "include",
    headers,
  });
  if (data) return data;

  const schemes = getStoredSchemes();
  const cats = getCategoriesWithCounts();
  return {
    total: schemes.length,
    active: schemes.filter((s) => s.active !== false).length,
    categories: cats.length,
  };
}

export async function fetchAdminSchemes(): Promise<Scheme[]> {
  const token = localStorage.getItem("gramaseva_admin_token");
  const headers: Record<string, string> = {};
  if (token) headers["Authorization"] = `Bearer ${token}`;

  const data = await safeFetchJson<Scheme[]>(`${API_BASE}/admin/schemes`, {
    credentials: "include",
    headers,
  });
  if (data && Array.isArray(data)) return data;

  return getStoredSchemes();
}

export async function createAdminScheme(scheme: SchemeInput): Promise<Scheme> {
  const token = localStorage.getItem("gramaseva_admin_token");
  const headers: Record<string, string> = { "Content-Type": "application/json" };
  if (token) headers["Authorization"] = `Bearer ${token}`;

  try {
    const res = await fetch(`${API_BASE}/admin/schemes`, {
      method: "POST",
      headers,
      body: JSON.stringify(scheme),
      credentials: "include",
    });
    const contentType = res.headers.get("content-type");
    if (res.ok && contentType?.includes("application/json")) {
      return await res.json();
    }
  } catch {}

  const schemes = getStoredSchemes();
  const slug = scheme.name
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-|-$/g, "");
  const newScheme: Scheme = {
    ...scheme,
    id: `${slug || "scheme"}-${Math.random().toString(36).substring(2, 7)}`,
    nameTe: scheme.nameTe || scheme.name,
    nameHi: scheme.nameHi || scheme.name,
    summaryTe: scheme.summaryTe || scheme.summary,
    summaryHi: scheme.summaryHi || scheme.summary,
    descriptionTe: scheme.descriptionTe || scheme.description,
    descriptionHi: scheme.descriptionHi || scheme.description,
    lastUpdated: scheme.lastUpdated || new Date().toISOString().slice(0, 10),
    officialUrl: scheme.officialUrl || null,
    active: scheme.active !== false,
  };
  schemes.unshift(newScheme);
  saveStoredSchemes(schemes);
  return newScheme;
}

export async function updateAdminScheme(
  id: string,
  scheme: SchemeInput
): Promise<Scheme> {
  const token = localStorage.getItem("gramaseva_admin_token");
  const headers: Record<string, string> = { "Content-Type": "application/json" };
  if (token) headers["Authorization"] = `Bearer ${token}`;

  try {
    const res = await fetch(`${API_BASE}/admin/schemes/${id}`, {
      method: "PUT",
      headers,
      body: JSON.stringify(scheme),
      credentials: "include",
    });
    const contentType = res.headers.get("content-type");
    if (res.ok && contentType?.includes("application/json")) {
      return await res.json();
    }
  } catch {}

  const schemes = getStoredSchemes();
  const index = schemes.findIndex((s) => s.id === id);
  if (index === -1) throw new Error("Scheme not found");

  const updated: Scheme = {
    ...schemes[index],
    ...scheme,
    nameTe: scheme.nameTe || schemes[index].nameTe,
    nameHi: scheme.nameHi || schemes[index].nameHi,
    summaryTe: scheme.summaryTe || schemes[index].summaryTe,
    summaryHi: scheme.summaryHi || schemes[index].summaryHi,
    descriptionTe: scheme.descriptionTe || schemes[index].descriptionTe,
    descriptionHi: scheme.descriptionHi || schemes[index].descriptionHi,
    lastUpdated: scheme.lastUpdated || new Date().toISOString().slice(0, 10),
    officialUrl: scheme.officialUrl !== undefined ? scheme.officialUrl : schemes[index].officialUrl,
    active: scheme.active !== undefined ? scheme.active : schemes[index].active,
  };
  schemes[index] = updated;
  saveStoredSchemes(schemes);
  return updated;
}

export async function deactivateAdminScheme(id: string): Promise<void> {
  const token = localStorage.getItem("gramaseva_admin_token");
  const headers: Record<string, string> = {};
  if (token) headers["Authorization"] = `Bearer ${token}`;

  try {
    const res = await fetch(`${API_BASE}/admin/schemes/${id}`, {
      method: "DELETE",
      credentials: "include",
      headers,
    });
    if (res.ok) return;
  } catch {}

  const schemes = getStoredSchemes();
  const s = schemes.find((x) => x.id === id);
  if (s) {
    s.active = false;
    saveStoredSchemes(schemes);
  }
}
