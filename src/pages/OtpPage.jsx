import React, { useState, useRef, useEffect } from "react";
import { useNavigate, useLocation } from "react-router-dom";
import { motion } from "framer-motion";
import {
  ArrowRight,
  ShieldCheck,
  KeyRound,
  Check,
  Store,
  Sparkles,
  RotateCcw,
  Lock,
} from "lucide-react";

import { requestOtp } from "../Services/auth";
import { verifyOtp } from "../Services/otp";
import { getPageRedirection } from "../Services/redirection";

const PAGE_ROUTE_MAP = {
  "verification-pending": "/verification-pending",
  onboarding: "/onboarding-steps",
  "select-slot": "/seva-shifts",
};

const DEFAULT_ROUTE = "/onboarding-steps";

export default function OtpPage() {
  const navigate = useNavigate();
  const location = useLocation();

  const phone =
    location.state?.phone ||
    location.state?.mobile ||
    localStorage.getItem("login_mobile");

  const [otp, setOtp] = useState(["", "", "", "", "", ""]);
  const [error, setError] = useState("");
  const [shake, setShake] = useState(false);
  const [loading, setLoading] = useState(false);
  const [resendLoading, setResendLoading] = useState(false);
  const [resendTimer, setResendTimer] = useState(30);

  const inputsRef = useRef([]);

  /* Resend timer */
  useEffect(() => {
    if (resendTimer <= 0) return;
    const timer = setInterval(() => {
      setResendTimer((sec) => sec - 1);
    }, 1000);
    return () => clearInterval(timer);
  }, [resendTimer]);

  /* Digit input */
  const handleChange = (value, index) => {
    if (!/^\d?$/.test(value)) return;
    setError("");
    const nextOtp = [...otp];
    nextOtp[index] = value;
    setOtp(nextOtp);

    if (value && index < 5) {
      inputsRef.current[index + 1]?.focus();
    }
  };

  /* Backspace */
  const handleKeyDown = (e, index) => {
    if (e.key === "Backspace" && !otp[index] && index > 0) {
      inputsRef.current[index - 1]?.focus();
    }
  };

  /* Paste OTP */
  const handlePaste = (e) => {
    e.preventDefault();
    const data = e.clipboardData
      .getData("text")
      .replace(/\D/g, "")
      .slice(0, 6);

    if (data.length === 6) {
      setOtp(data.split(""));
      setError("");
      inputsRef.current[5]?.focus();
    }
  };

  /* Verify OTP */
  const handleVerifyOtp = async () => {
    const enteredOtp = otp.join("");
    if (enteredOtp.length !== 6) {
      setError("Enter 6 digit OTP");
      return;
    }
    if (!phone) {
      setError("Mobile number not found.");
      return;
    }
    if (loading) return;

    try {
      setLoading(true);
      setError("");

      const res = await verifyOtp({
        mobile: phone,
        otp: enteredOtp,
      });

      const responseData = res?.data || res;

      if (responseData?.access) {
        localStorage.setItem("access_token", responseData.access);
      }
      if (responseData?.refresh) {
        localStorage.setItem("refresh_token", responseData.refresh);
      }
      if (responseData?.user) {
        localStorage.setItem("user", JSON.stringify(responseData.user));
      }

      localStorage.setItem("delivery_auth", "true");
      localStorage.removeItem("login_mobile");

      try {
        const redirectRes = await getPageRedirection();
        const redirectData = redirectRes?.data || redirectRes;
        const page = redirectData?.page;
        const targetRoute = PAGE_ROUTE_MAP[page] || DEFAULT_ROUTE;
        navigate(targetRoute, { replace: true });
      } catch (redirectErr) {
        console.error("Page redirection API error:", redirectErr);
        navigate(DEFAULT_ROUTE, { replace: true });
      }
    } catch (err) {
      console.error("OTP verification error:", err);
      setError(
        err?.response?.data?.message ||
          err?.response?.data?.detail ||
          "Invalid OTP"
      );
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

  /* Resend OTP */
  const resendOtp = async () => {
    if (!phone) {
      setError("Mobile number not found.");
      return;
    }
    if (resendTimer > 0 || resendLoading) return;

    try {
      setResendLoading(true);
      setError("");
      await requestOtp(phone);
      setOtp(["", "", "", "", "", ""]);
      setResendTimer(30);
      setTimeout(() => {
        inputsRef.current[0]?.focus();
      }, 100);
    } catch (err) {
      console.error("Resend OTP error:", err);
      setError(
        err?.response?.data?.message ||
          err?.response?.data?.detail ||
          "Failed to resend OTP. Please try again."
      );
    } finally {
      setResendLoading(false);
    }
  };

  const isOtpComplete = otp.join("").length === 6;

  if (!phone) {
    return (
      <div
        className="h-[100dvh] w-full flex items-center justify-center p-4"
        style={{ backgroundColor: "#FAF6F0" }}
      >
        <div className="bg-white p-7 sm:p-8 rounded-[28px] text-center w-full max-w-[380px] border border-[#F3E7DC] shadow-xl">
          <p className="font-extrabold text-xl text-[#2E1A0F]">
            Invalid Access
          </p>
          <p className="text-xs sm:text-sm text-[#7C6657] mt-1 mb-6">
            Please enter your mobile number to receive an OTP.
          </p>
          <button
            onClick={() => navigate("/login")}
            className="w-full py-3.5 rounded-xl sm:rounded-2xl text-white font-bold text-sm shadow-md"
            style={{
              background: "linear-gradient(90deg, #FF6200 0%, #FFA800 100%)",
            }}
          >
            Go to Login
          </button>
        </div>
      </div>
    );
  }

  return (
    <div
      className="h-[100dvh] w-full flex flex-col justify-between items-center relative overflow-hidden p-3 sm:p-5 md:p-7 select-none"
      style={{
        backgroundColor: "#FAF6F0",
        backgroundImage: `
          radial-gradient(circle at 10% 15%, rgba(255, 230, 205, 0.7) 0%, transparent 40%),
          radial-gradient(circle at 92% 25%, rgba(255, 226, 195, 0.75) 0%, transparent 38%),
          radial-gradient(circle at 85% 85%, rgba(255, 234, 212, 0.55) 0%, transparent 35%),
          radial-gradient(circle at 15% 80%, rgba(255, 228, 200, 0.5) 0%, transparent 35%)
        `,
      }}
    >
      {/* =====================================================
          FLOATING BACKGROUND ACCENTS
      ===================================================== */}
      <div className="absolute top-10 left-8 w-11 h-11 rounded-2xl bg-white/90 backdrop-blur-md border border-[#FFE7D3] shadow-[0_8px_24px_rgba(255,102,0,0.08)] flex items-center justify-center pointer-events-none hidden sm:flex">
        <Store size={20} color="#FF6600" />
      </div>

      <div className="absolute top-14 right-14 w-10 h-10 rounded-2xl bg-white/90 backdrop-blur-md border border-[#FFE7D3] shadow-[0_8px_24px_rgba(255,102,0,0.08)] flex items-center justify-center pointer-events-none hidden sm:flex">
        <Sparkles size={18} color="#FFA800" />
      </div>

      <div className="absolute bottom-20 right-14 w-11 h-11 rounded-2xl bg-white/90 backdrop-blur-md border border-[#FFE7D3] shadow-[0_8px_24px_rgba(255,102,0,0.08)] flex items-center justify-center pointer-events-none hidden sm:flex">
        <ShieldCheck size={20} color="#FF6600" />
      </div>

      {/* =====================================================
          FULL-SCREEN SPLIT CARD CONTAINER
      ===================================================== */}
      <div className="w-full max-w-[1060px] my-auto flex-1 flex flex-col justify-center z-10">
        <div className="w-full bg-white rounded-[24px] sm:rounded-[32px] shadow-[0_20px_60px_rgba(100,50,15,0.08)] border border-[#F3E7DC] overflow-hidden grid grid-cols-1 md:grid-cols-12 md:min-h-[500px] lg:min-h-[540px]">
          
          {/* -------------------------------------------------
              LEFT BANNER (ORANGE THEME)
          ------------------------------------------------- */}
          <div
            className="md:col-span-5 p-5 sm:p-7 md:p-10 lg:p-12 flex flex-col justify-between relative overflow-hidden"
            style={{
              background: "linear-gradient(155deg, #FF6000 0%, #FF7A00 45%, #FFA600 100%)",
            }}
          >
            {/* Ambient glows */}
            <div className="absolute -top-16 -right-16 w-52 h-52 rounded-full bg-white/10 blur-2xl pointer-events-none" />
            <div className="absolute -bottom-16 -left-16 w-52 h-52 rounded-full bg-black/5 blur-2xl pointer-events-none" />

            <div>
              {/* Brand Pill */}
              <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-white/20 backdrop-blur-md border border-white/25">
                <span className="w-2 h-2 rounded-full bg-white animate-pulse" />
                <span className="text-[10px] sm:text-xs font-black tracking-[1.5px] text-white uppercase">
                  Zatpatt
                </span>
              </div>

              {/* Headline */}
              <h1 className="mt-3 sm:mt-5 md:mt-7 text-[22px] xs:text-[26px] sm:text-[30px] md:text-[34px] lg:text-[38px] font-black text-white leading-[1.12] tracking-tight">
                Quick & safe
                <br />
                verification.
              </h1>


              {/* Bullet Features (Desktop) */}
              <div className="hidden md:flex flex-col gap-3 mt-7">
                <div className="flex items-center gap-3">
                  <div className="w-5 h-5 rounded-full bg-white/20 border border-white/30 flex items-center justify-center shrink-0">
                    <Check size={12} color="white" strokeWidth={3} />
                  </div>
                  <span className="text-xs sm:text-sm font-semibold text-white">
                    One-time password authentication
                  </span>
                </div>

                <div className="flex items-center gap-3">
                  <div className="w-5 h-5 rounded-full bg-white/20 border border-white/30 flex items-center justify-center shrink-0">
                    <Check size={12} color="white" strokeWidth={3} />
                  </div>
                  <span className="text-xs sm:text-sm font-semibold text-white">
                    End-to-end encrypted partner session
                  </span>
                </div>

                <div className="flex items-center gap-3">
                  <div className="w-5 h-5 rounded-full bg-white/20 border border-white/30 flex items-center justify-center shrink-0">
                    <Check size={12} color="white" strokeWidth={3} />
                  </div>
                  <span className="text-xs sm:text-sm font-semibold text-white">
                    Direct access to delivery hub assignments
                  </span>
                </div>
              </div>
            </div>

            {/* Bottom Tagline */}
            <div className="hidden md:block mt-8 pt-4 border-t border-white/15">
              <p className="text-xs font-medium text-white/80">
                — Powered by Zatpatt
              </p>
            </div>
          </div>

          {/* -------------------------------------------------
              RIGHT PANEL: FLUID RESPONSIVE OTP FORM
          ------------------------------------------------- */}
          <div className="md:col-span-7 p-5 sm:p-7 md:p-10 lg:p-12 flex flex-col justify-between bg-white">
            <div>
          

              {/* Phone Info Row */}
              <div className="flex items-center justify-between py-2 sm:py-2.5 px-3.5 sm:px-4 rounded-xl sm:rounded-2xl bg-[#FAF6F0] border border-[#F3E7DC] mb-4 sm:mb-5">
                <div>
                  <p className="text-[10px] sm:text-xs text-[#7C6657] font-medium">
                    Code sent to
                  </p>
                  <p className="text-xs sm:text-sm font-black text-[#2E1A0F]">
                    +91 {phone}
                  </p>
                </div>
                <button
                  type="button"
                  onClick={() => {
                    localStorage.removeItem("login_mobile");
                    navigate("/login");
                  }}
                  className="px-3 py-1 rounded-lg text-xs font-bold text-[#FF6600] bg-white border border-[#FED7AA] shadow-xs hover:bg-[#FFF5EC] transition-all"
                >
                  Change
                </button>
              </div>

              {/* =============================================
                  FULLY RESPONSIVE & FLUID OTP BOXES
              ============================================= */}
              <motion.div
                animate={shake ? { x: [-6, 6, -4, 4, 0] } : {}}
                transition={{ duration: 0.3 }}
                className="w-full flex items-center justify-center gap-1.5 xs:gap-2 sm:gap-2.5 md:gap-3 my-3 sm:my-5"
              >
                {otp.map((digit, idx) => (
                  <input
                    key={idx}
                    ref={(el) => {
                      inputsRef.current[idx] = el;
                    }}
                    type="tel"
                    inputMode="numeric"
                    pattern="[0-9]*"
                    autoComplete={idx === 0 ? "one-time-code" : "off"}
                    value={digit}
                    maxLength={1}
                    disabled={loading || resendLoading}
                    onChange={(e) => handleChange(e.target.value, idx)}
                    onKeyDown={(e) => handleKeyDown(e, idx)}
                    onPaste={handlePaste}
                    className="
                      flex-1
                      min-w-0
                      max-w-[48px]
                      xs:max-w-[54px]
                      sm:max-w-[60px]
                      md:max-w-[52px]
                      lg:max-w-[62px]
                      aspect-square
                      rounded-xl
                      sm:rounded-2xl
                      text-center
                      text-base
                      xs:text-lg
                      sm:text-2xl
                      font-black
                      outline-none
                      border
                      transition-all
                      duration-200
                      p-0
                    "
                    style={{
                      borderColor: digit ? "#FF6600" : "#E5E7EB",
                      backgroundColor: digit ? "#FFFCF9" : "#FFFFFF",
                      color: "#2E1A0F",
                    }}
                    onFocus={(e) => {
                      e.currentTarget.style.borderColor = "#FF6600";
                      e.currentTarget.style.boxShadow =
                        "0 0 0 3px rgba(255,102,0,0.12)";
                    }}
                    onBlur={(e) => {
                      e.currentTarget.style.borderColor = digit ? "#FF6600" : "#E5E7EB";
                      e.currentTarget.style.boxShadow = "none";
                    }}
                  />
                ))}
              </motion.div>

              {/* Error Message */}
              {error && (
                <p className="text-center text-xs sm:text-sm text-[#DC2626] font-semibold my-1.5">
                  {error}
                </p>
              )}

              {/* Verify Button */}
              <button
                type="button"
                onClick={handleVerifyOtp}
                disabled={!isOtpComplete || loading || resendLoading}
                className="group relative mt-3 sm:mt-5 w-full h-[48px] sm:h-[54px] rounded-xl sm:rounded-2xl font-extrabold text-sm sm:text-base flex items-center justify-center gap-2 transition-all duration-200 active:scale-[0.99] disabled:cursor-not-allowed"
                style={{
                  background: isOtpComplete
                    ? "linear-gradient(90deg, #FF6200 0%, #FFA800 100%)"
                    : "#E5E7EB",
                  color: isOtpComplete ? "#FFFFFF" : "#9CA3AF",
                  boxShadow: isOtpComplete
                    ? "0 10px 25px rgba(255,98,0,0.25)"
                    : "none",
                }}
              >
                {loading ? (
                  <div className="w-5 h-5 border-2 border-white/40 border-t-white rounded-full animate-spin" />
                ) : (
                  <>
                    <span>Verify & Continue</span>
                    <ArrowRight
                      size={18}
                      className="transition-transform duration-200 group-hover:translate-x-1"
                    />
                  </>
                )}
              </button>

              {/* Resend Section */}
              <div className="mt-3.5 sm:mt-4 flex items-center justify-center text-xs sm:text-sm">
                {resendTimer > 0 ? (
                  <span className="text-[#7C6657] font-medium">
                    Resend OTP in{" "}
                    <strong className="text-[#FF6600] font-black">{resendTimer}s</strong>
                  </span>
                ) : (
                  <button
                    type="button"
                    onClick={resendOtp}
                    disabled={resendLoading}
                    className="font-black text-[#FF6600] hover:underline flex items-center gap-1.5 transition-all"
                  >
                    <RotateCcw size={14} />
                    Resend OTP
                  </button>
                )}
              </div>
            </div>

            {/* Bottom Security Box */}
            <div className="mt-4 sm:mt-6 p-3 sm:p-3.5 rounded-xl sm:rounded-2xl bg-[#FFF9F3] border border-[#FFE8D6] flex items-center gap-3">
              <div className="w-8 h-8 rounded-xl bg-[#FFEADB] flex items-center justify-center shrink-0">
                <Lock size={15} color="#FF6600" />
              </div>
              <div className="min-w-0">
                <h4 className="text-xs font-bold text-[#2E1A0F] leading-tight">
                  Security Tip
                </h4>
                <p className="text-[11px] sm:text-xs text-[#7C6657] truncate leading-tight mt-0.5">
                  Never share your OTP with anyone, including Zatpatt support.
                </p>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* =====================================================
          BOTTOM FOOTER ARC
      ===================================================== */}
      <div className="relative z-10 shrink-0 pb-0.5">
        <div className="bg-[#FFEADA]/70 backdrop-blur-md px-8 py-2 rounded-full border border-[#FED7AA]/60 flex items-center gap-2 text-[10px] sm:text-xs font-medium text-[#7C6657]">
          <span>© {new Date().getFullYear()} Zatpatt</span>
          <span>•</span>
          <span>Delivery Partner Portal</span>
        </div>
      </div>
    </div>
  );
}
