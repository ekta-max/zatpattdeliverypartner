// src/pages/OrdersPage.jsx

import React, { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { ArrowLeft, Phone, MapPin, X } from "lucide-react";

import {
  getOrdersByStatus,
  acceptOrderApi,
  markPickedUpApi,
  verifyDeliveryOtpApi,
  markDeliveredApi,
} from "../Services/orders";

export default function OrdersPage() {
  const navigate = useNavigate();

  const [activeTab, setActiveTab] = useState("new");
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);

  // OTP states
  const [showOtpModal, setShowOtpModal] = useState(false);
  const [selectedOrderId, setSelectedOrderId] = useState(null);
  const [otp, setOtp] = useState("");
  const [verifyingOtp, setVerifyingOtp] = useState(false);

  const tabs = [
    { label: "New", value: "new" },
    { label: "Accepted", value: "accepted" },
    { label: "Picked Up", value: "picked-up" },
    { label: "Delivered", value: "delivered" },
  ];

  // ---------------- FETCH ORDERS ----------------
  const fetchOrders = async (status = "new") => {
    try {
      setLoading(true);

      const res = await getOrdersByStatus(status);
      const list = res?.data || [];

      setOrders(list);
    } catch (error) {
      console.error("Orders API error ❌", error);
      setOrders([]);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchOrders(activeTab);
  }, [activeTab]);

  // ---------------- ACCEPT ----------------
  const handleAccept = async (id) => {
    try {
      await acceptOrderApi(id);

      setActiveTab("accepted");
      fetchOrders("accepted");
    } catch (error) {
      console.error("Accept error ❌", error);
    }
  };

  // ---------------- PICKED UP ----------------
  const handlePickedUp = async (id) => {
    try {
      await markPickedUpApi(id);

      setActiveTab("picked-up");
      fetchOrders("picked-up");
    } catch (error) {
      console.error("Picked Up error ❌", error);
    }
  };

  // ---------------- OPEN OTP ----------------
  const openOtpModal = (id) => {
    setSelectedOrderId(id);
    setOtp("");
    setShowOtpModal(true);
  };

  // ---------------- VERIFY OTP + DELIVER ----------------
  const handleVerifyOtp = async () => {
    if (otp.length < 4) {
      alert("Enter valid OTP");
      return;
    }

    try {
      setVerifyingOtp(true);

      await verifyDeliveryOtpApi({
        orderId: selectedOrderId,
        otp,
      });

      await markDeliveredApi(selectedOrderId);

      setShowOtpModal(false);
      setSelectedOrderId(null);
      setOtp("");

      setActiveTab("delivered");
      fetchOrders("delivered");
    } catch (error) {
      console.error("OTP Verify error ❌", error);
      alert("Invalid OTP");
    } finally {
      setVerifyingOtp(false);
    }
  };

  return (
    <div className="min-h-screen bg-orange-50 pb-24">
      {/* HEADER */}
      <header className="bg-orange-500 text-white py-4 px-5 shadow flex items-center">
        <button
          onClick={() => navigate(-1)}
          className="mr-3 bg-white text-orange-500 p-2 rounded-full"
        >
          <ArrowLeft size={18} />
        </button>

        <h1 className="text-lg font-bold">Orders</h1>
      </header>

      {/* TABS */}
      <div className="px-4 pt-4">
        <div className="flex gap-2 overflow-x-auto pb-1">
          {tabs.map((tab) => (
            <button
              key={tab.value}
              onClick={() => setActiveTab(tab.value)}
              className={`px-4 py-2 rounded-full text-sm whitespace-nowrap transition ${
                activeTab === tab.value
                  ? "bg-orange-500 text-white"
                  : "bg-white text-gray-700 border"
              }`}
            >
              {tab.label}
            </button>
          ))}
        </div>
      </div>

      {/* CONTENT */}
      <div className="p-4 space-y-4">
        {loading ? (
          <div className="bg-white rounded-2xl p-6 text-center shadow">
            Loading orders...
          </div>
        ) : orders.length === 0 ? (
          <div className="bg-white rounded-2xl p-6 text-center shadow">
            No orders found
          </div>
        ) : (
          orders.map((order) => (
            <div
              key={order.id}
              className="bg-white rounded-2xl shadow p-4 space-y-3"
            >
              {/* TOP */}
              <div className="flex justify-between items-start">
                <div>
                  <h2 className="font-bold text-lg">{order.order_code}</h2>

                  <p className="text-sm text-gray-500">
                    {order.customer_name}
                  </p>

                  <p className="text-xs text-gray-400">
                    {order.customer_mobile}
                  </p>
                </div>

                <span className="text-xs bg-orange-100 text-orange-600 px-3 py-1 rounded-full capitalize">
                  {order.status}
                </span>
              </div>

              {/* PRICE */}
              <div className="flex justify-between text-sm">
                <span className="text-gray-500">Amount</span>
                <span className="font-bold">₹{order.final_amount}</span>
              </div>

              {/* PAYMENT */}
              <div className="flex justify-between text-sm">
                <span className="text-gray-500">Payment</span>
                <span className="font-medium">
                  {order.payment_method || "Online"}
                </span>
              </div>

              {/* ADDRESS */}
              <div className="text-sm text-gray-600">
                {order.delivery_address || "Address not available"}
              </div>

              {/* DATE */}
              <div className="text-xs text-gray-400">
                {new Date(order.created_on).toLocaleString()}
              </div>

              {/* ACTIONS */}
              <div className="grid grid-cols-2 gap-2 pt-2">
                <a
                  href={`tel:${order.customer_mobile}`}
                  className="border rounded-xl py-2 text-sm flex items-center justify-center gap-2"
                >
                  <Phone size={14} />
                  Call
                </a>

                <button className="border rounded-xl py-2 text-sm flex items-center justify-center gap-2">
                  <MapPin size={14} />
                  Navigate
                </button>
              </div>

              {/* BUTTONS */}

              {activeTab === "new" && (
                <button
                  onClick={() => handleAccept(order.id)}
                  className="w-full bg-orange-500 text-white py-3 rounded-xl font-semibold"
                >
                  Slide to Accept
                </button>
              )}

              {activeTab === "accepted" && (
                <button
                  onClick={() => handlePickedUp(order.id)}
                  className="w-full bg-blue-500 text-white py-3 rounded-xl font-semibold"
                >
                  Slide to Picked Up
                </button>
              )}

              {activeTab === "picked-up" && (
                <button
                  onClick={() => openOtpModal(order.id)}
                  className="w-full bg-green-500 text-white py-3 rounded-xl font-semibold"
                >
                  Slide to Deliver
                </button>
              )}

              {activeTab === "delivered" && (
                <div className="w-full bg-green-100 text-green-700 py-3 rounded-xl font-semibold text-center">
                  Delivered Successfully
                </div>
              )}
            </div>
          ))
        )}
      </div>

      {/* OTP MODAL */}
      {showOtpModal && (
        <div className="fixed inset-0 bg-black/40 z-50 flex items-end sm:items-center justify-center">
          <div className="bg-white w-full sm:w-[400px] rounded-t-3xl sm:rounded-3xl p-5">
            <div className="flex justify-between items-center mb-4">
              <h2 className="font-bold text-lg">Enter Delivery OTP</h2>

              <button onClick={() => setShowOtpModal(false)}>
                <X size={20} />
              </button>
            </div>

            <p className="text-sm text-gray-500 mb-4">
              Ask customer for OTP to complete delivery.
            </p>

            <input
              type="tel"
              maxLength={6}
              value={otp}
              onChange={(e) =>
                setOtp(e.target.value.replace(/\D/g, ""))
              }
              placeholder="Enter OTP"
              className="w-full border rounded-xl px-4 py-3 text-center text-xl tracking-widest outline-none"
            />

            <button
              onClick={handleVerifyOtp}
              disabled={verifyingOtp}
              className="w-full mt-4 bg-orange-500 text-white py-3 rounded-xl font-semibold"
            >
              {verifyingOtp ? "Verifying..." : "Verify & Deliver"}
            </button>
          </div>
        </div>
      )}
    </div>
  );
}


















