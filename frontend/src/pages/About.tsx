import React from "react";
import { Link } from "react-router-dom";
import {
  HeartHandshake,
  CheckCircle2,
  ShieldCheck,
  Languages,
  Users,
  Compass,
  ArrowRight,
  Sparkles,
} from "lucide-react";
import { useApp } from "../context/AppContext";

export const About: React.FC = () => {
  const { t } = useApp();

  return (
    <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-10 space-y-12 animate-fade-in">
      
      {/* Header */}
      <div className="text-center space-y-3">
        <div className="inline-flex items-center gap-1.5 px-3.5 py-1.5 rounded-full bg-emerald-50 text-emerald-800 text-xs font-semibold">
          <HeartHandshake size={14} />
          <span>Civic Technology for Rural Inclusion</span>
        </div>
        <h1 className="font-display font-bold text-3xl sm:text-5xl text-gov-charcoal tracking-tight">
          About GramaSeva
        </h1>
        <p className="text-gov-slate text-base sm:text-lg max-w-2xl mx-auto leading-relaxed">
          Democratizing access to public schemes and welfare information for rural citizens across India.
        </p>
      </div>

      {/* The 3 Pillars: Problem, Solution, Impact */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        
        {/* 1. Problem */}
        <div className="bg-white rounded-3xl p-6 sm:p-8 border border-gov-sand shadow-sm space-y-4">
          <div className="w-12 h-12 rounded-2xl bg-rose-50 text-rose-700 flex items-center justify-center font-bold text-lg">
            01
          </div>
          <h3 className="font-display font-bold text-xl text-gov-charcoal">
            The Challenge
          </h3>
          <p className="text-sm text-gov-slate leading-relaxed">
            Government schemes are scattered across hundreds of departmental portals, often written in dense administrative language, requiring intermediaries or agents who take advantage of low digital-literacy citizens.
          </p>
        </div>

        {/* 2. Solution */}
        <div className="bg-white rounded-3xl p-6 sm:p-8 border border-gov-sand shadow-sm space-y-4">
          <div className="w-12 h-12 rounded-2xl bg-emerald-50 text-gov-primary flex items-center justify-center font-bold text-lg">
            02
          </div>
          <h3 className="font-display font-bold text-xl text-gov-charcoal">
            Our Solution
          </h3>
          <p className="text-sm text-gov-slate leading-relaxed">
            GramaSeva consolidates critical central and state schemes into one ultra-simple platform with clear plain-language summaries, required document checklists, step-by-step guidance, and regional language support.
          </p>
        </div>

        {/* 3. Impact */}
        <div className="bg-white rounded-3xl p-6 sm:p-8 border border-gov-sand shadow-sm space-y-4">
          <div className="w-12 h-12 rounded-2xl bg-blue-50 text-blue-700 flex items-center justify-center font-bold text-lg">
            03
          </div>
          <h3 className="font-display font-bold text-xl text-gov-charcoal">
            The Impact
          </h3>
          <p className="text-sm text-gov-slate leading-relaxed">
            Empowered rural citizens—farmers, students, senior citizens, and women—who can independently discover their entitlements, check eligibility, prepare the right documents, and apply without anxiety or middlemen.
          </p>
        </div>

      </div>

      {/* Core Principles */}
      <div className="bg-white rounded-3xl p-8 sm:p-10 border border-gov-sand shadow-sm space-y-6">
        <h2 className="font-display font-bold text-2xl text-gov-charcoal">
          Design & Operational Principles
        </h2>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <div className="flex items-start gap-3 p-4 bg-gov-cream/50 rounded-2xl border border-gov-sand/60">
            <Languages size={22} className="text-gov-primary flex-shrink-0 mt-0.5" />
            <div>
              <h4 className="font-bold text-sm text-gov-charcoal">True Multilingual First</h4>
              <p className="text-xs text-gov-slate mt-1">
                Full interface and scheme details translated in English, Telugu (తెలుగు), and Hindi (हिन्दी) with seamless zero-reload switching.
              </p>
            </div>
          </div>

          <div className="flex items-start gap-3 p-4 bg-gov-cream/50 rounded-2xl border border-gov-sand/60">
            <Users size={22} className="text-gov-primary flex-shrink-0 mt-0.5" />
            <div>
              <h4 className="font-bold text-sm text-gov-charcoal">Low Digital-Literacy UX</h4>
              <p className="text-xs text-gov-slate mt-1">
                Generous tap targets, high contrast mode, large text mode, audio reading (TTS), and voice search for citizens who struggle with complex forms.
              </p>
            </div>
          </div>

          <div className="flex items-start gap-3 p-4 bg-gov-cream/50 rounded-2xl border border-gov-sand/60">
            <ShieldCheck size={22} className="text-gov-primary flex-shrink-0 mt-0.5" />
            <div>
              <h4 className="font-bold text-sm text-gov-charcoal">Official Source Verification</h4>
              <p className="text-xs text-gov-slate mt-1">
                Strict safety validation ensuring only verified .gov.in and india.gov.in links are linked, protecting users from scam portals.
              </p>
            </div>
          </div>

          <div className="flex items-start gap-3 p-4 bg-gov-cream/50 rounded-2xl border border-gov-sand/60">
            <Compass size={22} className="text-gov-primary flex-shrink-0 mt-0.5" />
            <div>
              <h4 className="font-bold text-sm text-gov-charcoal">Transparent Privacy</h4>
              <p className="text-xs text-gov-slate mt-1">
                No tracking cookies, no collection of Aadhaar, bank credentials, or phone numbers. All eligibility calculations are client-side or anonymous.
              </p>
            </div>
          </div>
        </div>
      </div>

      {/* Safety Notice */}
      <div className="bg-emerald-50 border border-emerald-200 rounded-3xl p-6 sm:p-8 space-y-3 text-emerald-950">
        <div className="flex items-center gap-2 font-bold text-base text-emerald-900">
          <ShieldCheck size={22} className="text-gov-primary" />
          <span>Important Official Disclaimer</span>
        </div>
        <p className="text-xs sm:text-sm text-emerald-800 leading-relaxed">
          {t.footerDisclaimer} GramaSeva is an open civic-tech guidance project developed for public awareness. It is not an official government agency and does not process applications or award funds.
        </p>
      </div>

      {/* Bottom CTA */}
      <div className="text-center pt-4">
        <Link
          to="/schemes"
          className="inline-flex items-center gap-2 bg-gov-primary hover:bg-gov-darkGreen text-white font-bold text-base px-8 py-3.5 rounded-xl shadow-md transition-colors"
        >
          <span>Explore All Schemes</span>
          <ArrowRight size={18} />
        </Link>
      </div>

    </div>
  );
};
