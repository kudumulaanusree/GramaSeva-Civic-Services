import React, { useState } from "react";
import { Link } from "react-router-dom";
import {
  ClipboardCheck,
  CheckCircle2,
  ArrowRight,
  ShieldCheck,
  AlertCircle,
  RotateCcw,
  Sparkles,
  HelpCircle,
  Loader2,
} from "lucide-react";
import { useApp } from "../context/AppContext";
import { checkEligibility } from "../services/api";
import { EligibilityInput, EligibilityMatch } from "../types";

export const Eligibility: React.FC = () => {
  const { t, getLocalizedName, getLocalizedSummary } = useApp();

  const [form, setForm] = useState<EligibilityInput>({
    rural: true,
    farmer: false,
    student: false,
    disability: false,
    seniorCitizen: false,
    housingNeed: false,
    state: "Andhra Pradesh",
  });

  const [matches, setMatches] = useState<EligibilityMatch[] | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const handleInputChange = (field: keyof EligibilityInput, value: any) => {
    setForm((prev) => ({ ...prev, [field]: value }));
  };

  const handleCheckboxToggle = (field: keyof EligibilityInput) => {
    setForm((prev) => ({ ...prev, [field]: !prev[field] }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      setLoading(true);
      setError("");
      const results = await checkEligibility(form);
      setMatches(results);
      // Smooth scroll down to results
      setTimeout(() => {
        document.getElementById("results-section")?.scrollIntoView({ behavior: "smooth" });
      }, 100);
    } catch (err: unknown) {
      setError("Unable to process eligibility check. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  const handleReset = () => {
    setForm({
      rural: true,
      farmer: false,
      student: false,
      disability: false,
      seniorCitizen: false,
      housingNeed: false,
      state: "Andhra Pradesh",
    });
    setMatches(null);
  };

  return (
    <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-10 space-y-10 animate-fade-in">
      
      {/* Page Header */}
      <div className="text-center space-y-3">
        <div className="inline-flex items-center gap-1.5 px-3.5 py-1.5 rounded-full bg-blue-50 text-blue-700 text-xs font-semibold">
          <ClipboardCheck size={14} />
          <span>Interactive Guidance Tool</span>
        </div>
        <h1 className="font-display font-bold text-3xl sm:text-4xl text-gov-charcoal">
          {t.eligibilityTitle}
        </h1>
        <p className="text-gov-slate text-sm sm:text-base max-w-xl mx-auto">
          {t.eligibilitySubtitle}
        </p>
      </div>

      {/* Safety & Guidance Notice */}
      <div className="bg-amber-50/70 border border-amber-200/80 rounded-2xl p-4 sm:p-5 text-xs text-amber-900 flex items-start gap-3">
        <AlertCircle size={20} className="text-amber-700 flex-shrink-0 mt-0.5" />
        <div className="space-y-1">
          <span className="font-bold block">Guidance Disclaimer:</span>
          <p className="leading-relaxed">
            {t.eligibilityDisclaimer}
          </p>
        </div>
      </div>

      {/* Main Form */}
      <form onSubmit={handleSubmit} className="bg-white rounded-3xl p-6 sm:p-10 border border-gov-sand shadow-sm space-y-8">
        
        {/* Section 1: Demographics */}
        <div className="space-y-4">
          <h3 className="font-display font-bold text-lg text-gov-charcoal border-b border-gov-sand pb-2">
            1. Personal & Location Details
          </h3>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            
            {/* Age */}
            <div>
              <label className="block text-xs font-bold text-gov-slate uppercase tracking-wider mb-2">
                {t.ageLabel}
              </label>
              <input
                type="number"
                min={1}
                max={120}
                value={form.age ?? ""}
                onChange={(e) => handleInputChange("age", e.target.value ? parseInt(e.target.value, 10) : undefined)}
                placeholder="e.g. 35"
                className="w-full bg-gov-cream/40 border border-gov-sand rounded-xl p-3 text-sm text-gov-charcoal focus:ring-2 focus:ring-gov-primary focus:outline-none"
              />
            </div>

            {/* Gender */}
            <div>
              <label className="block text-xs font-bold text-gov-slate uppercase tracking-wider mb-2">
                {t.genderLabel}
              </label>
              <select
                value={form.gender || ""}
                onChange={(e) => handleInputChange("gender", e.target.value || undefined)}
                className="w-full bg-gov-cream/40 border border-gov-sand rounded-xl p-3 text-sm text-gov-charcoal focus:ring-2 focus:ring-gov-primary focus:outline-none cursor-pointer"
              >
                <option value="">{t.genderSelect}</option>
                <option value="female">{t.female}</option>
                <option value="male">{t.male}</option>
                <option value="other">{t.other}</option>
              </select>
            </div>

            {/* State */}
            <div>
              <label className="block text-xs font-bold text-gov-slate uppercase tracking-wider mb-2">
                {t.stateLabel}
              </label>
              <input
                type="text"
                value={form.state || ""}
                onChange={(e) => handleInputChange("state", e.target.value)}
                placeholder="e.g. Andhra Pradesh, Telangana, Uttar Pradesh"
                className="w-full bg-gov-cream/40 border border-gov-sand rounded-xl p-3 text-sm text-gov-charcoal focus:ring-2 focus:ring-gov-primary focus:outline-none"
              />
            </div>

            {/* Residential Area (Rural/Urban) */}
            <div>
              <label className="block text-xs font-bold text-gov-slate uppercase tracking-wider mb-2">
                {t.residenceLabel}
              </label>
              <div className="grid grid-cols-2 gap-2">
                <button
                  type="button"
                  onClick={() => handleInputChange("rural", true)}
                  className={`p-3 rounded-xl border text-xs font-semibold transition-colors ${
                    form.rural
                      ? "bg-gov-primary text-white border-gov-primary"
                      : "bg-gov-cream/40 text-gov-slate border-gov-sand hover:bg-gov-sand"
                  }`}
                >
                  {t.rural}
                </button>
                <button
                  type="button"
                  onClick={() => handleInputChange("rural", false)}
                  className={`p-3 rounded-xl border text-xs font-semibold transition-colors ${
                    !form.rural
                      ? "bg-gov-primary text-white border-gov-primary"
                      : "bg-gov-cream/40 text-gov-slate border-gov-sand hover:bg-gov-sand"
                  }`}
                >
                  {t.urban}
                </button>
              </div>
            </div>

          </div>
        </div>

        {/* Section 2: Work & Economic Profile */}
        <div className="space-y-4">
          <h3 className="font-display font-bold text-lg text-gov-charcoal border-b border-gov-sand pb-2">
            2. Economic & Work Profile
          </h3>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            {/* Occupation */}
            <div>
              <label className="block text-xs font-bold text-gov-slate uppercase tracking-wider mb-2">
                {t.occupationLabel}
              </label>
              <input
                type="text"
                value={form.occupation || ""}
                onChange={(e) => handleInputChange("occupation", e.target.value)}
                placeholder={t.occupationPlaceholder}
                className="w-full bg-gov-cream/40 border border-gov-sand rounded-xl p-3 text-sm text-gov-charcoal focus:ring-2 focus:ring-gov-primary focus:outline-none"
              />
            </div>

            {/* Income */}
            <div>
              <label className="block text-xs font-bold text-gov-slate uppercase tracking-wider mb-2">
                {t.incomeLabel}
              </label>
              <input
                type="number"
                min={0}
                step={5000}
                value={form.annualIncome ?? ""}
                onChange={(e) => handleInputChange("annualIncome", e.target.value ? parseInt(e.target.value, 10) : undefined)}
                placeholder="e.g. 120000"
                className="w-full bg-gov-cream/40 border border-gov-sand rounded-xl p-3 text-sm text-gov-charcoal focus:ring-2 focus:ring-gov-primary focus:outline-none"
              />
            </div>

            {/* Employment Status */}
            <div className="sm:col-span-2">
              <label className="block text-xs font-bold text-gov-slate uppercase tracking-wider mb-2">
                {t.employmentLabel}
              </label>
              <select
                value={form.employmentStatus || ""}
                onChange={(e) => handleInputChange("employmentStatus", e.target.value || undefined)}
                className="w-full bg-gov-cream/40 border border-gov-sand rounded-xl p-3 text-sm text-gov-charcoal focus:ring-2 focus:ring-gov-primary focus:outline-none cursor-pointer"
              >
                <option value="">Select Employment Status</option>
                <option value="employed">{t.employed}</option>
                <option value="unemployed">{t.unemployed}</option>
                <option value="self-employed">{t.selfEmployed}</option>
              </select>
            </div>
          </div>
        </div>

        {/* Section 3: Household Criteria Checkboxes */}
        <div className="space-y-4">
          <h3 className="font-display font-bold text-lg text-gov-charcoal border-b border-gov-sand pb-2">
            3. Specific Household Circumstances
          </h3>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3.5">
            {[
              { field: "farmer" as const, label: t.farmerLabel },
              { field: "student" as const, label: t.studentLabel },
              { field: "seniorCitizen" as const, label: t.seniorLabel },
              { field: "housingNeed" as const, label: t.housingLabel },
              { field: "disability" as const, label: t.disabilityLabel },
            ].map(({ field, label }) => (
              <label
                key={field}
                className={`flex items-start gap-3 p-3.5 rounded-xl border cursor-pointer transition-all ${
                  form[field]
                    ? "bg-emerald-50/70 border-emerald-300 text-gov-darkGreen shadow-sm"
                    : "bg-gov-cream/30 border-gov-sand hover:bg-gov-sand/40 text-gov-charcoal"
                }`}
              >
                <input
                  type="checkbox"
                  checked={Boolean(form[field])}
                  onChange={() => handleCheckboxToggle(field)}
                  className="w-5 h-5 accent-gov-primary rounded mt-0.5"
                />
                <span className="text-xs sm:text-sm font-medium leading-snug">{label}</span>
              </label>
            ))}
          </div>
        </div>

        {error && (
          <div className="p-4 bg-red-50 text-red-700 rounded-xl text-sm font-medium">
            {error}
          </div>
        )}

        {/* Action Buttons */}
        <div className="flex flex-col sm:flex-row items-center gap-3 pt-4 border-t border-gov-sand">
          <button
            type="submit"
            disabled={loading}
            className="w-full sm:w-auto inline-flex items-center justify-center gap-2 bg-gov-primary hover:bg-gov-darkGreen text-white font-bold text-base px-8 py-4 rounded-xl shadow-md transition-all flex-1"
          >
            {loading ? (
              <>
                <Loader2 size={18} className="animate-spin" />
                <span>Checking Eligibility...</span>
              </>
            ) : (
              <>
                <ClipboardCheck size={20} />
                <span>{t.checkNowBtn}</span>
              </>
            )}
          </button>

          <button
            type="button"
            onClick={handleReset}
            className="w-full sm:w-auto inline-flex items-center justify-center gap-2 bg-gov-sand/60 hover:bg-gov-sand text-gov-slate font-medium text-sm px-5 py-4 rounded-xl transition-colors"
          >
            <RotateCcw size={16} />
            <span>Reset</span>
          </button>
        </div>

      </form>

      {/* Results Section */}
      {matches && (
        <section id="results-section" className="space-y-6 pt-6 animate-fade-in">
          <div className="flex items-center justify-between border-b border-gov-sand pb-4">
            <div>
              <h2 className="font-display font-bold text-2xl sm:text-3xl text-gov-charcoal">
                {t.potentialMatches}
              </h2>
              <p className="text-gov-slate text-sm">
                Ranked according to your stated occupation, location, and household needs.
              </p>
            </div>
            <span className="text-xs font-bold px-3 py-1.5 bg-gov-lightGreen text-gov-darkGreen rounded-full">
              {matches.length} Matches Found
            </span>
          </div>

          {matches.length === 0 ? (
            <div className="bg-white rounded-3xl p-10 text-center border border-gov-sand space-y-4">
              <p className="text-gov-slate text-sm">
                {t.noMatchesFound}
              </p>
              <Link
                to="/schemes"
                className="inline-flex items-center gap-2 bg-gov-primary text-white font-semibold text-sm px-6 py-2.5 rounded-xl hover:bg-gov-darkGreen transition-colors"
              >
                <span>Browse All Schemes</span>
                <ArrowRight size={16} />
              </Link>
            </div>
          ) : (
            <div className="space-y-4">
              {matches.map((m, index) => (
                <div
                  key={m.scheme.id}
                  className="bg-white rounded-2xl p-6 border border-gov-sand shadow-sm hover:shadow-md transition-shadow flex flex-col md:flex-row md:items-center justify-between gap-6"
                >
                  <div className="space-y-3 flex-1">
                    <div className="flex items-center gap-3">
                      <span className="w-8 h-8 rounded-full bg-gov-sand text-gov-charcoal font-bold text-sm flex items-center justify-center">
                        #{index + 1}
                      </span>
                      <span className="text-xs font-semibold uppercase tracking-wider text-emerald-800 bg-emerald-50 px-2.5 py-0.5 rounded-full border border-emerald-100">
                        {m.scheme.category}
                      </span>
                    </div>

                    <h3 className="font-display font-bold text-xl text-gov-charcoal">
                      {getLocalizedName(m.scheme)}
                    </h3>

                    <p className="text-gov-slate text-sm leading-relaxed">
                      {getLocalizedSummary(m.scheme)}
                    </p>

                    {/* Reasons for match */}
                    <div className="space-y-1.5 pt-1">
                      <span className="text-xs font-bold text-gray-500 uppercase tracking-wider block">
                        {t.whyRelevant}
                      </span>
                      {m.reasons.map((r, i) => (
                        <div key={i} className="flex items-start gap-2 text-xs text-gov-charcoal">
                          <CheckCircle2 size={14} className="text-gov-primary flex-shrink-0 mt-0.5" />
                          <span>{r}</span>
                        </div>
                      ))}
                    </div>
                  </div>

                  {/* Match Score & CTA */}
                  <div className="flex md:flex-col items-center justify-between md:justify-center gap-4 border-t md:border-t-0 md:border-l border-gov-sand pt-4 md:pt-0 md:pl-6 flex-shrink-0">
                    <div className="text-center">
                      <div className="font-display font-black text-3xl text-gov-primary">
                        {Math.round(m.relevance)}%
                      </div>
                      <span className="text-[11px] uppercase tracking-wider text-gray-400 font-semibold block">
                        Relevance
                      </span>
                    </div>

                    <Link
                      to={`/schemes/${m.scheme.id}`}
                      className="inline-flex items-center gap-1.5 bg-gov-lightGreen hover:bg-emerald-100 text-gov-darkGreen font-semibold text-xs px-4 py-2.5 rounded-xl transition-colors whitespace-nowrap"
                    >
                      <span>{t.viewDetails}</span>
                      <ArrowRight size={14} />
                    </Link>
                  </div>
                </div>
              ))}
            </div>
          )}
        </section>
      )}

    </div>
  );
};