// // src/pages/OrdersPage.jsx
// import React, { useEffect, useState, useContext, useRef } from "react";
// import { useNavigate } from "react-router-dom";
// import PageHeader from "../components/PageHeader";
// import { LanguageContext } from "../context/LanguageContext";
// import { NotificationContext } from "../context/NotificationContext";
// import { ArrowLeft, MapPin, Phone } from "lucide-react";
// import {
//   getOrders,
//   getOrdersByStatus,
//   acceptOrderApi,
//   markPickedUpApi,
//   markDeliveredApi,
// } from "../Services/orders";


// /**
//  * OrdersPage.jsx
//  *
//  * Features implemented:
//  * 1) New orders show "Accept" button. Once accepted -> cannot be rejected.
//  * 2) After accept the partner can mark "Picked up" -> then "On the way" (live location sharing saved to localStorage).
//  * 3) OTP: 4-digit OTP is assumed present on order object (you chose option A). Partner enters OTP at delivery; if it matches, order is marked Delivered.
//  * 4) Each order shows full details: customer name, phone, address, items, itemized prices, order total, delivery charge, partner earning.
//  * 5) Navigation buttons open Google Maps directions (to store pickup and to customer drop).
//  * 6) Pricing: if order doesn't include explicit deliveryCharge/partnerEarning, defaults are used (deliveryCharge: ₹40, partnerEarning: ₹20). When delivered earnings & pending balance are updated in localStorage.
//  *
//  * Notes:
//  * - This page updates orders in localStorage under "partner_orders".
//  * - Earnings are stored in "partner_earnings" as { daily, total, rating? }.
//  * - Pending partner payout stored in "partner_wallet" as { pending }.
//  * - Live location while order is "On the way" is written to localStorage key `order_live_loc_<orderId>` (object { lat, lng, ts }).
//  * - Make sure your order objects (coming from backend) include at least:
//  *    id, customer, phone, address (string), items (array of {name, qty, price}), totalPrice (number), otp (number or string)
//  *
//  * Paste this file over your existing OrdersPage.jsx
//  */

