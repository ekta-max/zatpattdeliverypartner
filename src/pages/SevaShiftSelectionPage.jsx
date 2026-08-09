//src\pages\SevaShiftSelectionPage.jsx

import React, { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { CheckCircle } from "lucide-react";
import {
  getSevaSlots,
  selectSevaSlots,
} from "../Services/sevaslots";

export default function SevaShiftSelectionPage() {
  const navigate = useNavigate();
  const [slots, setSlots] = useState([]);
  const [loading, setLoading] = useState(true);
  const [selectedSlots, setSelectedSlots] = useState([]);

  useEffect(() => {
    const fetchSlots = async () => {
      try {
        const res = await getSevaSlots();

        console.log("Slots API ✅", res);

        const data = res.data || [];

        const formatted = data.map((slot) => ({
          id: slot.slot_id,
          label: slot.shift_name,
          duration: slot.duration_hours,
          earning: slot.estimated_earning,
          // ✅ true = enabled/selectable, false = disabled/full
          capacity: slot.capacity,
          preselected: !!slot.preselected,
        }));

        const preselectedSlots = formatted.filter((s) => s.preselected);
          if (preselectedSlots.length > 0) {
            setSelectedSlots(preselectedSlots);
          }

        setSlots(formatted);
      } catch (err) {
        console.error("Slots API error ❌", err);
      } finally {
        setLoading(false);
      }
    };

    fetchSlots();
  }, []);

  /* 🔒 BLOCK RE-ENTRY */
  useEffect(() => {
    const existing = localStorage.getItem("seva_shifts");
    if (existing) {
      navigate("/dashboard", { replace: true });
    }
  }, [navigate]);

  const toggleSlot = (slot) => {
    if (!slot.capacity) return; // 🚫 disabled slots can't be selected

    setSelectedSlots((prev) =>
      prev.find((s) => s.id === slot.id)
        ? prev.filter((s) => s.id !== slot.id)
        : [...prev, slot]
    );
  };

  const handleConfirm = async () => {
    if (selectedSlots.length === 0) return;

    try {
      await selectSevaSlots(selectedSlots.map((s) => s.id));

      console.log("Slots selected ✅");

      navigate("/dashboard", { replace: true });
    } catch (err) {
      console.error("Select slots error ❌", err);
      alert("Failed to select slots");
    }
  };

  return (
    <div className="min-h-screen bg-white px-4 py-6 pb-40">
      <h1 className="text-lg font-semibold mb-1">Book Seva Slots</h1>
      <p className="text-sm text-gray-500 mb-4">
        You can select multiple Seva Slots for today
      </p>

      {loading ? (
        <p>Loading slots...</p>
      ) : slots.length === 0 ? (
        <p>No slots available</p>
      ) : (
        <div className="space-y-3">
          {slots.map((slot) => {
            const active = selectedSlots.find((s) => s.id === slot.id);
            const isDisabled = !slot.capacity;

            return (
              <div
                key={slot.id}
                onClick={() => toggleSlot(slot)}
                className={`p-4 rounded-xl border transition ${
                  isDisabled
                    ? "border-gray-200 bg-gray-100 opacity-60 cursor-not-allowed"
                    : active
                    ? "border-orange-500 bg-orange-50 cursor-pointer"
                    : "border-gray-200 cursor-pointer"
                }`}
              >
                {/* TOP ROW */}
                <div className="flex justify-between items-center">
                  <p
                    className={`text-sm font-semibold ${
                      isDisabled ? "text-gray-400" : "text-gray-900"
                    }`}
                  >
                    {slot.label}
                  </p>

                  {isDisabled ? (
                    <span className="text-[10px] bg-gray-200 text-gray-500 px-2 py-0.5 rounded-full ml-2">
                      Full
                    </span>
                  ) : (
                    <span className="text-[10px] bg-orange-100 text-orange-600 px-2 py-0.5 rounded-full ml-2">
                      Popular
                    </span>
                  )}

                  {!isDisabled && (
                    <div className="w-5 h-5 rounded border flex items-center justify-center">
                      {(active || slot.preselected) && (
                        <CheckCircle size={18} className="text-orange-500" />
                      )}
                    </div>
                  )}
                </div>

                {/* MIDDLE ROW */}
                <p
                  className={`text-xs mt-1 ${
                    isDisabled ? "text-gray-400" : "text-gray-500"
                  }`}
                >
                  ⏱ {slot.duration} hrs
                </p>

                {/* BOTTOM ROW (PRICE) */}
                <div className="mt-2 flex justify-between items-center">
                  <p className={`text-xs ${isDisabled ? "text-gray-400" : "text-gray-500"}`}>
                    {isDisabled ? "Slot full" : "Estimated earning"}
                  </p>

                  {!isDisabled && (
                    <p className="text-sm font-bold text-green-600">
                      ₹{slot.earning.min} – ₹{slot.earning.max}
                    </p>
                  )}
                </div>
              </div>
            );
          })}
        </div>
      )}

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