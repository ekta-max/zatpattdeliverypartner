//src\pages\PartnerKitOrderPage.jsx

import React, { useState, useEffect } from "react";
import { ArrowLeft, HelpCircle, Shirt, Backpack, IdCard } from "lucide-react";
import { useNavigate } from "react-router-dom";

import KitImage from "../assets/partner-kit.png";
import TshirtModel from "../assets/tshirt-model.png";
import { DEV_MODE } from "../config/appConfig";
import { submitPartnerKit } from "../Services/partnerkit";
import { getMyProfileDp } from "../Services/profileDp";

const SIZES = ["S", "M", "L", "XL", "2XL"];

export default function PartnerKitOrderPage() {
  const navigate = useNavigate();
  const [step, setStep] = useState(1);

  const [size, setSize] = useState("");
  const [submitting, setSubmitting] = useState(false);

  const progressPercent = (step / 3) * 100;

  useEffect(() => {
    const progress = JSON.parse(
      localStorage.getItem("onboarding_progress")
    );

    if (!DEV_MODE && progress?.personal_details !== "completed") {
      navigate("/personal-details");
    }

    if (progress?.kit_ordered === true) {
      navigate("/verification-pending", { replace: true });
    }
  }, [navigate]);

  const handleSubmitKit = async () => {
    if (!size || submitting) return;

    setSubmitting(true);

    try {
      // ✅ STEP 1: submit the kit selection
      await submitPartnerKit({
        tshirt_size: size,
      });

      console.log("Partner kit submitted ✅");

      localStorage.setItem(
        "partner_kit",
        JSON.stringify({
          tshirt_size: size,
          delivery_type: "pickup",
        })
      );

      const existing =
        JSON.parse(localStorage.getItem("onboarding_progress")) || {};

      localStorage.setItem(
        "onboarding_progress",
        JSON.stringify({
          ...existing,
          kit_ordered: true,
        })
      );

      // ✅ STEP 2: immediately check verification status
      const profileRes = await getMyProfileDp();
      const isVerified = profileRes?.data?.is_verified;

      console.log("Profile check ✅", profileRes);

      // ✅ STEP 3: route based on is_verified
      if (isVerified) {
        navigate("/training-intro", { replace: true }); // 👈 changed from /seva-slots
      } else {
        navigate("/verification-pending", { replace: true });
      }
    } catch (err) {
      console.error("Partner kit / profile check API error ❌", err);
      alert("Failed to submit partner kit");
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="min-h-screen bg-white flex flex-col">
      {/* ===== HEADER ===== */}
      <div className="flex items-center px-4 py-3 border-b">
        <button
          onClick={() => {
            if (step > 1) setStep(step - 1);
          }}
        >
          <ArrowLeft />
        </button>
        <h1 className="flex-1 text-center font-semibold">
          Zatpatt Partner Kit
        </h1>
        <HelpCircle className="text-orange-500" />
      </div>

      {/* ===== PROGRESS BAR ===== */}
      <div className="px-4 mt-3">
        <div className="h-1 bg-gray-200 rounded">
          <div
            className="h-1 bg-orange-500 rounded transition-all"
            style={{ width: `${progressPercent}%` }}
          />
        </div>
      </div>

      {/* ===== CONTENT ===== */}
      <div className="flex-1 px-4 pt-6">

        {/* ================= STEP 1 – INTRO ================= */}
        {step === 1 && (
          <>
            <div className="flex justify-center mt-6">
              <img src={KitImage} className="w-64" alt="Partner kit" />
            </div>

            <h2 className="text-xl font-bold text-center mt-6">
              Earn upto ₹5000 in first week!
            </h2>

            <p className="text-sm text-gray-500 text-center mt-2">
              Pay only for bag and get 2 T-shirts free
            </p>

            <button
              onClick={() => setStep(2)}
              className="mt-10 w-full bg-orange-500 text-white py-3 rounded-xl font-semibold"
            >
              Continue
            </button>
          </>
        )}

        {/* ================= STEP 2 – WHAT'S INCLUDED ================= */}
        {step === 2 && (
          <>
            <h2 className="text-lg font-semibold mb-1">
              What's in your kit
            </h2>
            <p className="text-sm text-gray-500 mb-6">
              Everything you need to start delivering
            </p>

            <div className="space-y-4">
              <KitItem
                icon={<Shirt size={22} className="text-orange-500" />}
                title="2 Delivery T-Shirts"
                subtitle="Free — no charge"
              />
              <KitItem
                icon={<Backpack size={22} className="text-orange-500" />}
                title="Insulated Delivery Bag"
                subtitle="One-time payment applies"
              />
              <KitItem
                icon={<IdCard size={22} className="text-orange-500" />}
                title="Partner ID Card"
                subtitle="Required for order pickups"
              />
            </div>

            <button
              onClick={() => setStep(3)}
              className="mt-10 w-full bg-orange-500 text-white py-3 rounded-xl font-semibold"
            >
              Select T-shirt size
            </button>
          </>
        )}

        {/* ================= STEP 3 – SIZE SELECTION + SUBMIT ================= */}
        {step === 3 && (
          <>
            <h2 className="text-lg font-semibold mb-4">
              Select T-shirt Size
            </h2>

            <div className="flex justify-center mb-6">
              <img src={TshirtModel} className="w-48" alt="T-shirt size guide" />
            </div>

            <div className="flex gap-3 justify-center">
              {SIZES.map((s) => (
                <button
                  key={s}
                  onClick={() => setSize(s)}
                  disabled={submitting}
                  className={`w-12 h-12 rounded-full border ${
                    size === s
                      ? "bg-orange-500 text-white border-orange-500"
                      : "border-gray-300"
                  }`}
                >
                  {s}
                </button>
              ))}
            </div>

            <button
              disabled={!size || submitting}
              onClick={handleSubmitKit}
              className={`mt-10 w-full py-3 rounded-xl font-semibold ${
                size && !submitting
                  ? "bg-orange-500 text-white"
                  : "bg-gray-200 text-gray-400"
              }`}
            >
              {submitting ? "Submitting..." : "Continue"}
            </button>
          </>
        )}
      </div>
    </div>
  );
}

function KitItem({ icon, title, subtitle }) {
  return (
    <div className="flex items-center gap-4 p-4 rounded-xl bg-orange-50">
      <div className="w-10 h-10 rounded-full bg-white flex items-center justify-center shadow-sm">
        {icon}
      </div>
      <div>
        <p className="text-sm font-semibold text-gray-900">{title}</p>
        <p className="text-xs text-gray-500 mt-0.5">{subtitle}</p>
      </div>
    </div>
  );
}