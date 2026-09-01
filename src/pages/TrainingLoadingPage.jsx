// src/pages/TrainingLoadingPage.jsx

import React, { useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { fetchDpData, evaluateDpProgress } from "../Services/dpService";

export default function TrainingLoadingPage() {
  const navigate = useNavigate();

  useEffect(() => {
    const initTraining = async () => {
      const data = await fetchDpData();
      const progress = evaluateDpProgress(data);

      if (!progress.isVerified) {
        navigate("/verification-pending", { replace: true });
        return;
      }

      if (progress.trainingDone) {
        navigate("/dashboard", { replace: true });
        return;
      }

      setTimeout(() => {
        navigate("/training", { replace: true });
      }, 1200);
    };

    initTraining();
  }, [navigate]);

  return (
    <div className="min-h-screen flex flex-col items-center justify-center bg-white">
      <div className="animate-spin w-10 h-10 border-4 border-orange-500 border-t-transparent rounded-full" />
      <p className="mt-4 text-sm text-gray-500">Preparing your training modules…</p>
    </div>
  );
}
