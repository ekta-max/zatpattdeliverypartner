// src/pages/DashboardPage.jsx
import React, { useState, useEffect, useContext, useRef } from "react";
import { useNavigate, useLocation } from "react-router-dom";
import {
  Star,
  MapPin,
  TrendingUp,
  Wallet,
  Clock,
  Package,
  Trophy,
  User,
  Power,
  CheckCircle2,
  AlertCircle,
  Navigation2,
  Bike,
  Sparkles,
  ArrowRight,
  ShieldCheck,
} from "lucide-react";
import Confetti from "react-confetti";
import { LanguageContext } from "../context/LanguageContext";
import { NotificationContext } from "../context/NotificationContext";
import { getDashboardData } from "../Services/dashboard";

/* =========================================================
   ZATPATAT THEME TOKENS
========================================================= */
const BRAND_ORANGE = "#FF6600";
const BRAND_GRADIENT = "linear-gradient(90deg, #FF6200 0%, #FFA800 100%)";
const HERO_GRADIENT = "linear-gradient(155deg, #FF6000 0%, #FF7A00 45%, #FFA600 100%)";
const TEXT_DARK = "#2E1A0F";
const TEXT_MUTED = "#7C6657";

const DELIVERY_PAYOUT = 20; // ₹ per delivered order

