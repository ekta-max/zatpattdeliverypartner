//src\pages\InfoPage.jsx

import React, { useState, useContext, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { motion } from "framer-motion";
import { Wallet, Clock, TrendingUp } from "lucide-react";
import { LanguageContext } from "../context/LanguageContext";

/* slides */
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
  { icon: Wallet, label: "Weekly Payouts" },
  { icon: Clock, label: "Flexible Hours" },
  { icon: TrendingUp, label: "Earn ₹60k+/mo" },
];

export default function InfoPage() {
  const navigate = useNavigate();
  const { lang } = useContext(LanguageContext);

  const [index, setIndex] = useState(0);

  useEffect(() => {
    const t = setInterval(
      () => setIndex((i) => (i + 1) % SLIDES.length),
      3500
    );
    return () => clearInterval(t);
  }, []);

  const slide = SLIDES[index];

  return (
    <div className="h-screen overflow-hidden bg-white flex flex-col">
      {/* HERO */}
      <div className="relative flex-1 min-h-0 w-full">
        <img
          src={slide.image}
          className="absolute inset-0 w-full h-full object-cover object-center"
          alt=""
        />
        <div className="absolute inset-0 bg-gradient-to-b from-black/20 via-black/35 to-black/70" />

        <div className="absolute top-8 left-5 right-5 text-white">
          <h1 className="text-[20px] font-bold leading-tight">{slide.title}</h1>
          <p className="text-[12px] whitespace-pre-line opacity-90 mt-1">
            {slide.subtitle}
          </p>
        </div>

        <div className="absolute bottom-4 left-0 right-0 flex justify-center gap-1">
          {SLIDES.map((_, i) => (
            <span
              key={i}
              className={`h-[3px] w-6 rounded-full ${
                i === index ? "bg-white" : "bg-white/40"
              }`}
            />
          ))}
        </div>
      </div>

      {/* BOTTOM CARD — highlights + single CTA, no fake login form */}
      <div className="shrink-0 -mt-4 bg-white rounded-t-3xl px-5 pt-6 pb-6 shadow-[0_-10px_30px_rgba(0,0,0,0.15)]">
        <h2 className="text-[16px] font-semibold text-orange-500 text-center leading-snug">
          🚀 <span className="font-bold">Deliver orders easily</span> with
          your <br />
          <span className="font-bold">ZATPATT</span>
        </h2>

        {/* Quick highlights row */}
        <div className="mt-5 grid grid-cols-3 gap-2">
          {HIGHLIGHTS.map(({ icon: Icon, label }) => (
            <div
              key={label}
              className="flex flex-col items-center text-center gap-1.5 py-3 rounded-xl bg-orange-50"
            >
              <Icon size={20} className="text-orange-500" />
              <span className="text-[11px] font-medium text-gray-700 leading-tight">
                {label}
              </span>
            </div>
          ))}
        </div>

        <button
          onClick={() => navigate("/login")}
          className="mt-5 w-full bg-orange-500 active:bg-orange-600 text-white py-3 rounded-xl font-semibold"
        >
          Get Started
        </button>

        <p className="mt-3 text-[11px] text-gray-400 text-center">
          By continuing you agree to our Terms & Privacy Policy
        </p>
      </div>
    </div>
  );
}