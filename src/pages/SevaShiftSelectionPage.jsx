//src\pages\SevaShiftSelectionPage.jsx

import React, { useEffect, useMemo, useState } from "react";
import { useNavigate } from "react-router-dom";
import { CheckCircle } from "lucide-react";

/* ================= SEVA SHIFT DATA ================= */

const SHIFTS = {
  morning: [
    {
      id: "6-9",
      label: "6 AM – 9 AM",
      payout: [55, 80],
      duration: 3,
      break: 10,
    },
    {
      id: "9-12",
      label: "9 AM – 12 PM",
      payout: [55, 80],
      duration: 3,
    },
  ],

  afternoon: [
    {
      id: "12-15",
      label: "12 PM – 3 PM",
      payout: [60, 85],
      duration: 3,
      break: 20,
      star: true,
    },
    {
      id: "15-17",
      label: "3 PM – 5 PM",
      payout: [60, 85],
      duration: 2,
    },
  ],

  evening: [
    {
      id: "17-20",
      label: "5 PM – 8 PM",
      payout: [70, 100],
      duration: 3,
      break: 10,
      star: true,
    },
    {
      id: "20-23",
      label: "8 PM – 11 PM",
      payout: [70, 100],
      duration: 3,
    },
  ],

  night: [
    {
      id: "23-1",
      label: "11 PM – 1 AM",
      payout: [50, 80],
      duration: 2, // ❌ NO BREAK HERE
    },
  ],
};

/* ================= COMPONENT ================= */

export default function SevaShiftSelectionPage() {
  const navigate = useNavigate();
  const [selectedSlots, setSelectedSlots] = useState([]);

  /* 🔒 BLOCK RE-ENTRY */
  useEffect(() => {
    const existing = localStorage.getItem("seva_shifts");
    if (existing) {
      navigate("/dashboard", { replace: true });
    }
  }, [navigate]);

  /* 💰 TOTAL PAYOUT (hourly × duration) */
  const payout = useMemo(() => {
    let min = 0;
    let max = 0;

    selectedSlots.forEach((s) => {
      min += s.payout[0] * s.duration;
      max += s.payout[1] * s.duration;
    });

    return { min, max };
  }, [selectedSlots]);

  const toggleSlot = (slot) => {
    setSelectedSlots((prev) =>
      prev.find((s) => s.id === slot.id)
        ? prev.filter((s) => s.id !== slot.id)
        : [...prev, slot]
    );
  };

  const handleConfirm = () => {
    localStorage.setItem(
      "seva_shifts",
      JSON.stringify({
        date: new Date().toISOString().slice(0, 10),
        slots: selectedSlots,
        payout_min: payout.min,
        payout_max: payout.max,
      })
    );

    navigate("/dashboard", { replace: true });
  };

  return (
    <div className="min-h-screen bg-white px-4 py-6 pb-40">
      <h1 className="text-lg font-semibold mb-1">Book Seva Slots</h1>
      <p className="text-sm text-gray-500 mb-4">
        You can select multiple Seva Slots for today
      </p>

      {/* ===== SHIFT GROUPS ===== */}
      {Object.entries(SHIFTS).map(([group, slots]) => (
        <div key={group} className="mb-6">
          <h2 className="text-sm font-semibold capitalize mb-3">
            {group} shift
          </h2>

          <div className="space-y-3">
            {slots.map((slot) => {
              const active = selectedSlots.find(
                (s) => s.id === slot.id
              );

              return (
                <div
                  key={slot.id}
                  onClick={() => toggleSlot(slot)}
                  className={`p-4 rounded-xl border cursor-pointer transition ${
                    active
                      ? "border-orange-500 bg-orange-50"
                      : "border-gray-200"
                  }`}
                >
                  <div className="flex justify-between items-start">
                    <div>
                      <p className="text-sm font-medium flex items-center gap-2">
                        {slot.label}
                        {slot.star && (
                          <span className="text-xs bg-purple-100 text-purple-700 px-2 py-0.5 rounded-full">
                            ⭐ Seva Slot
                          </span>
                        )}
                      </p>

                      <p className="text-xs text-gray-500 mt-1">
                        ₹{slot.payout[0]} – ₹{slot.payout[1]} per hour
                      </p>

                      <p className="text-xs text-gray-500">
                        ⏱ {slot.duration} hrs
                        {slot.break && ` · ☕ ${slot.break} min break`}
                      </p>

                      <p className="text-xs font-semibold text-green-700 mt-1">
                        Estimated: ₹{slot.payout[0] * slot.duration} – ₹
                        {slot.payout[1] * slot.duration}
                      </p>
                    </div>

                    <div className="w-5 h-5 rounded border flex items-center justify-center">
                      {active && (
                        <CheckCircle
                          size={18}
                          className="text-orange-500"
                        />
                      )}
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      ))}

      {/* ===== SUMMARY BAR ===== */}
      {selectedSlots.length > 0 && (
        <div className="fixed bottom-0 left-0 right-0 bg-white border-t p-4">
          <div className="text-sm mb-2">
            <p className="font-medium">
              {selectedSlots.length} Seva Slots selected
            </p>
            <p className="text-xs text-gray-500">
              {selectedSlots.map((s) => s.label).join(", ")}
            </p>
          </div>

          <p className="text-sm font-semibold mb-3">
            Estimated payout: ₹{payout.min} – ₹{payout.max}
          </p>

          <button
            onClick={handleConfirm}
            className="w-full bg-orange-500 text-white py-3 rounded-xl font-semibold"
          >
            Confirm Seva Slots
          </button>
        </div>
      )}
    </div>
  );
}
