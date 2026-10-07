import React from "react";
import { Link } from "react-router-dom";
import { ArrowRight, CheckCircle2, Calendar, ShieldCheck, Tag } from "lucide-react";
import { Scheme } from "../types";
import { useApp } from "../context/AppContext";

interface SchemeCardProps {
  scheme: Scheme;
}

export const SchemeCard: React.FC<SchemeCardProps> = ({ scheme }) => {
  const { t, getLocalizedName, getLocalizedSummary } = useApp();

  const isVerified = scheme.sourceType === "verified";

  return (
    <article className="card bg-white rounded-2xl p-6 border border-gov-sand/80 shadow-sm hover:shadow-md transition-all flex flex-col justify-between group">
      <div>
        {/* Top Badges */}
        <div className="flex items-center justify-between gap-2 mb-3.5">
          <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-semibold bg-emerald-50 text-emerald-800 border border-emerald-100">
            <Tag size={12} />
            <span className="capitalize">{scheme.category.replace("-", " ")}</span>
          </span>

          <span
            className={`inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-xs font-medium ${
              isVerified
                ? "bg-blue-50 text-blue-700 border border-blue-100"
                : "bg-amber-50 text-amber-700 border border-amber-100"
            }`}
          >
            <ShieldCheck size={12} />
            <span>{isVerified ? t.verifiedSource : t.demoData}</span>
          </span>
        </div>

        {/* Scheme Title */}
        <h3 className="font-display font-bold text-xl text-gov-charcoal group-hover:text-gov-primary transition-colors mb-2 leading-snug">
          {getLocalizedName(scheme)}
        </h3>

        {/* Scheme Summary */}
        <p className="text-gov-slate text-sm line-clamp-3 mb-4 leading-relaxed">
          {getLocalizedSummary(scheme)}
        </p>

        {/* Key Highlight / Benefits bullet */}
        {scheme.benefits && scheme.benefits.length > 0 && (
          <div className="bg-gov-sand/40 rounded-xl p-3 mb-4 text-xs text-gov-charcoal flex items-start gap-2 border border-gov-sand/60">
            <CheckCircle2 size={15} className="text-gov-primary mt-0.5 flex-shrink-0" />
            <span className="line-clamp-2">{scheme.benefits[0]}</span>
          </div>
        )}
      </div>

      {/* Card Footer & Action Buttons */}
      <div className="pt-3 border-t border-gov-sand/60 mt-auto">
        <div className="flex items-center justify-between text-xs text-gray-500 mb-4">
          <span className="flex items-center gap-1.5">
            <Calendar size={13} />
            <span>{t.lastUpdated}: {scheme.lastUpdated || "2026-10"}</span>
          </span>
        </div>

        <div className="flex items-center gap-2">
          <Link
            to={`/schemes/${scheme.id}`}
            className="flex-1 inline-flex items-center justify-center gap-1.5 bg-gov-lightGreen hover:bg-emerald-100 text-gov-darkGreen font-semibold text-sm py-2.5 px-3 rounded-xl transition-colors"
          >
            <span>{t.viewDetails}</span>
            <ArrowRight size={15} />
          </Link>

          <Link
            to="/eligibility"
            className="inline-flex items-center justify-center border border-gov-sand hover:bg-gov-sand text-gov-charcoal font-medium text-sm py-2.5 px-3 rounded-xl transition-colors"
            title={t.checkEligibility}
          >
            <span>{t.checkEligibility}</span>
          </Link>
        </div>
      </div>
    </article>
  );
};
