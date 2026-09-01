// src/pages/TrainingCompletedPage.jsx

import React, { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import Confetti from "react-confetti";
import {
  CheckCircle2,
  Sparkles,
  ArrowRight,
  ShieldCheck,
  Award,
  Bike,
  Clock3,
} from "lucide-react";
import { fetchDpData } from "../Services/dpService";

/* =========================================================
   ZATPATT THEME CONSTANTS
========================================================= */

const BRAND_ORANGE = "#FF6600";
const BRAND_ORANGE_LIGHT = "#FF7A00";
const BRAND_YELLOW = "#FFA800";

const BRAND_GRADIENT =
  "linear-gradient(90deg, #FF6200 0%, #FF7A00 55%, #FFA800 100%)";

const HERO_GRADIENT =
  "linear-gradient(145deg, #FF6600 0%, #FF7A00 48%, #FFA800 100%)";

const PAGE_BG = "#F8F0E6";
const CARD_BG = "#FFFFFF";

const TEXT_DARK = "#17110D";
const TEXT_MUTED = "#765F50";

const BORDER = "#E9DED3";

const SOFT_ORANGE = "#FFF2E8";
const SOFT_ORANGE_2 = "#FFF7F0";

export default function TrainingCompletedPage() {
  const navigate = useNavigate();

  const [showConfetti, setShowConfetti] = useState(true);
  const [partnerName, setPartnerName] = useState("Partner");
  const [windowSize, setWindowSize] = useState({
    width: window.innerWidth,
    height: window.innerHeight,
  });

  /* =========================================================
     LOAD PARTNER DATA & TIMER
  ========================================================= */

  useEffect(() => {
    localStorage.setItem("training_completed", "true");

    const loadProfile = async () => {
      const data = await fetchDpData();
      if (data?.first_name) {
        setPartnerName(`${data.first_name} ${data.last_name || ""}`.trim());
      }
    };
    loadProfile();

    const handleResize = () => {
      setWindowSize({
        width: window.innerWidth,
        height: window.innerHeight,
      });
    };
    window.addEventListener("resize", handleResize);

    const timer = setTimeout(() => setShowConfetti(false), 5000);

    return () => {
      clearTimeout(timer);
      window.removeEventListener("resize", handleResize);
    };
  }, []);

  return (
    <div
      className="min-h-screen w-full flex flex-col justify-between items-center relative overflow-x-hidden p-3.5 sm:p-5 md:p-7 select-none"
      style={{
        backgroundColor: PAGE_BG,
        backgroundImage: `
          radial-gradient(circle at 10% 15%, rgba(255, 230, 205, 0.7) 0%, transparent 40%),
          radial-gradient(circle at 92% 25%, rgba(255, 226, 195, 0.75) 0%, transparent 38%),
          radial-gradient(circle at 85% 85%, rgba(255, 234, 212, 0.55) 0%, transparent 35%)
        `,
      }}
    >
      {/* =====================================================
          CONFETTI CELEBRATION
      ===================================================== */}
      {showConfetti && (
        <Confetti
          width={windowSize.width}
          height={windowSize.height}
          numberOfPieces={220}
          recycle={false}
          gravity={0.18}
          colors={["#FF6600", "#FF7A00", "#FFA800", "#16A34A", "#FFFFFF", "#FFD7B8"]}
        />
      )}

      {/* BACKGROUND FLOATING ICONS */}
      <div className="absolute top-10 left-8 w-11 h-11 rounded-2xl bg-white/90 backdrop-blur-md border border-[#E9DED3] shadow-sm items-center justify-center pointer-events-none hidden sm:flex">
        <Award size={20} color={BRAND_ORANGE} />
      </div>

      <div className="absolute top-14 right-14 w-10 h-10 rounded-2xl bg-white/90 backdrop-blur-md border border-[#E9DED3] shadow-sm items-center justify-center pointer-events-none hidden sm:flex">
        <Sparkles size={18} color={BRAND_YELLOW} />
      </div>

      {/* =====================================================
          MAIN CARD CONTAINER
      ===================================================== */}
      <div className="w-full max-w-[540px] my-auto z-10">
        <div
          className="bg-white rounded-[26px] sm:rounded-[32px] border p-6 sm:p-8 md:p-9 shadow-[0_20px_60px_rgba(80,40,10,0.08)] text-center relative overflow-hidden"
          style={{
            borderColor: BORDER,
          }}
        >
          {/* TOP TAG BADGE */}
          
          {/* CELEBRATION ICON HERO */}
          <div className="relative mx-auto w-24 h-24 sm:w-28 sm:h-28 mb-6">
            <div
              className="w-full h-full rounded-[28px] sm:rounded-[32px] flex items-center justify-center text-white shadow-xl"
              style={{
                background: HERO_GRADIENT,
                boxShadow: "0 14px 32px rgba(255,102,0,0.28)",
              }}
            >
              <Award size={46} className="text-white" />
            </div>

            <div className="absolute -bottom-1 -right-1 w-8 h-8 rounded-full bg-green-500 border-2 border-white flex items-center justify-center shadow-md">
              <CheckCircle2 size={18} className="text-white" />
            </div>
          </div>

          {/* TITLE & GREETING */}
          <h1
            className="text-xl sm:text-2xl md:text-3xl font-black leading-tight tracking-tight mb-2"
            style={{ color: TEXT_DARK }}
          >
            Welcome to Zatpatt, {partnerName}!
          </h1>

          <p
            className="text-xs sm:text-sm leading-relaxed max-w-[420px] mx-auto mb-6"
            style={{ color: TEXT_MUTED }}
          >
            You have successfully completed all modules of delivery partner training. You are now fully certified to start booking shifts and receiving delivery orders.
          </p>

          {/* PERKS SUMMARY BOX */}
          <div className="rounded-2xl p-4 bg-[#FAF7F3] border border-[#E9DED3] text-left space-y-2.5 mb-7">
            <div className="flex items-center gap-2.5 text-xs font-bold text-[#17110D]">
              <div className="w-6 h-6 rounded-lg bg-[#FFF2E8] border border-[#FFD7B8] flex items-center justify-center shrink-0">
                <CheckCircle2 size={13} className="text-[#FF6600]" />
              </div>
              <span>Training modules verified</span>
            </div>

            <div className="flex items-center gap-2.5 text-xs font-bold text-[#17110D]">
              <div className="w-6 h-6 rounded-lg bg-[#FFF2E8] border border-[#FFD7B8] flex items-center justify-center shrink-0">
                <Bike size={13} className="text-[#FF6600]" />
              </div>
              <span>Daily Seva Shift booking is now unlocked</span>
            </div>


          </div>

          {/* CONTINUE BUTTON */}
          <button
            type="button"
            onClick={() => navigate("/seva-shifts", { replace: true })}
            className="w-full min-h-[50px] sm:h-[54px] rounded-2xl font-black text-xs sm:text-sm md:text-base text-white flex items-center justify-center gap-2 transition-all active:scale-[0.99]"
            style={{
              background: BRAND_GRADIENT,
              boxShadow: "0 10px 25px rgba(255,102,0,0.25)",
            }}
          >
            <span>Continue to Seva Shifts</span>
            <ArrowRight size={18} />
          </button>
        </div>
      </div>

      {/* =====================================================
          FOOTER BADGE
      ===================================================== */}
      <div className="relative z-10 shrink-0 mt-4">
        <div className="bg-[#FFEADA]/70 backdrop-blur-md px-8 py-2 rounded-full border border-[#FED7AA]/60 flex items-center gap-2 text-[10px] sm:text-xs font-medium text-[#7C6657]">
          <span>© {new Date().getFullYear()} Zatpatt</span>
          <span>•</span>
          <span>Delivery Partner Portal</span>
        </div>
      </div>
    </div>
  );
}
