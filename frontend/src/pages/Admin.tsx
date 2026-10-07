import React, { useState, useEffect } from "react";
import {
  ShieldAlert,
  ShieldCheck,
  Plus,
  Edit2,
  Trash2,
  X,
  Check,
  LogOut,
  Loader2,
  Sparkles,
  Layers,
  Database,
  CheckCircle2,
} from "lucide-react";
import { useApp } from "../context/AppContext";
import {
  checkAdminSession,
  loginAdmin,
  logoutAdmin,
  fetchAdminSummary,
  fetchAdminSchemes,
  createAdminScheme,
  updateAdminScheme,
  deactivateAdminScheme,
} from "../services/api";
import { Scheme, SchemeInput, AdminSummary } from "../types";

export const Admin: React.FC = () => {
  const { t } = useApp();

  const [authenticated, setAuthenticated] = useState(false);
  const [password, setPassword] = useState("");
  const [authLoading, setAuthLoading] = useState(true);
  const [loginError, setLoginError] = useState("");

  const [summary, setSummary] = useState<AdminSummary | null>(null);
  const [schemes, setSchemes] = useState<Scheme[]>([]);
  const [tableLoading, setTableLoading] = useState(false);

  // Add / Edit Modal state
  const [modalOpen, setModalOpen] = useState(false);
  const [editingScheme, setEditingScheme] = useState<Scheme | null>(null);
  const [formInput, setFormInput] = useState<SchemeInput>({
    name: "",
    nameTe: "",
    nameHi: "",
    summary: "",
    summaryTe: "",
    summaryHi: "",
    description: "",
    descriptionTe: "",
    descriptionHi: "",
    category: "agriculture",
    benefits: [],
    eligibilitySummary: "",
    documents: [],
    applicationSteps: [],
    officialUrl: "",
    sourceType: "demo",
    keywords: [],
    active: true,
  });
  const [benefitsText, setBenefitsText] = useState("");
  const [docsText, setDocsText] = useState("");
  const [stepsText, setStepsText] = useState("");
  const [keywordsText, setKeywordsText] = useState("");
  const [saveLoading, setSaveLoading] = useState(false);
  const [saveError, setSaveError] = useState("");
  const [actionSuccess, setActionSuccess] = useState("");

  useEffect(() => {
    async function verifyAuth() {
      try {
        setAuthLoading(true);
        const res = await checkAdminSession();
        setAuthenticated(res.authenticated);
        if (res.authenticated) {
          loadDashboard();
        }
      } catch {
        setAuthenticated(false);
      } finally {
        setAuthLoading(false);
      }
    }
    verifyAuth();
  }, []);

  const loadDashboard = async () => {
    try {
      setTableLoading(true);
      const [sum, list] = await Promise.all([
        fetchAdminSummary(),
        fetchAdminSchemes(),
      ]);
      setSummary(sum);
      setSchemes(list);
    } catch (err) {
      console.error("Failed to load dashboard data:", err);
    } finally {
      setTableLoading(false);
    }
  };

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!password.trim()) return;

    try {
      setAuthLoading(true);
      setLoginError("");
      const res = await loginAdmin(password.trim());
      if (res.authenticated) {
        setAuthenticated(true);
        setPassword("");
        loadDashboard();
      }
    } catch (err: any) {
      setLoginError(err.message || "Invalid administrator password");
    } finally {
      setAuthLoading(false);
    }
  };

  const handleLogout = async () => {
    await logoutAdmin();
    setAuthenticated(false);
    setSummary(null);
    setSchemes([]);
  };

  const openAddModal = () => {
    setEditingScheme(null);
    setFormInput({
      name: "",
      nameTe: "",
      nameHi: "",
      summary: "",
      summaryTe: "",
      summaryHi: "",
      description: "",
      descriptionTe: "",
      descriptionHi: "",
      category: "agriculture",
      benefits: [],
      eligibilitySummary: "",
      documents: [],
      applicationSteps: [],
      officialUrl: "",
      sourceType: "demo",
      keywords: [],
      active: true,
    });
    setBenefitsText("");
    setDocsText("");
    setStepsText("");
    setKeywordsText("");
    setSaveError("");
    setModalOpen(true);
  };

  const openEditModal = (scheme: Scheme) => {
    setEditingScheme(scheme);
    setFormInput({
      name: scheme.name,
      nameTe: scheme.nameTe || "",
      nameHi: scheme.nameHi || "",
      summary: scheme.summary,
      summaryTe: scheme.summaryTe || "",
      summaryHi: scheme.summaryHi || "",
      description: scheme.description,
      descriptionTe: scheme.descriptionTe || "",
      descriptionHi: scheme.descriptionHi || "",
      category: scheme.category,
      benefits: scheme.benefits || [],
      eligibilitySummary: scheme.eligibilitySummary,
      documents: scheme.documents || [],
      applicationSteps: scheme.applicationSteps || [],
      officialUrl: scheme.officialUrl || "",
      sourceType: scheme.sourceType,
      keywords: scheme.keywords || [],
      active: scheme.active,
    });
    setBenefitsText((scheme.benefits || []).join("\n"));
    setDocsText((scheme.documents || []).join("\n"));
    setStepsText((scheme.applicationSteps || []).join("\n"));
    setKeywordsText((scheme.keywords || []).join(", "));
    setSaveError("");
    setModalOpen(true);
  };

  const handleSaveScheme = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!formInput.name || !formInput.summary) {
      setSaveError("Name and summary are required.");
      return;
    }

    const payload: SchemeInput = {
      ...formInput,
      benefits: benefitsText.split("\n").map((s) => s.trim()).filter(Boolean),
      documents: docsText.split("\n").map((s) => s.trim()).filter(Boolean),
      applicationSteps: stepsText.split("\n").map((s) => s.trim()).filter(Boolean),
      keywords: keywordsText.split(",").map((s) => s.trim()).filter(Boolean),
      officialUrl: formInput.officialUrl ? formInput.officialUrl.trim() : null,
    };

    try {
      setSaveLoading(true);
      setSaveError("");

      if (editingScheme) {
        await updateAdminScheme(editingScheme.id, payload);
        setActionSuccess(`Scheme "${payload.name}" updated successfully.`);
      } else {
        await createAdminScheme(payload);
        setActionSuccess(`Scheme "${payload.name}" created successfully.`);
      }

      setModalOpen(false);
      loadDashboard();
      setTimeout(() => setActionSuccess(""), 4000);
    } catch (err: any) {
      setSaveError(err.message || "Failed to save scheme record.");
    } finally {
      setSaveLoading(false);
    }
  };

  const handleDeactivate = async (id: string, name: string) => {
    if (!window.confirm(`Are you sure you want to deactivate scheme "${name}"?`)) return;

    try {
      await deactivateAdminScheme(id);
      setActionSuccess(`Scheme "${name}" has been deactivated.`);
      loadDashboard();
      setTimeout(() => setActionSuccess(""), 4000);
    } catch (err: any) {
      alert("Failed to deactivate scheme: " + err.message);
    }
  };

  if (authLoading) {
    return (
      <div className="py-32 flex flex-col items-center justify-center text-gov-slate gap-3">
        <Loader2 size={36} className="text-gov-primary animate-spin" />
        <p className="text-sm font-medium">Checking administrative credentials...</p>
      </div>
    );
  }

  // Login Screen if not authenticated
  if (!authenticated) {
    return (
      <div className="max-w-md mx-auto px-4 py-16 animate-fade-in">
        <div className="bg-white rounded-3xl p-8 border border-gov-sand shadow-lg space-y-6 text-center">
          <div className="w-16 h-16 rounded-2xl bg-emerald-50 text-emerald-800 flex items-center justify-center mx-auto text-2xl shadow-sm">
            <ShieldAlert size={32} />
          </div>

          <div>
            <h1 className="font-display font-bold text-2xl text-gov-charcoal">
              {t.adminPortal}
            </h1>
            <p className="text-xs text-gov-slate mt-1">
              Authorized scheme management & content moderation
            </p>
          </div>

          <form onSubmit={handleLogin} className="space-y-4 text-left">
            <div>
              <label className="block text-xs font-bold text-gov-slate uppercase tracking-wider mb-2">
                {t.passwordPrompt}
              </label>
              <input
                type="password"
                required
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="Enter password..."
                className="w-full bg-gov-cream/40 border border-gov-sand rounded-xl p-3.5 text-sm focus:outline-none focus:ring-2 focus:ring-gov-primary text-gov-charcoal"
              />
            </div>

            {loginError && (
              <div className="p-3 bg-red-50 text-red-700 rounded-xl text-xs font-medium">
                {loginError}
              </div>
            )}

            <button
              type="submit"
              className="w-full bg-gov-primary hover:bg-gov-darkGreen text-white font-bold text-sm py-3.5 rounded-xl shadow-md transition-colors"
            >
              {t.loginBtn}
            </button>
          </form>

          <div className="p-3 bg-gov-sand/40 rounded-xl text-xs text-gov-slate border border-gov-sand">
            <span className="font-semibold block text-gov-charcoal">{t.demoPasswordHint}</span>
            <span className="text-[11px] text-gray-400">Password is verified using salted scrypt cryptography.</span>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10 space-y-8 animate-fade-in">
      
      {/* Top Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-gov-sand pb-6">
        <div>
          <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-emerald-50 text-emerald-800 text-xs font-semibold mb-2">
            <ShieldCheck size={14} />
            <span>Administrator Workspace</span>
          </div>
          <h1 className="font-display font-bold text-3xl text-gov-charcoal">
            {t.adminPortal}
          </h1>
          <p className="text-xs text-gov-slate">
            Real-time SQLite database management for public schemes
          </p>
        </div>

        <div className="flex items-center gap-3">
          <button
            onClick={openAddModal}
            className="inline-flex items-center gap-2 bg-gov-primary hover:bg-gov-darkGreen text-white font-bold text-sm px-5 py-3 rounded-xl shadow-sm transition-colors"
          >
            <Plus size={18} />
            <span>{t.addNewScheme}</span>
          </button>

          <button
            onClick={handleLogout}
            className="inline-flex items-center gap-1.5 bg-white hover:bg-gov-sand/60 text-gov-slate border border-gov-sand font-medium text-sm px-4 py-3 rounded-xl transition-colors"
          >
            <LogOut size={16} />
            <span>{t.logout}</span>
          </button>
        </div>
      </div>

      {actionSuccess && (
        <div className="p-4 bg-emerald-50 border border-emerald-200 text-emerald-800 rounded-2xl text-sm font-semibold flex items-center gap-2 animate-fade-in">
          <CheckCircle2 size={18} />
          <span>{actionSuccess}</span>
        </div>
      )}

      {/* Metrics Cards */}
      {summary && (
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-6">
          <div className="bg-white p-6 rounded-2xl border border-gov-sand shadow-sm flex items-center justify-between">
            <div>
              <span className="text-xs font-bold text-gray-400 uppercase tracking-wider block">
                {t.totalSchemes}
              </span>
              <span className="font-display font-black text-3xl text-gov-charcoal">
                {summary.total}
              </span>
            </div>
            <div className="w-12 h-12 rounded-xl bg-emerald-50 text-gov-primary flex items-center justify-center">
              <Database size={24} />
            </div>
          </div>

          <div className="bg-white p-6 rounded-2xl border border-gov-sand shadow-sm flex items-center justify-between">
            <div>
              <span className="text-xs font-bold text-gray-400 uppercase tracking-wider block">
                {t.activeSchemes}
              </span>
              <span className="font-display font-black text-3xl text-emerald-700">
                {summary.active}
              </span>
            </div>
            <div className="w-12 h-12 rounded-xl bg-blue-50 text-blue-700 flex items-center justify-center">
              <CheckCircle2 size={24} />
            </div>
          </div>

          <div className="bg-white p-6 rounded-2xl border border-gov-sand shadow-sm flex items-center justify-between">
            <div>
              <span className="text-xs font-bold text-gray-400 uppercase tracking-wider block">
                {t.categoriesCount}
              </span>
              <span className="font-display font-black text-3xl text-gov-charcoal">
                {summary.categories}
              </span>
            </div>
            <div className="w-12 h-12 rounded-xl bg-amber-50 text-amber-700 flex items-center justify-center">
              <Layers size={24} />
            </div>
          </div>
        </div>
      )}

      {/* Schemes Management Table */}
      <div className="bg-white rounded-3xl border border-gov-sand shadow-sm overflow-hidden">
        <div className="p-6 border-b border-gov-sand flex items-center justify-between">
          <h3 className="font-display font-bold text-xl text-gov-charcoal">
            All Scheme Records
          </h3>
          <span className="text-xs text-gray-400">
            Click edit or deactivate to update public availability
          </span>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left text-sm text-gov-charcoal">
            <thead className="bg-gov-sand/40 text-xs uppercase font-bold text-gray-500 border-b border-gov-sand">
              <tr>
                <th className="py-4 px-6">Scheme Name</th>
                <th className="py-4 px-6">Category</th>
                <th className="py-4 px-6">Source</th>
                <th className="py-4 px-6">Status</th>
                <th className="py-4 px-6 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gov-sand/60">
              {tableLoading ? (
                <tr>
                  <td colSpan={5} className="py-12 text-center text-gray-400">
                    <Loader2 size={24} className="animate-spin mx-auto mb-2" />
                    <span>Loading database records...</span>
                  </td>
                </tr>
              ) : schemes.length === 0 ? (
                <tr>
                  <td colSpan={5} className="py-12 text-center text-gray-400">
                    No schemes in database.
                  </td>
                </tr>
              ) : (
                schemes.map((s) => (
                  <tr key={s.id} className="hover:bg-gov-cream/30 transition-colors">
                    <td className="py-4 px-6">
                      <div className="font-bold text-gov-charcoal">{s.name}</div>
                      <div className="text-xs text-gray-400">{s.id}</div>
                    </td>
                    <td className="py-4 px-6 capitalize">
                      <span className="px-2.5 py-0.5 rounded-full text-xs font-semibold bg-gov-sand text-gov-slate">
                        {s.category.replace("-", " ")}
                      </span>
                    </td>
                    <td className="py-4 px-6">
                      <span
                        className={`px-2.5 py-0.5 rounded-full text-xs font-medium ${
                          s.sourceType === "verified"
                            ? "bg-blue-50 text-blue-700"
                            : "bg-amber-50 text-amber-700"
                        }`}
                      >
                        {s.sourceType}
                      </span>
                    </td>
                    <td className="py-4 px-6">
                      <span
                        className={`px-2.5 py-0.5 rounded-full text-xs font-bold ${
                          s.active
                            ? "bg-emerald-50 text-emerald-800"
                            : "bg-red-50 text-red-700"
                        }`}
                      >
                        {s.active ? "Active" : "Inactive"}
                      </span>
                    </td>
                    <td className="py-4 px-6 text-right space-x-2 whitespace-nowrap">
                      <button
                        onClick={() => openEditModal(s)}
                        className="inline-flex items-center gap-1 text-xs font-semibold text-gov-primary hover:text-gov-darkGreen bg-emerald-50 hover:bg-emerald-100 px-3 py-1.5 rounded-lg transition-colors"
                      >
                        <Edit2 size={13} />
                        <span>{t.editScheme}</span>
                      </button>

                      {s.active && (
                        <button
                          onClick={() => handleDeactivate(s.id, s.name)}
                          className="inline-flex items-center gap-1 text-xs font-semibold text-red-700 hover:text-red-800 bg-red-50 hover:bg-red-100 px-3 py-1.5 rounded-lg transition-colors"
                        >
                          <Trash2 size={13} />
                          <span>{t.deactivate}</span>
                        </button>
                      )}
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Add / Edit Scheme Modal */}
      {modalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm overflow-y-auto">
          <div className="bg-white rounded-3xl max-w-3xl w-full p-6 sm:p-8 shadow-2xl border border-gov-sand my-8 max-h-[90vh] overflow-y-auto">
            <div className="flex items-center justify-between pb-4 border-b border-gov-sand mb-6">
              <h3 className="font-display font-bold text-2xl text-gov-charcoal">
                {editingScheme ? t.editScheme : t.addNewScheme}
              </h3>
              <button
                onClick={() => setModalOpen(false)}
                className="p-1 rounded-lg text-gray-400 hover:text-gray-600"
              >
                <X size={22} />
              </button>
            </div>

            {saveError && (
              <div className="p-3 mb-6 bg-red-50 text-red-700 rounded-xl text-xs font-medium">
                {saveError}
              </div>
            )}

            <form onSubmit={handleSaveScheme} className="space-y-6">
              
              {/* Names in 3 languages */}
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                <div>
                  <label className="block text-xs font-bold text-gov-slate uppercase mb-1">
                    Name (English) *
                  </label>
                  <input
                    type="text"
                    required
                    value={formInput.name}
                    onChange={(e) => setFormInput({ ...formInput, name: e.target.value })}
                    className="w-full bg-gov-cream/40 border border-gov-sand rounded-xl p-3 text-sm focus:ring-2 focus:ring-gov-primary focus:outline-none"
                  />
                </div>
                <div>
                  <label className="block text-xs font-bold text-gov-slate uppercase mb-1">
                    Name (Telugu - తెలుగు)
                  </label>
                  <input
                    type="text"
                    value={formInput.nameTe || ""}
                    onChange={(e) => setFormInput({ ...formInput, nameTe: e.target.value })}
                    className="w-full bg-gov-cream/40 border border-gov-sand rounded-xl p-3 text-sm focus:ring-2 focus:ring-gov-primary focus:outline-none"
                  />
                </div>
                <div>
                  <label className="block text-xs font-bold text-gov-slate uppercase mb-1">
                    Name (Hindi - हिन्दी)
                  </label>
                  <input
                    type="text"
                    value={formInput.nameHi || ""}
                    onChange={(e) => setFormInput({ ...formInput, nameHi: e.target.value })}
                    className="w-full bg-gov-cream/40 border border-gov-sand rounded-xl p-3 text-sm focus:ring-2 focus:ring-gov-primary focus:outline-none"
                  />
                </div>
              </div>

              {/* Category & Source Type */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-bold text-gov-slate uppercase mb-1">
                    Category *
                  </label>
                  <select
                    value={formInput.category}
                    onChange={(e) => setFormInput({ ...formInput, category: e.target.value })}
                    className="w-full bg-gov-cream/40 border border-gov-sand rounded-xl p-3 text-sm focus:ring-2 focus:ring-gov-primary focus:outline-none capitalize"
                  >
                    {[
                      "agriculture",
                      "education",
                      "health",
                      "housing",
                      "employment",
                      "women-child",
                      "pension",
                      "financial-support",
                      "scholarships",
                      "skill-development",
                    ].map((c) => (
                      <option key={c} value={c}>
                        {c.replace("-", " ")}
                      </option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="block text-xs font-bold text-gov-slate uppercase mb-1">
                    Source Type
                  </label>
                  <select
                    value={formInput.sourceType}
                    onChange={(e) => setFormInput({ ...formInput, sourceType: e.target.value as any })}
                    className="w-full bg-gov-cream/40 border border-gov-sand rounded-xl p-3 text-sm focus:ring-2 focus:ring-gov-primary focus:outline-none"
                  >
                    <option value="demo">Demo Sample</option>
                    <option value="verified">Verified Official</option>
                  </select>
                </div>
              </div>

              {/* Summaries in 3 languages */}
              <div className="space-y-3">
                <div>
                  <label className="block text-xs font-bold text-gov-slate uppercase mb-1">
                    Summary (English) *
                  </label>
                  <textarea
                    required
                    rows={2}
                    value={formInput.summary}
                    onChange={(e) => setFormInput({ ...formInput, summary: e.target.value })}
                    className="w-full bg-gov-cream/40 border border-gov-sand rounded-xl p-3 text-sm focus:ring-2 focus:ring-gov-primary focus:outline-none"
                  />
                </div>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-xs font-bold text-gov-slate uppercase mb-1">
                      Summary (Telugu - తెలుగు)
                    </label>
                    <textarea
                      rows={2}
                      value={formInput.summaryTe || ""}
                      onChange={(e) => setFormInput({ ...formInput, summaryTe: e.target.value })}
                      className="w-full bg-gov-cream/40 border border-gov-sand rounded-xl p-3 text-sm focus:ring-2 focus:ring-gov-primary focus:outline-none"
                    />
                  </div>
                  <div>
                    <label className="block text-xs font-bold text-gov-slate uppercase mb-1">
                      Summary (Hindi - हिन्दी)
                    </label>
                    <textarea
                      rows={2}
                      value={formInput.summaryHi || ""}
                      onChange={(e) => setFormInput({ ...formInput, summaryHi: e.target.value })}
                      className="w-full bg-gov-cream/40 border border-gov-sand rounded-xl p-3 text-sm focus:ring-2 focus:ring-gov-primary focus:outline-none"
                    />
                  </div>
                </div>
              </div>

              {/* Full Description */}
              <div>
                <label className="block text-xs font-bold text-gov-slate uppercase mb-1">
                  Full Description
                </label>
                <textarea
                  rows={3}
                  value={formInput.description}
                  onChange={(e) => setFormInput({ ...formInput, description: e.target.value })}
                  className="w-full bg-gov-cream/40 border border-gov-sand rounded-xl p-3 text-sm focus:ring-2 focus:ring-gov-primary focus:outline-none"
                />
              </div>

              {/* Multiline Fields */}
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                <div>
                  <label className="block text-xs font-bold text-gov-slate uppercase mb-1">
                    {t.schemeBenefitsLines}
                  </label>
                  <textarea
                    rows={4}
                    value={benefitsText}
                    onChange={(e) => setBenefitsText(e.target.value)}
                    placeholder="Benefit 1&#10;Benefit 2..."
                    className="w-full bg-gov-cream/40 border border-gov-sand rounded-xl p-3 text-xs focus:ring-2 focus:ring-gov-primary focus:outline-none font-mono"
                  />
                </div>
                <div>
                  <label className="block text-xs font-bold text-gov-slate uppercase mb-1">
                    {t.schemeDocsLines}
                  </label>
                  <textarea
                    rows={4}
                    value={docsText}
                    onChange={(e) => setDocsText(e.target.value)}
                    placeholder="Document 1&#10;Document 2..."
                    className="w-full bg-gov-cream/40 border border-gov-sand rounded-xl p-3 text-xs focus:ring-2 focus:ring-gov-primary focus:outline-none font-mono"
                  />
                </div>
                <div>
                  <label className="block text-xs font-bold text-gov-slate uppercase mb-1">
                    {t.schemeStepsLines}
                  </label>
                  <textarea
                    rows={4}
                    value={stepsText}
                    onChange={(e) => setStepsText(e.target.value)}
                    placeholder="Step 1&#10;Step 2..."
                    className="w-full bg-gov-cream/40 border border-gov-sand rounded-xl p-3 text-xs focus:ring-2 focus:ring-gov-primary focus:outline-none font-mono"
                  />
                </div>
              </div>

              {/* Eligibility Summary & Official Portal */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-bold text-gov-slate uppercase mb-1">
                    Eligibility Summary
                  </label>
                  <input
                    type="text"
                    value={formInput.eligibilitySummary}
                    onChange={(e) => setFormInput({ ...formInput, eligibilitySummary: e.target.value })}
                    className="w-full bg-gov-cream/40 border border-gov-sand rounded-xl p-3 text-sm focus:ring-2 focus:ring-gov-primary focus:outline-none"
                  />
                </div>
                <div>
                  <label className="block text-xs font-bold text-gov-slate uppercase mb-1">
                    Official Portal URL
                  </label>
                  <input
                    type="url"
                    value={formInput.officialUrl || ""}
                    onChange={(e) => setFormInput({ ...formInput, officialUrl: e.target.value })}
                    placeholder="https://example.gov.in"
                    className="w-full bg-gov-cream/40 border border-gov-sand rounded-xl p-3 text-sm focus:ring-2 focus:ring-gov-primary focus:outline-none"
                  />
                </div>
              </div>

              {/* Search Keywords */}
              <div>
                <label className="block text-xs font-bold text-gov-slate uppercase mb-1">
                  Search Keywords (comma separated)
                </label>
                <input
                  type="text"
                  value={keywordsText}
                  onChange={(e) => setKeywordsText(e.target.value)}
                  placeholder="farmer, subsidy, kisan, రైతు, किसान"
                  className="w-full bg-gov-cream/40 border border-gov-sand rounded-xl p-3 text-sm focus:ring-2 focus:ring-gov-primary focus:outline-none"
                />
              </div>

              {/* Modal Actions */}
              <div className="flex items-center justify-end gap-3 pt-4 border-t border-gov-sand">
                <button
                  type="button"
                  onClick={() => setModalOpen(false)}
                  className="px-5 py-3 text-sm font-medium text-gov-slate hover:bg-gov-sand rounded-xl transition-colors"
                >
                  {t.cancel}
                </button>
                <button
                  type="submit"
                  disabled={saveLoading}
                  className="inline-flex items-center gap-2 bg-gov-primary hover:bg-gov-darkGreen text-white font-bold text-sm px-6 py-3 rounded-xl transition-colors shadow-sm"
                >
                  {saveLoading ? "Saving..." : (
                    <>
                      <Check size={16} />
                      <span>{t.saveScheme}</span>
                    </>
                  )}
                </button>
              </div>

            </form>
          </div>
        </div>
      )}

    </div>
  );
};
