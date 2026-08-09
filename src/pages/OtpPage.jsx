// src/pages/OtpPage.jsx

import React, { useState, useRef, useEffect } from "react";
import { useNavigate, useLocation } from "react-router-dom";
import { motion } from "framer-motion";
import { verifyOtp } from "../Services/otp";
import { getPageRedirection } from "../Services/redirection";

// Maps backend "page" value -> app route
const PAGE_ROUTE_MAP = {
  "verification-pending": "/verification-pending",
  "onboarding": "/onboarding-steps",
  "select-slot": "/seva-shifts", // matches <Route path="/seva-shifts" element={<SevaShiftSelectionPage />} />
};

const DEFAULT_ROUTE = "/onboarding-steps";

export default function OtpPage() {
  const navigate = useNavigate();
  const location = useLocation();

  const phone =
    location.state?.phone ||
    localStorage.getItem("login_mobile");

  const [otp, setOtp] = useState(["", "", "", "", "", ""]);
  const [error, setError] = useState("");
  const [shake, setShake] = useState(false);
  const [loading, setLoading] = useState(false);
  const [resendTimer, setResendTimer] = useState(30);

  const inputsRef = useRef([]);

  /* ---------------- TIMER ---------------- */
  useEffect(() => {
    if (resendTimer <= 0) return;
    const t = setInterval(() => setResendTimer((s) => s - 1), 1000);
    return () => clearInterval(t);
  }, [resendTimer]);

  /* ---------------- OTP INPUT ---------------- */
  const handleChange = (value, index) => {
    if (!/^\d?$/.test(value)) return;

    setError("");

    const next = [...otp];
    next[index] = value;
    setOtp(next);

    if (value && index < 5) {
      inputsRef.current[index + 1]?.focus();
    }
  };

  const handleKeyDown = (e, index) => {
    if (e.key === "Backspace" && !otp[index] && index > 0) {
      inputsRef.current[index - 1]?.focus();
    }
  };

  const handlePaste = (e) => {
    const data = e.clipboardData.getData("text").replace(/\D/g, "").slice(0, 6);
    if (data.length === 6) {
      setOtp(data.split(""));
      inputsRef.current[5]?.focus();
    }
  };

  /* ---------------- VERIFY OTP ---------------- */
  const handleVerifyOtp = async () => {
    const entered = otp.join("");

    if (entered.length !== 6) {
      setError("Enter 6 digit OTP");
      return;
    }

    try {
      setLoading(true);

      const res = await verifyOtp({ mobile: phone, otp: entered });

      console.log("OTP Verify ✅", res);

      // Store tokens — keys match what api.js's request interceptor reads
      localStorage.setItem("access_token", res.access);
      localStorage.setItem("refresh_token", res.refresh);
      localStorage.setItem("user", JSON.stringify(res.user));
      localStorage.setItem("delivery_auth", "true");
      localStorage.removeItem("login_mobile");

      // Ask backend where this user should land
      try {
        const redirectRes = await getPageRedirection();
        console.log("Page redirection ✅", redirectRes);

        const page = redirectRes?.data?.page;
        const targetRoute = PAGE_ROUTE_MAP[page] || DEFAULT_ROUTE;

        navigate(targetRoute, { replace: true });
      } catch (redirectErr) {
        console.error("Page redirection error ❌", redirectErr);
        // Token is valid, OTP succeeded — don't strand the user on /otp.
        // Fall back to a safe default rather than showing "Invalid OTP".
        navigate(DEFAULT_ROUTE, { replace: true });
      }
    } catch (err) {
      console.error("OTP error ❌", err);

      setError("Invalid OTP");
      setShake(true);
      setOtp(["", "", "", "", "", ""]);

      setTimeout(() => {
        inputsRef.current[0]?.focus();
        setShake(false);
      }, 400);
    } finally {
      setLoading(false);
    }
  };

  /* ---------------- RESEND ---------------- */
  const resendOtp = () => {
    setResendTimer(30);
    setOtp(["", "", "", "", "", ""]);
    inputsRef.current[0]?.focus();
    alert("OTP resent successfully");
  };

  /* ---------------- CHANGE NUMBER ---------------- */
  const changeMobile = () => {
    localStorage.removeItem("login_mobile");
    navigate("/login");
  };

  if (!phone) {
    return (
      <div className="min-h-screen flex items-center justify-center text-red-500">
        Invalid Access
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#fff6ed] flex justify-center items-center px-6">
      <div className="w-full max-w-sm p-[2px] rounded-xl bg-gradient-to-r from-orange-500 to-yellow-400">
        <motion.div className="bg-white rounded-xl p-8 text-center">
          <h2 className="text-xl font-bold text-orange-500 mb-2">
            OTP Verification
          </h2>

          <p className="text-gray-600 text-sm">OTP sent to</p>
          <p className="font-semibold mb-6">+91 {phone}</p>

          <motion.div
            animate={shake ? { x: [-6, 6, -4, 4, 0] } : {}}
            transition={{ duration: 0.3 }}
            className="flex justify-center gap-3 mb-2"
          >
            {otp.map((digit, i) => (
              <input
                key={i}
                ref={(el) => (inputsRef.current[i] = el)}
                value={digit}
                onChange={(e) => handleChange(e.target.value, i)}
                onKeyDown={(e) => handleKeyDown(e, i)}
                onPaste={handlePaste}
                maxLength={1}
                className="w-12 h-12 border border-orange-400 rounded-lg text-center text-lg font-semibold outline-none focus:ring-2 focus:ring-orange-500"
              />
            ))}
          </motion.div>

          {error && <p className="text-red-500 text-sm mb-4">{error}</p>}

          <button
            onClick={handleVerifyOtp}
            disabled={loading}
            className="w-full bg-orange-500 text-white py-3 rounded-xl font-semibold"
          >
            {loading ? "Verifying..." : "Verify OTP"}
          </button>

          <div className="mt-4 text-sm text-gray-600">
            {resendTimer > 0 ? (
              <span>Resend OTP in {resendTimer}s</span>
            ) : (
              <button
                onClick={resendOtp}
                className="text-orange-500 underline font-semibold"
              >
                Resend OTP
              </button>
            )}
          </div>

          <button
            onClick={changeMobile}
            className="mt-3 text-sm text-orange-500 underline font-semibold"
          >
            Change mobile number
          </button>
        </motion.div>
      </div>
    </div>
  );
}