// src/pages/InfoPage.jsx

import React, { useState, useContext, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { Wallet, Clock, TrendingUp, ArrowRight } from "lucide-react";
import { LanguageContext } from "../context/LanguageContext";

/* 3D Animated Slides */
import Slide1 from "../assets/onboarding/slide1.png";
import Slide2 from "../assets/onboarding/slide2.png";
import Slide3 from "../assets/onboarding/slide3.png";

/* =========================================================
   THEME — ORANGE & PEACH PREMIUM DASHBOARD
========================================================= */

const PRIMARY_ORANGE = "#EA580C";
const PRIMARY_ORANGE_LIGHT = "#FB923C";
const GOLD_ACCENT = "#F5B841";

const PEACH_SOFT = "#FFF3E8";
const PEACH_DEEP = "#FFE0C7";
const CREAM_BG = "#FFFAF5";

const TEXT_PRIMARY = "#2E1A0F";
const TEXT_SECONDARY = "#8A6F5E";
const TEXT_MUTED = "#B79C89";

const CARD_BORDER = "#FFE0C7";

const SLIDES = [
  {
    image: Slide1,
    title: "Flexible Timings.",
    subtitle: "Work in Areas you want",
  },
  {
    image: Slide2,
    title: "Weekly Payouts",
    subtitle: "Direct bank transfer",
  },
];

const HIGHLIGHTS = [
  {
    icon: Wallet,
    label: "Weekly Payouts",
  },
  {
    icon: Clock,
    label: "Flexible Hours",
  }
];

export default function InfoPage() {
  const navigate = useNavigate();
  const { lang } = useContext(LanguageContext);

  const [index, setIndex] = useState(0);

  /* ==========================================
     AUTO SLIDE
  ========================================== */

  useEffect(() => {
    const timer = setInterval(() => {
      setIndex((current) => (current + 1) % SLIDES.length);
    }, 3800);

    return () => clearInterval(timer);
  }, []);

  return (
    <div
      className="
        h-[100dvh]
        w-full
        overflow-hidden
        flex
        flex-col
      "
      style={{
        background: CREAM_BG,
      }}
    >
      {/* ==========================================
          HERO & 3D CHARACTER SLIDER
      ========================================== */}

      <div className="relative flex-1 min-h-0 w-full overflow-hidden bg-amber-50">
        {/* CROSS-FADE SLIDES */}
        {SLIDES.map((slide, i) => (
          <img
            key={i}
            src={slide.image}
            alt={slide.title}
            className={`
              absolute
              inset-0
              w-full
              h-full
              object-cover
              object-center
              transition-all
              duration-700
              ease-in-out
              ${i === index ? "opacity-100 scale-100" : "opacity-0 scale-105"}
            `}
          />
        ))}

        {/* WARM TOP & BOTTOM GRADIENT OVERLAY */}
        <div
          className="
            absolute
            inset-0
            pointer-events-none
          "
          style={{
            background: `linear-gradient(
              180deg,
              rgba(35, 18, 10, 0.70) 0%,
              rgba(35, 18, 10, 0.15) 35%,
              rgba(234, 88, 12, 0.05) 60%,
              rgba(46, 26, 15, 0.65) 100%
            )`,
          }}
        />

        {/* HERO CONTENT */}
        <div
          className="
            relative
            z-10
            top-6
            sm:top-8
            left-5
            right-5
            sm:left-7
            sm:right-7
            text-white
          "
        >
          {/* BRAND BADGE */}
          <div
            className="
              inline-flex
              items-center
              gap-2
              px-3
              py-1.5
              rounded-full
              backdrop-blur-md
              mb-3
            "
            style={{
              background: "rgba(255,255,255,0.2)",
              border: "1px solid rgba(245,184,65,0.4)",
            }}
          >
            <span
              className="w-2 h-2 rounded-full"
              style={{
                background: GOLD_ACCENT,
                boxShadow: "0 0 0 4px rgba(245,184,65,0.25)",
              }}
            />
            <span
              className="text-[9px] sm:text-[10px] font-extrabold tracking-[1.5px]"
              style={{ color: GOLD_ACCENT }}
            >
              ZATPATT
            </span>
          </div>

          {/* TITLE */}
          <h1
            className="
              text-[22px]
              sm:text-[26px]
              md:text-[30px]
              font-extrabold
              leading-tight
              tracking-tight
              max-w-[340px]
              drop-shadow-md
            "
          >
            {SLIDES[index].title}
          </h1>

          {/* SUBTITLE */}
          <p
            className="
              text-[12px]
              sm:text-[13px]
              md:text-sm
              whitespace-pre-line
              opacity-95
              mt-1.5
              leading-relaxed
              max-w-[300px]
              drop-shadow-md
            "
          >
            {SLIDES[index].subtitle}
          </p>
        </div>

        {/* SLIDE INDICATORS */}
        <div
          className="
            absolute
            bottom-6
            left-0
            right-0
            z-10
            flex
            justify-center
            items-center
            gap-1.5
          "
        >
          {SLIDES.map((_, i) => (
            <button
              key={i}
              type="button"
              onClick={() => setIndex(i)}
              aria-label={`Go to slide ${i + 1}`}
              className="h-[4px] rounded-full transition-all duration-300"
              style={{
                width: i === index ? "32px" : "18px",
                background:
                  i === index
                    ? GOLD_ACCENT
                    : "rgba(255,255,255,0.5)",
              }}
            />
          ))}
        </div>
      </div>

      {/* ==========================================
          BOTTOM CARD
      ========================================== */}

      <div
        className="
          relative
          z-10
          shrink-0
          -mt-5
          rounded-t-[28px]
          px-5
          sm:px-6
          md:px-8
          pt-6
          sm:pt-7
          pb-[max(18px,env(safe-area-inset-bottom))]
        "
        style={{
          background: "#ffffff",
          boxShadow: "0 -12px 40px rgba(234,88,12,0.14)",
        }}
      >
        <div className="w-full max-w-xl mx-auto">
          {/* HEADING */}
          <h2
            className="
              text-[16px]
              sm:text-lg
              md:text-xl
              font-semibold
              text-center
              leading-snug
            "
            style={{ color: PRIMARY_ORANGE }}
          >
            <span className="mr-1">🚀</span>
            <span className="font-extrabold" style={{ color: TEXT_PRIMARY }}>
              Deliver orders easily
            </span>
            <span style={{ color: TEXT_SECONDARY }}> with </span>
            <span className="font-extrabold">ZATPATT</span>
          </h2>

          {/* QUICK HIGHLIGHTS */}
          <div className="mt-5 grid grid-cols-3 gap-2 sm:gap-3">
            {HIGHLIGHTS.map(({ icon: Icon, label }) => (
              <div
                key={label}
                className="
                  flex
                  flex-col
                  items-center
                  justify-center
                  text-center
                  gap-2
                  py-3
                  sm:py-4
                  px-1
                  rounded-xl
                  sm:rounded-2xl
                  border
                  transition-all
                  duration-200
                "
                style={{
                  background: PEACH_SOFT,
                  borderColor: CARD_BORDER,
                }}
              >
                <div
                  className="
                    w-9
                    h-9
                    sm:w-10
                    sm:h-10
                    rounded-xl
                    flex
                    items-center
                    justify-center
                  "
                  style={{
                    background: `linear-gradient(135deg, ${PRIMARY_ORANGE} 0%, ${PRIMARY_ORANGE_LIGHT} 60%, ${GOLD_ACCENT} 100%)`,
                    boxShadow: "0 6px 14px rgba(234,88,12,0.22)",
                  }}
                >
                  <Icon size={18} className="text-white" strokeWidth={2.2} />
                </div>

                <span
                  className="
                    text-[10px]
                    sm:text-[11px]
                    md:text-xs
                    font-semibold
                    leading-tight
                  "
                  style={{ color: TEXT_PRIMARY }}
                >
                  {label}
                </span>
              </div>
            ))}
          </div>

          {/* GET STARTED BUTTON */}
          <button
            type="button"
            onClick={() => navigate("/login")}
            className="
              group
              mt-5
              w-full
              min-h-[50px]
              sm:min-h-[54px]
              flex
              items-center
              justify-center
              gap-2
              px-5
              py-3
              rounded-xl
              sm:rounded-2xl
              text-white
              text-sm
              sm:text-base
              font-extrabold
              transition-all
              duration-200
              hover:-translate-y-[1px]
              active:translate-y-0
              focus:outline-none
              focus:ring-2
              focus:ring-offset-2
            "
            style={{
              background: `linear-gradient(90deg, ${PRIMARY_ORANGE} 0%, ${PRIMARY_ORANGE_LIGHT} 55%, ${GOLD_ACCENT} 100%)`,
              boxShadow: "0 10px 22px rgba(234,88,12,0.28)",
            }}
          >
            <span>Get Started</span>
            <ArrowRight
              size={18}
              className="transition-transform duration-200 group-hover:translate-x-1"
            />
          </button>

          {/* TERMS */}
          <p
            className="mt-3 text-[10px] sm:text-[11px] text-center leading-relaxed"
            style={{ color: TEXT_MUTED }}
          >
            By continuing you agree to our{" "}
            <span className="font-medium" style={{ color: PRIMARY_ORANGE }}>
              Terms
            </span>{" "}
            &{" "}
            <span className="font-medium" style={{ color: PRIMARY_ORANGE }}>
              Privacy Policy
            </span>
          </p>
        </div>
      </div>
    </div>
  );
}
