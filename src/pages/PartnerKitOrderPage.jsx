// src/pages/PartnerKitOrderPage.jsx

import React, { useState, useEffect } from "react";
import { ArrowLeft, HelpCircle } from "lucide-react";
import { useNavigate } from "react-router-dom";
import TshirtModel from "../assets/tshirt-model.png";
import { submitPartnerKit } from "../Services/partnerkit";
import { fetchDpData, evaluateDpProgress } from "../Services/dpService";

const SIZES = ["S", "M", "L", "XL", "2XL"];

export default function PartnerKitOrderPage() {
  const navigate = useNavigate();
  const [size, setSize] = useState("");
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);

  useEffect(() => {
    const checkStatus = async () => {
      setLoading(true);
      const data = await fetchDpData();

      if (!data) {
        navigate("/onboarding-steps", { replace: true });
        return;
      }

      const progress = evaluateDpProgress(data);

      // Gate: Step 1 & 2 must be done
      if (!progress.step1Done) {
        navigate("/work-details", { replace: true });
        return;
      }
      if (!progress.step2Done) {
        navigate("/personal-details", { replace: true });
        return;
      }

      // Pre-fill size if existing
      if (data.tshirt_size) {
        setSize(String(data.tshirt_size).toUpperCase());
      }

      setLoading(false);
    };

    checkStatus();
  }, [navigate]);

  const handleSubmitKit = async () => {
    if (!size || submitting) return;

    setSubmitting(true);
    try {
      await submitPartnerKit({ tshirt_size: size.toLowerCase() });
      const updatedData = await fetchDpData();

      if (updatedData?.is_verified) {
        navigate("/training-intro", { replace: true });
      } else {
        navigate("/verification-pending", { replace: true });
      }
    } catch (error) {
      console.error("Partner kit submission failed:", error);
      alert("Failed to submit partner kit. Please try again.");
    } finally {
      setSubmitting(false);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-white">
        <div className="text-sm font-bold text-orange-500">Checking onboarding status...</div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-white flex flex-col">
      <div className="flex items-center px-4 py-3 border-b bg-white">
        <button
          type="button"
          onClick={() => navigate("/onboarding-steps")}
          className="w-9 h-9 rounded-full flex items-center justify-center hover:bg-gray-100 transition"
        >
          <ArrowLeft size={21} />
        </button>
        <h1 className="flex-1 text-center font-semibold text-gray-900">Zatpatt Partner Kit</h1>
        <div className="w-9 h-9 rounded-full flex items-center justify-center">
          <HelpCircle size={21} className="text-orange-500" />
        </div>
      </div>

      <div className="flex-1 px-4 py-6">
        <div className="max-w-xl mx-auto">
          <h3 className="text-base font-semibold text-gray-900">Select T-shirt Size</h3>
          <p className="text-sm text-gray-500 mt-1">Choose the size you want for your partner kit.</p>

          <div className="flex justify-center my-6">
            <div className="w-full max-w-[260px] rounded-2xl bg-orange-50 flex items-center justify-center p-4">
              <img src={TshirtModel} className="w-48 h-auto object-contain" alt="T-shirt guide" />
            </div>
          </div>

          <div className="flex gap-2 justify-center flex-wrap">
            {SIZES.map((s) => {
              const selected = size === s;
              return (
                <button
                  key={s}
                  type="button"
                  onClick={() => setSize(s)}
                  disabled={submitting}
                  className={`w-10 h-10 rounded-full border-2 text-sm font-semibold transition-all ${
                    selected
                      ? "bg-orange-500 text-white border-orange-500 shadow-md scale-105"
                      : "bg-white text-gray-700 border-gray-300 hover:border-orange-400 hover:text-orange-500"
                  }`}
                >
                  {s}
                </button>
              );
            })}
          </div>

          {size && (
            <div className="mt-4 text-center">
              <span className="inline-flex items-center px-4 py-2 rounded-full bg-orange-50 text-orange-600 text-sm font-semibold">
                Selected Size: {size}
              </span>
            </div>
          )}

          <button
            type="button"
            disabled={!size || submitting}
            onClick={handleSubmitKit}
            className={`mt-8 w-full py-3.5 rounded-xl font-semibold transition-all ${
              size && !submitting
                ? "bg-orange-500 text-white hover:bg-orange-600 shadow-md"
                : "bg-gray-200 text-gray-400 cursor-not-allowed"
            }`}
          >
            {submitting ? "Submitting..." : "Continue"}
          </button>
        </div>
      </div>
    </div>
  );
}
