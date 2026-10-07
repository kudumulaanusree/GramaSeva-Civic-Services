import React, { useState } from "react";
import { X, CheckCircle, AlertTriangle, Send } from "lucide-react";
import { submitReport } from "../services/api";

interface ReportModalProps {
  schemeId: string;
  schemeName: string;
  onClose: () => void;
}

export const ReportModal: React.FC<ReportModalProps> = ({
  schemeId,
  schemeName,
  onClose,
}) => {
  const [message, setMessage] = useState("");
  const [loading, setLoading] = useState(false);
  const [submitted, setSubmitted] = useState(false);
  const [error, setError] = useState("");

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!message.trim()) return;

    try {
      setLoading(true);
      setError("");
      await submitReport(schemeId, message.trim());
      setSubmitted(true);
    } catch (err: unknown) {
      setError("Failed to submit report. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm animate-fade-in">
      <div className="bg-white rounded-2xl max-w-lg w-full p-6 shadow-2xl border border-gov-sand relative">
        <button
          onClick={onClose}
          className="absolute top-4 right-4 text-gray-400 hover:text-gray-600 p-1 rounded-lg"
          aria-label="Close dialog"
        >
          <X size={20} />
        </button>

        {submitted ? (
          <div className="text-center py-6 space-y-4">
            <div className="w-16 h-16 bg-emerald-100 text-gov-primary rounded-full flex items-center justify-center mx-auto">
              <CheckCircle size={32} />
            </div>
            <h3 className="font-display font-bold text-2xl text-gov-charcoal">
              Report Received
            </h3>
            <p className="text-gov-slate text-sm max-w-sm mx-auto">
              Thank you for helping keep GramaSeva up to date. Our administrative team will verify this scheme record.
            </p>
            <button
              onClick={onClose}
              className="mt-4 bg-gov-primary text-white font-semibold px-6 py-2.5 rounded-xl hover:bg-gov-darkGreen transition-colors"
            >
              Done
            </button>
          </div>
        ) : (
          <div>
            <div className="flex items-center gap-3 mb-4">
              <div className="p-2.5 bg-amber-50 text-amber-700 rounded-xl">
                <AlertTriangle size={24} />
              </div>
              <div>
                <h3 className="font-display font-bold text-xl text-gov-charcoal">
                  Report Outdated Information
                </h3>
                <p className="text-xs text-gray-500 line-clamp-1">{schemeName}</p>
              </div>
            </div>

            <p className="text-sm text-gov-slate mb-4">
              Did a deadline pass, subsidy amount change, or document requirement alter? Tell us what needs correction.
            </p>

            {error && (
              <div className="p-3 mb-4 rounded-xl bg-red-50 text-red-700 text-xs font-medium">
                {error}
              </div>
            )}

            <form onSubmit={handleSubmit} className="space-y-4">
              <textarea
                required
                rows={4}
                value={message}
                onChange={(e) => setMessage(e.target.value)}
                placeholder="Describe what appears incorrect or outdated..."
                className="w-full border border-gov-sand rounded-xl p-3.5 text-sm focus:outline-none focus:ring-2 focus:ring-gov-primary bg-gov-cream/40"
              />

              <div className="flex items-center justify-end gap-3 pt-2">
                <button
                  type="button"
                  onClick={onClose}
                  className="px-4 py-2.5 text-sm font-medium text-gov-slate hover:bg-gov-sand rounded-xl transition-colors"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={loading || !message.trim()}
                  className="inline-flex items-center gap-2 px-5 py-2.5 bg-gov-primary hover:bg-gov-darkGreen disabled:opacity-50 text-white font-semibold text-sm rounded-xl transition-colors"
                >
                  {loading ? "Submitting..." : (
                    <>
                      <span>Submit Report</span>
                      <Send size={15} />
                    </>
                  )}
                </button>
              </div>
            </form>
          </div>
        )}
      </div>
    </div>
  );
};