// export default function OrdersPage() {
//   const { t } = useContext(LanguageContext);
//   const { addNotification } = useContext(NotificationContext);
//   const navigate = useNavigate();

//   const [orders, setOrders] = useState([]);

//   // UI state
//   const [selectedOrder, setSelectedOrder] = useState(null); // order object for details modal
//   const [showDetails, setShowDetails] = useState(false);
//   const [otpInput, setOtpInput] = useState("");
//   const [otpError, setOtpError] = useState("");
//   const [watchIds, setWatchIds] = useState({}); // keep geolocation watch ids per order
//   const geoWatchRef = useRef({}); // mutable ref to watch ids

//   const mapStatus = (status) => {
//   switch (status) {
//     case "pending":
//       return "Assigned";
//     case "accepted":
//       return "Accepted";
//     case "picked":
//       return "Picked up";
//     case "on_the_way":
//       return "On the way";
//     case "delivered":
//       return "Delivered";
//     default:
//       return "Assigned";
//   }
// };

// const [activeTab, setActiveTab] = useState("all");

// const fetchOrders = async (status = "all") => {
//   try {
//     let data;

//     if (status === "all") {
//       data = await getOrders(); // my-orders-dp
//     } else {
//       data = await getOrdersByStatus(status); // case-tracking
//     }

//     const apiOrders = data?.data || [];

//     const formattedOrders = apiOrders.map((o, index) => ({
//   id: o.id,
//   order_code: o.order_code,
//   customer: `Customer #${o.customer}`,
//   phone: "N/A",
//   address: o.delivery_address || "No address",
//   totalPrice: Number(o.final_amount),

//   status:
//     o.status === "prepared"
//       ? "Assigned"
//       : o.status === "accepted"
//       ? "Accepted"
//       : o.status === "picked_up"
//       ? "Picked up"
//       : o.status === "delivered"
//       ? "Delivered"
//       : "Assigned",

//   timestamp: new Date().toISOString(),
// }));

//     setOrders(formattedOrders);
//   } catch (err) {
//     console.error("Orders API error ❌", err);
//   }
// };

// useEffect(() => {
//   fetchOrders(activeTab);
// }, [activeTab]);



//   // helper: save orders to localStorage and state
//   const persistOrders = (updatedOrders) => {
//     localStorage.setItem("partner_orders", JSON.stringify(updatedOrders));
//     setOrders(updatedOrders);
//   };

//   // helper: ensure partner wallet and earnings keys exist
//   const readWallet = () => {
//     const w = JSON.parse(localStorage.getItem("partner_wallet") || "{}");
//     return { pending: w.pending || 0 };
//   };
//   const writeWallet = (w) => {
//     localStorage.setItem("partner_wallet", JSON.stringify(w));
//   };
//   const readEarnings = () => {
//     const e = JSON.parse(localStorage.getItem("partner_earnings") || "{}");
//     return { daily: e.daily || 0, total: e.total || 0, rating: e.rating || 0 };
//   };
//   const writeEarnings = (e) => {
//     localStorage.setItem("partner_earnings", JSON.stringify(e));
//   };

