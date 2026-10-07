import React, { useState } from "react";
import { Link, useLocation } from "react-router-dom";
import {
  Menu,
  X,
  Globe,
  Eye,
  Home,
  BookOpen,
  ClipboardCheck,
  MessageSquare,
  Info,
  ShieldAlert,
} from "lucide-react";
import { useApp } from "../context/AppContext";
import { Language } from "../types";

export const Navbar: React.FC = () => {
  const { language, setLanguage, largeText, setLargeText, highContrast, setHighContrast, t } = useApp();
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [accessMenuOpen, setAccessMenuOpen] = useState(false);
  const location = useLocation();

  const navLinks = [
    { to: "/", label: t.navHome, icon: Home },
    { to: "/schemes", label: t.navSchemes, icon: BookOpen },
    { to: "/eligibility", label: t.navEligibility, icon: ClipboardCheck },
    { to: "/assistant", label: t.navAssistant, icon: MessageSquare },
    { to: "/about", label: t.navAbout, icon: Info },
  ];

  const handleLanguageChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    setLanguage(e.target.value as Language);
  };

  return (
    <header className="sticky top-0 z-50 bg-white/95 backdrop-blur-md border-b border-gov-sand shadow-sm transition-colors">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-20">
          
          {/* Brand Logo */}
          <Link to="/" className="flex items-center gap-3 group" onClick={() => setMobileMenuOpen(false)}>
            <div className="w-12 h-12 rounded-xl bg-gov-lightGreen text-gov-primary flex items-center justify-center text-2xl shadow-inner group-hover:scale-105 transition-transform">
              🌾
            </div>
            <div>
              <span className="font-display font-bold text-2xl text-gov-darkGreen tracking-tight block">
                {t.appName}
              </span>
              <span className="text-xs text-gov-slate font-medium hidden sm:block">
                {t.tagline}
              </span>
            </div>
          </Link>

          {/* Desktop Navigation */}
          <nav className="hidden md:flex items-center gap-1 lg:gap-2">
            {navLinks.map((link) => {
              const Icon = link.icon;
              const isActive = location.pathname === link.to;
              return (
                <Link
                  key={link.to}
                  to={link.to}
                  className={`flex items-center gap-2 px-3.5 py-2 rounded-lg font-medium text-sm transition-all ${
                    isActive
                      ? "bg-gov-lightGreen text-gov-darkGreen font-semibold shadow-sm"
                      : "text-gov-slate hover:text-gov-primary hover:bg-gov-sand/60"
                  }`}
                >
                  <Icon size={18} className={isActive ? "text-gov-primary" : "text-gray-400"} />
                  <span>{link.label}</span>
                </Link>
              );
            })}
          </nav>

          {/* Controls: Language, Accessibility, Admin */}
          <div className="flex items-center gap-2 sm:gap-3">
            
            {/* Language Selector */}
            <div className="relative flex items-center bg-gov-sand/80 hover:bg-gov-sand rounded-lg px-2.5 py-1.5 border border-gov-sand transition-colors">
              <Globe size={16} className="text-gov-primary mr-1.5" />
              <select
                value={language}
                onChange={handleLanguageChange}
                aria-label={t.language}
                className="bg-transparent text-sm font-semibold text-gov-charcoal outline-none cursor-pointer pr-1"
              >
                <option value="en">English</option>
                <option value="te">తెలుగు</option>
                <option value="hi">हिन्दी</option>
              </select>
            </div>

            {/* Accessibility Dropdown */}
            <div className="relative">
              <button
                onClick={() => setAccessMenuOpen(!accessMenuOpen)}
                title={t.accessibility}
                aria-label={t.accessibility}
                className="p-2 rounded-lg border border-gov-sand bg-gov-sand/60 hover:bg-gov-sand text-gov-slate hover:text-gov-primary font-bold text-sm flex items-center justify-center transition-colors"
              >
                <Eye size={18} />
              </button>

              {accessMenuOpen && (
                <div className="absolute right-0 mt-2 w-56 bg-white rounded-xl shadow-xl border border-gov-sand p-3 z-50 animate-fade-in">
                  <div className="text-xs font-semibold uppercase tracking-wider text-gray-500 mb-2 px-1">
                    {t.accessibility}
                  </div>
                  <label className="flex items-center justify-between p-2 rounded-lg hover:bg-gov-sand/50 cursor-pointer">
                    <span className="text-sm font-medium text-gov-charcoal">{t.largeText}</span>
                    <input
                      type="checkbox"
                      checked={largeText}
                      onChange={(e) => setLargeText(e.target.checked)}
                      className="w-4 h-4 accent-gov-primary rounded"
                    />
                  </label>
                  <label className="flex items-center justify-between p-2 rounded-lg hover:bg-gov-sand/50 cursor-pointer">
                    <span className="text-sm font-medium text-gov-charcoal">{t.highContrast}</span>
                    <input
                      type="checkbox"
                      checked={highContrast}
                      onChange={(e) => setHighContrast(e.target.checked)}
                      className="w-4 h-4 accent-gov-primary rounded"
                    />
                  </label>
                </div>
              )}
            </div>

            {/* Admin Link Button */}
            <Link
              to="/admin"
              title={t.navAdmin}
              className="hidden lg:flex items-center gap-1.5 px-3 py-1.5 rounded-lg border border-emerald-200 text-gov-darkGreen text-xs font-semibold hover:bg-gov-lightGreen transition-colors"
            >
              <ShieldAlert size={14} />
              <span>{t.navAdmin}</span>
            </Link>

            {/* Mobile Hamburger Toggle */}
            <button
              onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
              className="p-2 md:hidden text-gov-charcoal hover:text-gov-primary rounded-lg focus:outline-none"
              aria-label="Toggle menu"
            >
              {mobileMenuOpen ? <X size={26} /> : <Menu size={26} />}
            </button>
          </div>
        </div>
      </div>

      {/* Mobile Drawer Menu */}
      {mobileMenuOpen && (
        <div className="md:hidden border-t border-gov-sand bg-white px-4 pt-3 pb-6 shadow-xl animate-fade-in">
          <div className="flex flex-col gap-1">
            {navLinks.map((link) => {
              const Icon = link.icon;
              const isActive = location.pathname === link.to;
              return (
                <Link
                  key={link.to}
                  to={link.to}
                  onClick={() => setMobileMenuOpen(false)}
                  className={`flex items-center gap-3 px-4 py-3 rounded-xl font-medium text-base transition-colors ${
                    isActive
                      ? "bg-gov-lightGreen text-gov-darkGreen font-bold"
                      : "text-gov-slate hover:bg-gov-sand/60"
                  }`}
                >
                  <Icon size={20} className={isActive ? "text-gov-primary" : "text-gray-400"} />
                  <span>{link.label}</span>
                </Link>
              );
            })}
            <Link
              to="/admin"
              onClick={() => setMobileMenuOpen(false)}
              className="flex items-center gap-3 px-4 py-3 rounded-xl font-medium text-base text-emerald-800 bg-emerald-50 hover:bg-emerald-100 mt-2"
            >
              <ShieldAlert size={20} />
              <span>{t.navAdmin}</span>
            </Link>
          </div>
        </div>
      )}
    </header>
  );
};
