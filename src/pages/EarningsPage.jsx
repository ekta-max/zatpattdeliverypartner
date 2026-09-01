// src/pages/EarningsPage.jsx
import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import {
  ArrowLeft,
  Wallet,
  TrendingUp,
  Calendar,
  CalendarDays,
  Sparkles,
  Clock,
  CheckCircle2,
  AlertCircle,
  HelpCircle,
  ArrowRight,
  ShieldCheck,
} from "lucide-react";
import { getEarnings, requestPayment } from "../Services/earnings";

/* =========================================================
   ZATPATAT THEME DESIGN TOKENS
========================================================= */
const BRAND_ORANGE = "#FF6600";
const BRAND_GRADIENT = "linear-gradient(90deg, #FF6200 0%, #FFA800 100%)";
const HERO_GRADIENT = "linear-gradient(155deg, #FF6000 0%, #FF7A00 45%, #FFA600 100%)";
const TEXT_DARK = "#2E1A0F";
const TEXT_MUTED = "#7C6657";

export default function EarningsPage() {
  const navigate = useNavigate();

  const [loading, setLoading] = useState(true);
  const [requesting, setRequesting] = useState(false);
  const [earnings, setEarnings] = useState({
    daily: 0,
    weekly: 0,
    monthly: 0,
    total: 0,
  });

  const [pending, setPending] = useState(0);
  const [withdrawStatus, setWithdrawStatus] = useState("none"); // none | pending | completed

  /* ---------------- LOAD EARNINGS DATA ---------------- */
  useEffect(() => {
    const fetchEarnings = async () => {
      try {
        const data = await getEarnings();
        console.log("Earnings API ✅", data);

        const e = data.data || data;

        setEarnings({
          daily: e.today?.earnings || 0,
          weekly: e.week?.earnings || 0,
          monthly: e.month?.earnings || 0,
          total: e.total?.earnings || 0,
        });

        setPending(e.pending_payment || 0);
      } catch (err) {
        console.error("Earnings API error ❌", err);
      } finally {
        setLoading(false);
      }
    };

    fetchEarnings();

    const withdraw = localStorage.getItem("withdraw_request") || "none";
    setWithdrawStatus(withdraw);
  }, []);

  /* ---------------- HANDLE WITHDRAW REQUEST ---------------- */
  const handleWithdrawRequest = async () => {
    if (pending === 0 || requesting) return;
    setRequesting(true);

    try {
      await requestPayment();
      console.log("Payment request sent ✅");

      setWithdrawStatus("pending");
      localStorage.setItem("withdraw_request", "pending");
    } catch (err) {
      console.error("Payment request API error ❌", err);
      alert("Failed to submit withdrawal request. Please try again.");
    } finally {
      setRequesting(false);
    }
  };

  if (loading) {
    return (
      <div
        className="min-h-screen w-full flex items-center justify-center p-4"
        style={{
          backgroundColor: "#FAF6F0",
          backgroundImage: `
            radial-gradient(circle at 10% 15%, rgba(255, 230, 205, 0.7) 0%, transparent 40%),
            radial-gradient(circle at 90% 25%, rgba(255, 226, 195, 0.75) 0%, transparent 38%)
          `,
        }}
      >
        <div className="bg-white rounded-[26px] shadow-[0_20px_60px_rgba(100,50,15,0.08)] px-8 py-7 text-center border border-[#F3E7DC]">
          <div className="mx-auto mb-4 h-11 w-11 rounded-full border-4 border-[#FED7AA] border-t-[#FF6600] animate-spin" />
          <p className="font-black text-[#2E1A0F] text-sm">Loading Earnings...</p>
          <p className="text-[11px] text-[#7C6657] mt-0.5">Calculating delivery payouts</p>
        </div>
      </div>
    );
  }

  return (
    <div
      className="min-h-screen w-full flex flex-col justify-between pb-12 text-[#2E1A0F] select-none"
      style={{
        backgroundColor: "#FAF6F0",
        backgroundImage: `
          radial-gradient(circle at 10% 15%, rgba(255, 230, 205, 0.7) 0%, transparent 40%),
          radial-gradient(circle at 92% 25%, rgba(255, 226, 195, 0.75) 0%, transparent 38%),
          radial-gradient(circle at 85% 85%, rgba(255, 234, 212, 0.55) 0%, transparent 35%)
        `,
      }}
    >
      {/* ================= HEADER ================= */}
      <header
        className="sticky top-0 z-40 text-white shadow-md"
        style={{ background: HERO_GRADIENT }}
      >
        <div className="max-w-4xl mx-auto px-4 sm:px-6 py-3.5 flex items-center justify-between">
          <button
            onClick={() => navigate(-1)}
            className="w-9 h-9 sm:w-10 sm:h-10 rounded-xl bg-white/20 hover:bg-white/30 backdrop-blur-md border border-white/25 flex items-center justify-center transition active:scale-95"
          >
            <ArrowLeft size={19} />
          </button>

          <div className="text-center">
            <div className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full bg-white/20 backdrop-blur-md border border-white/25">
              <span className="w-1.5 h-1.5 rounded-full bg-white animate-pulse" />
              <span className="text-[9px] font-black tracking-[1.3px] uppercase text-white">
                Zatpatt Payouts
              </span>
            </div>
            <h1 className="text-base sm:text-lg font-black mt-0.5">Partner Earnings</h1>
          </div>

          <div className="w-9 h-9 sm:w-10 sm:h-10 rounded-xl bg-white/20 backdrop-blur-md border border-white/25 flex items-center justify-center">
            <Wallet size={18} />
          </div>
        </div>
      </header>

      {/* ================= MAIN CONTENT ================= */}
      <main className="max-w-4xl w-full mx-auto px-3 sm:px-6 py-5 sm:py-7 space-y-4 sm:space-y-6">
        
        {/* ================= LIFETIME EARNINGS HERO BANNER ================= */}
        <div
          className="rounded-[26px] sm:rounded-[32px] p-6 sm:p-7 text-white shadow-[0_15px_35px_rgba(255,102,0,0.18)] relative overflow-hidden flex flex-col justify-between"
          style={{ background: HERO_GRADIENT }}
        >
          <div className="relative z-10 flex items-center justify-between">
            <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-white/20 backdrop-blur-md border border-white/25 text-[10px] font-black uppercase tracking-wider">
              <Sparkles size={12} /> Total Accumulated
            </div>
            <div className="w-10 h-10 rounded-2xl bg-white/20 backdrop-blur-md flex items-center justify-center text-white">
              <TrendingUp size={20} />
            </div>
          </div>

          <div className="relative z-10 mt-4">
            <span className="text-xs text-white/90 font-bold uppercase tracking-wider">
              Partner Earnings
            </span>
            <div className="text-3xl sm:text-4xl font-black mt-0.5 tracking-tight">
              ₹{earnings.total.toLocaleString()}
            </div>
            <p className="text-[11px] text-white/80 mt-1">
              Includes all completed order deliveries, peak-hour incentives & milestone bonuses.
            </p>
          </div>
        </div>

        {/* ================= PERIOD STATS (Today, This Week, This Month) ================= */}
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 sm:gap-4">
          <PeriodCard
            icon={<Clock size={18} />}
            label="Today's Earnings"
            subtext="Resets midnight"
            value={`₹${earnings.daily.toLocaleString()}`}
          />
          <PeriodCard
            icon={<Calendar size={18} />}
            label="This Week"
            subtext="Current cycle"
            value={`₹${earnings.weekly.toLocaleString()}`}
          />
          <PeriodCard
            icon={<CalendarDays size={18} />}
            label="This Month"
            subtext="Monthly total"
            value={`₹${earnings.monthly.toLocaleString()}`}
          />
        </div>

        {/* ================= WALLET & WITHDRAWAL CARD ================= */}
        <div className="bg-white rounded-[26px] sm:rounded-[32px] p-5 sm:p-7 shadow-[0_20px_60px_rgba(100,50,15,0.08)] border border-[#F3E7DC] space-y-4">
          
          <div className="flex items-center justify-between border-b border-[#F3E7DC]/80 pb-4">
            <div className="flex items-center gap-2.5">
              <div className="w-10 h-10 rounded-xl bg-[#FFF5EC] border border-[#FED7AA] flex items-center justify-center text-[#FF6600]">
                <Wallet size={20} />
              </div>
              <div>
                <h3 className="text-base font-black text-[#2E1A0F]">
                  Payout Wallet
                </h3>
                <p className="text-[11px] text-[#7C6657]">
                  Direct bank transfer clearance
                </p>
              </div>
            </div>

            <div className="text-right">
              <span className="text-[10px] font-bold text-[#7C6657] block">
                Pending Balance
              </span>
              <span className="text-xl sm:text-2xl font-black text-[#FF6600]">
                ₹{pending.toLocaleString()}
              </span>
            </div>
          </div>

          {/* STATUS NOTICES */}
          {withdrawStatus === "pending" && (
            <div className="p-3.5 rounded-2xl bg-[#FFF9F3] border border-[#FED7AA] flex items-center gap-2.5 text-[#FF6600]">
              <Clock size={18} className="animate-spin shrink-0" />
              <div className="text-xs font-bold leading-snug">
                Withdrawal request under review. Payout will be credited to your linked bank account upon admin approval.
              </div>
            </div>
          )}

          {withdrawStatus === "completed" && (
            <div className="p-3.5 rounded-2xl bg-green-50 border border-green-200 flex items-center gap-2.5 text-green-700">
              <CheckCircle2 size={18} className="shrink-0 text-green-600" />
              <div className="text-xs font-bold leading-snug">
                Your last withdrawal was processed successfully.
              </div>
            </div>
          )}

          {/* REQUEST WITHDRAW BUTTON */}
          <button
            type="button"
            disabled={pending === 0 || withdrawStatus === "pending" || requesting}
            onClick={handleWithdrawRequest}
            className={`w-full h-[50px] rounded-2xl font-extrabold text-xs sm:text-sm flex items-center justify-center gap-2 transition-all shadow-md ${
              pending === 0 || withdrawStatus === "pending"
                ? "bg-[#F3E7DC] text-[#7C6657] cursor-not-allowed opacity-70 shadow-none"
                : "text-white active:scale-[0.99] hover:shadow-lg"
            }`}
            style={
              pending > 0 && withdrawStatus !== "pending"
                ? {
                    background: BRAND_GRADIENT,
                    boxShadow: "0 8px 20px rgba(255,98,0,0.24)",
                  }
                : undefined
            }
          >
            {requesting ? (
              <>
                <div className="w-4 h-4 border-2 border-white/40 border-t-white rounded-full animate-spin" />
                <span>Processing Request...</span>
              </>
            ) : withdrawStatus === "pending" ? (
              <>
                <Clock size={16} />
                <span>Withdrawal Request Sent (Pending Approval)</span>
              </>
            ) : pending === 0 ? (
              <>
                <ShieldCheck size={16} />
                <span>No Pending Balance to Withdraw</span>
              </>
            ) : (
              <>
                <span>Request Payout (₹{pending.toLocaleString()})</span>
                <ArrowRight size={16} />
              </>
            )}
          </button>
        </div>

        {/* ================= IMPORTANT NOTES ================= */}
        <div className="bg-[#FFF9F3] border border-[#FFE8D6] rounded-[24px] p-4 sm:p-5 flex items-start gap-3">
          <div className="w-8 h-8 rounded-xl bg-[#FFEADB] flex items-center justify-center shrink-0 text-[#FF6600] mt-0.5">
            <HelpCircle size={17} />
          </div>
          <div className="text-xs text-[#7C6657] space-y-1 leading-relaxed">
            <h4 className="font-black text-[#2E1A0F]">Important Payout Information:</h4>
            <p>• Earnings update in real-time immediately after every successful customer delivery.</p>
            <p>• Pending balance reflects approved earnings awaiting direct bank transfer.</p>
            <p>• Weekly batch payouts are automatically dispatched every Monday.</p>
          </div>
        </div>

        {/* ================= BOTTOM FOOTER BADGE ================= */}
        <div className="text-center pt-2">
          <div className="inline-flex items-center gap-2 bg-[#FFEADA]/70 backdrop-blur-md px-6 py-1.5 rounded-full border border-[#FED7AA]/60 text-[9px] sm:text-[10px] font-bold text-[#7C6657]">
            <span>© {new Date().getFullYear()} Zatpatt</span>
            <span>•</span>
            <span>Delivery Partner Portal</span>
          </div>
        </div>
      </main>
    </div>
  );
}

/* =========================================================
   PERIOD EARNING CARD SUB-COMPONENT
========================================================= */
function PeriodCard({ icon, label, subtext, value }) {
  return (
    <div className="bg-white p-4 sm:p-5 rounded-[22px] sm:rounded-[26px] border border-[#F3E7DC] shadow-[0_10px_30px_rgba(100,50,15,0.04)] flex items-center justify-between">
      <div className="flex items-center gap-3">
        <div className="w-10 h-10 rounded-xl bg-[#FFF5EC] border border-[#FED7AA] flex items-center justify-center text-[#FF6600] shrink-0">
          {icon}
        </div>
        <div>
          <div className="text-xs font-bold text-[#7C6657] leading-tight">
            {label}
          </div>
          <div className="text-[10px] text-gray-400 mt-0.5">
            {subtext}
          </div>
        </div>
      </div>

      <div className="text-right">
        <div className="text-base sm:text-lg font-black text-[#2E1A0F]">
          {value}
        </div>
      </div>
    </div>
  );
}