//   // Accept an Assigned order -> status "Accepted" (cannot reject after)
//   const acceptOrder = async (id) => {
//   try {
//     await acceptOrderApi(id);
//     fetchOrders(activeTab);
//   } catch (err) {
//     console.log(err);
//   }
// };

//   // Mark as Picked up -> status "Picked up"
//   const markPickedUp = async (id) => {
//   try {
//     await markPickedUpApi(id);
//     fetchOrders(activeTab);
//   } catch (err) {
//     console.log(err);
//   }
// };

//   // Start delivery -> status "On the way" and start live location sharing for this order
//   const startDelivery = (id) => {
//     const updated = orders.map((o) =>
//       o.id === id ? { ...o, status: "On the way", onWayAt: Date.now() } : o
//     );
//     persistOrders(updated);
//     addNotification(`Order #${id} is on the way`);

//     // start geolocation watch and write to localStorage per-order
//     if ("geolocation" in navigator && !geoWatchRef.current[id]) {
//       const watchId = navigator.geolocation.watchPosition(
//         (pos) => {
//           const locObj = {
//             lat: pos.coords.latitude,
//             lng: pos.coords.longitude,
//             ts: Date.now(),
//           };
//           localStorage.setItem(`order_live_loc_${id}`, JSON.stringify(locObj));
//         },
//         (err) => {
//           console.warn("geo watch error", err);
//         },
//         { enableHighAccuracy: true, maximumAge: 2000, timeout: 10000 }
//       );
//       geoWatchRef.current[id] = watchId;
//       setWatchIds((prev) => ({ ...prev, [id]: watchId }));
//     }
//   };

//   // Stop live location sharing for an order (call after delivered)
//   const stopLocationSharing = (id) => {
//     const watchId = geoWatchRef.current[id];
//     if (watchId != null) {
//       navigator.geolocation.clearWatch(watchId);
//       delete geoWatchRef.current[id];
//       setWatchIds((prev) => {
//         const copy = { ...prev };
//         delete copy[id];
//         return copy;
//       });
//       // optionally remove live loc key
//       // localStorage.removeItem(`order_live_loc_${id}`);
//     }
//   };

//   // OTP verification -> if matches order.otp => mark Delivered and update earnings/pending
// const verifyOtpAndDeliver = async (order) => {
//   try {
//     await markDeliveredApi(order.id);

//     setOtpInput("");
//     setShowDetails(false);

//     fetchOrders(activeTab);
//   } catch (err) {
//     console.error("Deliver API error ❌", err);
//   }
// };

//   // Navigation helpers
//   const openMapsTo = (lat, lng, label = "") => {
//     if (!lat || !lng) return;
//     const url = `https://www.google.com/maps/dir/?api=1&destination=${lat},${lng}&travelmode=driving`;
//     window.open(url, "_blank");
//   };

//   // open details modal for order
//   const openDetails = (order) => {
//     setSelectedOrder(order);
//     setOtpInput("");
//     setOtpError("");
//     setShowDetails(true);
//   };
//   const closeDetails = () => {
//     setShowDetails(false);
//     setSelectedOrder(null);
//   };

//   // Render helpers
//   const formatCurrency = (n) => {
//     const num = Number(n || 0);
//     return `₹${num.toFixed(0)}`;
//   };

//   // compute derived order price breakdown
//   const getOrderBreakdown = (order) => {
//     const items = Array.isArray(order.items) ? order.items : [];
//     const itemsTotal = items.reduce((s, it) => s + (Number(it.price || 0) * (it.qty || 1)), 0);
//     const deliveryCharge = Number(order.deliveryCharge ?? order.delivery_fee ?? 40);
//     const partnerEarning = Number(order.partnerEarning ?? order.partner_earning ?? 20);
//     const orderTotal = Number(order.totalPrice ?? order.total ?? itemsTotal + deliveryCharge);
//     return { items, itemsTotal, deliveryCharge, partnerEarning, orderTotal };
//   };

