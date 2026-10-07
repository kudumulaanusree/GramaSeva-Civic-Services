export type Language = "en" | "te" | "hi";

export interface Scheme {
  id: string;
  name: string;
  nameTe: string;
  nameHi: string;
  summary: string;
  summaryTe: string;
  summaryHi: string;
  description: string;
  descriptionTe: string;
  descriptionHi: string;
  category: string;
  benefits: string[];
  eligibilitySummary: string;
  documents: string[];
  applicationSteps: string[];
  officialUrl: string | null;
  sourceType: "demo" | "verified";
  lastUpdated: string;
  keywords: string[];
  active: boolean;
}

export interface SchemeInput {
  name: string;
  nameTe?: string;
  nameHi?: string;
  summary: string;
  summaryTe?: string;
  summaryHi?: string;
  description: string;
  descriptionTe?: string;
  descriptionHi?: string;
  category: string;
  benefits: string[];
  eligibilitySummary: string;
  documents: string[];
  applicationSteps: string[];
  officialUrl?: string | null;
  sourceType: "demo" | "verified";
  lastUpdated?: string;
  keywords: string[];
  active?: boolean;
}

export interface Category {
  id: string;
  label: string;
  icon: string;
  count?: number;
}

export interface EligibilityInput {
  age?: number;
  gender?: string;
  state?: string;
  rural?: boolean;
  occupation?: string;
  annualIncome?: number;
  farmer?: boolean;
  student?: boolean;
  disability?: boolean;
  seniorCitizen?: boolean;
  housingNeed?: boolean;
  employmentStatus?: string;
}

export interface EligibilityMatch {
  scheme: Scheme;
  relevance: number;
  reasons: string[];
}

export interface AssistantResponse {
  answer: string;
  schemes: Scheme[];
}

export interface AdminSummary {
  total: number;
  active: number;
  categories: number;
}
