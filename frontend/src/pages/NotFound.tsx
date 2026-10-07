import React from "react";
import { Link } from "react-router-dom";
import { Home, ArrowLeft } from "lucide-react";
import { useApp } from "../context/AppContext";

export const NotFound: React.FC = () => {
  const { t } = useApp();

  return (
    <div className="max-w-md mx-auto px-4 py-24 text-center space-y-6 animate-fade-in">
      <div className="w-20 h-20 bg-emerald-50 text-gov-primary rounded-3xl flex items-center justify-center mx-auto text-4xl shadow-inner font-black">
        404
      </div>
      <div>
        <h1 className="font-display font-bold text-3xl text-gov-charcoal">
          Page Not Found
        </h1>
        <p className="text-sm text-gov-slate mt-2">
          The requested page could not be located. It may have moved or no longer exists.
        </p>
      </div>
      <div className="pt-2">
        <Link
          to="/"
          className="inline-flex items-center gap-2 bg-gov-primary text-white font-semibold text-sm px-6 py-3.5 rounded-xl hover:bg-gov-darkGreen transition-colors shadow-sm"
        >
          <Home size={16} />
          <span>Return to Homepage</span>
        </Link>
      </div>
    </div>
  );
};
