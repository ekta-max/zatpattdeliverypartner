//src\pages\OnboardingStepsPage.jsx

import React, { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import {
  User,
  Briefcase,
  FileText,
  HelpCircle,
  Lock,
  CheckCircle,
} from "lucide-react";
import { DEV_MODE } from "../config/appConfig";

export default function OnboardingStepsPage() {
  const navigate = useNavigate();

  const [progress, setProgress] = useState(null);

  useEffect(() => {
    const stored =
      JSON.parse(localStorage.getItem("onboarding_progress")) || {
        work_details: "pending",
        personal_details: "pending",
        kit_ordered: false,
      };

    // 🚫 If kit already ordered → NEVER show onboarding again
    // if (stored.kit_ordered) {
    //   navigate("/verification-pending", { replace: true });
    //   return;
    // }

    

if (!DEV_MODE && stored.kit_ordered) {
  navigate("/verification-pending");
}
    setProgress(stored);
  }, [navigate]);

  if (!progress) {
  return (
    <div className="min-h-screen bg-white flex items-center justify-center">
      Loading...
    </div>
  );
}

  const workDone = progress.work_details === "completed";
  const personalDone = progress.personal_details === "completed";

  return (
    <div className="min-h-screen bg-[#f5f5f5] flex flex-col">
      {/* TOP HERO */}
      <div className="bg-orange-500 text-white pt-10 pb-16 rounded-b-3xl px-5">
        <h1 className="text-xl font-semibold">
          Welcome to ZatPatt Delivery!
        </h1>
      </div>

      {/* STEPS */}
      <div className="-mt-10 mx-4 bg-white rounded-2xl shadow-md p-5">
        <h2 className="text-sm font-semibold text-gray-700 mb-4">
          COMPLETE IN 3 STEPS
        </h2>

        {/* STEP 1 – WORK */}
        <StepItem
          step={1}
          title="Work Details"
          subtitle="City, Vehicle & Store"
          icon={<Briefcase size={18} />}
          status={
            workDone ? "done" : "active"
          }
         onClick={() => {
          if (progress.work_details !== "completed") {
            navigate("/work-details");
          }
        }}
        />

        {/* STEP 2 – PERSONAL */}
        <StepItem
          step={2}
          title="Personal Details"
          subtitle="Aadhaar, PAN, Bank & Selfie"
          icon={<User size={18} />}
          status={
            !workDone
              ? "locked"
              : personalDone
              ? "done"
              : "active"
          }
         onClick={() => {
          if (
            progress.work_details === "completed" &&
            progress.personal_details !== "completed"
          ) {
            navigate("/personal-details");
          }
        }}
        />

        {/* STEP 3 – KIT */}
        <StepItem
          step={3}
          title="Order Zatpatt Partner Kit"
          subtitle="T-Shirts, Bag & Benefits"
          icon={<FileText size={18} />}
          status={
            !workDone || !personalDone
              ? "locked"
              : "active"
          }
         onClick={() => {
          if (
            progress.work_details === "completed" &&
            progress.personal_details === "completed" &&
            !progress.kit_ordered
          ) {
            navigate("/order-partner-kit");
          }
        }}
        />

        {/* HELP */}
        <div className="mt-6 flex justify-center gap-2 text-sm text-orange-500">
          <HelpCircle size={16} />
          <span className="font-medium">Need Help?</span>
        </div>
      </div>
    </div>
  );
}

/* ================= STEP ITEM ================= */

function StepItem({ step, title, subtitle, icon, status, onClick }) {
  return (
    <div
      onClick={status === "active" ? onClick : undefined}
      className={`flex items-center gap-4 p-4 rounded-xl mb-3 transition ${
        status === "active"
          ? "bg-orange-50 cursor-pointer"
          : "bg-gray-100"
      }`}
    >
      <div
        className={`w-8 h-8 rounded-full flex items-center justify-center ${
          status === "active"
            ? "bg-orange-500 text-white"
            : status === "done"
            ? "bg-orange-500 text-white"
            : "bg-gray-300 text-gray-600"
        }`}
      >
        {status === "done" ? (
          <CheckCircle size={16} />
        ) : status === "locked" ? (
          <Lock size={14} />
        ) : (
          step
        )}
      </div>

      <div className="flex-1">
        <p className="text-sm font-semibold">{title}</p>
        <p className="text-xs text-gray-500">{subtitle}</p>
      </div>

      <div className="text-gray-400">{icon}</div>
    </div>
  );
}
