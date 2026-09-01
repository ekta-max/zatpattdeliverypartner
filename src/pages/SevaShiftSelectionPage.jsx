// src/pages/SevaShiftSelectionPage.jsx

import React, { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import {
  ArrowLeft,
  CheckCircle,
  Clock3,
  IndianRupee,
  Sparkles,
} from "lucide-react";

import { getSevaSlots, selectSevaSlots } from "../Services/sevaslots";
import { fetchDpData, evaluateDpProgress } from "../Services/dpService";

/* =========================================================
   ZATPATT THEME
========================================================= */

const COLORS = {
  orange: "#FF6600",
  orangeDark: "#F45100",
  orangeLight: "#FFA800",

  background: "#FAF6F0",

  white: "#FFFFFF",

  text: "#2E1A0F",
  textMuted: "#7C6657",

  softOrange: "#FFF5EC",
  softOrange2: "#FFF9F3",

  border: "#F3E7DC",
  orangeBorder: "#FED7AA",

  success: "#16A34A",
};

const BRAND_GRADIENT =
  "linear-gradient(90deg, #FF6200 0%, #FFA800 100%)";

const HERO_GRADIENT =
  "linear-gradient(155deg, #FF6000 0%, #FF7A00 45%, #FFA600 100%)";

export default function SevaShiftSelectionPage() {
  const navigate = useNavigate();

  const [slots, setSlots] = useState([]);
  const [loading, setLoading] = useState(true);
  const [selectedSlots, setSelectedSlots] = useState([]);
  const [confirmLoading, setConfirmLoading] = useState(false);

  /* =========================================================
     INITIALIZE PAGE
  ========================================================= */

  useEffect(() => {
    const initPage = async () => {
      setLoading(true);

      try {
        const data = await fetchDpData();
        const progress = evaluateDpProgress(data);

        // Step 1
        if (!progress.step1Done) {
          navigate("/work-details", { replace: true });
          return;
        }

        // Step 2
        if (!progress.step2Done) {
          navigate("/personal-details", { replace: true });
          return;
        }

        // Step 3
        if (!progress.step3Done) {
          navigate("/order-partner-kit", { replace: true });
          return;
        }

        // Verification
        if (!progress.isVerified) {
          navigate("/verification-pending", { replace: true });
          return;
        }

        // Training
        if (!progress.trainingDone) {
          navigate("/training", { replace: true });
          return;
        }

        /* -----------------------------------------------------
           FETCH SEVA SLOTS
        ----------------------------------------------------- */

        const res = await getSevaSlots();

        const slotsData = res?.data || [];

        const formatted = slotsData.map((slot) => ({
          id: slot.slot_id,
          label: slot.shift_name,
          duration: slot.duration_hours,
          earning: slot.estimated_earning,
          capacity: slot.capacity,
          preselected: !!slot.preselected,
        }));

        setSlots(formatted);

        setSelectedSlots(
          formatted.filter((slot) => slot.preselected)
        );
      } catch (err) {
        console.error("Seva slots API error ❌", err);
      } finally {
        setLoading(false);
      }
    };

    initPage();
  }, [navigate]);

  /* =========================================================
     TOGGLE SLOT
  ========================================================= */

  const toggleSlot = (slot) => {
    if (!slot.capacity) return;

    setSelectedSlots((prev) => {
      const exists = prev.some((item) => item.id === slot.id);

      if (exists) {
        return prev.filter((item) => item.id !== slot.id);
      }

      return [...prev, slot];
    });
  };

  /* =========================================================
     CONFIRM SLOTS
  ========================================================= */

  const handleConfirm = async () => {
    if (selectedSlots.length === 0 || confirmLoading) return;

    try {
      setConfirmLoading(true);

      await selectSevaSlots(
        selectedSlots.map((slot) => slot.id)
      );

      localStorage.setItem(
        "seva_shifts",
        JSON.stringify({
          slots: selectedSlots,
        })
      );

      navigate("/dashboard", { replace: true });
    } catch (err) {
      console.error("Confirm slots error ❌", err);

      alert("Failed to confirm slots. Please try again.");
    } finally {
      setConfirmLoading(false);
    }
  };

  /* =========================================================
     LOADING SCREEN
  ========================================================= */

  if (loading) {
    return (
      <div
        className="min-h-screen w-full flex items-center justify-center px-4"
        style={{
          backgroundColor: COLORS.background,
          backgroundImage: `
            radial-gradient(
              circle at 10% 15%,
              rgba(255, 230, 205, 0.7) 0%,
              transparent 40%
            ),
            radial-gradient(
              circle at 90% 25%,
              rgba(255, 226, 195, 0.75) 0%,
              transparent 38%
            )
          `,
        }}
      >
        <div
          className="bg-white rounded-[26px] px-8 py-7 text-center"
          style={{
            border: `1px solid ${COLORS.border}`,
            boxShadow:
              "0 20px 60px rgba(100,50,15,0.08)",
          }}
        >
          <div
            className="mx-auto mb-4 h-11 w-11 rounded-full border-4 animate-spin"
            style={{
              borderColor: "#FED7AA",
              borderTopColor: COLORS.orange,
            }}
          />

          <p
            className="text-sm font-black"
            style={{ color: COLORS.text }}
          >
            Loading Seva Slots...
          </p>

          <p
            className="text-[11px] mt-1"
            style={{ color: COLORS.textMuted }}
          >
            Please wait a moment
          </p>
        </div>
      </div>
    );
  }

  /* =========================================================
     MAIN UI
  ========================================================= */

  return (
    <div
      className="min-h-screen w-full"
      style={{
        backgroundColor: COLORS.background,
        backgroundImage: `
          radial-gradient(
            circle at 10% 15%,
            rgba(255, 230, 205, 0.7) 0%,
            transparent 40%
          ),
          radial-gradient(
            circle at 92% 25%,
            rgba(255, 226, 195, 0.75) 0%,
            transparent 38%
          ),
          radial-gradient(
            circle at 85% 85%,
            rgba(255, 234, 212, 0.55) 0%,
            transparent 35%
          )
        `,
      }}
    >
      {/* =====================================================
          HEADER
      ===================================================== */}

      <header
        className="sticky top-0 z-40 text-white shadow-md"
        style={{
          background: HERO_GRADIENT,
        }}
      >
        <div className="max-w-2xl mx-auto px-4 sm:px-6 py-3.5 flex items-center justify-between">
          {/* BACK BUTTON */}

          <button
            type="button"
            onClick={() => navigate(-1)}
            className="w-9 h-9 sm:w-10 sm:h-10 rounded-xl flex items-center justify-center transition active:scale-95"
            style={{
              backgroundColor: "rgba(255,255,255,0.20)",
              border: "1px solid rgba(255,255,255,0.25)",
              backdropFilter: "blur(8px)",
            }}
          >
            <ArrowLeft size={19} />
          </button>

          {/* TITLE */}

          <div className="text-center">
            <div
              className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full"
              style={{
                backgroundColor: "rgba(255,255,255,0.20)",
                border: "1px solid rgba(255,255,255,0.25)",
                backdropFilter: "blur(8px)",
              }}
            >
              <span className="w-1.5 h-1.5 rounded-full bg-white animate-pulse" />

              <span className="text-[9px] font-black tracking-[1.3px] uppercase">
                Zatpatt Partner
              </span>
            </div>

            <h1 className="text-base sm:text-lg font-black mt-0.5">
              Seva Slots
            </h1>
          </div>

          {/* ICON */}

          <div
            className="w-9 h-9 sm:w-10 sm:h-10 rounded-xl flex items-center justify-center"
            style={{
              backgroundColor: "rgba(255,255,255,0.20)",
              border: "1px solid rgba(255,255,255,0.25)",
              backdropFilter: "blur(8px)",
            }}
          >
            <Clock3 size={18} />
          </div>
        </div>
      </header>

      {/* =====================================================
          MAIN CONTENT
      ===================================================== */}

      <main className="max-w-2xl mx-auto px-3 sm:px-6 py-5 sm:py-7 pb-36">
        {/* ===================================================
            HERO CARD
        =================================================== */}

        <div
          className="relative overflow-hidden bg-white rounded-[26px] sm:rounded-[32px] p-5 sm:p-7 mb-5"
          style={{
            border: `1px solid ${COLORS.border}`,
            boxShadow:
              "0 20px 60px rgba(100,50,15,0.08)",
          }}
        >
          {/* Decorative orange glow */}

          <div
            className="absolute -right-12 -top-12 w-32 h-32 rounded-full opacity-20"
            style={{
              background: COLORS.orangeLight,
            }}
          />

          <div className="relative">
            {/* LABEL */}

          

            {/* TITLE */}

            <h2
              className="text-2xl sm:text-3xl font-black leading-tight"
              style={{
                color: COLORS.text,
              }}
            >
              Book your Seva
              <br />
              slots.
            </h2>

            <p
              className="text-xs sm:text-sm font-semibold leading-relaxed mt-2 max-w-md"
              style={{
                color: COLORS.textMuted,
              }}
            >
              Choose the shifts that work best for you.
              You can select multiple Seva Slots for today.
            </p>

            {/* SELECTED COUNT */}

            {selectedSlots.length > 0 && (
              <div
                className="inline-flex items-center gap-2 mt-4 px-3 py-1.5 rounded-full text-[11px] font-black"
                style={{
                  backgroundColor: COLORS.softOrange,
                  border: `1px solid ${COLORS.orangeBorder}`,
                  color: COLORS.orange,
                }}
              >
                <CheckCircle size={13} />

                {selectedSlots.length}{" "}
                {selectedSlots.length === 1
                  ? "slot selected"
                  : "slots selected"}
              </div>
            )}
          </div>
        </div>

        {/* ===================================================
            SECTION TITLE
        =================================================== */}

        <div className="flex items-center justify-between mb-3">
          <div>
            <h3
              className="text-sm sm:text-base font-black"
              style={{
                color: COLORS.text,
              }}
            >
              Available Slots
            </h3>

            <p
              className="text-[10px] sm:text-[11px] font-semibold mt-0.5"
              style={{
                color: COLORS.textMuted,
              }}
            >
              Select one or more shifts
            </p>
          </div>

          {slots.length > 0 && (
            <span
              className="text-[10px] font-black px-2.5 py-1 rounded-full"
              style={{
                backgroundColor: COLORS.softOrange,
                color: COLORS.orange,
                border: `1px solid ${COLORS.orangeBorder}`,
              }}
            >
              {slots.length} slots
            </span>
          )}
        </div>

        {/* ===================================================
            SLOTS
        =================================================== */}

        <div className="space-y-3">
          {slots.length === 0 && (
            <div
              className="bg-white rounded-[24px] p-7 text-center"
              style={{
                border: `1px solid ${COLORS.border}`,
                boxShadow:
                  "0 10px 35px rgba(100,50,15,0.05)",
              }}
            >
              <div
                className="w-12 h-12 rounded-2xl mx-auto mb-3 flex items-center justify-center"
                style={{
                  backgroundColor: COLORS.softOrange,
                  color: COLORS.orange,
                  border: `1px solid ${COLORS.orangeBorder}`,
                }}
              >
                <Clock3 size={21} />
              </div>

              <p
                className="text-sm font-black"
                style={{
                  color: COLORS.text,
                }}
              >
                No Seva Slots Available
              </p>

              <p
                className="text-[11px] font-semibold mt-1"
                style={{
                  color: COLORS.textMuted,
                }}
              >
                Please check again later.
              </p>
            </div>
          )}

          {slots.map((slot) => {
            const active = selectedSlots.some(
              (selected) => selected.id === slot.id
            );

            const isDisabled = !slot.capacity;

            return (
              <div
                key={slot.id}
                onClick={() => toggleSlot(slot)}
                className="relative overflow-hidden rounded-[22px] p-4 sm:p-5 transition-all duration-200"
                style={{
                  backgroundColor: isDisabled
                    ? "#F5F3F0"
                    : active
                    ? COLORS.softOrange2
                    : COLORS.white,

                  border: active
                    ? `1.5px solid ${COLORS.orange}`
                    : `1px solid ${COLORS.border}`,

                  boxShadow: active
                    ? "0 10px 30px rgba(255,102,0,0.10)"
                    : "0 8px 25px rgba(100,50,15,0.045)",

                  opacity: isDisabled ? 0.60 : 1,

                  cursor: isDisabled
                    ? "not-allowed"
                    : "pointer",
                }}
              >
                {/* TOP ROW */}

                <div className="flex items-start justify-between gap-3">
                  <div className="min-w-0">
                    <div className="flex items-center gap-2">
                      <h4
                        className="text-sm sm:text-base font-black"
                        style={{
                          color: COLORS.text,
                        }}
                      >
                        {slot.label}
                      </h4>

                      {active && (
                        <span
                          className="text-[9px] font-black uppercase tracking-wide px-2 py-0.5 rounded-full"
                          style={{
                            backgroundColor: "#FFEADB",
                            color: COLORS.orange,
                          }}
                        >
                          Selected
                        </span>
                      )}
                    </div>

                    {/* DURATION */}

                    <div
                      className="flex items-center gap-1.5 mt-2 text-[11px] sm:text-xs font-semibold"
                      style={{
                        color: COLORS.textMuted,
                      }}
                    >
                      <Clock3
                        size={14}
                        style={{
                          color: COLORS.orange,
                        }}
                      />

                      <span>
                        {slot.duration} hrs
                      </span>
                    </div>
                  </div>

                  {/* CHECKBOX */}

                  {!isDisabled ? (
                    <div
                      className="w-7 h-7 rounded-xl flex items-center justify-center shrink-0 transition-all"
                      style={{
                        backgroundColor: active
                          ? COLORS.orange
                          : COLORS.white,

                        border: active
                          ? `1.5px solid ${COLORS.orange}`
                          : "1.5px solid #D6D3D1",

                        boxShadow: active
                          ? "0 5px 12px rgba(255,102,0,0.20)"
                          : "none",
                      }}
                    >
                      {active && (
                        <CheckCircle
                          size={17}
                          color="#FFFFFF"
                          strokeWidth={2.7}
                        />
                      )}
                    </div>
                  ) : (
                    <span
                      className="text-[9px] font-black uppercase px-2.5 py-1 rounded-full"
                      style={{
                        backgroundColor: "#E7E5E4",
                        color: COLORS.textMuted,
                      }}
                    >
                      Full
                    </span>
                  )}
                </div>

                {/* DIVIDER */}

                <div
                  className="h-px mt-4 mb-3"
                  style={{
                    backgroundColor: COLORS.border,
                  }}
                />

                {/* BOTTOM ROW */}

                <div className="flex items-center justify-between gap-3">
                  <div>
                    <p
                      className="text-[10px] sm:text-[11px] font-semibold"
                      style={{
                        color: COLORS.textMuted,
                      }}
                    >
                      Estimated earning
                    </p>

                    <div className="flex items-center gap-1 mt-0.5">
                      <IndianRupee
                        size={14}
                        style={{
                          color: COLORS.success,
                        }}
                      />

                      <p
                        className="text-sm sm:text-base font-black"
                        style={{
                          color: COLORS.success,
                        }}
                      >
                        {slot.earning?.min} –{" "}
                        {slot.earning?.max}
                      </p>
                    </div>
                  </div>

                  
                </div>

                {/* ACTIVE ORANGE LINE */}

                {active && (
                  <div
                    className="absolute left-0 top-4 bottom-4 w-1 rounded-r-full"
                    style={{
                      background: BRAND_GRADIENT,
                    }}
                  />
                )}
              </div>
            );
          })}
        </div>
      </main>

      {/* =====================================================
          BOTTOM CONFIRM BAR
      ===================================================== */}

      {selectedSlots.length > 0 && (
        <div
          className="fixed bottom-0 left-0 right-0 z-50"
          style={{
            backgroundColor: "rgba(255,255,255,0.96)",
            backdropFilter: "blur(14px)",
            borderTop: `1px solid ${COLORS.border}`,
            boxShadow:
              "0 -10px 35px rgba(100,50,15,0.08)",
          }}
        >
          <div className="max-w-2xl mx-auto px-4 sm:px-6 py-3.5">
            {/* SUMMARY */}

            <div className="flex items-center justify-between mb-2.5">
              <div>
                <p
                  className="text-[10px] font-bold"
                  style={{
                    color: COLORS.textMuted,
                  }}
                >
                  Your selection
                </p>

                <p
                  className="text-xs font-black"
                  style={{
                    color: COLORS.text,
                  }}
                >
                  {selectedSlots.length}{" "}
                  {selectedSlots.length === 1
                    ? "Seva Slot"
                    : "Seva Slots"}
                </p>
              </div>

              <div className="text-right">
                <p
                  className="text-[10px] font-bold"
                  style={{
                    color: COLORS.textMuted,
                  }}
                >
                  Estimated earning
                </p>

                <p
                  className="text-xs font-black"
                  style={{
                    color: COLORS.success,
                  }}
                >
                  ₹
                  {selectedSlots.reduce(
                    (total, slot) =>
                      total + (slot.earning?.min || 0),
                    0
                  )}{" "}
                  – ₹
                  {selectedSlots.reduce(
                    (total, slot) =>
                      total + (slot.earning?.max || 0),
                    0
                  )}
                </p>
              </div>
            </div>

            {/* CONFIRM BUTTON */}

            <button
              type="button"
              onClick={handleConfirm}
              disabled={confirmLoading}
              className="w-full h-[50px] rounded-2xl font-extrabold text-xs sm:text-sm text-white flex items-center justify-center gap-2 transition-all active:scale-[0.99] disabled:opacity-60"
              style={{
                background: BRAND_GRADIENT,
                boxShadow:
                  "0 8px 22px rgba(255,98,0,0.24)",
              }}
            >
              {confirmLoading ? (
                <>
                  <div
                    className="w-4 h-4 rounded-full border-2 animate-spin"
                    style={{
                      borderColor:
                        "rgba(255,255,255,0.4)",
                      borderTopColor: "#FFFFFF",
                    }}
                  />

                  <span>Confirming...</span>
                </>
              ) : (
                <>
                  <CheckCircle size={17} />

                  <span>
                    Confirm {selectedSlots.length}{" "}
                    {selectedSlots.length === 1
                      ? "Seva Slot"
                      : "Seva Slots"}
                  </span>
                </>
              )}
            </button>
          </div>
        </div>
      )}
    </div>
  );
}