//   // ensure localStorage structures exist on mount
//   useEffect(() => {
//     if (!localStorage.getItem("partner_wallet")) {
//       localStorage.setItem("partner_wallet", JSON.stringify({ pending: 0 }));
//     }
//     if (!localStorage.getItem("partner_earnings")) {
//       localStorage.setItem("partner_earnings", JSON.stringify({ daily: 0, total: 0 }));
//     }
//   }, []);

//   // When component unmounts, clear any geo watches we started
//   useEffect(() => {
//     return () => {
//       Object.values(geoWatchRef.current || {}).forEach((id) => {
//         try {
//           navigator.geolocation.clearWatch(id);
//         } catch (e) {}
//       });
//       geoWatchRef.current = {};
//     };
//   }, []);

//   return (
//     <div className="min-h-screen bg-orange-50 pb-28">
//       {/* Header */}
//       <header className="bg-orange-500 text-white py-4 px-6 shadow-lg flex items-center">
//         <button
//           onClick={() => navigate(-1)}
//           className="mr-3 bg-white text-orange-500 p-2 rounded-full shadow hover:bg-gray-100 transition"
//         >
//           <ArrowLeft size={18} />
//         </button>
//         <h1 className="text-lg font-bold">Orders</h1>
//       </header>

//       <main className="p-6 max-w-4xl mx-auto space-y-4">
//         {orders.length === 0 && (
//           <div className="bg-white p-4 rounded-2xl shadow text-center text-gray-600">
//             No orders yet.
//           </div>
//         )}


// <div className="flex gap-2 mb-4 overflow-x-auto">
//   {[
//     { label: "All", value: "all" },
//     { label: "New", value: "new" },
//     { label: "Picked Up", value: "picked_up" },
//     { label: "Delivered", value: "delivered" },
//   ].map((tab) => (
//     <button
//       key={tab.value}
//       onClick={() => setActiveTab(tab.value)}
//       className={`px-4 py-2 rounded-full text-sm whitespace-nowrap ${
//         activeTab === tab.value
//           ? "bg-orange-500 text-white"
//           : "bg-white border"
//       }`}
//     >
//       {tab.label}
//     </button>
//   ))}
// </div>


//         {/* Order list */}
//         <div className="space-y-3">
//           {orders
//             .slice()
//             .sort((a, b) => (b.id || 0) - (a.id || 0)) // newest first
//             .map((order) => {
//               const { itemsTotal, deliveryCharge, partnerEarning, orderTotal } = getOrderBreakdown(order);
//               return (
//                 <div
//                   key={order.id}
//                   className="bg-white p-4 rounded-2xl shadow flex flex-col md:flex-row justify-between gap-4"
//                 >
//                   <div className="flex-1">
//                     <div className="flex items-start justify-between">
//                       <div>
//                         <div className="font-semibold text-lg">Order #{order.id}</div>
//                         <div className="text-sm text-gray-600">
//                           {order.customer} • <span className="font-medium">{order.phone}</span>
//                         </div>
//                         <div className="text-sm text-gray-500 mt-1">{order.address}</div>
//                       </div>

//                       <div className="text-right">
//                         <div className="text-sm text-gray-500">Status</div>
//                         <div className="font-semibold">{order.status || "Assigned"}</div>
//                         <div className="text-xs text-gray-400 mt-1">{order.timestamp ? new Date(order.timestamp).toLocaleString() : ""}</div>
//                       </div>
//                     </div>

//                     {/* Items & price summary */}
//                     <div className="mt-3 grid grid-cols-2 gap-2 text-sm">
//                       <div>
//                         <div className="font-medium">Items</div>
//                         <ul className="mt-1 space-y-1">
//                           {Array.isArray(order.items) && order.items.length ? order.items.map((it, idx) => (
//                             <li key={idx} className="flex justify-between">
//                               <span>{it.name} x{it.qty ?? 1}</span>
//                               <span className="font-medium">{formatCurrency((it.price || 0) * (it.qty || 1))}</span>
//                             </li>
//                           )) : <li className="text-gray-400">No item details</li>}
//                         </ul>
//                       </div>

