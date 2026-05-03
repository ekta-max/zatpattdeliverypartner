// src/pages/DashboardPage.jsx
import React, { useState, useEffect, useContext, useRef } from "react";
import { Star, Phone, MessageCircle, Navigation2 } from "lucide-react";
import { useNavigate } from "react-router-dom";
import { LanguageContext } from "../context/LanguageContext";
import { NotificationContext } from "../context/NotificationContext";
import Confetti from "react-confetti";
import { getDashboardData } from "../Services/dashboard";


/**
 * Delivery partner dashboard
 * - Today's earnings reset at midnight (option A selected)
 * - Total earnings accumulate forever
 * - Pending balance = amount admin still needs to pay to partner
 * - Earnings are saved to localStorage under "partner_earnings"
 * - Pending stored under "partner_wallet" as { pending: number }
 *
 * Notes:
 * - Replace YOUR_GOOGLE_MAPS_API_KEY with your actual key
 * - Put /bike.png, /pickup-pin.png and /drop-pin.png into public/
 * - Per-delivery payout (used here) is ₹20 — change DELIVERY_PAYOUT if needed
 */

const DELIVERY_PAYOUT = 20; // ₹ per delivered order (change if required)

// function optimizeRoute(orders, startLat, startLng) {
//   const remaining = [...orders];
//   const route = [];
//   let current = { lat: startLat, lng: startLng };

//   while (remaining.length) {
//     let nearestIndex = 0;
//     let nearestDistance = Number.MAX_VALUE;

//     remaining.forEach((o, idx) => {
//       const dLat = current.lat - o.pickupLat;
//       const dLng = current.lng - o.pickupLng;
//       const dist = Math.sqrt(dLat * dLat + dLng * dLng);

//       if (dist < nearestDistance) {
//         nearestDistance = dist;
//         nearestIndex = idx;
//       }
//     });

//     const nextOrder = remaining.splice(nearestIndex, 1)[0];
//     route.push(nextOrder);
//     current = { lat: nextOrder.dropLat, lng: nextOrder.dropLng };
//   }

//   return route;
// }

