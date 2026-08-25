import React, { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import {
  ArrowRight,
  CheckCircle2,
  ShieldCheck,
  Smartphone,
  Check,
  Store,
  Sparkles,
  Lock,
} from "lucide-react";

import { requestOtp } from "../Services/auth";

export default function LoginPage() {
  const navigate = useNavigate();

  const [mobile, setMobile] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  /* Mobile Validation */
  useEffect(() => {
    if (!mobile) {
      setError("");
    } else if (!/^[6-9]\d{9}$/.test(mobile)) {
      setError("Enter a valid 10 digit mobile number");
    } else {
      setError("");
    }
  }, [mobile]);

  const isValid = /^[6-9]\d{9}$/.test(mobile);

  /* Send OTP */
  const handleContinue = async () => {
    if (!isValid || loading) return;

    try {
      setLoading(true);
      setError("");
      const res = await requestOtp(mobile);

      console.log("OTP API ✅", res);
      localStorage.setItem("login_mobile", mobile);

      navigate("/otp", {
        state: {
          phone: mobile,
        },
      });
    } catch (err) {
      console.error("OTP API error ❌", err);
      setError(
        err?.response?.data?.message ||
          "Failed to send OTP. Please try again."
      );
    } finally {
      setLoading(false);
    }
  };

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
      {/* Floating Badges */}
      <div className="absolute top-10 left-8 w-11 h-11 rounded-2xl bg-white/90 backdrop-blur-md border border-[#FFE7D3] shadow-[0_8px_24px_rgba(255,102,0,0.08)] flex items-center justify-center pointer-events-none hidden sm:flex">
        <Store size={20} color="#FF6600" />
      </div>

      <div className="absolute top-14 right-14 w-10 h-10 rounded-2xl bg-white/90 backdrop-blur-md border border-[#FFE7D3] shadow-[0_8px_24px_rgba(255,102,0,0.08)] flex items-center justify-center pointer-events-none hidden sm:flex">
        <Sparkles size={18} color="#FFA800" />
      </div>

      <div className="absolute bottom-20 right-14 w-11 h-11 rounded-2xl bg-white/90 backdrop-blur-md border border-[#FFE7D3] shadow-[0_8px_24px_rgba(255,102,0,0.08)] flex items-center justify-center pointer-events-none hidden sm:flex">
        <ShieldCheck size={20} color="#FF6600" />
      </div>

      {/* Main Card */}
      <div className="w-full max-w-[1060px] my-auto flex-1 flex flex-col justify-center z-10">
        <div className="w-full bg-white rounded-[24px] sm:rounded-[32px] shadow-[0_20px_60px_rgba(100,50,15,0.08)] border border-[#F3E7DC] overflow-hidden grid grid-cols-1 md:grid-cols-12 md:min-h-[500px] lg:min-h-[540px]">
          
          {/* Left Banner */}
          <div
            className="md:col-span-6 p-5 sm:p-7 md:p-10 lg:p-12 flex flex-col justify-between relative overflow-hidden"
            style={{
              background: "linear-gradient(155deg, #FF6000 0%, #FF7A00 45%, #FFA600 100%)",
            }}
          >
            <div className="absolute -top-16 -right-16 w-52 h-52 rounded-full bg-white/10 blur-2xl pointer-events-none" />
            <div className="absolute -bottom-16 -left-16 w-52 h-52 rounded-full bg-black/5 blur-2xl pointer-events-none" />

            <div>
              <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-white/20 backdrop-blur-md border border-white/25">
                <span className="w-2 h-2 rounded-full bg-white animate-pulse" />
                <span className="text-[10px] sm:text-xs font-black tracking-[1.5px] text-white uppercase">
                  Zatpatt
                </span>
              </div>

              <h1 className="mt-3 sm:mt-5 md:mt-7 text-[22px] xs:text-[26px] sm:text-[30px] md:text-[34px] lg:text-[38px] font-black text-white leading-[1.12] tracking-tight">
                Deliver orders
                <br />
                smarter.
              </h1>

              <p className="mt-2 text-xs sm:text-sm md:text-base text-white/90 leading-snug max-w-[380px]">
                Everything you need to manage your deliveries, earnings, and routes in one place.
              </p>

              <div className="hidden md:flex flex-col gap-3 mt-7">
                <div className="flex items-center gap-3">
                  <div className="w-5 h-5 rounded-full bg-white/20 border border-white/30 flex items-center justify-center shrink-0">
                    <Check size={12} color="white" strokeWidth={3} />
                  </div>
                  <span className="text-xs sm:text-sm font-semibold text-white">
                    Manage orders easily
                  </span>
                </div>

                <div className="flex items-center gap-3">
                  <div className="w-5 h-5 rounded-full bg-white/20 border border-white/30 flex items-center justify-center shrink-0">
                    <Check size={12} color="white" strokeWidth={3} />
                  </div>
                  <span className="text-xs sm:text-sm font-semibold text-white">
                    Track live performance & incentives
                  </span>
                </div>

                <div className="flex items-center gap-3">
                  <div className="w-5 h-5 rounded-full bg-white/20 border border-white/30 flex items-center justify-center shrink-0">
                    <Check size={12} color="white" strokeWidth={3} />
                  </div>
                  <span className="text-xs sm:text-sm font-semibold text-white">
                    Flexible hours & guaranteed weekly payouts
                  </span>
                </div>
              </div>
            </div>

            <div className="hidden md:block mt-8 pt-4 border-t border-white/15">
              <p className="text-xs font-medium text-white/80">
                — Powered by Zatpatt
              </p>
            </div>
          </div>

          {/* Right Form */}
          <div className="md:col-span-6 p-5 sm:p-7 md:p-10 lg:p-12 flex flex-col justify-between bg-white">
            <div>
              <div className="flex items-center gap-3 mb-4 sm:mb-5">
                <div className="w-10 h-10 sm:w-12 sm:h-12 rounded-2xl bg-[#FFF5EC] border border-[#FED7AA] flex items-center justify-center shrink-0 shadow-sm">
                  <Smartphone size={22} color="#FF6600" />
                </div>
                <div>
                  <span className="text-[10px] sm:text-xs font-extrabold uppercase tracking-[1.5px] text-[#FF6600] block leading-tight">
                    Delivery Partner
                  </span>
                  <h2 className="text-[20px] sm:text-[24px] lg:text-[26px] font-black text-[#2E1A0F] leading-tight">
                    Welcome!
                  </h2>
                </div>
              </div>

              <p className="text-xs sm:text-sm text-[#7C6657] mb-4 sm:mb-5">
                Login using your registered mobile number
              </p>

              <div className="space-y-1.5">
                <label className="block text-xs sm:text-sm font-bold text-[#2E1A0F]">
                  Mobile Number
                </label>

                <div
                  className="flex items-center rounded-xl sm:rounded-2xl px-3.5 py-3 sm:py-3.5 border transition-all duration-200 bg-white"
                  style={{
                    borderColor: error
                      ? "#FCA5A5"
                      : mobile
                      ? "#FF6600"
                      : "#E5E7EB",
                    boxShadow: mobile ? "0 0 0 3px rgba(255,102,0,0.08)" : "none",
                  }}
                >
                  <div className="flex items-center gap-1.5 shrink-0 pr-3 border-r border-[#E5E7EB]">
                    <span className="text-sm sm:text-base font-bold text-[#2E1A0F]">+91</span>
                  </div>

                  <input
                    type="tel"
                    inputMode="numeric"
                    pattern="[0-9]*"
                    placeholder="Enter mobile number"
                    value={mobile}
                    onChange={(e) => setMobile(e.target.value.replace(/\D/g, ""))}
                    maxLength={10}
                    className="flex-1 pl-3 bg-transparent outline-none text-sm sm:text-base font-semibold text-[#2E1A0F] placeholder:text-[#9CA3AF]"
                  />

                  {isValid && (
                    <CheckCircle2 size={19} color="#16A34A" className="shrink-0" />
                  )}
                </div>

                {error ? (
                  <p className="text-xs text-[#DC2626] font-medium pt-0.5">
                    {error}
                  </p>
                ) : (
                  <div className="flex items-center gap-1.5 pt-0.5 text-[#7C6657]">
                    <ShieldCheck size={13} color="#16A34A" />
                    <span className="text-[10px] sm:text-xs">
                      Enter your registered 10 digit mobile number
                    </span>
                  </div>
                )}
              </div>

              <button
                type="button"
                onClick={handleContinue}
                disabled={!isValid || loading}
                className="group relative mt-5 sm:mt-6 w-full h-[48px] sm:h-[54px] rounded-xl sm:rounded-2xl font-extrabold text-sm sm:text-base flex items-center justify-center gap-2 transition-all duration-200 active:scale-[0.99] disabled:cursor-not-allowed"
                style={{
                  background: isValid
                    ? "linear-gradient(90deg, #FF6200 0%, #FFA800 100%)"
                    : "#E5E7EB",
                  color: isValid ? "#FFFFFF" : "#9CA3AF",
                  boxShadow: isValid
                    ? "0 10px 25px rgba(255,98,0,0.25)"
                    : "none",
                }}
              >
                {loading ? (
                  <div className="w-5 h-5 border-2 border-white/40 border-t-white rounded-full animate-spin" />
                ) : (
                  <>
                    <span>Continue</span>
                    <ArrowRight
                      size={18}
                      className="transition-transform duration-200 group-hover:translate-x-1"
                    />
                  </>
                )}
              </button>
            </div>

            <div className="mt-4 sm:mt-6 p-3 sm:p-3.5 rounded-xl sm:rounded-2xl bg-[#FFF9F3] border border-[#FFE8D6] flex items-center gap-3">
              <div className="w-8 h-8 rounded-xl bg-[#FFEADB] flex items-center justify-center shrink-0">
                <Lock size={15} color="#FF6600" />
              </div>
              <div className="min-w-0">
                <h4 className="text-xs font-bold text-[#2E1A0F] leading-tight">
                  Secure Login
                </h4>
                <p className="text-[11px] sm:text-xs text-[#7C6657] truncate leading-tight mt-0.5">
                  We'll send an OTP to verify your registered mobile number.
                </p>
              </div>
            </div>
          </div>
        </div>
      </div>

      <div className="relative z-10 shrink-0 pb-0.5">
        <div className="bg-[#FFEADA]/70 backdrop-blur-md px-8 py-2 rounded-full border border-[#FED7AA]/60 flex items-center gap-2 text-[10px] sm:text-xs font-medium text-[#7C6657]">
          <span>© {new Date().getFullYear()} Zatpatt</span>
          <span>•</span>
          <span>Delivery Partner</span>
        </div>
      </div>
    </div>
  );
}
