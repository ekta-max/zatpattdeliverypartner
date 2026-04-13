//src\pages\TrainingLoadingPage.jsx

import React, { useEffect } from "react";
import { useNavigate } from "react-router-dom";

export default function TrainingLoadingPage() {
  const navigate = useNavigate();

  useEffect(() => {
    // 🔐 HARD GATES

    const verification = localStorage.getItem("verification_status");
    const trainingCompleted = localStorage.getItem("training_completed");
    

    // ❌ Training already done → skip loading
    if (trainingCompleted === "true") {
      navigate("/dashboard", { replace: true });
      return;
    }

    // ✅ Valid flow → move to training
    const t = setTimeout(() => {
      navigate("/training", { replace: true });
    }, 1500);

    return () => clearTimeout(t);
  }, [navigate]);

  return (
    <div className="min-h-screen flex flex-col items-center justify-center bg-white">
      <div className="animate-spin w-10 h-10 border-4 border-orange-500 border-t-transparent rounded-full"></div>

      <p className="mt-4 text-sm text-gray-500">
        Preparing your training modules…
      </p>
    </div>
  );
}