export default function DashboardPage() {
  const navigate = useNavigate();
  const location = useLocation();
  const { t } = useContext(LanguageContext || { t: (s) => s });
  const { addNotification } = useContext(
    NotificationContext || { addNotification: () => {} }
  );

  // UI & App state
  const [locationPopup, setLocationPopup] = useState(false);
  const [online, setOnline] = useState(() => {
    const saved = localStorage.getItem("partnerOnlineStatus");
    return saved === "true";
  });
  const [showConfetti, setShowConfetti] = useState(false);

  // Orders state
  const [orders, setOrders] = useState(() =>
    JSON.parse(localStorage.getItem("partner_orders") || "[]")
  );

  // Earnings state
  const [earnings, setEarnings] = useState(() => {
    const saved = JSON.parse(localStorage.getItem("partner_earnings") || "{}");
    return {
      daily: saved.daily || 0,
      total: saved.total || 0,
      rating: typeof saved.rating === "number" ? saved.rating : 4.9,
      lastReset: saved.lastReset || null,
    };
  });

  // Wallet state
  const [wallet, setWallet] = useState(() => {
    const saved = JSON.parse(localStorage.getItem("partner_wallet") || "{}");
    return { pending: saved.pending || 0 };
  });

  // Map refs
  const mapRef = useRef(null);
  const map = useRef(null);
  const riderMarker = useRef(null);

  /* ---------------- FETCH DASHBOARD DATA ---------------- */
  useEffect(() => {
    const fetchDashboard = async () => {
      try {
        const res = await getDashboardData();
        console.log("Dashboard API ✅", res);

        const d = res?.data?.[0];
        if (!d) return;

        setEarnings((prev) => ({
          ...prev,
          daily: d.today_earning || 0,
          total: d.total_earning || 0,
          rating: d.rating || 4.9,
        }));

        setWallet({
          pending: d.pending_balance || 0,
        });

        const formattedOrders = (d.recent_orders || []).map((o) => ({
          id: o.order_code,
          customer: `Customer #${o.customer}`,
          phone: "N/A",
          pickup: "Store pickup",
          drop: "Customer location",
          eta: "20-25 mins",
          status: o.status,
          amount: o.final_amount,
          isLive: o.is_live,
        }));

        setOrders(formattedOrders);
      } catch (err) {
        console.error("Dashboard API error ❌", err);
      }
    };

    fetchDashboard();
  }, []);

  /* ---------------- DAILY RESET LOGIC ---------------- */
  const todayDateStr = () => new Date().toISOString().slice(0, 10);

  const resetDailyIfNeeded = () => {
    const today = todayDateStr();
    if (earnings.lastReset !== today) {
      const updated = { ...earnings, daily: 0, lastReset: today };
      setEarnings(updated);
      localStorage.setItem("partner_earnings", JSON.stringify(updated));
    }
  };

  useEffect(() => {
    resetDailyIfNeeded();

    const now = new Date();
    const nextMidnight = new Date(now);
    nextMidnight.setHours(24, 0, 0, 0);
    const msToMidnight = nextMidnight.getTime() - now.getTime();

    const timeoutId = setTimeout(() => {
      const today = todayDateStr();
      const updated = { ...earnings, daily: 0, lastReset: today };
      setEarnings(updated);
      localStorage.setItem("partner_earnings", JSON.stringify(updated));

      const intervalId = setInterval(() => {
        const tStr = todayDateStr();
        const u = prevEarningsRef.current
          ? { ...prevEarningsRef.current, daily: 0, lastReset: tStr }
          : { daily: 0, total: earnings.total || 0, rating: 4.9, lastReset: tStr };

        setEarnings(u);
        localStorage.setItem("partner_earnings", JSON.stringify(u));
      }, 24 * 60 * 60 * 1000);

      window.__dashboard_daily_reset_interval = intervalId;
    }, msToMidnight);

    return () => {
      clearTimeout(timeoutId);
      if (window.__dashboard_daily_reset_interval) {
        clearInterval(window.__dashboard_daily_reset_interval);
        delete window.__dashboard_daily_reset_interval;
      }
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const prevEarningsRef = useRef(earnings);
  useEffect(() => {
    prevEarningsRef.current = earnings;
  }, [earnings]);

  /* ---------------- TOGGLE ONLINE ---------------- */
  const toggleOnline = async () => {
    if (!online) {
      try {
        const pos = await new Promise((resolve, reject) => {
          navigator.geolocation.getCurrentPosition(resolve, reject, {
            enableHighAccuracy: true,
            timeout: 10000,
          });
        });

        localStorage.setItem("partnerLat", pos.coords.latitude);
        localStorage.setItem("partnerLng", pos.coords.longitude);

        setShowConfetti(true);
        setTimeout(() => setShowConfetti(false), 3000);

        addNotification?.("You're online and ready for orders!");
        setOnline(true);
        localStorage.setItem("partnerOnlineStatus", "true");
      } catch (e) {
        setLocationPopup(true);
        setOnline(false);
      }
    } else {
      setOnline(false);
      localStorage.setItem("partnerOnlineStatus", "false");
      addNotification?.("You're now offline.");
    }
  };

  /* ---------------- GOOGLE MAPS SETUP ---------------- */
  useEffect(() => {
    if (window.google) {
      if (!map.current) initMap();
      return;
    }
    if (document.getElementById("gmaps-script")) {
      const maybeInit = () => {
        if (window.google && !map.current) initMap();
      };
      window.addEventListener("google-maps-loaded", maybeInit);
      return () => window.removeEventListener("google-maps-loaded", maybeInit);
    }

    const script = document.createElement("script");
    script.id = "gmaps-script";
    script.src = `https://maps.googleapis.com/maps/api/js?key=YOUR_GOOGLE_MAPS_API_KEY`;
    script.async = true;
    script.onload = () => {
      initMap();
      try {
        window.dispatchEvent(new Event("google-maps-loaded"));
      } catch {}
    };
    document.body.appendChild(script);
  }, []);

  const initMap = () => {
    if (!mapRef.current) return;
    map.current = new window.google.maps.Map(mapRef.current, {
      center: { lat: 19.072, lng: 72.877 },
      zoom: 15,
      disableDefaultUI: true,
    });
  };

  // Live GPS tracking
  useEffect(() => {
    if (!online || !navigator.geolocation) return;

    const id = navigator.geolocation.watchPosition(
      (pos) => {
        const { latitude, longitude } = pos.coords;

        if (map.current) {
          if (!riderMarker.current) {
            riderMarker.current = new window.google.maps.Marker({
              position: { lat: latitude, lng: longitude },
              map: map.current,
              icon: {
                url: "/bike.png",
                scaledSize: new window.google.maps.Size(42, 42),
              },
            });
          } else {
            riderMarker.current.setPosition({ lat: latitude, lng: longitude });
          }
          map.current.setCenter({ lat: latitude, lng: longitude });
        }

        localStorage.setItem("partnerLat", latitude);
        localStorage.setItem("partnerLng", longitude);
      },
      (err) => console.log("watchPosition error:", err),
      { enableHighAccuracy: true }
    );

    return () => navigator.geolocation.clearWatch(id);
  }, [online]);

  return (
    <div
      className="min-h-screen w-full flex flex-col justify-between pb-24 text-[#2E1A0F] select-none"
      style={{
        backgroundColor: "#FAF6F0",
        backgroundImage: `
          radial-gradient(circle at 10% 15%, rgba(255, 230, 205, 0.7) 0%, transparent 40%),
          radial-gradient(circle at 92% 25%, rgba(255, 226, 195, 0.75) 0%, transparent 38%),
          radial-gradient(circle at 85% 85%, rgba(255, 234, 212, 0.55) 0%, transparent 35%)
        `,
      }}
    >
      {showConfetti && <Confetti numberOfPieces={160} recycle={false} />}

      {/* ================= TOP HERO HEADER ================= */}
      <header
        className="sticky top-0 z-40 text-white shadow-md"
        style={{ background: HERO_GRADIENT }}
      >
        <div className="max-w-5xl mx-auto px-4 sm:px-6 py-3.5 flex items-center justify-between">
          <div className="flex items-center gap-2.5">
            <div className="w-10 h-10 rounded-2xl bg-white/20 backdrop-blur-md border border-white/25 flex items-center justify-center text-white">
              <Bike size={20} />
            </div>
            <div>
              <div className="inline-flex items-center gap-1.5 px-2 py-0.5 rounded-full bg-white/20 backdrop-blur-md border border-white/25">
                <span className="w-1.5 h-1.5 rounded-full bg-white animate-pulse" />
                <span className="text-[9px] font-black tracking-[1.2px] uppercase">
                  Zatpatt Fleet
                </span>
              </div>
              <h1 className="text-base sm:text-lg font-black leading-tight mt-0.5">
                Partner Dashboard
              </h1>
            </div>
          </div>

          {/* Quick Profile Button */}
          <button
            onClick={() => navigate("/profile")}
            className="w-10 h-10 rounded-2xl bg-white/20 hover:bg-white/30 backdrop-blur-md border border-white/25 flex items-center justify-center transition active:scale-95"
          >
            <User size={19} />
          </button>
        </div>
      </header>

      {/* ================= MAIN CONTENT ================= */}
      <main className="max-w-5xl w-full mx-auto px-3 sm:px-6 py-4 sm:py-6 space-y-4 sm:space-y-5">
        
        {/* ================= DUTY STATUS CARD ================= */}
        <div className="bg-white rounded-[24px] sm:rounded-[30px] p-4 sm:p-5 shadow-[0_15px_40px_rgba(100,50,15,0.06)] border border-[#F3E7DC] flex items-center justify-between gap-4">
          <div className="flex items-center gap-3">
            <div
              className={`w-11 h-11 rounded-2xl flex items-center justify-center transition-all ${
                online
                  ? "bg-green-50 border border-green-200 text-green-600"
                  : "bg-[#FAF8F5] border border-[#F3E7DC] text-[#7C6657]"
              }`}
            >
              <Power size={20} className={online ? "animate-pulse" : ""} />
            </div>
            <div>
              <div className="flex items-center gap-1.5">
                <span
                  className={`w-2 h-2 rounded-full ${
                    online ? "bg-green-500 animate-ping" : "bg-gray-400"
                  }`}
                />
                <h3 className="text-sm sm:text-base font-black text-[#2E1A0F]">
                  {online ? "You are Online" : "You are Offline"}
                </h3>
              </div>
              <p className="text-[11px] text-[#7C6657] mt-0.5">
                {online
                  ? "Ready to receive live orders nearby"
                  : "Go online to start earning surge payouts"}
              </p>
            </div>
          </div>

          {/* TOGGLE SWITCH */}
          <div
            onClick={toggleOnline}
            className={`w-16 h-8 sm:w-20 sm:h-9 flex items-center rounded-full p-1 cursor-pointer transition-colors shadow-inner ${
              online ? "bg-[#FF6600]" : "bg-gray-200"
            }`}
          >
            <div
              className={`w-6 h-6 sm:w-7 sm:h-7 bg-white rounded-full shadow-md transform transition-transform duration-300 flex items-center justify-center ${
                online
                  ? "translate-x-8 sm:translate-x-11 text-[#FF6600]"
                  : "translate-x-0 text-gray-400"
              }`}
            >
              <Power size={13} />
            </div>
          </div>
        </div>

        {/* ================= EARNINGS 4-CARD GRID ================= */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-3 sm:gap-4">
          <StatCard
            icon={<TrendingUp size={18} />}
            title="Today's Earnings"
            value={`₹${earnings.daily || 0}`}
            badge="Daily"
          />
          <StatCard
            icon={<Wallet size={18} />}
            title="Total Earnings"
            value={`₹${earnings.total || 0}`}
            badge="All-time"
          />
          <StatCard
            icon={<Clock size={18} />}
            title="Pending Balance"
            value={`₹${wallet.pending || 0}`}
            badge="To Payout"
          />
          <StatCard
            icon={<Star size={18} />}
            title="Partner Rating"
            value={`${earnings.rating || 4.9} ★`}
            badge="Top Fleet"
          />
        </div>

        {/* ================= LIVE MAP SECTION ================= */}
        <div className="bg-white rounded-[24px] sm:rounded-[30px] p-3 sm:p-4 shadow-[0_15px_40px_rgba(100,50,15,0.06)] border border-[#F3E7DC] space-y-2.5">
          <div className="flex items-center justify-between px-2 pt-1">
            <div className="flex items-center gap-2">
              <div className="w-7 h-7 rounded-lg bg-[#FFF5EC] border border-[#FED7AA] flex items-center justify-center text-[#FF6600]">
                <MapPin size={15} />
              </div>
              <h3 className="text-xs sm:text-sm font-black text-[#2E1A0F]">
                Live Hotspot & GPS Tracking
              </h3>
            </div>
            <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-[#FFF5EC] border border-[#FED7AA] text-[#FF6600]">
              {online ? "GPS Active" : "GPS Inactive"}
            </span>
          </div>

          <div
            className="w-full h-52 sm:h-64 rounded-2xl border border-[#F3E7DC] overflow-hidden bg-[#FAF8F5] relative shadow-inner"
            ref={mapRef}
          >
            {/* Fallback overlay if map isn't rendered or is offline */}
            {!online && (
              <div className="absolute inset-0 bg-white/70 backdrop-blur-[2px] flex flex-col items-center justify-center p-4 text-center z-10">
                <Bike size={32} className="text-[#FF6600] mb-2 animate-bounce" />
                <p className="text-xs font-black text-[#2E1A0F]">
                  Go online to view live order routes
                </p>
                <p className="text-[10px] text-[#7C6657] mt-0.5">
                  Your GPS position will update in real-time
                </p>
              </div>
            )}
          </div>
        </div>

        {/* ================= RECENT ORDERS LIST ================= */}
        <div className="bg-white rounded-[24px] sm:rounded-[30px] p-4 sm:p-6 shadow-[0_15px_40px_rgba(100,50,15,0.06)] border border-[#F3E7DC] space-y-3.5">
          <div className="flex items-center justify-between border-b border-[#F3E7DC]/70 pb-3">
            <div className="flex items-center gap-2">
              <div className="w-8 h-8 rounded-xl bg-[#FFF5EC] border border-[#FED7AA] flex items-center justify-center text-[#FF6600]">
                <Package size={17} />
              </div>
              <div>
                <h3 className="text-sm sm:text-base font-black text-[#2E1A0F]">
                  Recent Orders
                </h3>
                <p className="text-[10px] text-[#7C6657]">
                  Showing latest active & completed deliveries
                </p>
              </div>
            </div>

            <button
              onClick={() => navigate("/orders")}
              className="inline-flex items-center gap-1 text-xs font-black text-[#FF6600] hover:underline"
            >
              <span>View All</span>
              <ArrowRight size={13} />
            </button>
          </div>

          {orders.length === 0 ? (
            <div className="py-8 text-center bg-[#FAF8F5] rounded-2xl border border-[#F3E7DC]">
              <Package size={32} className="mx-auto text-[#FF6600]/40 mb-1.5" />
              <p className="text-xs font-bold text-[#7C6657]">No active orders right now</p>
              <p className="text-[10px] text-gray-400 mt-0.5">
                New delivery tasks will appear here as soon as they are assigned.
              </p>
            </div>
          ) : (
            <div className="space-y-2.5">
              {orders.slice(0, 5).map((order) => (
                <OrderCard key={order.id} order={order} />
              ))}
            </div>
          )}
        </div>
      </main>

      {/* ================= LOCATION POPUP MODAL ================= */}
      {locationPopup && (
        <div className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center z-50 p-4">
          <div className="bg-white p-6 rounded-[28px] sm:rounded-[32px] w-full max-w-sm shadow-2xl border border-[#F3E7DC] text-center">
            <div className="w-12 h-12 rounded-2xl bg-[#FFF5EC] border border-[#FED7AA] text-[#FF6600] flex items-center justify-center mx-auto mb-3 shadow-sm">
              <MapPin size={24} />
            </div>
            <h2 className="text-base font-black text-[#2E1A0F]">
              Location Access Required
            </h2>
            <p className="text-xs text-[#7C6657] my-2 leading-relaxed">
              Please enable device GPS permissions so Zatpatt can assign nearby delivery orders and calculate trip earnings.
            </p>
            <button
              onClick={() => setLocationPopup(false)}
              className="mt-2 w-full h-[46px] rounded-xl text-white font-extrabold text-xs sm:text-sm shadow-md transition active:scale-95"
              style={{
                background: BRAND_GRADIENT,
                boxShadow: "0 8px 20px rgba(255,98,0,0.24)",
              }}
            >
              Allow & Continue
            </button>
          </div>
        </div>
      )}

      {/* ================= FIXED BOTTOM DOCKED NAVIGATION ================= */}
      <nav className="fixed bottom-0 left-0 right-0 z-40 bg-white/95 backdrop-blur-md border-t border-[#F3E7DC] shadow-[0_-10px_25px_rgba(100,50,15,0.05)] py-2 px-3">
        <div className="max-w-md mx-auto grid grid-cols-4 gap-1">
          <NavButton
            label="Orders"
            icon={<Package size={19} />}
            path="/orders"
            active={location.pathname === "/orders"}
            onClick={() => navigate("/orders")}
          />
          <NavButton
            label="Earnings"
            icon={<Wallet size={19} />}
            path="/earnings"
            active={location.pathname === "/earnings"}
            onClick={() => navigate("/earnings")}
          />
          <NavButton
            label="Ranks"
            icon={<Trophy size={19} />}
            path="/leaderboard"
            active={location.pathname === "/leaderboard"}
            onClick={() => navigate("/leaderboard")}
          />
          <NavButton
            label="Profile"
            icon={<User size={19} />}
            path="/profile"
            active={location.pathname === "/profile"}
            onClick={() => navigate("/profile")}
          />
        </div>
      </nav>
    </div>
  );
}

/* =========================================================
   SUB-COMPONENTS
========================================================= */

function StatCard({ icon, title, value, badge }) {
  return (
    <div className="bg-white p-3.5 sm:p-4 rounded-2xl sm:rounded-[24px] shadow-[0_10px_30px_rgba(100,50,15,0.04)] border border-[#F3E7DC] flex flex-col justify-between">
      <div className="flex items-center justify-between mb-2">
        <div className="w-8 h-8 rounded-xl bg-[#FFF5EC] border border-[#FED7AA] flex items-center justify-center text-[#FF6600]">
          {icon}
        </div>
        {badge && (
          <span className="text-[9px] font-extrabold text-[#7C6657] bg-[#FAF8F5] border border-[#F3E7DC] px-1.5 py-0.5 rounded-full">
            {badge}
          </span>
        )}
      </div>
      <div>
        <div className="text-[10px] sm:text-[11px] font-bold text-[#7C6657] truncate">
          {title}
        </div>
        <div className="text-base sm:text-xl font-black text-[#2E1A0F] mt-0.5 truncate">
          {value}
        </div>
      </div>
    </div>
  );
}

function OrderCard({ order }) {
  const isDelivered = order.status?.toLowerCase() === "delivered";

  return (
    <div className="rounded-2xl p-3.5 border border-[#F3E7DC] bg-[#FFFDFB] shadow-sm hover:shadow-md transition-all">
      <div className="flex justify-between items-center">
        <div className="flex items-center gap-2">
          <div className="w-8 h-8 rounded-xl bg-[#FFF5EC] text-[#FF6600] flex items-center justify-center font-black text-xs">
            #{order.id?.slice(-3) || "01"}
          </div>
          <div>
            <div className="font-extrabold text-xs sm:text-sm text-[#2E1A0F]">
              Order #{order.id}
            </div>
            <div className="text-[10px] text-[#7C6657] flex items-center gap-1">
              <span>{order.customer}</span>
              <span>•</span>
              <span>{order.eta || "20 mins"}</span>
            </div>
          </div>
        </div>

        <div className="text-right">
          <div className="text-sm font-black text-[#FF6600]">
            ₹{order.amount || "0"}
          </div>
          <span
            className={`inline-block text-[9px] font-bold px-2 py-0.5 rounded-full mt-0.5 ${
              isDelivered
                ? "bg-green-50 text-green-700 border border-green-200"
                : "bg-[#FFF5EC] text-[#FF6600] border border-[#FED7AA]"
            }`}
          >
            {order.status || "Assigned"}
          </span>
        </div>
      </div>

      {order.isLive && (
        <div className="mt-2 pt-2 border-t border-[#F3E7DC]/60 flex items-center justify-between text-[11px] font-bold text-green-600">
          <span className="flex items-center gap-1.5">
            <span className="w-2 h-2 rounded-full bg-green-500 animate-ping" />
            Live Delivery in Progress
          </span>
          <span className="text-[#FF6600] flex items-center gap-1">
            Navigate <Navigation2 size={11} />
          </span>
        </div>
      )}
    </div>
  );
}

function NavButton({ label, icon, active, onClick }) {
  return (
    <button
      type="button"
      onClick={onClick}
      className={`flex flex-col items-center justify-center py-1.5 px-2 rounded-xl transition-all ${
        active
          ? "text-[#FF6600] font-black bg-[#FFF5EC]"
          : "text-[#7C6657] font-bold hover:text-[#2E1A0F]"
      }`}
    >
      <div className={`${active ? "scale-110" : "scale-100"} transition-transform`}>
        {icon}
      </div>
      <span className="text-[10px] mt-0.5">{label}</span>
    </button>
  );
}