//                       <div>
//                         <div className="font-medium">Price</div>
//                         <div className="mt-1 space-y-1 text-sm text-gray-700">
//                           <div className="flex justify-between">
//                             <span>Items total</span>
//                             <span>{formatCurrency(itemsTotal)}</span>
//                           </div>
//                           <div className="flex justify-between">
//                             <span>Delivery charge</span>
//                             <span>{formatCurrency(deliveryCharge)}</span>
//                           </div>
//                           <div className="flex justify-between font-semibold mt-2">
//                             <span>Order total</span>
//                             <span>{formatCurrency(orderTotal)}</span>
//                           </div>
//                           <div className="flex justify-between text-xs text-gray-500 mt-1">
//                             <span>Your earning (this order)</span>
//                             <span>{formatCurrency(partnerEarning)}</span>
//                           </div>
//                         </div>
//                       </div>
//                     </div>
//                   </div>

//                   {/* action column */}
//                   <div className="flex flex-col items-stretch justify-between gap-2 w-full md:w-56">
//                     <div className="space-y-2">
//                       {/* Accept button (only when Assigned) */}
//                       {order.status === "Assigned" && (
//                         <button
//                           onClick={() => acceptOrder(order.id)}
//                           className="w-full px-3 py-2 bg-orange-500 text-white rounded-xl font-semibold"
//                         >
//                           Accept Order
//                         </button>
//                       )}

//                       {/* Once accepted, cannot reject */}
//                       {order.status === "Accepted" && (
//                         <>
//                           <div className="text-sm text-gray-600">Accepted</div>
//                           <button
//                             onClick={() => markPickedUp(order.id)}
//                             className="w-full px-3 py-2 bg-yellow-400 text-white rounded-xl font-semibold"
//                           >
//                             Mark Picked Up
//                           </button>
//                         </>
//                       )}

//                       {/* If picked up but not on the way -> button to start delivery (and start live sharing) */}
//                       {order.status === "Picked up" && (
//                         <button
//                           onClick={() => startDelivery(order.id)}
//                           className="w-full px-3 py-2 bg-blue-500 text-white rounded-xl font-semibold"
//                         >
//                           Start Delivery (On the way)
//                         </button>
//                       )}

//                       {/* If on the way -> show OTP verify and live location button */}
//                       {order.status === "On the way" && (
//                         <>
//                           <button
//                             onClick={() => openDetails(order)}
//                             className="w-full px-3 py-2 bg-indigo-500 text-white rounded-xl font-semibold"
//                           >
//                             View / Verify OTP
//                           </button>

//                           <div className="flex gap-2">
//                             <button
//                               onClick={() => {
//                                 // open navigation directly to customer
//                                 openMapsTo(order.dropLat ?? order.drop_lat ?? null, order.dropLng ?? order.drop_lng ?? null);
//                               }}
//                               className="flex-1 px-2 py-2 bg-white border rounded-xl text-xs"
//                             >
//                               <MapPin size={14} className="inline mr-1" /> Navigate to Customer
//                             </button>
//                             <button
//                               onClick={() => {
//                                 const loc = localStorage.getItem(`order_live_loc_${order.id}`);
//                                 if (loc) {
//                                   // open map centered on latest lat/lng
//                                   try {
//                                     const parsed = JSON.parse(loc);
//                                     openMapsTo(parsed.lat, parsed.lng);
//                                   } catch (e) {}
//                                 } else {
//                                   alert("No live location available yet.");
//                                 }
//                               }}
//                               className="flex-1 px-2 py-2 bg-white border rounded-xl text-xs"
//                             >
//                               Live Loc
//                             </button>
//                           </div>
//                         </>
//                       )}

//                       {/* Delivered */}
//                       {order.status === "Delivered" && (
//                         <div className="text-center text-sm text-green-600 font-semibold">Delivered ✓</div>
//                       )}

//                       {/* Fallback Details button */}
//                       {order.status !== "On the way" && (
//                         <button
//                           onClick={() => openDetails(order)}
//                           className="w-full px-3 py-2 bg-gray-100 rounded-xl text-sm"
//                         >
//                           Details
//                         </button>
//                       )}
//                     </div>

//                     {/* contact actions */}
//                     <div className="flex gap-2">
//                       <a href={`tel:${order.phone}`} className="flex-1 px-3 py-2 bg-white border rounded-xl text-sm flex items-center justify-center gap-2">
//                         <Phone size={14} /> Call
//                       </a>
//                       <button
//                         onClick={() => {
//                           // open navigation to pickup (store) if pickup coords exist
//                           openMapsTo(order.pickupLat ?? order.pickup_lat ?? null, order.pickupLng ?? order.pickup_lng ?? null);
//                         }}
//                         className="px-3 py-2 bg-white border rounded-xl text-sm"
//                         title="Navigate to store"
//                       >
//                         Store
//                       </button>
//                     </div>
//                   </div>
//                 </div>
//               );
//             })}
//         </div>
//       </main>