export default function DashboardPage() {
  const navigate = useNavigate();
  const { t } = useContext(LanguageContext);
  const { addNotification } = useContext(NotificationContext);
  // const [dashboardData, setDashboardData] = useState(null);


 useEffect(() => {
  const fetchDashboard = async () => {
    try {
      const res = await getDashboardData();

      console.log("Dashboard API ✅", res);

      const d = res?.data?.[0];
      if (!d) return;

      // ✅ Earnings mapping
      setEarnings((prev) => ({
        ...prev,
        daily: d.today_earning || 0,
        total: d.total_earning || 0,
        rating: 0,
      }));

      // ✅ Wallet mapping
      setWallet({
        pending: d.pending_balance || 0,
      });

      // ✅ 🔥 TRANSFORM ORDERS FOR UI
      const formattedOrders = (d.recent_orders || []).map((o) => ({
        id: o.order_code,
        customer: `Customer #${o.customer}`,
        phone: "N/A",
        pickup: "Pickup location",
        drop: "Delivery location",
        eta: "—",
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


  // UI state
  const [locationPopup, setLocationPopup] = useState(false);
  const [online, setOnline] = useState(() => {
    const saved = localStorage.getItem("partnerOnlineStatus");
    return saved === "true"; // default false if not set
  });
  const [showConfetti, setShowConfetti] = useState(false);

  // Orders (persisted)
  const [orders, setOrders] = useState(() =>
    JSON.parse(localStorage.getItem("partner_orders") || "[]")
  );

  // Earnings shape stored in localStorage as partner_earnings:
  // { daily: number, total: number, rating: number (optional), lastReset: "YYYY-MM-DD" }
  const [earnings, setEarnings] = useState(() => {
    const saved = JSON.parse(localStorage.getItem("partner_earnings") || "{}");
    return {
      daily: saved.daily || 0,
      total: saved.total || 0,
      rating: typeof saved.rating === "number" ? saved.rating : 0,
      lastReset: saved.lastReset || null,
    };
  });

  // Wallet shape stored in localStorage as partner_wallet:
  // { pending: number }
  const [wallet, setWallet] = useState(() => {
    const saved = JSON.parse(localStorage.getItem("partner_wallet") || "{}");
    return { pending: saved.pending || 0 };
  });

  // Map & tracking refs
  const mapRef = useRef(null);
  const map = useRef(null);
  const riderMarker = useRef(null);
  const pickupMarkers = useRef([]);
  const dropMarkers = useRef([]);
  const polyline = useRef(null);

  // -------------------------
  // --- DAILY RESET LOGIC ---
  // -------------------------
  // helper to get YYYY-MM-DD for local date
  const todayDateStr = () => {
    const d = new Date();
    return d.toISOString().slice(0, 10); // YYYY-MM-DD (UTC time may differ but ok for local simple reset)
  };

  // Reset today's earnings if lastReset is not today
  const resetDailyIfNeeded = () => {
    const today = todayDateStr();
    if (earnings.lastReset !== today) {
      const updated = { ...earnings, daily: 0, lastReset: today };
      setEarnings(updated);
      localStorage.setItem("partner_earnings", JSON.stringify(updated));
    }
  };

  // on mount ensure daily is reset if required and schedule next midnight reset
  useEffect(() => {
    // initial check
    resetDailyIfNeeded();

    // schedule a timeout until next local midnight, then set interval every 24h
    const now = new Date();
    const nextMidnight = new Date(now);
    nextMidnight.setHours(24, 0, 0, 0);
    const msToMidnight = nextMidnight.getTime() - now.getTime();

    const timeoutId = setTimeout(() => {
      // reset at midnight
      const today = todayDateStr();
      const updated = { ...earnings, daily: 0, lastReset: today };
      setEarnings(updated);
      localStorage.setItem("partner_earnings", JSON.stringify(updated));

      // afterwards set an interval that fires every 24h
      const intervalId = setInterval(() => {
        const t = todayDateStr();
        const u = prevEarningsRef.current
          ? { ...prevEarningsRef.current, daily: 0, lastReset: t }
          : { daily: 0, total: earnings.total || 0, rating: earnings.rating || 0, lastReset: t };

        setEarnings(u);
        localStorage.setItem("partner_earnings", JSON.stringify(u));
      }, 24 * 60 * 60 * 1000);

      // store interval id on window so we can clear if needed (component unmount)
      window.__dashboard_daily_reset_interval = intervalId;
    }, msToMidnight);

    // keep previous earnings in ref so the interval callback (if created) can access latest
    return () => {
      clearTimeout(timeoutId);
      if (window.__dashboard_daily_reset_interval) {
        clearInterval(window.__dashboard_daily_reset_interval);
        delete window.__dashboard_daily_reset_interval;
      }
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []); // run once

  // small ref to allow interval to access latest earnings if needed
  const prevEarningsRef = useRef(earnings);
  useEffect(() => {
    prevEarningsRef.current = earnings;
  }, [earnings]);

  // -------------------------
  // --- TOGGLE ONLINE (with GPS) ---
  // -------------------------
  const toggleOnline = async () => {
    if (!online) {
      // Going online: require location permission
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

        addNotification("You're online and ready for orders!");

        setOnline(true);
        localStorage.setItem("partnerOnlineStatus", "true");
      } catch (e) {
        setLocationPopup(true);
        setOnline(false);
      }
    } else {
      // Going offline
      setOnline(false);
      localStorage.setItem("partnerOnlineStatus", "false");
      addNotification("You're now offline.");
    }
  };

  // -------------------------
  // --- ORDER SIMULATION ---
  // -------------------------
  // useEffect(() => {
  //   const interval = setInterval(() => {
  //     if (!online) return;

  //     const newOrder = {
  //       id: Date.now(),
  //       customer: `Customer ${Math.floor(Math.random() * 100)}`,
  //       phone: "9876543210",
  //       pickup: "123 Main St, City",
  //       drop: "456 Market St, City",
  //       pickupLat: 19.072 + Math.random() * 0.01,
  //       pickupLng: 72.877 + Math.random() * 0.01,
  //       dropLat: 19.076 + Math.random() * 0.01,
  //       dropLng: 72.882 + Math.random() * 0.01,
  //       items: ["Item A", "Item B"],
  //       status: "Assigned",
  //       eta: "25 mins",
  //       timestamp: new Date().toLocaleTimeString(),
  //     };

  //     setOrders((prev) => {
  //       const updated = [newOrder, ...prev];
  //       localStorage.setItem("partner_orders", JSON.stringify(updated));
  //       return updated;
  //     });

  //     addNotification(`New order assigned: #${newOrder.id}`);
  //   }, 15000);

  //   return () => clearInterval(interval);
  // }, [online, addNotification]);

  // -------------------------
  // --- UPDATE ORDER STATUS ---
  // -------------------------
  const updateOrderStatus = (id, newStatus) => {
    // If delivered, update pending, daily and total (and persist)
    if (newStatus === "Delivered") {
      // Update wallet.pending
      setWallet((prev) => {
        const updated = { pending: (prev.pending || 0) + DELIVERY_PAYOUT };
        localStorage.setItem("partner_wallet", JSON.stringify(updated));
        return updated;
      });

      // Update earnings: daily and total
      setEarnings((prev) => {
        // ensure daily reset check: if lastReset not today, reset daily to 0 first
        const today = todayDateStr();
        let currentDaily = prev.daily || 0;
        let lastReset = prev.lastReset || today;
        if (lastReset !== today) {
          currentDaily = 0;
          lastReset = today;
        }

        const updated = {
          ...prev,
          daily: currentDaily + DELIVERY_PAYOUT,
          total: (prev.total || 0) + DELIVERY_PAYOUT,
          lastReset,
          rating: prev.rating || 0,
        };

        localStorage.setItem("partner_earnings", JSON.stringify(updated));
        return updated;
      });
    }

    // Update orders array
    setOrders((prev) => {
      const updated = prev.map((o) => (o.id === id ? { ...o, status: newStatus } : o));
      localStorage.setItem("partner_orders", JSON.stringify(updated));
      addNotification(`Order #${id} updated to ${newStatus}`);
      return updated;
    });
  };

  // -------------------------
  // --- NAVIGATION HELPER ---
  // -------------------------
  // const openNavigation = (ordersArr) => {
  //   if (!ordersArr.length) return;
  //   const first = ordersArr[0];
  //   const last = ordersArr[ordersArr.length - 1];

  //   const url = `https://www.google.com/maps/dir/?api=1&origin=${first.pickupLat},${first.pickupLng}&destination=${last.dropLat},${last.dropLng}`;
  //   window.open(url, "_blank");
  // };

  // -------------------------
  // --- OPTIMIZED ORDERS ---
  // -------------------------
  // const optimizedOrders = optimizeRoute(
  //   orders.filter((o) => o.status !== "Delivered"),
  //   19.072,
  //   72.877
  // );

  // -------------------------
  // --- GOOGLE MAP SETUP ---
  // -------------------------
  // Load script once
  useEffect(() => {
    if (window.google) {
      if (!map.current) initMap(); // init map if not done
      return;
    }
    if (document.getElementById("gmaps-script")) {
      // script exists but google might not be ready yet
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
      // dispatch custom event in case multiple listeners want it
      try {
        window.dispatchEvent(new Event("google-maps-loaded"));
      } catch {}
    };
    document.body.appendChild(script);

    return () => {
      // we don't remove the script because reloading can be expensive
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const initMap = () => {
    if (!mapRef.current) return;
    map.current = new window.google.maps.Map(mapRef.current, {
      center: { lat: 19.072, lng: 72.877 },
      zoom: 15,
    });
  };

  // Live rider tracking — watchPosition while online
  useEffect(() => {
    if (!online || !navigator.geolocation) return;

    const id = navigator.geolocation.watchPosition(
      (pos) => {
        const { latitude, longitude } = pos.coords;

        // create or move rider marker
        if (map.current) {
          if (!riderMarker.current) {
            riderMarker.current = new window.google.maps.Marker({
              position: { lat: latitude, lng: longitude },
              map: map.current,
              icon: {
                url: "/bike.png",
                scaledSize: new window.google.maps.Size(45, 45),
              },
            });
          } else {
            riderMarker.current.setPosition({ lat: latitude, lng: longitude });
          }

          map.current.setCenter({ lat: latitude, lng: longitude });
        }

        // persist last known
        localStorage.setItem("partnerLat", latitude);
        localStorage.setItem("partnerLng", longitude);
      },
      (err) => {
        console.log("watchPosition error:", err);
      },
      { enableHighAccuracy: true }
    );

    return () => navigator.geolocation.clearWatch(id);
  }, [online]);

  // Add pickup/drop markers and polyline for optimized orders (max 5)
  // useEffect(() => {
  //   if (!map.current || !window.google) return;

  //   // clear old markers
  //   pickupMarkers.current.forEach((m) => m.setMap(null));
  //   dropMarkers.current.forEach((m) => m.setMap(null));
  //   pickupMarkers.current = [];
  //   dropMarkers.current = [];

  //   optimizedOrders.slice(0, 5).forEach((o) => {
  //     const pickup = new window.google.maps.Marker({
  //       position: { lat: o.pickupLat, lng: o.pickupLng },
  //       map: map.current,
  //       icon: { url: "/pickup-pin.png", scaledSize: new window.google.maps.Size(40, 40) },
  //     });

  //     const drop = new window.google.maps.Marker({
  //       position: { lat: o.dropLat, lng: o.dropLng },
  //       map: map.current,
  //       icon: { url: "/drop-pin.png", scaledSize: new window.google.maps.Size(40, 40) },
  //     });

  //     pickupMarkers.current.push(pickup);
  //     dropMarkers.current.push(drop);
  //   });

  //   const path = optimizedOrders.slice(0, 5).flatMap((o) => [
  //     { lat: o.pickupLat, lng: o.pickupLng },
  //     { lat: o.dropLat, lng: o.dropLng },
  //   ]);

  //   if (polyline.current) polyline.current.setMap(null);

  //   if (path.length) {
  //     polyline.current = new window.google.maps.Polyline({
  //       path,
  //       strokeColor: "#ff6600",
  //       strokeWeight: 5,
  //       map: map.current,
  //     });
  //   }
  // }, [optimizedOrders]);

  // -------------------------
  // --- UI RENDERING ---
  // -------------------------
  return (
    <div className="min-h-screen bg-orange-50 pb-24">
      {showConfetti && <Confetti />}

      {/* HEADER */}
      <div className="bg-orange-500 text-white py-4 px-4 text-center shadow-md">
        <h1 className="text-lg font-bold">{t("dashboard")}</h1>
      </div>

      <div className="p-5 space-y-6">
        {/* ONLINE STATUS */}
        <div className="bg-white p-4 rounded-2xl shadow flex justify-between items-center">
          <span className="font-semibold">Status:</span>

          <div className="flex items-center gap-2">
            <div
              onClick={toggleOnline}
              className={`w-16 h-8 flex items-center rounded-full p-1 cursor-pointer transition ${
                online ? "bg-orange-400" : "bg-gray-300"
              }`}
            >
              <div
                className={`w-6 h-6 bg-white rounded-full transform transition ${
                  online ? "translate-x-8" : "translate-x-0"
                }`}
              />
            </div>

            <span className={`font-semibold ${online ? "text-orange-500" : "text-gray-500"}`}>
              {online ? "Online" : "Offline"}
            </span>
          </div>
        </div>

        {/* EARNINGS GRID */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          <Card title="Today's Earnings" value={`₹${earnings.daily || 0}`} />
          <Card title="Total Earnings" value={`₹${earnings.total || 0}`} />
          <Card title="Pending Balance" value={`₹${wallet.pending || 0}`} />
          <Card title="Rating" value={<>{earnings.rating || 0} ⭐</>} />
        </div>

        {/* LIVE MAP */}
        <div className="w-full h-64 rounded-2xl shadow overflow-hidden" ref={mapRef} />

        {/* ORDERS LIST (show only recent 5 optimized) */}
        <div className="bg-white p-4 rounded-2xl shadow space-y-4">
          <h3 className="text-lg font-semibold">Recent Orders (5)</h3>

          {orders.length === 0 ? (
            <p className="text-gray-400">No active orders</p>
          ) : (
           orders.slice(0, 5).map((order) => (
              <OrderCard
              key={order.id}
              order={order}
            />
            ))
          )}
        </div>
      </div>

      {/* LOCATION POPUP */}
      {locationPopup && (
        <div className="fixed inset-0 bg-orange-50 bg-opacity-40 flex items-center justify-center z-50">
          <div className="bg-white p-6 rounded-2xl w-80 shadow-lg text-center">
            <h2 className="text-lg font-bold">📍 Location Required</h2>
            <p className="text-sm text-gray-600 my-3">Enable location access to accept delivery orders.</p>
            <button onClick={() => setLocationPopup(false)} className="bg-orange-500 text-white px-4 py-2 rounded-full">
              OK
            </button>
          </div>
        </div>
      )}

      {/* FIXED FOOTER */}
      <div className="fixed bottom-0 left-0 right-0 bg-white shadow-lg border-t flex justify-around py-2">
        <FooterBtn label="Orders" icon="📦" path="/orders" />
        <FooterBtn label="Earnings" icon="💰" path="/earnings" />
        <FooterBtn label="Leaderboard" icon="🏆" path="/leaderboard" />
        <FooterBtn label="Profile" icon="👤" path="/profile" />
      </div>
    </div>
  );
}

/* ---------------- small components ---------------- */

function Card({ title, value }) {
  return (
    <div className="bg-white p-4 rounded-2xl shadow text-center">
      <div className="text-sm text-gray-500">{title}</div>
      <div className="text-2xl font-bold">{value}</div>
    </div>
  );
}

function FooterBtn({ label, icon, path }) {
  const navigate = useNavigate();
  return (
    <button onClick={() => navigate(path)} className="flex flex-col items-center text-xs font-semibold">
      <span>{icon}</span>
      <span>{label}</span>
    </button>
  );
}

function OrderCard({ order }) {
  return (
    <div className="border rounded-xl p-4 shadow-sm bg-white">
      <div className="flex justify-between items-center">
        <div className="font-semibold text-gray-800">
          {order.id}
        </div>
        <div className="text-sm font-semibold text-orange-500">
          ₹{order.amount}
        </div>
      </div>

      <div className="text-sm text-gray-600 mt-1">
        Status: <span className="capitalize">{order.status}</span>
      </div>

      {order.isLive && (
        <div className="text-xs text-green-600 font-semibold mt-2">
          ● Live Order
        </div>
      )}
    </div>
  );
}


// function Btn({ text, color, onClick }) {
//   return (
//     <button className={`${color} text-white rounded px-3 py-1 text-sm`} onClick={onClick}>
//       {text}
//     </button>
//   );
// }
