import React from "react";
import { Link } from "react-router-dom";
import { ShieldCheck, HeartHandshake, PhoneCall } from "lucide-react";
import { useApp } from "../context/AppContext";

export const Footer: React.FC = () => {
  const { t } = useApp();

  return (
    <footer className="bg-gov-sand/60 border-t border-gov-sand mt-20 pt-12 pb-8">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        
        {/* Main Footer Grid */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-8 pb-10 border-b border-gov-sand">
          
          {/* Brand Info */}
          <div className="md:col-span-2 space-y-4">
            <Link to="/" className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-lg bg-gov-lightGreen text-gov-primary flex items-center justify-center text-xl">
                🌾
              </div>
              <span className="font-display font-bold text-2xl text-gov-darkGreen">
                {t.appName}
              </span>
            </Link>
            <p className="text-gov-slate text-sm max-w-md leading-relaxed">
              {t.subTagline}
            </p>
            <div className="flex items-center gap-2 text-xs text-emerald-800 bg-emerald-50 px-3 py-2 rounded-lg border border-emerald-200/60 max-w-md">
              <HeartHandshake size={16} className="text-gov-primary flex-shrink-0" />
              <span>Designed with simplicity for rural citizens, farmers, students, and elders.</span>
            </div>
          </div>

          {/* Quick Links */}
          <div>
            <h4 className="font-display font-bold text-gov-charcoal text-sm uppercase tracking-wider mb-4">
              Navigation
            </h4>
            <ul className="space-y-2 text-sm text-gov-slate font-medium">
              <li>
                <Link to="/" className="hover:text-gov-primary transition-colors">
                  {t.navHome}
                </Link>
              </li>
              <li>
                <Link to="/schemes" className="hover:text-gov-primary transition-colors">
                  {t.navSchemes}
                </Link>
              </li>
              <li>
                <Link to="/eligibility" className="hover:text-gov-primary transition-colors">
                  {t.navEligibility}
                </Link>
              </li>
              <li>
                <Link to="/assistant" className="hover:text-gov-primary transition-colors">
                  {t.navAssistant}
                </Link>
              </li>
              <li>
                <Link to="/about" className="hover:text-gov-primary transition-colors">
                  {t.navAbout}
                </Link>
              </li>
            </ul>
          </div>

          {/* Helpline & Admin */}
          <div>
            <h4 className="font-display font-bold text-gov-charcoal text-sm uppercase tracking-wider mb-4">
              Assistance & Info
            </h4>
            <div className="space-y-3 text-sm text-gov-slate">
              <div className="flex items-start gap-2.5">
                <PhoneCall size={16} className="text-gov-primary mt-0.5 flex-shrink-0" />
                <div>
                  <span className="font-semibold block text-gov-charcoal">National Toll-Free: 1912</span>
                  <span className="text-xs text-gray-500">Kisan Call Centre: 1800-180-1551</span>
                </div>
              </div>
              <div className="pt-2">
                <Link
                  to="/admin"
                  className="inline-flex items-center gap-1.5 text-xs font-semibold text-emerald-800 bg-white border border-gov-sand px-3 py-1.5 rounded-md hover:bg-gov-sand transition-colors"
                >
                  <ShieldCheck size={14} />
                  <span>{t.navAdmin}</span>
                </Link>
              </div>
            </div>
          </div>
        </div>

        {/* Disclaimer & Copyright */}
        <div className="pt-8 text-xs text-gray-500 space-y-3 text-center sm:text-left sm:flex sm:items-center sm:justify-between">
          <p className="max-w-2xl leading-relaxed">
            <span className="font-semibold text-gray-700">Notice: </span>
            {t.footerDisclaimer}
          </p>
          <p className="whitespace-nowrap">
            {t.footerRights}
          </p>
        </div>
      </div>
    </footer>
  );
};
