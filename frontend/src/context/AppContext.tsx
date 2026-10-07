import React, { createContext, useContext, useState, useEffect } from "react";
import { Language, Scheme } from "../types";
import { translations } from "../translations/translations";

interface AppContextType {
  language: Language;
  setLanguage: (lang: Language) => void;
  largeText: boolean;
  setLargeText: (val: boolean) => void;
  highContrast: boolean;
  setHighContrast: (val: boolean) => void;
  t: typeof translations.en;
  getLocalizedName: (scheme: Scheme) => string;
  getLocalizedSummary: (scheme: Scheme) => string;
  getLocalizedDescription: (scheme: Scheme) => string;
}

const AppContext = createContext<AppContextType | undefined>(undefined);

export const AppProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [language, setLanguageState] = useState<Language>(() => {
    const saved = localStorage.getItem("gramaseva_lang") as Language;
    return saved && ["en", "te", "hi"].includes(saved) ? saved : "en";
  });

  const [largeText, setLargeText] = useState<boolean>(() => {
    return localStorage.getItem("gramaseva_large") === "true";
  });

  const [highContrast, setHighContrast] = useState<boolean>(() => {
    return localStorage.getItem("gramaseva_contrast") === "true";
  });

  const setLanguage = (lang: Language) => {
    setLanguageState(lang);
    localStorage.setItem("gramaseva_lang", lang);
  };

  useEffect(() => {
    localStorage.setItem("gramaseva_large", String(largeText));
    if (largeText) {
      document.documentElement.classList.add("large-text");
    } else {
      document.documentElement.classList.remove("large-text");
    }
  }, [largeText]);

  useEffect(() => {
    localStorage.setItem("gramaseva_contrast", String(highContrast));
    if (highContrast) {
      document.documentElement.classList.add("high-contrast");
    } else {
      document.documentElement.classList.remove("high-contrast");
    }
  }, [highContrast]);

  const t = translations[language] || translations.en;

  const getLocalizedName = (scheme: Scheme) => {
    if (language === "te" && scheme.nameTe) return scheme.nameTe;
    if (language === "hi" && scheme.nameHi) return scheme.nameHi;
    return scheme.name;
  };

  const getLocalizedSummary = (scheme: Scheme) => {
    if (language === "te" && scheme.summaryTe) return scheme.summaryTe;
    if (language === "hi" && scheme.summaryHi) return scheme.summaryHi;
    return scheme.summary;
  };

  const getLocalizedDescription = (scheme: Scheme) => {
    if (language === "te" && scheme.descriptionTe) return scheme.descriptionTe;
    if (language === "hi" && scheme.descriptionHi) return scheme.descriptionHi;
    return scheme.description;
  };

  return (
    <AppContext.Provider
      value={{
        language,
        setLanguage,
        largeText,
        setLargeText,
        highContrast,
        setHighContrast,
        t,
        getLocalizedName,
        getLocalizedSummary,
        getLocalizedDescription,
      }}
    >
      <div className={`min-h-screen ${largeText ? "large-text" : ""} ${highContrast ? "high-contrast" : ""}`}>
        {children}
      </div>
    </AppContext.Provider>
  );
};

export const useApp = () => {
  const context = useContext(AppContext);
  if (!context) {
    throw new Error("useApp must be used within an AppProvider");
  }
  return context;
};
