// src/pages/TrainingCompletedPage.jsx

import React, { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import Confetti from "react-confetti";
import { fetchDpData } from "../Services/dpService";

export default function TrainingCompletedPage() {
  const navigate = useNavigate();
  const [showConfetti, setShowConfetti] = useState(true);
  const [partnerName, setPartnerName] = useState("Partner");

  useEffect(() => {
    localStorage.setItem("training_completed", "true");

    const loadProfile = async () => {
      const data = await fetchDpData();
      if (data?.first_name) {
        setPartnerName(`${data.first_name} ${data.last_name || ""}`.trim());
      }
    };
    loadProfile();

    const timer = setTimeout(() => setShowConfetti(false), 4000);
    return () => clearTimeout(timer);
  }, []);

  return (
    <div className="min-h-screen bg-white flex flex-col items-center justify-center px-6 text-center">
      {showConfetti && <Confetti numberOfPieces={200} recycle={false} />}
      <div className="w-28 h-28 rounded-full bg-orange-100 flex items-center justify-center mb-6 text-4xl">
        🤝
      </div>

      <h1 className="text-xl font-semibold mb-2">Welcome to Zatpatt, {partnerName}</h1>
      <p className="text-sm text-gray-500 mb-10">🎉 We’re very happy that you chose us.</p>

      <button
        onClick={() => navigate("/seva-shifts", { replace: true })}
        className="w-full max-w-md bg-orange-500 active:bg-orange-600 text-white py-3 rounded-xl font-semibold shadow-md"
      >
        Continue to Seva Shifts
      </button>
    </div>
  );
}
