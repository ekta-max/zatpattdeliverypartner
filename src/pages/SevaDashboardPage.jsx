// src/pages/SevaDashboardPage.jsx

import React, { useEffect, useState } from "react";
import { Clock, IndianRupee, CheckCircle } from "lucide-react";
import { useNavigate } from "react-router-dom";
import { fetchDpData, evaluateDpProgress } from "../Services/dpService";

export default function SevaDashboardPage() {
  const navigate = useNavigate();
  const [sevaData, setSevaData] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const checkAllSteps = async () => {
      setLoading(true);
      const data = await fetchDpData();
      const progress = evaluateDpProgress(data);

      if (!progress.step1Done) return navigate("/work-details", { replace: true });
      if (!progress.step2Done) return navigate("/personal-details", { replace: true });
      if (!progress.step3Done) return navigate("/order-partner-kit", { replace: true });
      if (!progress.isVerified) return navigate("/verification-pending", { replace: true });
      if (!progress.trainingDone) return navigate("/training", { replace: true });

      const storedShifts = JSON.parse(localStorage.getItem("seva_shifts"));
      if (!storedShifts) {
        navigate("/seva-shifts", { replace: true });
        return;
      }

      setSevaData(storedShifts);
      setLoading(false);
    };

    checkAllSteps();
  }, [navigate]);

  if (loading || !sevaData) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-white">
        <div className="w-6 h-6 border-2 border-orange-500 border-t-transparent rounded-full animate-spin" />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-white px-4 py-6 max-w-xl mx-auto">
      <h1 className="text-lg font-semibold mb-1">Today’s Seva Slots</h1>
      <p className="text-sm text-gray-500 mb-4">You’re booked for today</p>

      <div className="bg-green-50 border border-green-200 rounded-xl p-4 flex gap-3 mb-6">
        <CheckCircle className="text-green-600" />
        <p className="text-sm text-green-700">Seva Slots confirmed successfully</p>
      </div>

      <div className="space-y-3">
        {sevaData.slots?.map((slot) => (
          <div key={slot.id} className="border rounded-xl p-4 flex justify-between items-center">
            <div>
              <p className="font-medium text-sm text-gray-900">{slot.label}</p>
              <p className="text-xs text-gray-500 flex items-center gap-1 mt-1">
                <Clock size={14} /> {slot.duration} hrs
              </p>
            </div>
            <p className="text-sm font-semibold text-green-700">
              ₹{slot.earning?.min || 0} – ₹{slot.earning?.max || 0}
            </p>
          </div>
        ))}
      </div>
    </div>
  );
}
