import React, { useState, useEffect } from "react";
import { useSearchParams } from "react-router-dom";
import { Search, Filter, ArrowUpDown, X, Loader2, Sparkles } from "lucide-react";
import { useApp } from "../context/AppContext";
import { fetchSchemes, fetchCategories } from "../services/api";
import { Scheme, Category } from "../types";
import { SchemeCard } from "../components/SchemeCard";

export const Schemes: React.FC = () => {
  const { t } = useApp();
  const [searchParams, setSearchParams] = useSearchParams();

  const queryParam = searchParams.get("q") || "";
  const categoryParam = searchParams.get("category") || "";

  const [searchQuery, setSearchQuery] = useState(queryParam);
  const [selectedCategory, setSelectedCategory] = useState(categoryParam);
  const [sortBy, setSortBy] = useState<string>("relevance");

  const [schemes, setSchemes] = useState<Scheme[]>([]);
  const [categories, setCategories] = useState<Category[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    async function loadCategories() {
      try {
        const cats = await fetchCategories();
        setCategories(cats);
      } catch (err) {
        console.error("Failed to load categories:", err);
      }
    }
    loadCategories();
  }, []);

  useEffect(() => {
    setSearchQuery(queryParam);
    setSelectedCategory(categoryParam);
  }, [queryParam, categoryParam]);

  useEffect(() => {
    async function loadSchemes() {
      try {
        setLoading(true);
        setError("");
        const data = await fetchSchemes({
          q: searchQuery.trim() || undefined,
          category: selectedCategory || undefined,
          sort: sortBy,
        });
        setSchemes(data);
      } catch (err) {
        setError("Unable to load schemes. Please check your network connection.");
      } finally {
        setLoading(false);
      }
    }
    loadSchemes();
  }, [searchQuery, selectedCategory, sortBy]);

  const handleSearchSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    updateUrlParams(searchQuery, selectedCategory);
  };

  const handleCategoryChange = (catId: string) => {
    setSelectedCategory(catId);
    updateUrlParams(searchQuery, catId);
  };

  const updateUrlParams = (q: string, cat: string) => {
    const params = new URLSearchParams();
    if (q.trim()) params.set("q", q.trim());
    if (cat) params.set("category", cat);
    setSearchParams(params);
  };

  const clearFilters = () => {
    setSearchQuery("");
    setSelectedCategory("");
    setSearchParams(new URLSearchParams());
  };

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10 space-y-8 animate-fade-in">
      
      {/* Header */}
      <div className="space-y-2 border-b border-gov-sand pb-6">
        <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-emerald-50 text-emerald-800 text-xs font-semibold">
          <Sparkles size={13} />
          <span>{t.navSchemes}</span>
        </div>
        <h1 className="font-display font-bold text-3xl sm:text-4xl text-gov-charcoal">
          {t.schemesPageTitle}
        </h1>
        <p className="text-gov-slate text-sm sm:text-base max-w-2xl">
          {t.schemesPageSubtitle}
        </p>
      </div>

      {/* Search & Filter Bar */}
      <div className="bg-white p-4 sm:p-5 rounded-2xl border border-gov-sand shadow-sm space-y-4">
        <form onSubmit={handleSearchSubmit} className="flex flex-col sm:flex-row gap-3">
          
          {/* Keyword Search Input */}
          <div className="relative flex-1">
            <Search size={20} className="text-gray-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder={t.searchPlaceholder}
              className="w-full pl-11 pr-4 py-3 bg-gov-cream/40 rounded-xl border border-gov-sand text-sm focus:outline-none focus:ring-2 focus:ring-gov-primary text-gov-charcoal"
            />
            {searchQuery && (
              <button
                type="button"
                onClick={() => {
                  setSearchQuery("");
                  updateUrlParams("", selectedCategory);
                }}
                className="absolute right-3.5 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600"
              >
                <X size={16} />
              </button>
            )}
          </div>

          {/* Category Dropdown */}
          <div className="relative sm:w-60">
            <Filter size={18} className="text-gray-400 absolute left-3.5 top-1/2 -translate-y-1/2 pointer-events-none" />
            <select
              value={selectedCategory}
              onChange={(e) => handleCategoryChange(e.target.value)}
              className="w-full pl-10 pr-8 py-3 bg-gov-cream/40 rounded-xl border border-gov-sand text-sm font-medium focus:outline-none focus:ring-2 focus:ring-gov-primary text-gov-charcoal appearance-none cursor-pointer"
            >
              <option value="">{t.categoryFilter}</option>
              {categories.map((c) => (
                <option key={c.id} value={c.id}>
                  {c.label} ({c.count ?? 1})
                </option>
              ))}
            </select>
          </div>

          {/* Sort Dropdown */}
          <div className="relative sm:w-48">
            <ArrowUpDown size={16} className="text-gray-400 absolute left-3.5 top-1/2 -translate-y-1/2 pointer-events-none" />
            <select
              value={sortBy}
              onChange={(e) => setSortBy(e.target.value)}
              className="w-full pl-9 pr-8 py-3 bg-gov-cream/40 rounded-xl border border-gov-sand text-sm font-medium focus:outline-none focus:ring-2 focus:ring-gov-primary text-gov-charcoal appearance-none cursor-pointer"
            >
              <option value="relevance">{t.sortRelevance}</option>
              <option value="name">{t.sortName}</option>
            </select>
          </div>

          <button
            type="submit"
            className="bg-gov-primary hover:bg-gov-darkGreen text-white font-semibold text-sm px-6 py-3 rounded-xl transition-colors sm:flex-shrink-0"
          >
            Search
          </button>
        </form>

        {/* Category Quick Filter Chips */}
        <div className="flex flex-wrap items-center gap-2 pt-2 border-t border-gov-sand/60">
          <span className="text-xs font-semibold text-gray-400 mr-1 uppercase">Categories:</span>
          <button
            onClick={() => handleCategoryChange("")}
            className={`px-3 py-1 rounded-full text-xs font-medium transition-colors ${
              !selectedCategory
                ? "bg-gov-primary text-white"
                : "bg-gov-sand/60 text-gov-slate hover:bg-gov-sand"
            }`}
          >
            All
          </button>
          {categories.map((cat) => (
            <button
              key={cat.id}
              onClick={() => handleCategoryChange(cat.id)}
              className={`px-3 py-1 rounded-full text-xs font-medium transition-colors ${
                selectedCategory === cat.id
                  ? "bg-gov-primary text-white"
                  : "bg-gov-sand/60 text-gov-slate hover:bg-gov-sand"
              }`}
            >
              {cat.label}
            </button>
          ))}
        </div>
      </div>

      {/* Active Filters / Result Count bar */}
      <div className="flex items-center justify-between text-sm text-gov-slate">
        <div>
          Showing <span className="font-bold text-gov-charcoal">{schemes.length}</span> schemes
          {(searchQuery || selectedCategory) && (
            <span className="ml-2 text-xs text-gray-500">
              for {searchQuery ? `"${searchQuery}"` : ""} {selectedCategory ? `[${selectedCategory}]` : ""}
            </span>
          )}
        </div>

        {(searchQuery || selectedCategory) && (
          <button
            onClick={clearFilters}
            className="text-xs font-semibold text-gov-primary hover:underline flex items-center gap-1"
          >
            <X size={14} />
            <span>Reset filters</span>
          </button>
        )}
      </div>

      {/* Schemes Grid */}
      {loading ? (
        <div className="py-20 flex flex-col items-center justify-center text-gov-slate gap-3">
          <Loader2 size={36} className="text-gov-primary animate-spin" />
          <p className="text-sm font-medium">Loading government schemes...</p>
        </div>
      ) : error ? (
        <div className="bg-red-50 text-red-700 p-6 rounded-2xl border border-red-100 text-center space-y-2">
          <p className="font-semibold">{error}</p>
          <button
            onClick={() => window.location.reload()}
            className="text-xs bg-red-600 text-white px-4 py-2 rounded-lg font-medium hover:bg-red-700 transition-colors"
          >
            Try Again
          </button>
        </div>
      ) : schemes.length === 0 ? (
        <div className="bg-white rounded-3xl p-12 text-center border border-gov-sand max-w-lg mx-auto space-y-4">
          <div className="w-16 h-16 bg-gov-sand text-gray-400 rounded-full flex items-center justify-center mx-auto text-2xl">
            🔍
          </div>
          <h3 className="font-display font-bold text-xl text-gov-charcoal">
            {t.noSchemesFound}
          </h3>
          <p className="text-sm text-gov-slate">
            {t.tryDifferentSearch}
          </p>
          <button
            onClick={clearFilters}
            className="bg-gov-primary text-white font-semibold text-sm px-6 py-2.5 rounded-xl hover:bg-gov-darkGreen transition-colors"
          >
            Show All Schemes
          </button>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {schemes.map((scheme) => (
            <SchemeCard key={scheme.id} scheme={scheme} />
          ))}
        </div>
      )}

    </div>
  );
};
