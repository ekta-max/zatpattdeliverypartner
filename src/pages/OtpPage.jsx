//src\pages\OtpPage.jsx

import React, { useState, useRef, useEffect } from "react";
import { useNavigate, useLocation } from "react-router-dom";
import { motion } from "framer-motion";

export default function OtpPage() {
  const navigate = useNavigate();
  const location = useLocation();

  const phone =
    location.state?.phone || localStorage.getItem("mock_phone");

  const CORRECT_OTP = localStorage.getItem("mock_otp") || "123456";

  const [otp, setOtp] = useState(["", "", "", "", "", ""]);
  const [error, setError] = useState("");
  const [shake, setShake] = useState(false);
  const [resendTimer, setResendTimer] = useState(30);

  const inputsRef = useRef([]);

  /* ---------------- RESEND TIMER ---------------- */
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
 const handleVerifyOtp = () => {
  const entered = otp.join("");

  if (entered !== CORRECT_OTP) {
    setError("Invalid OTP. Please try again.");
    setShake(true);
    setOtp(["", "", "", "", "", ""]);

    setTimeout(() => {
      inputsRef.current[0]?.focus();
      setShake(false);
    }, 400);

    return;
  }

  // ✅ AUTH SUCCESS
  localStorage.setItem("delivery_auth", "true");

  // 🔽 MOCK USER STATE (later comes from backend)
  const onboarded =
    localStorage.getItem("partner_onboarded") === "true";

  const verificationStatus =
    localStorage.getItem("verification_status"); // pending | approved

  const trainingCompleted =
    localStorage.getItem("training_completed") === "true";

  /* ===== ROUTING LOGIC ===== */

  if (!onboarded) {
    navigate("/onboarding-steps");
    return;
  }

  if (verificationStatus === "pending") {
    navigate("/verification-pending");
    return;
  }

  if (!trainingCompleted) {
    navigate("/training-intro");
    return;
  }

  // ✅ FULLY ACTIVE PARTNER
  navigate("/dashboard");
};

  /* ---------------- RESEND OTP ---------------- */
  const resendOtp = () => {
    setResendTimer(30);
    setOtp(["", "", "", "", "", ""]);
    inputsRef.current[0]?.focus();
    alert("Mock OTP resent: 123456");
  };

  /* ---------------- CHANGE MOBILE ---------------- */
  const changeMobile = () => {
    localStorage.removeItem("mock_phone");
    localStorage.removeItem("mock_otp");
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

          {/* OTP INPUTS */}
          <motion.div
            animate={shake ? { x: [-6, 6, -4, 4, 0] } : {}}
            transition={{ duration: 0.3 }}
            className="flex justify-center gap-3 mb-2"
          >
            {otp.map((d, i) => (
              <input
                key={i}
                ref={(el) => (inputsRef.current[i] = el)}
                value={d}
                onChange={(e) => handleChange(e.target.value, i)}
                onKeyDown={(e) => handleKeyDown(e, i)}
                onPaste={handlePaste}
                maxLength={1}
                className="
                  w-12 h-12
                  border border-orange-400
                  rounded-lg
                  text-center
                  text-lg
                  font-semibold
                  outline-none
                  focus:ring-2 focus:ring-orange-500
                "
              />
            ))}
          </motion.div>

          {/* ERROR MESSAGE */}
          {error && (
            <p className="text-red-500 text-sm mb-4">{error}</p>
          )}

          {/* VERIFY BUTTON */}
          <button
            onClick={handleVerifyOtp}
            className="w-full bg-orange-500 text-white py-3 rounded-xl font-semibold"
          >
            Verify OTP
          </button>

          {/* RESEND */}
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

          {/* CHANGE MOBILE */}
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
