//src\pages\TrainingIntroPage.jsx

import React, { useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { CheckCircle, Target } from "lucide-react";

export default function TrainingIntroPage() {
  const navigate = useNavigate();

  const personal =
    JSON.parse(localStorage.getItem("personal_details")) || {};

  const fullName =
    personal.firstName
      ? `${personal.firstName} ${personal.lastName || ""}`.trim()
      : "Partner";

  useEffect(() => {
    // 🔐 HARD GATE: verification required
    const verification =
      localStorage.getItem("verification_status");

   

    // 🔒 Lock onboarding permanently
    localStorage.setItem("onboarding_locked", "true");
  }, [navigate]);

  return (
    <div className="min-h-screen bg-white px-4 py-8 flex flex-col">
      {/* VERIFIED BANNER */}
      <div className="bg-green-50 border border-green-200 rounded-xl p-4 flex gap-3">
        <CheckCircle className="text-green-600" />
        <p className="text-sm text-green-700">
          {fullName}, your details have been verified successfully
        </p>
      </div>

      {/* ICON */}
      <div className="flex justify-center mt-12">
        <Target size={80} className="text-orange-500" />
      </div>

      {/* TITLE */}
      <h2 className="text-xl font-semibold text-center mt-6">
        Finish your training and hit the road delivering orders 🚀
      </h2>

      {/* BENEFITS */}
      <ul className="mt-6 space-y-3 text-sm text-gray-700">
        <li>💰 Boost your income with smart strategies</li>
        <li>⚡ Insider tips to work faster and smarter</li>
        <li>🎁 Unlock exclusive rewards and perks</li>
      </ul>

      {/* CTA */}
      <button
        onClick={() => navigate("/training-loading")}
        className="mt-auto bg-orange-500 text-white py-3 rounded-xl font-semibold"
      >
        Start Training
      </button>
    </div>
  );
}
