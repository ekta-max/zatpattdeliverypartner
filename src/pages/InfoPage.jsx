// src/pages/InfoPage.jsx

import React, { useState, useContext, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { Wallet, Clock, TrendingUp, ArrowRight } from "lucide-react";
import { LanguageContext } from "../context/LanguageContext";

/* Slides */
import Slide1 from "../assets/onboarding/slide1.png";
import Slide2 from "../assets/onboarding/slide2.png";
import Slide3 from "../assets/onboarding/slide3.png";

const SLIDES = [
  {
    image: Slide1,
    title: "Earn up to ₹60,000 per month",
    subtitle: "Join 5 Lakh+ Happy\nDelivery Partners!",
  },
  {
    image: Slide2,
    title: "Flexible Timings.",
    subtitle: "Work in Areas you want",
  },
  {
    image: Slide3,
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
  },
  {
    icon: TrendingUp,
    label: "Earn ₹60k+/mo",
  },
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
    }, 3500);

    return () => clearInterval(timer);
  }, []);

  const slide = SLIDES[index];

  return (
    <div
      className="
        h-[100dvh]
        w-full
        overflow-hidden
        flex
        flex-col
        bg-[#fffaf5]
      "
    >
      {/* ==========================================
          HERO
      ========================================== */}

      <div className="relative flex-1 min-h-0 w-full overflow-hidden">
        {/* SLIDE IMAGE */}

        <img
          src={slide.image}
          className="
            absolute
            inset-0
            w-full
            h-full
            object-cover
            object-center
          "
          alt=""
        />

        {/* MERCHANT THEME OVERLAY */}

        <div
          className="
            absolute
            inset-0
            bg-gradient-to-b
            from-[#ff6b00]/10
            via-black/30
            to-black/75
          "
        />

        {/* SUBTLE ORANGE GLOW */}

        <div
          className="
            absolute
            top-[-100px]
            right-[-100px]
            w-[260px]
            h-[260px]
            rounded-full
            bg-[#ff7a00]/20
            blur-3xl
            pointer-events-none
          "
        />

        {/* HERO CONTENT */}

        <div
          className="
            absolute
            top-7
            sm:top-9
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
              bg-white/15
              border
              border-white/20
              backdrop-blur-md
              mb-4
            "
          >
            <span
              className="
                w-2
                h-2
                rounded-full
                bg-white
                shadow-[0_0_0_4px_rgba(255,255,255,0.12)]
              "
            />

            <span
              className="
                text-[9px]
                sm:text-[10px]
                font-extrabold
                tracking-[1.5px]
              "
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
            "
          >
            {slide.title}
          </h1>

          {/* SUBTITLE */}

          <p
            className="
              text-[12px]
              sm:text-[13px]
              md:text-sm
              whitespace-pre-line
              opacity-90
              mt-2
              leading-relaxed
              max-w-[300px]
            "
          >
            {slide.subtitle}
          </p>
        </div>

        {/* SLIDE INDICATORS */}

        <div
          className="
            absolute
            bottom-5
            left-0
            right-0
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
              className={`
                h-[4px]
                rounded-full
                transition-all
                duration-300
                ${
                  i === index
                    ? "w-8 bg-white"
                    : "w-5 bg-white/40"
                }
              `}
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
          bg-white
          rounded-t-[28px]
          px-5
          sm:px-6
          md:px-8
          pt-6
          sm:pt-7
          pb-[max(18px,env(safe-area-inset-bottom))]
          shadow-[0_-12px_40px_rgba(80,48,20,0.12)]
        "
      >
        <div className="w-full max-w-xl mx-auto">
          {/* HEADING */}

          <h2
            className="
              text-[16px]
              sm:text-lg
              md:text-xl
              font-semibold
              text-[#ff6b00]
              text-center
              leading-snug
            "
          >
            <span className="mr-1">🚀</span>

            <span className="font-extrabold">
              Deliver orders easily
            </span>

            <span> with your </span>

            <span className="font-extrabold">
              ZATPATT
            </span>
          </h2>

          {/* ==========================================
              QUICK HIGHLIGHTS
          ========================================== */}

          <div
            className="
              mt-5
              grid
              grid-cols-3
              gap-2
              sm:gap-3
            "
          >
            {HIGHLIGHTS.map(
              ({ icon: Icon, label }) => (
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
                    bg-[#fff3e8]
                    border
                    border-[#ffe0c7]
                    transition-all
                    duration-200
                  "
                >
                  {/* ICON */}

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
                      bg-gradient-to-br
                      from-[#ff6b00]
                      to-[#ff8a00]
                      shadow-[0_6px_14px_rgba(255,107,0,0.18)]
                    "
                  >
                    <Icon
                      size={18}
                      className="text-white"
                      strokeWidth={2.2}
                    />
                  </div>

                  {/* LABEL */}

                  <span
                    className="
                      text-[10px]
                      sm:text-[11px]
                      md:text-xs
                      font-semibold
                      text-[#344054]
                      leading-tight
                    "
                  >
                    {label}
                  </span>
                </div>
              )
            )}
          </div>

          {/* ==========================================
              GET STARTED BUTTON
          ========================================== */}

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
              bg-gradient-to-r
              from-[#ff6b00]
              via-[#ff7a00]
              to-[#ff8a00]
              text-white
              text-sm
              sm:text-base
              font-extrabold
              shadow-[0_10px_22px_rgba(255,107,0,0.22)]
              hover:shadow-[0_14px_28px_rgba(255,107,0,0.28)]
              hover:-translate-y-[1px]
              active:translate-y-0
              active:shadow-[0_7px_16px_rgba(255,107,0,0.2)]
              transition-all
              duration-200
              focus:outline-none
              focus:ring-2
              focus:ring-[#ff7a00]/30
              focus:ring-offset-2
            "
          >
            <span>Get Started</span>

            <ArrowRight
              size={18}
              className="
                transition-transform
                duration-200
                group-hover:translate-x-1
              "
            />
          </button>

          {/* ==========================================
              TERMS
          ========================================== */}

          <p
            className="
              mt-3
              text-[10px]
              sm:text-[11px]
              text-[#98a2b3]
              text-center
              leading-relaxed
            "
          >
            By continuing you agree to our{" "}
            <span className="text-[#ff6b00] font-medium">
              Terms
            </span>{" "}
            &{" "}
            <span className="text-[#ff6b00] font-medium">
              Privacy Policy
            </span>
          </p>
        </div>
      </div>
    </div>
  );
}