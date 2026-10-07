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

const API_BASE = import.meta.env.VITE_API_URL || "/api";

import { categoriesList, seedSchemes } from "../data/mockData";

export async function fetchSchemes(params?: {
  q?: string;
  category?: string;
  sort?: string;
}): Promise<Scheme[]> {
  const query = new URLSearchParams();
  if (params?.q) query.set("q", params.q);
  if (params?.category) query.set("category", params.category);
  if (params?.sort) query.set("sort", params.sort);

  try {
    const res = await fetch(`${API_BASE}/schemes?${query.toString()}`);
    if (!res.ok) throw new Error("Failed to load schemes");
    return res.json();
  } catch (error) {
    console.warn("Backend not reachable, falling back to mock data");
    
    // Fallback logic using mock data
    let filtered = [...seedSchemes] as unknown as Scheme[];
    if (params?.category) {
      filtered = filtered.filter(s => s.category === params.category);
    }
    if (params?.q) {
      const q = params.q.toLowerCase();
      filtered = filtered.filter(s => 
        s.name.toLowerCase().includes(q) || 
        s.summary.toLowerCase().includes(q) ||
        s.keywords.some((k: string) => k.toLowerCase().includes(q))
      );
    }
    return filtered;
  }
}

export async function fetchSchemeById(id: string): Promise<Scheme> {
  try {
    const res = await fetch(`${API_BASE}/schemes/${id}`);
    if (!res.ok) throw new Error("Failed to load scheme details");
    return res.json();
  } catch (error) {
    const scheme = seedSchemes.find((s) => s.id === id);
    if (!scheme) throw new Error("Scheme not found in mock data");
    return scheme as unknown as Scheme;
  }
}

export async function searchSchemes(q: string): Promise<Scheme[]> {
  try {
    const res = await fetch(`${API_BASE}/schemes/search?q=${encodeURIComponent(q)}`);
    if (!res.ok) throw new Error("Failed to search schemes");
    return res.json();
  } catch (error) {
    return fetchSchemes({ q });
  }
}

export async function fetchCategories(): Promise<Category[]> {
  try {
    const res = await fetch(`${API_BASE}/categories`);
    if (!res.ok) throw new Error("Failed to load categories");
    return res.json();
  } catch (error) {
    console.warn("Backend not reachable, falling back to mock categories");
    return categoriesList;
  }
}

export async function checkEligibility(
  input: EligibilityInput
): Promise<EligibilityMatch[]> {
  const res = await fetch(`${API_BASE}/eligibility/check`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(input),
  });
  if (!res.ok) throw new Error("Failed to check eligibility");
  return res.json();
}

export async function askAssistant(
  message: string,
  language: Language
): Promise<AssistantResponse> {
  const res = await fetch(`${API_BASE}/assistant/query`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ message, language }),
  });
  if (!res.ok) throw new Error("Failed to get assistant response");
  return res.json();
}

export async function submitReport(
  schemeId: string,
  message: string
): Promise<{ id: number; received: boolean }> {
  const res = await fetch(`${API_BASE}/reports`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ schemeId, message }),
  });
  if (!res.ok) throw new Error("Failed to submit report");
  return res.json();
}

// Admin APIs
export async function checkAdminSession(): Promise<{ authenticated: boolean }> {
  const token = localStorage.getItem("gramaseva_admin_token");
  const headers: Record<string, string> = {};
  if (token) headers["Authorization"] = `Bearer ${token}`;

  const res = await fetch(`${API_BASE}/admin/auth/session`, {
    credentials: "include",
    headers,
  });
  if (!res.ok) return { authenticated: false };
  return res.json();
}

export async function loginAdmin(
  password: string
): Promise<{ authenticated: boolean; token?: string }> {
  const res = await fetch(`${API_BASE}/admin/auth/session`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ password }),
    credentials: "include",
  });
  if (!res.ok) {
    const data = await res.json().catch(() => ({}));
    throw new Error(data.error || "Invalid administrator password");
  }
  const data = await res.json();
  if (data.token) {
    localStorage.setItem("gramaseva_admin_token", data.token);
  }
  return data;
}

export async function logoutAdmin(): Promise<void> {
  localStorage.removeItem("gramaseva_admin_token");
  await fetch(`${API_BASE}/admin/auth/session`, {
    method: "DELETE",
    credentials: "include",
  });
}

export async function fetchAdminSummary(): Promise<AdminSummary> {
  const token = localStorage.getItem("gramaseva_admin_token");
  const headers: Record<string, string> = {};
  if (token) headers["Authorization"] = `Bearer ${token}`;

  const res = await fetch(`${API_BASE}/admin/summary`, {
    credentials: "include",
    headers,
  });
  if (!res.ok) throw new Error("Failed to load admin summary");
  return res.json();
}

export async function fetchAdminSchemes(): Promise<Scheme[]> {
  const token = localStorage.getItem("gramaseva_admin_token");
  const headers: Record<string, string> = {};
  if (token) headers["Authorization"] = `Bearer ${token}`;

  const res = await fetch(`${API_BASE}/admin/schemes`, {
    credentials: "include",
    headers,
  });
  if (!res.ok) throw new Error("Failed to load admin schemes");
  return res.json();
}

export async function createAdminScheme(scheme: SchemeInput): Promise<Scheme> {
  const token = localStorage.getItem("gramaseva_admin_token");
  const headers: Record<string, string> = { "Content-Type": "application/json" };
  if (token) headers["Authorization"] = `Bearer ${token}`;

  const res = await fetch(`${API_BASE}/admin/schemes`, {
    method: "POST",
    headers,
    body: JSON.stringify(scheme),
    credentials: "include",
  });
  if (!res.ok) {
    const err = await res.json().catch(() => ({}));
    throw new Error(err.error || "Failed to create scheme");
  }
  return res.json();
}

export async function updateAdminScheme(
  id: string,
  scheme: SchemeInput
): Promise<Scheme> {
  const token = localStorage.getItem("gramaseva_admin_token");
  const headers: Record<string, string> = { "Content-Type": "application/json" };
  if (token) headers["Authorization"] = `Bearer ${token}`;

  const res = await fetch(`${API_BASE}/admin/schemes/${id}`, {
    method: "PUT",
    headers,
    body: JSON.stringify(scheme),
    credentials: "include",
  });
  if (!res.ok) {
    const err = await res.json().catch(() => ({}));
    throw new Error(err.error || "Failed to update scheme");
  }
  return res.json();
}

export async function deactivateAdminScheme(id: string): Promise<void> {
  const token = localStorage.getItem("gramaseva_admin_token");
  const headers: Record<string, string> = {};
  if (token) headers["Authorization"] = `Bearer ${token}`;

  const res = await fetch(`${API_BASE}/admin/schemes/${id}`, {
    method: "DELETE",
    credentials: "include",
    headers,
  });
  if (!res.ok) throw new Error("Failed to deactivate scheme");
}
