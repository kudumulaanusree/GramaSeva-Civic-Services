import React, { useState, useEffect } from "react";
import { Link, useNavigate } from "react-router-dom";
import {
  Search,
  ArrowRight,
  Sparkles,
  ClipboardCheck,
  MessageSquare,
  FileText,
  Sprout,
  GraduationCap,
  HeartPulse,
  Home as HomeIcon,
  Briefcase,
  Baby,
  HandHeart,
  Wallet,
  BookOpenCheck,
  Wrench,
  ShieldCheck,
  CheckCircle2,
  Users,
} from "lucide-react";
import { useApp } from "../context/AppContext";
import { fetchCategories, fetchSchemes } from "../services/api";
import { Category, Scheme } from "../types";
import { SchemeCard } from "../components/SchemeCard";

export const Home: React.FC = () => {
  const { t } = useApp();
  const navigate = useNavigate();
  const [searchQuery, setSearchQuery] = useState("");
  const [categories, setCategories] = useState<Category[]>([]);
  const [featuredSchemes, setFeaturedSchemes] = useState<Scheme[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function loadData() {
      try {
        setLoading(true);
        const [cats, schemes] = await Promise.all([
          fetchCategories(),
          fetchSchemes({ sort: "relevance" }),
        ]);
        setCategories(cats);
        setFeaturedSchemes(schemes.slice(0, 3));
      } catch (err) {
        console.error("Failed to load homepage data:", err);
      } finally {
        setLoading(false);
      }
    }
    loadData();
  }, []);

  const handleSearchSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (searchQuery.trim()) {
      navigate(`/schemes?q=${encodeURIComponent(searchQuery.trim())}`);
    } else {
      navigate("/schemes");
    }
  };

  const categoryIcons: Record<string, React.ReactNode> = {
    agriculture: <Sprout size={24} className="text-emerald-700" />,
    education: <GraduationCap size={24} className="text-blue-700" />,
    health: <HeartPulse size={24} className="text-rose-700" />,
    housing: <HomeIcon size={24} className="text-amber-700" />,
    employment: <Briefcase size={24} className="text-indigo-700" />,
    "women-child": <Baby size={24} className="text-pink-700" />,
    pension: <HandHeart size={24} className="text-teal-700" />,
    "financial-support": <Wallet size={24} className="text-green-700" />,
    scholarships: <BookOpenCheck size={24} className="text-sky-700" />,
    "skill-development": <Wrench size={24} className="text-orange-700" />,
  };

  return (
    <div className="space-y-16 sm:space-y-24 pb-12 animate-fade-in">
      
      {/* 1. Hero Section */}
      <section className="relative overflow-hidden bg-gradient-to-b from-gov-sand/60 via-gov-cream to-white pt-10 pb-16 sm:py-20 border-b border-gov-sand">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-12 items-center">
            
            {/* Hero Text and Search */}
            <div className="lg:col-span-7 space-y-6 text-center lg:text-left">
              <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-emerald-100 text-gov-darkGreen text-xs font-semibold tracking-wide shadow-sm">
                <Sparkles size={14} />
                <span>Multilingual Citizen Services Guide</span>
              </div>

              <h1 className="font-display font-bold text-4xl sm:text-5xl lg:text-6xl text-gov-charcoal tracking-tight leading-[1.15]">
                {t.heroTitle}
              </h1>

              <p className="text-gov-slate text-base sm:text-lg max-w-2xl mx-auto lg:mx-0 leading-relaxed">
                {t.heroSubtitle}
              </p>

              {/* Quick Search Form */}
              <form
                onSubmit={handleSearchSubmit}
                className="relative max-w-xl mx-auto lg:mx-0 flex items-center bg-white rounded-2xl shadow-md border border-gov-sand p-2 focus-within:ring-2 focus-within:ring-gov-primary transition-all"
              >
                <Search size={22} className="text-gray-400 ml-3 mr-2 flex-shrink-0" />
                <input
                  type="text"
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  placeholder={t.quickSearchPlaceholder}
                  className="w-full text-sm sm:text-base outline-none bg-transparent pr-2 text-gov-charcoal placeholder:text-gray-400"
                />
                <button
                  type="submit"
                  className="bg-gov-primary hover:bg-gov-darkGreen text-white font-semibold text-sm px-5 py-3 rounded-xl transition-colors flex items-center gap-1.5 flex-shrink-0 shadow-sm"
                >
                  <span>Search</span>
                  <ArrowRight size={16} />
                </button>
              </form>

              {/* CTAs */}
              <div className="flex flex-wrap items-center justify-center lg:justify-start gap-4 pt-2">
                <Link
                  to="/schemes"
                  className="inline-flex items-center gap-2 bg-gov-darkGreen hover:bg-emerald-950 text-white font-semibold text-sm sm:text-base px-6 py-3.5 rounded-xl shadow-sm transition-all hover:translate-y-[-1px]"
                >
                  <span>{t.exploreSchemes}</span>
                  <ArrowRight size={18} />
                </Link>
                <Link
                  to="/eligibility"
                  className="inline-flex items-center gap-2 bg-white hover:bg-gov-sand/60 text-gov-charcoal border border-gov-sand font-semibold text-sm sm:text-base px-6 py-3.5 rounded-xl shadow-sm transition-all"
                >
                  <ClipboardCheck size={18} className="text-gov-primary" />
                  <span>{t.checkEligibilityBtn}</span>
                </Link>
              </div>

              {/* Trust Indicators */}
              <div className="flex items-center justify-center lg:justify-start gap-6 text-xs text-gov-slate pt-4">
                <span className="flex items-center gap-1.5 font-medium">
                  <ShieldCheck size={16} className="text-gov-primary" />
                  Verified .gov.in links
                </span>
                <span className="flex items-center gap-1.5 font-medium">
                  <CheckCircle2 size={16} className="text-gov-primary" />
                  100% Free Public Guide
                </span>
              </div>
            </div>

            {/* Hero Visual Card / Rural India Illustration */}
            <div className="lg:col-span-5 flex justify-center">
              <div className="relative w-full max-w-md bg-white rounded-3xl p-6 sm:p-8 shadow-xl border border-gov-sand/80 space-y-6">
                <div className="w-16 h-16 rounded-2xl bg-gov-lightGreen text-gov-primary flex items-center justify-center text-3xl shadow-sm mx-auto">
                  🌾
                </div>

                <div className="text-center space-y-2">
                  <h3 className="font-display font-bold text-2xl text-gov-charcoal">
                    {t.appName}
                  </h3>
                  <p className="text-xs text-gov-slate">
                    Connecting rural families to essential public welfare programs.
                  </p>
                </div>

                {/* Quick stats banner */}
                <div className="grid grid-cols-3 gap-2 text-center py-4 border-y border-gov-sand bg-gov-cream/40 rounded-2xl">
                  <div>
                    <span className="block font-bold text-lg text-gov-darkGreen">15+</span>
                    <span className="text-[11px] text-gray-500 uppercase">Schemes</span>
                  </div>
                  <div className="border-x border-gov-sand">
                    <span className="block font-bold text-lg text-gov-darkGreen">3</span>
                    <span className="text-[11px] text-gray-500 uppercase">Languages</span>
                  </div>
                  <div>
                    <span className="block font-bold text-lg text-gov-darkGreen">10</span>
                    <span className="text-[11px] text-gray-500 uppercase">Categories</span>
                  </div>
                </div>

                {/* Regional Languages banner */}
                <div className="flex items-center justify-center gap-2 text-xs font-semibold text-emerald-800 bg-emerald-50 px-4 py-3 rounded-xl border border-emerald-100">
                  <span>English</span>
                  <span>•</span>
                  <span>తెలుగు</span>
                  <span>•</span>
                  <span>हिन्दी</span>
                </div>
              </div>
            </div>

          </div>
        </div>
      </section>

      {/* 2. Quick Actions */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
          
          <Link
            to="/schemes"
            className="group card bg-white rounded-2xl p-6 border border-gov-sand hover:border-gov-primary/40 shadow-sm hover:shadow-md transition-all flex flex-col justify-between"
          >
            <div>
              <div className="w-12 h-12 rounded-xl bg-emerald-50 text-gov-primary flex items-center justify-center mb-4 group-hover:scale-105 transition-transform">
                <Search size={24} />
              </div>
              <h3 className="font-display font-bold text-lg text-gov-charcoal mb-2 group-hover:text-gov-primary transition-colors">
                {t.qaFindSchemeTitle}
              </h3>
              <p className="text-gov-slate text-sm">
                {t.qaFindSchemeDesc}
              </p>
            </div>
            <div className="mt-5 flex items-center gap-1.5 text-xs font-semibold text-gov-primary">
              <span>Explore now</span>
              <ArrowRight size={14} className="group-hover:translate-x-1 transition-transform" />
            </div>
          </Link>

          <Link
            to="/eligibility"
            className="group card bg-white rounded-2xl p-6 border border-gov-sand hover:border-gov-primary/40 shadow-sm hover:shadow-md transition-all flex flex-col justify-between"
          >
            <div>
              <div className="w-12 h-12 rounded-xl bg-blue-50 text-blue-700 flex items-center justify-center mb-4 group-hover:scale-105 transition-transform">
                <ClipboardCheck size={24} />
              </div>
              <h3 className="font-display font-bold text-lg text-gov-charcoal mb-2 group-hover:text-gov-primary transition-colors">
                {t.qaEligibilityTitle}
              </h3>
              <p className="text-gov-slate text-sm">
                {t.qaEligibilityDesc}
              </p>
            </div>
            <div className="mt-5 flex items-center gap-1.5 text-xs font-semibold text-blue-700">
              <span>Check eligibility</span>
              <ArrowRight size={14} className="group-hover:translate-x-1 transition-transform" />
            </div>
          </Link>

          <Link
            to="/assistant"
            className="group card bg-white rounded-2xl p-6 border border-gov-sand hover:border-gov-primary/40 shadow-sm hover:shadow-md transition-all flex flex-col justify-between"
          >
            <div>
              <div className="w-12 h-12 rounded-xl bg-amber-50 text-amber-700 flex items-center justify-center mb-4 group-hover:scale-105 transition-transform">
                <MessageSquare size={24} />
              </div>
              <h3 className="font-display font-bold text-lg text-gov-charcoal mb-2 group-hover:text-gov-primary transition-colors">
                {t.qaAssistantTitle}
              </h3>
              <p className="text-gov-slate text-sm">
                {t.qaAssistantDesc}
              </p>
            </div>
            <div className="mt-5 flex items-center gap-1.5 text-xs font-semibold text-amber-700">
              <span>Ask with voice or text</span>
              <ArrowRight size={14} className="group-hover:translate-x-1 transition-transform" />
            </div>
          </Link>

          <Link
            to="/schemes"
            className="group card bg-white rounded-2xl p-6 border border-gov-sand hover:border-gov-primary/40 shadow-sm hover:shadow-md transition-all flex flex-col justify-between"
          >
            <div>
              <div className="w-12 h-12 rounded-xl bg-rose-50 text-rose-700 flex items-center justify-center mb-4 group-hover:scale-105 transition-transform">
                <FileText size={24} />
              </div>
              <h3 className="font-display font-bold text-lg text-gov-charcoal mb-2 group-hover:text-gov-primary transition-colors">
                {t.qaDocsTitle}
              </h3>
              <p className="text-gov-slate text-sm">
                {t.qaDocsDesc}
              </p>
            </div>
            <div className="mt-5 flex items-center gap-1.5 text-xs font-semibold text-rose-700">
              <span>View requirements</span>
              <ArrowRight size={14} className="group-hover:translate-x-1 transition-transform" />
            </div>
          </Link>

        </div>
      </section>

      {/* 3. Popular Categories Section */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex flex-col sm:flex-row sm:items-end justify-between mb-8 gap-4">
          <div>
            <h2 className="font-display font-bold text-2xl sm:text-3xl text-gov-charcoal">
              {t.categoriesTitle}
            </h2>
            <p className="text-gov-slate text-sm mt-1">
              {t.categoriesSubtitle}
            </p>
          </div>
          <Link
            to="/schemes"
            className="inline-flex items-center gap-1.5 text-sm font-semibold text-gov-primary hover:text-gov-darkGreen"
          >
            <span>{t.allCategories}</span>
            <ArrowRight size={16} />
          </Link>
        </div>

        <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-5 gap-4">
          {categories.map((cat) => (
            <Link
              key={cat.id}
              to={`/schemes?category=${cat.id}`}
              className="card bg-white rounded-2xl p-4 sm:p-5 border border-gov-sand hover:border-emerald-200 hover:shadow-md transition-all flex flex-col items-center text-center group"
            >
              <div className="w-12 h-12 rounded-xl bg-gov-cream flex items-center justify-center mb-3 group-hover:scale-110 transition-transform">
                {categoryIcons[cat.id] || <Sparkles size={22} className="text-gov-primary" />}
              </div>
              <h4 className="font-display font-bold text-sm text-gov-charcoal group-hover:text-gov-primary transition-colors line-clamp-1">
                {cat.label}
              </h4>
              <span className="text-xs text-gray-400 mt-1">
                {cat.count ?? 1} {t.schemesAvailable}
              </span>
            </Link>
          ))}
        </div>
      </section>

      {/* 4. Featured Schemes */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex flex-col sm:flex-row sm:items-end justify-between mb-8 gap-4">
          <div>
            <h2 className="font-display font-bold text-2xl sm:text-3xl text-gov-charcoal">
              {t.featuredTitle}
            </h2>
            <p className="text-gov-slate text-sm mt-1">
              {t.featuredSubtitle}
            </p>
          </div>
          <Link
            to="/schemes"
            className="inline-flex items-center gap-1.5 text-sm font-semibold text-gov-primary hover:text-gov-darkGreen"
          >
            <span>{t.viewAllSchemes}</span>
            <ArrowRight size={16} />
          </Link>
        </div>

        {loading ? (
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {[1, 2, 3].map((n) => (
              <div key={n} className="bg-white rounded-2xl p-6 border border-gov-sand animate-pulse space-y-4">
                <div className="h-6 bg-gov-sand rounded-full w-24"></div>
                <div className="h-7 bg-gov-sand rounded w-3/4"></div>
                <div className="h-16 bg-gov-sand rounded"></div>
                <div className="h-10 bg-gov-sand rounded"></div>
              </div>
            ))}
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {featuredSchemes.map((scheme) => (
              <SchemeCard key={scheme.id} scheme={scheme} />
            ))}
          </div>
        )}
      </section>

      {/* 5. How It Works */}
      <section className="bg-gov-sand/40 border-y border-gov-sand py-16">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center max-w-2xl mx-auto mb-12">
            <h2 className="font-display font-bold text-3xl text-gov-charcoal">
              {t.howItWorksTitle}
            </h2>
            <p className="text-gov-slate text-sm sm:text-base mt-2">
              {t.howItWorksSubtitle}
            </p>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
            <div className="bg-white rounded-2xl p-6 border border-gov-sand/80 shadow-sm relative">
              <span className="text-3xl font-display font-black text-emerald-100 absolute top-4 right-4">01</span>
              <h3 className="font-display font-bold text-lg text-gov-charcoal mb-2">{t.step1Title}</h3>
              <p className="text-sm text-gov-slate leading-relaxed">{t.step1Desc}</p>
            </div>

            <div className="bg-white rounded-2xl p-6 border border-gov-sand/80 shadow-sm relative">
              <span className="text-3xl font-display font-black text-emerald-100 absolute top-4 right-4">02</span>
              <h3 className="font-display font-bold text-lg text-gov-charcoal mb-2">{t.step2Title}</h3>
              <p className="text-sm text-gov-slate leading-relaxed">{t.step2Desc}</p>
            </div>

            <div className="bg-white rounded-2xl p-6 border border-gov-sand/80 shadow-sm relative">
              <span className="text-3xl font-display font-black text-emerald-100 absolute top-4 right-4">03</span>
              <h3 className="font-display font-bold text-lg text-gov-charcoal mb-2">{t.step3Title}</h3>
              <p className="text-sm text-gov-slate leading-relaxed">{t.step3Desc}</p>
            </div>

            <div className="bg-white rounded-2xl p-6 border border-gov-sand/80 shadow-sm relative">
              <span className="text-3xl font-display font-black text-emerald-100 absolute top-4 right-4">04</span>
              <h3 className="font-display font-bold text-lg text-gov-charcoal mb-2">{t.step4Title}</h3>
              <p className="text-sm text-gov-slate leading-relaxed">{t.step4Desc}</p>
            </div>
          </div>
        </div>
      </section>

      {/* 6. Why GramaSeva */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center max-w-2xl mx-auto mb-12">
          <h2 className="font-display font-bold text-3xl text-gov-charcoal">
            {t.whyTitle}
          </h2>
          <p className="text-gov-slate text-sm sm:text-base mt-2">
            {t.whySubtitle}
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          <div className="bg-white p-6 rounded-2xl border border-gov-sand">
            <div className="w-10 h-10 rounded-xl bg-emerald-50 text-gov-primary flex items-center justify-center font-bold text-lg mb-4">
              1
            </div>
            <h3 className="font-display font-bold text-lg text-gov-charcoal mb-2">{t.why1Title}</h3>
            <p className="text-sm text-gov-slate leading-relaxed">{t.why1Desc}</p>
          </div>

          <div className="bg-white p-6 rounded-2xl border border-gov-sand">
            <div className="w-10 h-10 rounded-xl bg-emerald-50 text-gov-primary flex items-center justify-center font-bold text-lg mb-4">
              2
            </div>
            <h3 className="font-display font-bold text-lg text-gov-charcoal mb-2">{t.why2Title}</h3>
            <p className="text-sm text-gov-slate leading-relaxed">{t.why2Desc}</p>
          </div>

          <div className="bg-white p-6 rounded-2xl border border-gov-sand">
            <div className="w-10 h-10 rounded-xl bg-emerald-50 text-gov-primary flex items-center justify-center font-bold text-lg mb-4">
              3
            </div>
            <h3 className="font-display font-bold text-lg text-gov-charcoal mb-2">{t.why3Title}</h3>
            <p className="text-sm text-gov-slate leading-relaxed">{t.why3Desc}</p>
          </div>

          <div className="bg-white p-6 rounded-2xl border border-gov-sand">
            <div className="w-10 h-10 rounded-xl bg-emerald-50 text-gov-primary flex items-center justify-center font-bold text-lg mb-4">
              4
            </div>
            <h3 className="font-display font-bold text-lg text-gov-charcoal mb-2">{t.why4Title}</h3>
            <p className="text-sm text-gov-slate leading-relaxed">{t.why4Desc}</p>
          </div>
        </div>
      </section>

      {/* 7. Call To Action Banner */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="bg-gradient-to-r from-gov-darkGreen to-emerald-800 text-white rounded-3xl p-8 sm:p-12 shadow-xl flex flex-col md:flex-row items-center justify-between gap-8 text-center md:text-left">
          <div className="space-y-3 max-w-xl">
            <h2 className="font-display font-bold text-3xl sm:text-4xl text-white leading-tight">
              {t.ctaTitle}
            </h2>
            <p className="text-emerald-100 text-sm sm:text-base">
              {t.ctaSubtitle}
            </p>
          </div>
          <Link
            to="/eligibility"
            className="inline-flex items-center gap-2 bg-white hover:bg-emerald-50 text-gov-darkGreen font-bold text-base px-8 py-4 rounded-xl shadow-lg transition-all hover:scale-105 flex-shrink-0"
          >
            <span>{t.ctaButton}</span>
            <ArrowRight size={18} />
          </Link>
        </div>
      </section>

    </div>
  );
};
