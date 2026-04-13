//src\pages\LanguageSelectPage.jsx

import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { CheckCircle } from "lucide-react";

const LANGUAGES = [
  {
    key: "en",
    name: "English",
    native: "English",
    short: "En",
  },
  {
    key: "mr",
    name: "Marathi",
    native: "मराठी",
    short: "म",
  },
  {
    key: "hi",
    name: "Hindi",
    native: "हिन्दी",
    short: "हि",
  },
];

export default function LanguageSelectPage() {
  const navigate = useNavigate();

  const [selected, setSelected] = useState("en");

  useEffect(() => {
    // default language
    const saved = localStorage.getItem("app_language") || "en";
    setSelected(saved);
  }, []);

  const handleContinue = () => {
    localStorage.setItem("app_language", selected);
    navigate("/info"); // or next onboarding step
  };

  return (
    <div className="min-h-screen bg-white flex flex-col">
      {/* HEADER */}
      <div className="px-6 pt-10 pb-6">
        <h1 className="text-xl font-semibold text-gray-900">
          Choose App Language
        </h1>
        <p className="text-sm text-gray-500 mt-1">
          Pick the language you’re comfortable with
        </p>
      </div>

      {/* LANGUAGE LIST */}
      <div className="px-6 space-y-4">
        {LANGUAGES.map((lang) => {
          const active = selected === lang.key;
          return (
            <button
              key={lang.key}
              onClick={() => setSelected(lang.key)}
              className={`w-full flex items-center justify-between px-4 py-4 rounded-xl border transition ${
                active
                  ? "border-orange-500 bg-orange-50"
                  : "border-gray-200"
              }`}
            >
              <div className="flex items-center gap-3">
                <div
                  className={`w-5 h-5 rounded-full border flex items-center justify-center ${
                    active
                      ? "border-orange-500 bg-orange-500"
                      : "border-gray-400"
                  }`}
                >
                  {active && (
                    <CheckCircle size={14} className="text-white" />
                  )}
                </div>

                <div className="text-left">
                  <p className="text-sm font-medium text-gray-900">
                    {lang.native}
                  </p>
                  <p className="text-xs text-gray-500">{lang.name}</p>
                </div>
              </div>

              <span className="text-orange-500 font-bold text-lg">
                {lang.short}
              </span>
            </button>
          );
        })}
      </div>

      {/* CONTINUE */}
      <div className="mt-auto p-6">
        <button
          onClick={handleContinue}
          className="w-full bg-orange-500 text-white py-3 rounded-xl font-semibold active:bg-orange-700"
        >
          Continue
        </button>
      </div>
    </div>
  );
}