//       {/* Details / OTP Modal */}
//       {showDetails && selectedOrder && (
//         <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 p-4">
//           <div className="bg-white rounded-2xl shadow-lg w-full max-w-2xl overflow-y-auto max-h-[90vh]">
//             <div className="p-4 border-b flex items-center justify-between">
//               <div>
//                 <div className="font-semibold">Order #{selectedOrder.id}</div>
//                 <div className="text-xs text-gray-500">{selectedOrder.customer} • {selectedOrder.phone}</div>
//               </div>
//               <div>
//                 <button onClick={closeDetails} className="px-3 py-1 text-sm rounded bg-gray-100">Close</button>
//               </div>
//             </div>

//             <div className="p-4 space-y-4">
//               <div>
//                 <div className="text-sm text-gray-500">Address</div>
//                 <div className="font-medium">{selectedOrder.address}</div>
//               </div>

//               <div>
//                 <div className="text-sm text-gray-500">Items</div>
//                 <div className="mt-2 space-y-1">
//                   {(selectedOrder.items || []).map((it, idx) => (
//                     <div key={idx} className="flex justify-between text-sm">
//                       <div>{it.name} x{it.qty ?? 1}</div>
//                       <div>{formatCurrency((it.price || 0) * (it.qty || 1))}</div>
//                     </div>
//                   ))}
//                 </div>
//               </div>

//               {/* Price breakdown */}
//               <div className="bg-gray-50 p-3 rounded">
//                 {(() => {
//                   const { itemsTotal, deliveryCharge, partnerEarning, orderTotal } = getOrderBreakdown(selectedOrder);
//                   return (
//                     <div className="text-sm">
//                       <div className="flex justify-between mb-1"><span>Items total</span><span>{formatCurrency(itemsTotal)}</span></div>
//                       <div className="flex justify-between mb-1"><span>Delivery charge</span><span>{formatCurrency(deliveryCharge)}</span></div>
//                       <div className="flex justify-between mb-1 font-semibold"><span>Order total</span><span>{formatCurrency(orderTotal)}</span></div>
//                       <div className="flex justify-between mt-2 text-xs text-gray-600"><span>Your earning</span><span>{formatCurrency(partnerEarning)}</span></div>
//                     </div>
//                   );
//                 })()}
//               </div>

//               {/* OTP section (only if on the way or picked up) */}
//               {(selectedOrder.status === "On the way" || selectedOrder.status === "Picked up") && (
//                 <div className="space-y-2">
//                   <div className="text-sm text-gray-600">Enter 4-digit OTP provided by customer</div>
//                   <input
//                     value={otpInput}
//                     onChange={(e) => setOtpInput(e.target.value.replace(/\D/g, "").slice(0, 4))}
//                     className="w-40 px-3 py-2 border rounded text-lg tracking-widest text-center"
//                     placeholder="— — — —"
//                     inputMode="numeric"
//                   />
//                   {otpError && <div className="text-sm text-red-500">{otpError}</div>}
//                   <div className="flex gap-2">
//                     <button
//                       onClick={() => verifyOtpAndDeliver(selectedOrder)}
//                       className="px-4 py-2 bg-green-500 text-white rounded-xl font-semibold"
//                     >
//                       Verify & Deliver
//                     </button>

//                     <button
//                       onClick={() => {
//                         // quick check: open navigation to customer
//                         openMapsTo(selectedOrder.dropLat ?? selectedOrder.drop_lat ?? null, selectedOrder.dropLng ?? selectedOrder.drop_lng ?? null);
//                       }}
//                       className="px-4 py-2 bg-white border rounded-xl"
//                     >
//                       Navigate to Customer
//                     </button>
//                   </div>
//                 </div>
//               )}

//               {/* Additional order metadata */}
//               <div className="text-xs text-gray-500">
//                 <div>Order created: {selectedOrder.timestamp ? new Date(selectedOrder.timestamp).toLocaleString() : "—"}</div>

//               </div>
//             </div>
//           </div>
//         </div>
//       )}
//     </div>
//   );
// }
