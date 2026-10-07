import React, { useState, useEffect } from "react";
import { useParams, Link, useNavigate } from "react-router-dom";
import {
  ArrowLeft,
  Calendar,
  ShieldCheck,
  CheckCircle2,
  FileText,
  ExternalLink,
  ClipboardCheck,
  AlertCircle,
  Flag,
  Tag,
  Loader2,
  HelpCircle,
  Building2,
} from "lucide-react";
import { useApp } from "../context/AppContext";
import { fetchSchemeById, fetchSchemes } from "../services/api";
import { Scheme } from "../types";
import { ReportModal } from "../components/ReportModal";

export const SchemeDetails: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const { t, getLocalizedName, getLocalizedSummary, getLocalizedDescription } = useApp();

  const [scheme, setScheme] = useState<Scheme | null>(null);
  const [relatedSchemes, setRelatedSchemes] = useState<Scheme[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [reportModalOpen, setReportModalOpen] = useState(false);
  const [activeTab, setActiveTab] = useState<"overview" | "benefits" | "eligibility" | "documents" | "steps">("overview");

  useEffect(() => {
    async function loadScheme() {
      if (!id) return;
      try {
        setLoading(true);
        setError("");
        const data = await fetchSchemeById(id);
        setScheme(data);

        // Fetch related schemes from the same category
        if (data.category) {
          const catSchemes = await fetchSchemes({ category: data.category });
          setRelatedSchemes(catSchemes.filter((s) => s.id !== data.id).slice(0, 3));
        }
      } catch (err: unknown) {
        setError("Scheme not found or error loading details.");
      } finally {
        setLoading(false);
      }
    }
    loadScheme();
  }, [id]);

  if (loading) {
    return (
      <div className="py-32 flex flex-col items-center justify-center text-gov-slate gap-3">
        <Loader2 size={36} className="text-gov-primary animate-spin" />
        <p className="text-sm font-medium">Loading scheme details...</p>
      </div>
    );
  }

  if (error || !scheme) {
    return (
      <div className="max-w-2xl mx-auto px-4 py-20 text-center space-y-4">
        <div className="w-16 h-16 bg-red-50 text-red-600 rounded-full flex items-center justify-center mx-auto text-2xl">
          ⚠️
        </div>
        <h2 className="font-display font-bold text-2xl text-gov-charcoal">
          {error || "Scheme Details Unavailable"}
        </h2>
        <p className="text-sm text-gov-slate">
          The requested scheme record could not be found or has been deactivated.
        </p>
        <Link
          to="/schemes"
          className="inline-flex items-center gap-2 bg-gov-primary text-white font-semibold px-6 py-2.5 rounded-xl hover:bg-gov-darkGreen transition-colors"
        >
          <ArrowLeft size={16} />
          <span>Back to Schemes</span>
        </Link>
      </div>
    );
  }

  const isVerified = scheme.sourceType === "verified";

  return (
    <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-10 space-y-8 animate-fade-in">
      
      {/* Top Breadcrumb & Back */}
      <div className="flex items-center justify-between">
        <button
          onClick={() => navigate(-1)}
          className="inline-flex items-center gap-1.5 text-sm font-semibold text-gov-slate hover:text-gov-primary transition-colors"
        >
          <ArrowLeft size={16} />
          <span>Back</span>
        </button>

        <button
          onClick={() => setReportModalOpen(true)}
          className="inline-flex items-center gap-1.5 text-xs font-medium text-gray-500 hover:text-red-700 bg-white border border-gov-sand px-3 py-1.5 rounded-lg shadow-2xl transition-colors"
        >
          <Flag size={13} />
          <span>{t.reportBtn}</span>
        </button>
      </div>

      {/* Main Header Card */}
      <div className="bg-white rounded-3xl p-6 sm:p-10 border border-gov-sand shadow-sm space-y-5">
        
        {/* Badges */}
        <div className="flex flex-wrap items-center gap-3">
          <span className="inline-flex items-center gap-1.5 px-3.5 py-1 rounded-full text-xs font-semibold bg-emerald-50 text-emerald-800 border border-emerald-100">
            <Tag size={13} />
            <span className="capitalize">{scheme.category.replace("-", " ")}</span>
          </span>

          <span
            className={`inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-medium ${
              isVerified
                ? "bg-blue-50 text-blue-700 border border-blue-100"
                : "bg-amber-50 text-amber-700 border border-amber-100"
            }`}
          >
            <ShieldCheck size={14} />
            <span>{isVerified ? t.verifiedSource : t.demoData}</span>
          </span>

          <span className="text-xs text-gray-400 flex items-center gap-1 ml-auto">
            <Calendar size={13} />
            <span>{t.lastUpdated}: {scheme.lastUpdated}</span>
          </span>
        </div>

        {/* Scheme Name */}
        <h1 className="font-display font-bold text-3xl sm:text-4xl text-gov-charcoal leading-tight">
          {getLocalizedName(scheme)}
        </h1>

        {/* Short Summary */}
        <p className="text-gov-slate text-base sm:text-lg leading-relaxed max-w-4xl">
          {getLocalizedSummary(scheme)}
        </p>

        {/* Quick Action CTAs */}
        <div className="pt-4 flex flex-wrap items-center gap-4 border-t border-gov-sand/60">
          <Link
            to="/eligibility"
            className="inline-flex items-center gap-2 bg-gov-primary hover:bg-gov-darkGreen text-white font-semibold text-sm px-6 py-3 rounded-xl shadow-sm transition-colors"
          >
            <ClipboardCheck size={18} />
            <span>{t.checkMyEligibility}</span>
          </Link>

          {scheme.officialUrl ? (
            <a
              href={scheme.officialUrl}
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center gap-2 bg-gov-cream hover:bg-gov-sand text-gov-charcoal border border-gov-sand font-semibold text-sm px-6 py-3 rounded-xl transition-colors"
            >
              <span>{t.officialLink}</span>
              <ExternalLink size={16} className="text-gov-primary" />
            </a>
          ) : (
            <div className="text-xs text-gray-500 bg-gov-sand/50 px-4 py-2.5 rounded-xl border border-gov-sand/60 flex items-center gap-2">
              <Building2 size={16} className="text-gov-primary flex-shrink-0" />
              <span>{t.nearestCscNotice}</span>
            </div>
          )}
        </div>
      </div>

      {/* Tabs Navigation */}
      <div className="flex items-center gap-2 border-b border-gov-sand overflow-x-auto pb-1 scrollbar-none">
        {[
          { key: "overview", label: t.detailsOverview },
          { key: "benefits", label: t.detailsBenefits },
          { key: "eligibility", label: t.detailsEligibility },
          { key: "documents", label: t.detailsDocuments },
          { key: "steps", label: t.detailsHowToApply },
        ].map((tab) => (
          <button
            key={tab.key}
            onClick={() => setActiveTab(tab.key as any)}
            className={`px-5 py-3 font-semibold text-sm rounded-t-xl transition-colors whitespace-nowrap border-b-2 -mb-0.5 ${
              activeTab === tab.key
                ? "border-gov-primary text-gov-primary bg-white shadow-sm"
                : "border-transparent text-gov-slate hover:text-gov-charcoal hover:bg-white/50"
            }`}
          >
            {tab.label}
          </button>
        ))}
      </div>

      {/* Tab Contents */}
      <div className="bg-white rounded-3xl p-6 sm:p-10 border border-gov-sand shadow-sm space-y-6">
        
        {/* 1. Overview Tab */}
        {activeTab === "overview" && (
          <div className="space-y-6 animate-fade-in">
            <h3 className="font-display font-bold text-xl text-gov-charcoal">
              Detailed Program Description
            </h3>
            <p className="text-gov-slate text-base leading-relaxed whitespace-pre-line">
              {getLocalizedDescription(scheme)}
            </p>

            {scheme.benefits && scheme.benefits.length > 0 && (
              <div className="mt-6 pt-6 border-t border-gov-sand/60">
                <h4 className="font-display font-bold text-lg text-gov-charcoal mb-4">
                  Primary Benefits
                </h4>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                  {scheme.benefits.map((b, i) => (
                    <div key={i} className="flex items-start gap-3 p-3.5 bg-gov-cream/50 rounded-xl border border-gov-sand/60">
                      <CheckCircle2 size={18} className="text-gov-primary mt-0.5 flex-shrink-0" />
                      <span className="text-sm text-gov-charcoal">{b}</span>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>
        )}

        {/* 2. Benefits Tab */}
        {activeTab === "benefits" && (
          <div className="space-y-6 animate-fade-in">
            <h3 className="font-display font-bold text-xl text-gov-charcoal">
              {t.detailsBenefits}
            </h3>
            <div className="space-y-3">
              {scheme.benefits && scheme.benefits.length > 0 ? (
                scheme.benefits.map((benefit, idx) => (
                  <div
                    key={idx}
                    className="p-4 rounded-2xl bg-gov-lightGreen/50 border border-emerald-100 flex items-start gap-3.5"
                  >
                    <div className="w-7 h-7 rounded-full bg-gov-primary text-white flex items-center justify-center font-bold text-xs flex-shrink-0 mt-0.5">
                      ✓
                    </div>
                    <p className="text-sm sm:text-base text-gov-charcoal leading-relaxed font-medium">
                      {benefit}
                    </p>
                  </div>
                ))
              ) : (
                <p className="text-sm text-gray-500">No specific benefit list available.</p>
              )}
            </div>
          </div>
        )}

        {/* 3. Eligibility Tab */}
        {activeTab === "eligibility" && (
          <div className="space-y-6 animate-fade-in">
            <h3 className="font-display font-bold text-xl text-gov-charcoal">
              {t.detailsEligibility}
            </h3>
            <div className="p-6 rounded-2xl bg-amber-50/60 border border-amber-200/80 space-y-3">
              <div className="flex items-center gap-2 text-amber-800 font-semibold text-sm">
                <AlertCircle size={18} />
                <span>Eligibility Criteria Summary</span>
              </div>
              <p className="text-gov-charcoal text-base leading-relaxed">
                {scheme.eligibilitySummary}
              </p>
            </div>

            <div className="pt-4 flex items-center justify-between bg-gov-cream/60 p-4 rounded-2xl border border-gov-sand">
              <div>
                <span className="font-bold text-sm text-gov-charcoal block">Not sure if you qualify?</span>
                <span className="text-xs text-gov-slate">Use our interactive eligibility guidance tool.</span>
              </div>
              <Link
                to="/eligibility"
                className="bg-gov-primary text-white font-semibold text-xs px-4 py-2.5 rounded-xl hover:bg-gov-darkGreen transition-colors"
              >
                {t.checkEligibility}
              </Link>
            </div>
          </div>
        )}

        {/* 4. Documents Tab */}
        {activeTab === "documents" && (
          <div className="space-y-6 animate-fade-in">
            <h3 className="font-display font-bold text-xl text-gov-charcoal">
              {t.detailsDocuments}
            </h3>
            <p className="text-sm text-gov-slate">
              Keep original copies and photocopies of the following records ready before submitting your application:
            </p>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              {scheme.documents && scheme.documents.length > 0 ? (
                scheme.documents.map((doc, idx) => (
                  <div
                    key={idx}
                    className="p-4 rounded-xl border border-gov-sand/80 bg-white flex items-center gap-3.5 shadow-sm"
                  >
                    <div className="p-2 rounded-lg bg-emerald-50 text-gov-primary">
                      <FileText size={20} />
                    </div>
                    <span className="font-medium text-sm text-gov-charcoal">{doc}</span>
                  </div>
                ))
              ) : (
                <p className="text-sm text-gray-500">Contact local officer for required document checklist.</p>
              )}
            </div>
          </div>
        )}

        {/* 5. How to Apply Tab */}
        {activeTab === "steps" && (
          <div className="space-y-6 animate-fade-in">
            <h3 className="font-display font-bold text-xl text-gov-charcoal">
              {t.detailsHowToApply}
            </h3>

            <div className="space-y-4">
              {scheme.applicationSteps && scheme.applicationSteps.length > 0 ? (
                scheme.applicationSteps.map((step, idx) => (
                  <div
                    key={idx}
                    className="flex items-start gap-4 p-4 rounded-2xl bg-gov-cream/60 border border-gov-sand/80"
                  >
                    <div className="w-8 h-8 rounded-xl bg-gov-primary text-white flex items-center justify-center font-bold text-sm flex-shrink-0">
                      {idx + 1}
                    </div>
                    <p className="text-sm sm:text-base text-gov-charcoal pt-1 leading-relaxed">
                      {step}
                    </p>
                  </div>
                ))
              ) : (
                <p className="text-sm text-gray-500">
                  Visit your nearest Gram Panchayat or Common Service Centre for instructions.
                </p>
              )}
            </div>

            {scheme.officialUrl && (
              <div className="pt-6 border-t border-gov-sand">
                <a
                  href={scheme.officialUrl}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="inline-flex items-center gap-2 bg-gov-primary hover:bg-gov-darkGreen text-white font-semibold text-sm px-6 py-3 rounded-xl transition-colors"
                >
                  <span>Proceed to Official Government Portal</span>
                  <ExternalLink size={16} />
                </a>
              </div>
            )}
          </div>
        )}

      </div>

      {/* Official Safety Notice */}
      <div className="bg-emerald-50/70 border border-emerald-200/80 rounded-2xl p-5 text-xs text-emerald-900 flex items-start gap-3">
        <ShieldCheck size={20} className="text-gov-primary flex-shrink-0 mt-0.5" />
        <div className="space-y-1">
          <span className="font-bold block">Important Official Information Safety Notice:</span>
          <p className="leading-relaxed">
            {t.footerDisclaimer} GramaSeva never charges any fee and does not ask for bank passwords or OTPs. All official submissions must be done through government portals or authorized Common Service Centres.
          </p>
        </div>
      </div>

      {/* Related Schemes */}
      {relatedSchemes.length > 0 && (
        <div className="space-y-6 pt-6">
          <h3 className="font-display font-bold text-2xl text-gov-charcoal">
            Related Schemes in {scheme.category.replace("-", " ")}
          </h3>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {relatedSchemes.map((rel) => (
              <Link
                key={rel.id}
                to={`/schemes/${rel.id}`}
                className="bg-white p-5 rounded-2xl border border-gov-sand hover:shadow-md transition-all group"
              >
                <h4 className="font-display font-bold text-base text-gov-charcoal group-hover:text-gov-primary transition-colors mb-2">
                  {getLocalizedName(rel)}
                </h4>
                <p className="text-xs text-gov-slate line-clamp-2">
                  {getLocalizedSummary(rel)}
                </p>
              </Link>
            ))}
          </div>
        </div>
      )}

      {/* Outdated Info Report Modal */}
      {reportModalOpen && (
        <ReportModal
          schemeId={scheme.id}
          schemeName={scheme.name}
          onClose={() => setReportModalOpen(false)}
        />
      )}

    </div>
  );
};
