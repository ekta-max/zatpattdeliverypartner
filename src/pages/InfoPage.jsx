//src\pages\InfoPage.jsx

import React, { useState, useContext, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { motion } from "framer-motion";
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

export default function InfoPage() {
  const navigate = useNavigate();
  const { lang } = useContext(LanguageContext);

  const [index, setIndex] = useState(0);
  const [mobile, setMobile] = useState("");
  const [error, setError] = useState("");

  /* slideshow */
  useEffect(() => {
    const t = setInterval(
      () => setIndex((i) => (i + 1) % SLIDES.length),
      3500
    );
    return () => clearInterval(t);
  }, []);

  /* validation */
  useEffect(() => {
    if (!mobile) setError("");
    else if (!/^[6-9]\d{9}$/.test(mobile))
      setError("Enter a valid 10 digit mobile number");
    else setError("");
  }, [mobile]);

  const isValid = /^[6-9]\d{9}$/.test(mobile);

  const handleLogin = () => {
    if (!isValid) return;

    // 🔥 MOCK OTP FLOW
    localStorage.setItem("mock_otp", "123456");
    localStorage.setItem("mock_phone", mobile);

    navigate("/otp", { state: { phone: mobile } });
  };

  const slide = SLIDES[index];

  return (
    <div className="min-h-screen bg-white flex flex-col overflow-hidden">
      {/* HERO */}
      <div className="relative w-full h-[74vh] min-h-[500px] max-h-[650px]">
        <img
          src={slide.image}
          className="absolute inset-0 w-full h-full object-cover"
          alt=""
        />
        <div className="absolute inset-0 bg-gradient-to-b from-black/20 via-black/35 to-black/70" />

        <div className="absolute top-12 left-5 right-5 text-white">
          <h1 className="text-[22px] font-bold">{slide.title}</h1>
          <p className="text-[13px] whitespace-pre-line opacity-90">
            {slide.subtitle}
          </p>
        </div>

        <div className="absolute bottom-6 left-0 right-0 flex justify-center gap-1">
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

      {/* LOGIN */}
      <div className="-mt-4 bg-white rounded-t-3xl px-5 pt-8 pb-6 shadow-[0_-10px_30px_rgba(0,0,0,0.15)]">
        <h2 className="text-[18px] font-semibold text-orange-500 text-center">
  🚀 <span className="font-bold">Deliver orders easily </span> with your{" "}<br></br>
  <span className="font-bold">ZATPATT</span>
</h2>

        {/* MOBILE INPUT WITH +91 + DIVIDER */}
        <div className="mt-5">
          <div
            className={`
              flex items-center
              w-full
              border
              rounded-xl
              px-3
              transition
              ${
                mobile
                  ? "border-orange-400"
                  : "border-gray-300"
              }
              focus-within:ring-2 focus-within:ring-orange-500
            `}
          >
            {/* +91 */}
            <span className="text-orange-500 font-semibold text-sm select-none">
              +91
            </span>

            {/* Divider */}
            <div className="mx-3 h-6 w-px bg-gray-300" />

            {/* Input */}
            <input
  type="tel"
  inputMode="numeric"
  pattern="[0-9]*"
  placeholder="Enter 10 digit mobile number"
  value={mobile}
  onFocus={() => navigate("/login")}   // 🔥 ADD THIS
  onChange={(e) => {
    const onlyNumbers = e.target.value.replace(/\D/g, "");
    setMobile(onlyNumbers);
  }}
  maxLength={10}
  className="
    flex-1
    py-3
    text-[14px]
    outline-none
    bg-transparent
    text-gray-700
  "
/>   
        </div>
         
        </div>

        {/* Continue BUTTON */}
        <button
          onClick={() => navigate("/login")}
          className="mt-3 w-full max-w-md bg-orange-500 active:bg-orange-600 text-white py-3 rounded-xl font-semibold"
        >
          Let's Start
        </button>
      
      </div>
     </div>
  );
}
