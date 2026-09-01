// src/pages/LeaderboardPage.jsx
import React, { useState, useEffect } from "react";
import {
  ArrowLeft,
  Trophy,
  Medal,
  Award,
  Crown,
  Sparkles,
  Package,
  Star,
  User,
  TrendingUp,
  Flame,
} from "lucide-react";
import { useNavigate } from "react-router-dom";
import Confetti from "react-confetti";
import { getLeaderboard } from "../Services/leaderboard";

/* =========================================================
   ZATPATAT THEME DESIGN TOKENS
========================================================= */
const BRAND_ORANGE = "#FF6600";
const BRAND_GRADIENT = "linear-gradient(90deg, #FF6200 0%, #FFA800 100%)";
const HERO_GRADIENT = "linear-gradient(155deg, #FF6000 0%, #FF7A00 45%, #FFA600 100%)";

export default function LeaderboardPage() {
  const navigate = useNavigate();

  const [activeTab, setActiveTab] = useState("orders");
  const [leaders, setLeaders] = useState([]);
  const [currentUser, setCurrentUser] = useState(null);
  const [loading, setLoading] = useState(true);
  const [showConfetti, setShowConfetti] = useState(true);

  useEffect(() => {
    const timer = setTimeout(() => {
      setShowConfetti(false);
    }, 3500);

    return () => clearTimeout(timer);
  }, []);

  /* ---------------- LOAD LEADERBOARD DATA ---------------- */
  useEffect(() => {
    const fetchLeaderboard = async () => {
      try {
        const res = await getLeaderboard();
        console.log("Leaderboard API ✅", res);

        const list = res.data || [];

        const formatted = list.map((item) => ({
          id: item.id,
          name: item.full_name || `Partner #${item.id}`,
          completed: item.total_orders || 0,
          rating: 4.9,
          isCurrent: item.id === 10,
        }));

        setLeaders(formatted);

        const current = formatted.find((u) => u.isCurrent) || {
          id: 10,
          name: "You",
          completed: 0,
          rating: 4.9,
          isCurrent: true,
        };

        setCurrentUser(current);
      } catch (err) {
        console.error("Leaderboard API error ❌", err);
      } finally {
        setLoading(false);
      }
    };

    fetchLeaderboard();
  }, []);

  // 1. Sort all by completed orders descending
  const sortedByOrders = [...leaders].sort((a, b) => b.completed - a.completed);

  // 2. Separate partners with > 0 orders vs 0 orders
  const activePartners = sortedByOrders.filter((p) => p.completed > 0);
  const zeroOrderPartners = sortedByOrders.filter((p) => p.completed === 0);

  // 3. Top Podium: Max 3 partners who have > 0 orders
  const podiumPartners = activePartners.slice(0, 3);

  // 4. List below: Remaining active partners + all 0-order partners
  const remainingActive = activePartners.slice(podiumPartners.length);
  const listBelow = [...remainingActive, ...zeroOrderPartners];

  // User rank in full list
  const userOrdersRank =
    sortedByOrders.findIndex((x) => x.isCurrent) + 1 || sortedByOrders.length + 1;

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
          <p className="font-black text-[#2E1A0F] text-sm">Loading Leaderboard...</p>
          <p className="text-[11px] text-[#7C6657] mt-0.5">Fetching top fleet partners</p>
        </div>
      </div>
    );
  }

  return (
    <div
      className="min-h-screen w-full flex flex-col justify-between pb-24 text-[#2E1A0F] select-none relative"
      style={{
        backgroundColor: "#FAF6F0",
        backgroundImage: `
          radial-gradient(circle at 10% 15%, rgba(255, 230, 205, 0.7) 0%, transparent 40%),
          radial-gradient(circle at 92% 25%, rgba(255, 226, 195, 0.75) 0%, transparent 38%),
          radial-gradient(circle at 85% 85%, rgba(255, 234, 212, 0.55) 0%, transparent 35%)
        `,
      }}
    >
      {showConfetti && <Confetti numberOfPieces={180} recycle={false} />}

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
                Zatpatt Fleet
              </span>
            </div>
            <h1 className="text-base sm:text-lg font-black mt-0.5">Fleet Leaderboard</h1>
          </div>

          <div className="w-9 h-9 sm:w-10 sm:h-10 rounded-xl bg-white/20 backdrop-blur-md border border-white/25 flex items-center justify-center">
            <Trophy size={18} />
          </div>
        </div>
      </header>

      {/* ================= MAIN CONTAINER ================= */}
      <main className="max-w-4xl w-full mx-auto px-3 sm:px-6 py-4 sm:py-6 space-y-4 sm:space-y-6">
        
        {/* ================= TABS ================= */}
        <div className="flex justify-center">
          <div className="inline-flex p-1 rounded-2xl bg-white border border-[#F3E7DC] shadow-sm">
            <button
              onClick={() => setActiveTab("orders")}
              className={`px-5 py-2 rounded-xl text-xs sm:text-sm font-extrabold transition-all ${
                activeTab === "orders"
                  ? "text-white shadow-md"
                  : "text-[#7C6657] hover:text-[#2E1A0F]"
              }`}
              style={activeTab === "orders" ? { background: BRAND_GRADIENT } : undefined}
            >
              Completed Orders
            </button>
          </div>
        </div>

        {/* ================= DYNAMIC TOP PODIUM (ONLY SHOWS PARTNERS WITH > 0 ORDERS) ================= */}
        
        {/* CASE A: Exactly 1 Partner with > 0 orders */}
        {podiumPartners.length === 1 && (
          <div className="max-w-xs mx-auto pt-2 pb-2">
            <ChampionCard rank={1} partner={podiumPartners[0]} />
          </div>
        )}

        {/* CASE B: Exactly 2 Partners with > 0 orders */}
        {podiumPartners.length === 2 && (
          <div className="max-w-md mx-auto grid grid-cols-2 gap-3 sm:gap-4 items-end pt-2 pb-2">
            <ChampionCard rank={1} partner={podiumPartners[0]} />
            <SilverCard rank={2} partner={podiumPartners[1]} />
          </div>
        )}

        {/* CASE C: 3 or more Partners with > 0 orders */}
        {podiumPartners.length === 3 && (
          <div className="grid grid-cols-3 gap-2 sm:gap-4 items-end pt-4 pb-2">
            <div className="order-1">
              <SilverCard rank={2} partner={podiumPartners[1]} />
            </div>
            <div className="order-2 scale-105 z-10">
              <ChampionCard rank={1} partner={podiumPartners[0]} />
            </div>
            <div className="order-3">
              <BronzeCard rank={3} partner={podiumPartners[2]} />
            </div>
          </div>
        )}

        {/* CASE D: 0 Partners have completed an order yet */}
        {podiumPartners.length === 0 && (
          <div className="bg-white rounded-[24px] sm:rounded-[30px] p-6 text-center border border-[#F3E7DC] shadow-sm">
            <Flame size={32} className="mx-auto text-[#FF6600] mb-2 animate-bounce" />
            <h3 className="text-sm font-black text-[#2E1A0F]">Leaderboard is Ready!</h3>
            <p className="text-xs text-[#7C6657] mt-1">
              Complete your first delivery order today to claim the #1 Champion position.
            </p>
          </div>
        )}

        {/* ================= REMAINING & 0-COUNT PARTNERS LIST ================= */}
        <div className="bg-white rounded-[26px] sm:rounded-[32px] shadow-[0_20px_60px_rgba(100,50,15,0.08)] border border-[#F3E7DC] overflow-hidden">
          
          <div className="p-4 sm:p-5 border-b border-[#F3E7DC]/80 flex items-center justify-between">
            <div className="flex items-center gap-2">
              <div className="w-8 h-8 rounded-xl bg-[#FFF5EC] border border-[#FED7AA] flex items-center justify-center text-[#FF6600]">
                <TrendingUp size={16} />
              </div>
              <h3 className="text-sm sm:text-base font-black text-[#2E1A0F]">
                Fleet Rankings
              </h3>
            </div>
            <span className="text-[11px] font-bold text-[#7C6657]">
              {sortedByOrders.length} Total Partners
            </span>
          </div>

          <div className="divide-y divide-[#F3E7DC]/60">
            {listBelow.length === 0 && podiumPartners.length === 0 ? (
              <div className="p-8 text-center text-[#7C6657] text-xs font-bold">
                No delivery partners found.
              </div>
            ) : (
              listBelow.map((user, index) => {
                // Determine accurate overall rank in sorted list
                const actualRank = podiumPartners.length + index + 1;
                const isYou = user.isCurrent;

                return (
                  <div
                    key={user.id}
                    className={`flex items-center justify-between px-4 sm:px-6 py-3.5 transition-colors ${
                      isYou
                        ? "bg-[#FFF9F3] border-l-4 border-l-[#FF6600]"
                        : "hover:bg-[#FAF8F5]"
                    }`}
                  >
                    <div className="flex items-center gap-3 min-w-0">
                      <span className="w-7 text-xs sm:text-sm font-black text-[#7C6657]">
                        #{actualRank}
                      </span>

                      <div className="w-9 h-9 rounded-xl bg-[#FAF8F5] border border-[#F3E7DC] flex items-center justify-center text-[#2E1A0F] font-bold shrink-0">
                        <User size={16} className="text-[#7C6657]" />
                      </div>

                      <div className="min-w-0">
                        <div className="flex items-center gap-1.5">
                          <p className="text-xs sm:text-sm font-extrabold text-[#2E1A0F] truncate">
                            {user.name}
                          </p>
                          {isYou && (
                            <span className="text-[9px] font-black px-2 py-0.5 rounded-full bg-[#FFEEDB] border border-[#FF6600] text-[#FF6600]">
                              You
                            </span>
                          )}
                        </div>
                        <span className="text-[10px] text-[#7C6657]">Delivery Partner</span>
                      </div>
                    </div>

                    <div className="text-right shrink-0">
                      <div className="text-xs sm:text-sm font-black text-[#FF6600]">
                        {user.completed}{" "}
                        <span className="text-[10px] text-[#7C6657] font-semibold">orders</span>
                      </div>
                    </div>
                  </div>
                );
              })
            )}
          </div>
        </div>
      </main>

      {/* ================= FIXED BOTTOM USER POSITION BAR ================= */}
      <div className="fixed bottom-0 left-0 right-0 z-40 bg-white/95 backdrop-blur-md border-t border-[#F3E7DC] shadow-[0_-10px_25px_rgba(100,50,15,0.08)] py-3 px-4">
        <div className="max-w-4xl mx-auto flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-2xl bg-[#FFF5EC] border border-[#FED7AA] flex items-center justify-center font-black text-sm text-[#FF6600] shadow-sm">
              #{userOrdersRank}
            </div>
            <div>
              <div className="flex items-center gap-1.5">
                <span className="text-xs sm:text-sm font-black text-[#2E1A0F]">
                  {currentUser?.name || "Your Position"}
                </span>
                <span className="text-[9px] font-black px-1.5 py-0.2 rounded-full bg-green-50 text-green-700 border border-green-200">
                  Active
                </span>
              </div>
              <p className="text-[10px] sm:text-[11px] text-[#7C6657]">
                {currentUser?.completed > 0
                  ? "Keep delivering to maintain your leaderboard rank!"
                  : "Deliver 1 order to jump onto the leaderboard podium!"}
              </p>
            </div>
          </div>

          <div className="text-right">
            <div className="text-sm sm:text-base font-black text-[#FF6600]">
              {currentUser?.completed || 0}{" "}
              <span className="text-xs text-[#7C6657] font-bold">Orders</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

/* =========================================================
   TOP PODIUM CARD COMPONENTS
========================================================= */

function ChampionCard({ rank, partner }) {
  if (!partner) return null;
  return (
    <div
      className="bg-white rounded-[24px] sm:rounded-[32px] border-2 border-[#FED7AA] shadow-[0_15px_35px_rgba(255,102,0,0.14)] p-3.5 sm:p-5 flex flex-col items-center text-center relative overflow-hidden w-full"
      style={{
        background: "linear-gradient(180deg, #FFFDF8 0%, #FFFFFF 100%)",
      }}
    >
      <div className="absolute -top-0.5 bg-[#FF6600] text-white px-3 py-0.5 rounded-b-xl text-[9px] font-black tracking-wider uppercase shadow-sm flex items-center gap-1">
        <Crown size={11} /> #{rank} Champion
      </div>

      <div className="w-9 h-9 rounded-full bg-[#FFEADB] text-[#FF6600] flex items-center justify-center font-black text-xs mt-3 mb-1.5 shadow-inner">
        #{rank}
      </div>

      <div
        className="w-13 h-13 sm:w-16 sm:h-16 rounded-2xl flex items-center justify-center text-white shadow-lg mb-2 p-3"
        style={{ background: HERO_GRADIENT }}
      >
        <Trophy size={26} />
      </div>

      <h4 className="text-xs sm:text-sm font-black text-[#2E1A0F] truncate w-full">
        {partner.name}
      </h4>

      <div className="mt-1 inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full bg-[#FFF5EC] border border-[#FED7AA] text-[10px] sm:text-[11px] font-extrabold text-[#FF6600]">
        <Sparkles size={11} />
        <span>{partner.completed} orders</span>
      </div>
    </div>
  );
}

function SilverCard({ rank, partner }) {
  if (!partner) return null;
  return (
    <div className="bg-white rounded-[22px] sm:rounded-[28px] border border-[#E2E8F0] shadow-sm p-3 sm:p-4 flex flex-col items-center text-center relative overflow-hidden w-full">
      <div className="w-8 h-8 rounded-full bg-gray-100 text-gray-600 flex items-center justify-center font-black text-xs mb-1.5 shadow-inner">
        #{rank}
      </div>
      <div className="w-12 h-12 sm:w-14 sm:h-14 rounded-2xl bg-[#F1F5F9] border-2 border-gray-300 flex items-center justify-center text-gray-700 shadow-sm mb-2">
        <User size={22} />
      </div>
      <h4 className="text-xs sm:text-sm font-black text-[#2E1A0F] truncate w-full">
        {partner.name}
      </h4>
      <div className="mt-1 inline-flex items-center gap-1 px-2 py-0.5 rounded-full bg-[#F8FAFC] border border-gray-200 text-[10px] sm:text-[11px] font-bold text-gray-700">
        <Package size={11} className="text-gray-500" />
        <span>{partner.completed} orders</span>
      </div>
    </div>
  );
}

function BronzeCard({ rank, partner }) {
  if (!partner) return null;
  return (
    <div className="bg-white rounded-[22px] sm:rounded-[28px] border border-[#FED7AA]/70 shadow-sm p-3 sm:p-4 flex flex-col items-center text-center relative overflow-hidden w-full">
      <div className="w-8 h-8 rounded-full bg-[#FFEADB]/70 text-[#C2410C] flex items-center justify-center font-black text-xs mb-1.5 shadow-inner">
        #{rank}
      </div>
      <div className="w-12 h-12 sm:w-14 sm:h-14 rounded-2xl bg-[#FFF7ED] border-2 border-[#FED7AA] flex items-center justify-center text-[#C2410C] shadow-sm mb-2">
        <User size={22} />
      </div>
      <h4 className="text-xs sm:text-sm font-black text-[#2E1A0F] truncate w-full">
        {partner.name}
      </h4>
      <div className="mt-1 inline-flex items-center gap-1 px-2 py-0.5 rounded-full bg-[#FFF7ED] border border-[#FED7AA]/60 text-[10px] sm:text-[11px] font-bold text-[#C2410C]">
        <Package size={11} className="text-[#C2410C]" />
        <span>{partner.completed} orders</span>
      </div>
    </div>
  );
}
