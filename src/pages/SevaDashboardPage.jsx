//src\pages\SevaDashboardPage.jsx

import React, { useEffect, useState } from "react";
import { Clock, IndianRupee, CheckCircle } from "lucide-react";
import { useNavigate } from "react-router-dom";

export default function SevaDashboardPage() {
  const navigate = useNavigate();
  const [sevaData, setSevaData] = useState(null);

  useEffect(() => {
    const data = JSON.parse(localStorage.getItem("seva_shifts"));

    if (!data) {
      navigate("/seva-shifts", { replace: true });
      return;
    }

    setSevaData(data);
  }, [navigate]);

  if (!sevaData) return null;

  return (
    <div className="min-h-screen bg-white px-4 py-6">
      {/* HEADER */}
      <h1 className="text-lg font-semibold mb-1">Today’s Seva Slots</h1>
      <p className="text-sm text-gray-500 mb-4">
        You’re booked for today
      </p>

      {/* SUCCESS CARD */}
      <div className="bg-green-50 border border-green-200 rounded-xl p-4 flex gap-3 mb-6">
        <CheckCircle className="text-green-600" />
        <p className="text-sm text-green-700">
          Seva Slots confirmed successfully
        </p>
      </div>

      {/* SLOT LIST */}
      <div className="space-y-3">
        {sevaData.slots.map((slot) => (
          <div
            key={slot.id}
            className="border rounded-xl p-4 flex justify-between items-center"
          >
            <div>
              <p className="font-medium text-sm">{slot.label}</p>
              <p className="text-xs text-gray-500 flex items-center gap-1 mt-1">
                <Clock size={14} />
                {slot.duration} hrs
                {slot.break && ` · ${slot.break} min break`}
              </p>
            </div>

            <p className="text-sm font-semibold text-green-700 flex items-center gap-1">
              <IndianRupee size={14} />
              {slot.payout[0] * slot.duration} –{" "}
              {slot.payout[1] * slot.duration}
            </p>
          </div>
        ))}
      </div>

      {/* TOTAL PAYOUT */}
      <div className="mt-6 border-t pt-4">
        <p className="text-sm text-gray-500">
          Total estimated payout
        </p>
        <p className="text-lg font-semibold text-green-700">
          ₹{sevaData.payout_min} – ₹{sevaData.payout_max}
        </p>
      </div>

      {/* LOCKED MESSAGE */}
      <div className="mt-6 text-xs text-gray-400 text-center">
        Seva Slots can be booked once per day
      </div>
    </div>
  );
}
