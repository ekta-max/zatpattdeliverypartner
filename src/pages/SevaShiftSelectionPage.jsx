// src/pages/SevaShiftSelectionPage.jsx

import React, { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { CheckCircle, Clock3, IndianRupee } from "lucide-react";

import {
  getSevaSlots,
  selectSevaSlots,
} from "../Services/sevaslots";

// =========================================================
// MERCHANT APP THEME
// =========================================================

const COLORS = {
  primary: "#f97316",
  primaryHover: "#ea580c",
  primaryActive: "#c2410c",

  background: "#fffaf5",

  softOrange: "#fff7ed",
  softOrangeLight: "#ffedd5",

  border: "#fed7aa",
  borderLight: "#fdba74",

  text: "#101828",
  secondaryText: "#667085",

  success: "#16a34a",
};

export default function SevaShiftSelectionPage() {
  const navigate = useNavigate();

  const [slots, setSlots] = useState([]);
  const [loading, setLoading] = useState(true);
  const [selectedSlots, setSelectedSlots] = useState([]);
  const [confirmLoading, setConfirmLoading] =
    useState(false);

  // =======================================================
  // FETCH SLOTS
  // =======================================================

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

          // true = selectable
          // false = full
          capacity: slot.capacity,

          preselected: !!slot.preselected,
        }));

        const preselectedSlots =
          formatted.filter(
            (slot) => slot.preselected
          );

        if (preselectedSlots.length > 0) {
          setSelectedSlots(preselectedSlots);
        }

        setSlots(formatted);
      } catch (err) {
        console.error(
          "Slots API error ❌",
          err
        );
      } finally {
        setLoading(false);
      }
    };

    fetchSlots();
  }, []);

  // =======================================================
  // BLOCK RE-ENTRY
  // =======================================================

  useEffect(() => {
    const existing =
      localStorage.getItem("seva_shifts");

    if (existing) {
      navigate("/dashboard", {
        replace: true,
      });
    }
  }, [navigate]);

  // =======================================================
  // TOGGLE SLOT
  // =======================================================

  const toggleSlot = (slot) => {
    // Disabled / full slot
    if (!slot.capacity) return;

    setSelectedSlots((prev) =>
      prev.find(
        (selected) =>
          selected.id === slot.id
      )
        ? prev.filter(
            (selected) =>
              selected.id !== slot.id
          )
        : [...prev, slot]
    );
  };

  // =======================================================
  // CONFIRM
  // =======================================================

  const handleConfirm = async () => {
    if (
      selectedSlots.length === 0 ||
      confirmLoading
    ) {
      return;
    }

    try {
      setConfirmLoading(true);

      await selectSevaSlots(
        selectedSlots.map(
          (slot) => slot.id
        )
      );

      console.log(
        "Slots selected ✅"
      );

      navigate("/dashboard", {
        replace: true,
      });
    } catch (err) {
      console.error(
        "Select slots error ❌",
        err
      );

      alert("Failed to select slots");
    } finally {
      setConfirmLoading(false);
    }
  };

  // =======================================================
  // LOADING
  // =======================================================

  if (loading) {
    return (
      <div
        className="
          min-h-screen
          flex
          items-center
          justify-center
          px-4
        "
        style={{
          backgroundColor:
            COLORS.background,
        }}
      >
        <div className="text-center">
          <div
            className="
              w-8
              h-8
              mx-auto
              rounded-full
              border-2
              border-gray-200
              animate-spin
            "
            style={{
              borderTopColor:
                COLORS.primary,
            }}
          />

          <p
            className="
              mt-3
              text-sm
              font-medium
            "
            style={{
              color:
                COLORS.secondaryText,
            }}
          >
            Loading slots...
          </p>
        </div>
      </div>
    );
  }

  // =======================================================
  // PAGE
  // =======================================================

  return (
    <div
      className="
        min-h-screen
        w-full

        px-4
        pt-6
        pb-32

        sm:px-6
        sm:pt-8
      "
      style={{
        backgroundColor:
          COLORS.background,
      }}
    >
      {/* =================================================
          HEADER
      ================================================= */}

      <div className="max-w-2xl mx-auto">
        <div className="mb-5">
          <h1
            className="
              text-xl
              sm:text-2xl

              font-extrabold

              tracking-tight
            "
            style={{
              color: COLORS.text,
            }}
          >
            Book Seva Slots
          </h1>

          <p
            className="
              text-sm
              mt-1
            "
            style={{
              color:
                COLORS.secondaryText,
            }}
          >
            You can select multiple Seva
            Slots for today
          </p>
        </div>

        {/* =================================================
            EMPTY STATE
        ================================================= */}

        {slots.length === 0 ? (
          <div
            className="
              bg-white
              rounded-2xl
              border
              p-8
              text-center
            "
            style={{
              borderColor:
                COLORS.border,
            }}
          >
            <p
              className="
                text-sm
                font-medium
              "
              style={{
                color:
                  COLORS.secondaryText,
              }}
            >
              No slots available
            </p>
          </div>
        ) : (
          /* =================================================
              SLOTS
          ================================================= */

          <div className="space-y-3">
            {slots.map((slot) => {
              const active =
                selectedSlots.some(
                  (selected) =>
                    selected.id ===
                    slot.id
                );

              const isDisabled =
                !slot.capacity;

              return (
                <div
                  key={slot.id}
                  onClick={() =>
                    toggleSlot(slot)
                  }
                  className={`
                    relative

                    p-4
                    sm:p-5

                    rounded-2xl

                    border

                    transition-all
                    duration-200

                    ${
                      isDisabled
                        ? "bg-gray-100 opacity-60 cursor-not-allowed"
                        : active
                        ? "cursor-pointer"
                        : "bg-white cursor-pointer hover:-translate-y-[1px]"
                    }
                  `}
                  style={{
                    borderColor:
                      isDisabled
                        ? "#e5e7eb"
                        : active
                        ? COLORS.primary
                        : "#e5e7eb",

                    backgroundColor:
                      isDisabled
                        ? "#f3f4f6"
                        : active
                        ? COLORS.softOrange
                        : "#ffffff",

                    boxShadow:
                      active
                        ? "0 6px 18px rgba(249, 115, 22, 0.10)"
                        : "none",
                  }}
                >
                  {/* =========================================
                      TOP ROW
                  ========================================= */}

                  <div
                    className="
                      flex
                      items-center
                      justify-between
                      gap-3
                    "
                  >
                    <div className="min-w-0">
                      <p
                        className={`
                          text-sm
                          sm:text-base
                          font-bold
                          truncate
                        `}
                        style={{
                          color:
                            isDisabled
                              ? "#9ca3af"
                              : COLORS.text,
                        }}
                      >
                        {slot.label}
                      </p>
                    </div>

                    <div className="flex items-center gap-2 shrink-0">
                      {/* STATUS */}

                      {isDisabled ? (
                        <span
                          className="
                            text-[10px]
                            sm:text-xs
                            font-bold

                            px-2.5
                            py-1

                            rounded-full
                          "
                          style={{
                            backgroundColor:
                              "#e5e7eb",
                            color:
                              "#6b7280",
                          }}
                        >
                          Full
                        </span>
                      ) : (
                        <span
                          className="
                            text-[10px]
                            sm:text-xs
                            font-bold

                            px-2.5
                            py-1

                            rounded-full
                          "
                          style={{
                            backgroundColor:
                              COLORS.softOrangeLight,
                            color:
                              COLORS.primaryHover,
                          }}
                        >
                          Popular
                        </span>
                      )}

                      {/* CHECK */}

                      {!isDisabled && (
                        <div
                          className="
                            w-6
                            h-6

                            rounded-lg

                            flex
                            items-center
                            justify-center

                            transition-all
                          "
                          style={{
                            border: active
                              ? `1.5px solid ${COLORS.primary}`
                              : "1.5px solid #d1d5db",

                            backgroundColor:
                              active
                                ? COLORS.primary
                                : "#ffffff",
                          }}
                        >
                          {active && (
                            <CheckCircle
                              size={17}
                              strokeWidth={
                                2.5
                              }
                              color="#ffffff"
                            />
                          )}
                        </div>
                      )}
                    </div>
                  </div>

                  {/* =========================================
                      DURATION
                  ========================================= */}

                  <div
                    className="
                      flex
                      items-center
                      gap-1.5

                      mt-2
                    "
                  >
                    <Clock3
                      size={14}
                      style={{
                        color:
                          isDisabled
                            ? "#9ca3af"
                            : COLORS.primary,
                      }}
                    />

                    <p
                      className="text-xs sm:text-sm"
                      style={{
                        color:
                          isDisabled
                            ? "#9ca3af"
                            : COLORS.secondaryText,
                      }}
                    >
                      {slot.duration} hrs
                    </p>
                  </div>

                  {/* =========================================
                      EARNING
                  ========================================= */}

                  <div
                    className="
                      mt-3

                      pt-3

                      border-t

                      flex
                      items-center
                      justify-between
                      gap-3
                    "
                    style={{
                      borderColor:
                        isDisabled
                          ? "#e5e7eb"
                          : active
                          ? "#fed7aa"
                          : "#f0f0f0",
                    }}
                  >
                    <p
                      className="text-xs sm:text-sm"
                      style={{
                        color:
                          isDisabled
                            ? "#9ca3af"
                            : COLORS.secondaryText,
                      }}
                    >
                      {isDisabled
                        ? "Slot full"
                        : "Estimated earning"}
                    </p>

                    {!isDisabled && (
                      <div
                        className="
                          flex
                          items-center
                          gap-1
                        "
                      >
                        <IndianRupee
                          size={14}
                          strokeWidth={2.5}
                          style={{
                            color:
                              COLORS.success,
                          }}
                        />

                        <p
                          className="
                            text-sm
                            sm:text-base
                            font-extrabold
                          "
                          style={{
                            color:
                              COLORS.success,
                          }}
                        >
                          ₹
                          {
                            slot
                              .earning
                              .min
                          }{" "}
                          – ₹
                          {
                            slot
                              .earning
                              .max
                          }
                        </p>
                      </div>
                    )}
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>

      {/* =====================================================
          BOTTOM SUMMARY
      ===================================================== */}

      {selectedSlots.length > 0 && (
        <div
          className="
            fixed
            bottom-0
            left-0
            right-0

            z-50

            bg-white

            border-t

            px-4
            py-3

            sm:px-6
            sm:py-4
          "
          style={{
            borderColor:
              COLORS.border,
            boxShadow:
              "0 -8px 25px rgba(80, 48, 20, 0.08)",
          }}
        >
          <div
            className="
              max-w-2xl
              mx-auto
            "
          >
            {/* SELECTED INFO */}

            <div className="mb-2.5">
              <p
                className="
                  text-sm
                  font-bold
                "
                style={{
                  color: COLORS.text,
                }}
              >
                {selectedSlots.length}{" "}
                Seva{" "}
                {selectedSlots.length ===
                1
                  ? "Slot"
                  : "Slots"}{" "}
                selected
              </p>

              <p
                className="
                  text-[11px]
                  sm:text-xs

                  mt-0.5

                  truncate
                "
                style={{
                  color:
                    COLORS.secondaryText,
                }}
              >
                {selectedSlots
                  .map(
                    (slot) =>
                      slot.label
                  )
                  .join(", ")}
              </p>
            </div>

            {/* CONFIRM BUTTON */}

            <button
              type="button"
              onClick={handleConfirm}
              disabled={confirmLoading}
              className="
                w-full

                h-[46px]
                sm:h-[50px]

                rounded-xl

                text-sm
                sm:text-base

                font-extrabold

                text-white

                transition-all
                duration-200

                disabled:cursor-not-allowed
              "
              style={{
                background:
                  confirmLoading
                    ? COLORS.disabled
                    : `linear-gradient(
                        135deg,
                        #f97316 0%,
                        #fb923c 100%
                      )`,

                boxShadow:
                  confirmLoading
                    ? "none"
                    : "0 8px 20px rgba(249, 115, 22, 0.20)",
              }}
              onMouseEnter={(e) => {
                if (!confirmLoading) {
                  e.currentTarget.style.background =
                    "linear-gradient(135deg, #ea580c 0%, #f97316 100%)";

                  e.currentTarget.style.boxShadow =
                    "0 12px 24px rgba(249, 115, 22, 0.26)";
                }
              }}
              onMouseLeave={(e) => {
                if (!confirmLoading) {
                  e.currentTarget.style.background =
                    "linear-gradient(135deg, #f97316 0%, #fb923c 100%)";

                  e.currentTarget.style.boxShadow =
                    "0 8px 20px rgba(249, 115, 22, 0.20)";
                }
              }}
            >
              {confirmLoading
                ? "Confirming..."
                : "Confirm Seva Slots"}
            </button>
          </div>
        </div>
      )}
    </div>
  );
}