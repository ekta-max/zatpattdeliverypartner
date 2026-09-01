// src/pages/OrdersPage.jsx

import React, { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import {
  ArrowLeft,
  Phone,
  MapPin,
  X,
  Package,
  CheckCircle2,
  Navigation,
  Clock3,
  CreditCard,
  IndianRupee,
  ShieldCheck,
  ChevronRight,
} from "lucide-react";

import {
  getOrdersByStatus,
  acceptOrderApi,
  markPickedUpApi,
  verifyDeliveryOtpApi,
  markDeliveredApi,
  collectPaymentApi,
} from "../Services/orders";

/* =========================================================
   ZATPATT THEME CONSTANTS (MATCHING PROFILE PAGE)
========================================================= */

const BRAND_ORANGE = "#FF6600";
const BRAND_ORANGE_LIGHT = "#FF7A00";
const BRAND_YELLOW = "#FFA800";

const BRAND_GRADIENT =
  "linear-gradient(90deg, #FF6200 0%, #FF7A00 55%, #FFA800 100%)";

const HERO_GRADIENT =
  "linear-gradient(145deg, #FF6600 0%, #FF7A00 48%, #FFA800 100%)";

const PAGE_BG = "#F8F0E6";
const CARD_BG = "#FFFFFF";

const TEXT_DARK = "#17110D";
const TEXT_MUTED = "#765F50";

const BORDER = "#E9DED3";

const SOFT_ORANGE = "#FFF2E8";
const SOFT_ORANGE_2 = "#FFF7F0";

export default function OrdersPage() {
  const navigate = useNavigate();

  const [activeTab, setActiveTab] = useState("new");
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);

  // OTP Modal
  const [showOtpModal, setShowOtpModal] = useState(false);
  const [selectedOrderId, setSelectedOrderId] = useState(null);
  const [otp, setOtp] = useState("");
  const [verifyingOtp, setVerifyingOtp] = useState(false);

  // Payment
  const [collectingPaymentId, setCollectingPaymentId] = useState(null);

  const tabs = [
    { label: "New", value: "new" },
    { label: "Accepted", value: "accepted" },
    { label: "Picked Up", value: "picked-up" },
    { label: "Delivered", value: "delivered" },
  ];

  /* =========================================================
     FETCH ORDERS
  ========================================================= */

  const fetchOrders = async (status = activeTab) => {
    try {
      setLoading(true);
      const res = await getOrdersByStatus(status);
      const list = res?.data || [];
      setOrders(Array.isArray(list) ? list : []);
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

  /* =========================================================
     ACCEPT ORDER
  ========================================================= */

  const handleAccept = async (id) => {
    try {
      await acceptOrderApi(id);
      setActiveTab("accepted");
    } catch (error) {
      console.error("Accept error ❌", error);
      alert("Failed to accept order");
    }
  };

  /* =========================================================
     PICKED UP
  ========================================================= */

  const handlePickedUp = async (id) => {
    try {
      await markPickedUpApi(id);
      setActiveTab("picked-up");
    } catch (error) {
      console.error("Picked Up error ❌", error);
      alert("Failed to mark order as picked up");
    }
  };

  /* =========================================================
     OTP MODAL
  ========================================================= */

  const openOtpModal = (id) => {
    setSelectedOrderId(id);
    setOtp("");
    setShowOtpModal(true);
  };

  const closeOtpModal = () => {
    if (verifyingOtp) return;
    setShowOtpModal(false);
    setSelectedOrderId(null);
    setOtp("");
  };

  /* =========================================================
     VERIFY OTP + DELIVER
  ========================================================= */

  const handleVerifyOtp = async () => {
    if (otp.length < 4) {
      alert("Please enter a valid OTP");
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
    } catch (error) {
      console.error("OTP Verify error ❌", error);
      alert("Invalid OTP. Please try again.");
    } finally {
      setVerifyingOtp(false);
    }
  };

  /* =========================================================
     COLLECT PAYMENT
  ========================================================= */

  const handleCollectPayment = async (orderId) => {
    if (collectingPaymentId) return;

    try {
      setCollectingPaymentId(orderId);
      await collectPaymentApi(orderId);
      await fetchOrders(activeTab);
    } catch (error) {
      console.error("Collect payment error ❌", error);
      alert("Failed to collect payment");
    } finally {
      setCollectingPaymentId(null);
    }
  };

  /* =========================================================
     NAVIGATION
  ========================================================= */

  const handleNavigate = (order) => {
    if (order?.latitude && order?.longitude) {
      window.open(
        `https://www.google.com/maps/dir/?api=1&destination=${order.latitude},${order.longitude}`,
        "_blank"
      );
      return;
    }

    if (order?.delivery_latitude && order?.delivery_longitude) {
      window.open(
        `https://www.google.com/maps/dir/?api=1&destination=${order.delivery_latitude},${order.delivery_longitude}`,
        "_blank"
      );
      return;
    }

    alert("Delivery location coordinates are not available.");
  };

  /* =========================================================
     PAYMENT CHECK
  ========================================================= */

  const shouldShowCodPayment = (order) => {
    const paymentFlag = order?.payment_flag?.toUpperCase();
    const paymentMethod = order?.payment_method?.toUpperCase();
    const paymentStatus = order?.payment_status?.toUpperCase();

    return (
      (paymentFlag === "COD" || paymentMethod === "COD") &&
      paymentStatus === "PENDING"
    );
  };

  /* =========================================================
     FORMAT DATE
  ========================================================= */

  const formatDate = (date) => {
    if (!date) return "";
    try {
      return new Date(date).toLocaleString("en-IN", {
        day: "2-digit",
        month: "short",
        year: "numeric",
        hour: "2-digit",
        minute: "2-digit",
      });
    } catch {
      return date;
    }
  };

  return (
    <div
      className="min-h-screen overflow-x-hidden pb-20 sm:pb-24"
      style={{
        background: PAGE_BG,
        color: TEXT_DARK,
      }}
    >
      {/* =====================================================
          HEADER (MATCHING PROFILE PAGE)
      ===================================================== */}

      <header
        className="sticky top-0 z-40 text-white shadow-md"
        style={{
          background: HERO_GRADIENT,
        }}
      >
        <div className="max-w-5xl mx-auto px-3 sm:px-6 py-3 flex items-center justify-between gap-3">
          <button
            type="button"
            onClick={() => navigate(-1)}
            className="w-9 h-9 sm:w-10 sm:h-10 rounded-xl bg-white/15 hover:bg-white/25 border border-white/25 flex items-center justify-center transition shrink-0"
          >
            <ArrowLeft size={18} />
          </button>

          <div className="text-center min-w-0">
            <div className="inline-flex items-center gap-2 px-2.5 sm:px-3 py-1 rounded-full bg-white/15 border border-white/30">
              <span className="w-1.5 h-1.5 sm:w-2 sm:h-2 rounded-full bg-white" />
              <span className="text-[8px] sm:text-[9px] font-black tracking-[1.5px] uppercase">
                ZATPATT FLEET
              </span>
            </div>

            <h1 className="text-sm sm:text-lg font-black mt-1 truncate">
              Orders
            </h1>
          </div>

          <div className="w-9 h-9 sm:w-10 sm:h-10 rounded-xl bg-white/15 border border-white/25 flex items-center justify-center shrink-0">
            <Package size={17} />
          </div>
        </div>
      </header>

      {/* =====================================================
          MAIN BODY
      ===================================================== */}

      <main className="max-w-5xl mx-auto px-3 sm:px-6 py-4 sm:py-7 space-y-4 sm:space-y-6">

        {/* ===================================================
            TABS
        =================================================== */}

        <div className="flex gap-2 overflow-x-auto pb-1 scrollbar-hide">
          {tabs.map((tab) => {
            const isActive = activeTab === tab.value;

            return (
              <button
                key={tab.value}
                onClick={() => setActiveTab(tab.value)}
                className={`shrink-0 px-5 py-2.5 rounded-2xl text-xs sm:text-sm font-black transition-all active:scale-95 ${
                  isActive
                    ? "text-white"
                    : "bg-white text-[#765F50] border border-[#E9DED3] hover:bg-[#FAF7F3]"
                }`}
                style={
                  isActive
                    ? {
                        background: BRAND_GRADIENT,
                        boxShadow: "0 8px 20px rgba(255,102,0,0.22)",
                        border: "none",
                      }
                    : undefined
                }
              >
                {tab.label}
              </button>
            );
          })}
        </div>

        {/* ===================================================
            CONTENT AREA
        =================================================== */}

        {loading ? (
          <div
            className="bg-white rounded-[24px] sm:rounded-[32px] p-8 sm:p-12 text-center border"
            style={{
              borderColor: BORDER,
              boxShadow: "0 18px 50px rgba(80,40,10,0.06)",
            }}
          >
            <div className="mx-auto mb-4 h-11 w-11 rounded-full border-4 border-[#FFE0C7] border-t-[#FF6600] animate-spin" />
            <p className="font-black text-sm" style={{ color: TEXT_DARK }}>
              Loading orders...
            </p>
            <p className="text-[11px] mt-1" style={{ color: TEXT_MUTED }}>
              Fetching latest updates from dispatch
            </p>
          </div>
        ) : orders.length === 0 ? (
          <div
            className="bg-white rounded-[24px] sm:rounded-[32px] p-8 sm:p-12 text-center border"
            style={{
              borderColor: BORDER,
              boxShadow: "0 18px 50px rgba(80,40,10,0.06)",
            }}
          >
            <div
              className="w-16 h-16 mx-auto mb-4 rounded-2xl flex items-center justify-center"
              style={{
                background: SOFT_ORANGE,
                border: "1px solid #FFD7B8",
                color: BRAND_ORANGE,
              }}
            >
              <Package size={30} />
            </div>

            <h2 className="font-black text-base sm:text-lg" style={{ color: TEXT_DARK }}>
              No {activeTab} orders
            </h2>

            <p className="text-xs text-[#765F50] mt-1">
              There are currently no orders under the {activeTab} tab.
            </p>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 sm:gap-5">
            {orders.map((order) => {
              const isDelivered = order.status?.toLowerCase() === "delivered";

              return (
                <div
                  key={order.id}
                  className="bg-white rounded-[24px] sm:rounded-[32px] border p-4 sm:p-6 space-y-4 transition-all"
                  style={{
                    borderColor: BORDER,
                    boxShadow: "0 18px 50px rgba(80,40,10,0.06)",
                  }}
                >
                  {/* ORDER HEADER */}
                  <div className="flex items-start justify-between gap-3">
                    <div className="flex items-center gap-3 min-w-0">
                      <div
                        className="w-10 h-10 rounded-2xl flex items-center justify-center shrink-0"
                        style={{
                          background: SOFT_ORANGE,
                          color: BRAND_ORANGE,
                          border: "1px solid #FFD7B8",
                        }}
                      >
                        <Package size={18} />
                      </div>

                      <div className="min-w-0">
                        <h2
                          className="font-black text-sm sm:text-base leading-tight truncate"
                          style={{ color: TEXT_DARK }}
                        >
                          {order.order_code}
                        </h2>
                        <p className="text-[11px] font-semibold text-[#765F50] truncate mt-0.5">
                          {order.customer_name || "Customer"}
                        </p>
                      </div>
                    </div>

                    {/* STATUS BADGE */}
                    <span
                      className={`shrink-0 inline-flex items-center gap-1 px-3 py-1 rounded-full text-[10px] font-black uppercase tracking-wider ${
                        isDelivered
                          ? "bg-green-50 text-green-700 border border-green-200"
                          : "bg-[#FFF2E8] text-[#FF6600] border border-[#FFD7B8]"
                      }`}
                    >
                      {isDelivered ? (
                        <>
                          <CheckCircle2 size={12} />
                          Delivered
                        </>
                      ) : (
                        <>
                          <Clock3 size={12} />
                          {order.status || "Active"}
                        </>
                      )}
                    </span>
                  </div>

                  {/* CUSTOMER PHONE */}
                  {order.customer_mobile && (
                    <div className="flex items-center gap-2 text-xs font-semibold text-[#765F50]">
                      <Phone size={13} className="text-[#FF6600] shrink-0" />
                      <span>{order.customer_mobile}</span>
                    </div>
                  )}

                  {/* AMOUNT & PAYMENT BOXES */}
                  <div className="grid grid-cols-2 gap-3">
                    <div className="rounded-2xl p-3.5 bg-[#FAF7F3] border border-[#E9DED3]">
                      <p className="flex items-center gap-1 text-[11px] font-black text-[#765F50] mb-1">
                        <IndianRupee size={12} className="text-[#FF6600]" />
                        Amount
                      </p>
                      <p className="text-base sm:text-lg font-black text-[#17110D]">
                        ₹{order.final_amount ?? "0"}
                      </p>
                    </div>

                    <div className="rounded-2xl p-3.5 bg-[#FAF7F3] border border-[#E9DED3]">
                      <p className="flex items-center gap-1 text-[11px] font-black text-[#765F50] mb-1">
                        <CreditCard size={12} className="text-[#FF6600]" />
                        Payment
                      </p>
                      <p className="text-xs sm:text-sm font-bold text-[#17110D] truncate mt-1">
                        {order.payment_method || "Online"}
                      </p>
                    </div>
                  </div>

                  {/* ADDRESS BOX */}
                  <div className="rounded-2xl p-3.5 bg-[#FAF7F3] border border-[#E9DED3] flex items-start gap-2.5">
                    <MapPin size={16} className="text-[#FF6600] shrink-0 mt-0.5" />
                    <p className="text-xs font-semibold text-[#62574F] leading-relaxed">
                      {order.delivery_address || "Address not available"}
                    </p>
                  </div>

                  {/* CREATED TIMESTAMP */}
                  {order.created_on && (
                    <p className="text-[10px] sm:text-[11px] font-medium text-[#8B776A]">
                      Ordered on: {formatDate(order.created_on)}
                    </p>
                  )}

                  {/* CALL & NAVIGATE BUTTONS */}
                  <div className="grid grid-cols-2 gap-2 pt-1">
                    <a
                      href={`tel:${order.customer_mobile || ""}`}
                      className="border border-[#E9DED3] bg-white rounded-2xl py-3 text-xs sm:text-sm font-black text-[#17110D] flex items-center justify-center gap-2 hover:bg-[#FAF7F3] active:scale-[0.98] transition shadow-sm"
                    >
                      <Phone size={14} className="text-[#FF6600]" />
                      Call
                    </a>

                    <button
                      type="button"
                      onClick={() => handleNavigate(order)}
                      className="border border-[#FFD7B8] bg-[#FFF8F2] hover:bg-[#FFEBDD] text-[#FF6600] rounded-2xl py-3 text-xs sm:text-sm font-black flex items-center justify-center gap-2 active:scale-[0.98] transition shadow-sm"
                    >
                      <Navigation size={14} />
                      Navigate
                    </button>
                  </div>

                  {/* TAB ACTION: NEW -> ACCEPT */}
                  {activeTab === "new" && (
                    <button
                      type="button"
                      onClick={() => handleAccept(order.id)}
                      className="w-full min-h-[48px] rounded-2xl font-black text-xs sm:text-sm text-white flex items-center justify-center gap-2 transition active:scale-[0.99]"
                      style={{
                        background: BRAND_GRADIENT,
                        boxShadow: "0 8px 20px rgba(255,102,0,0.22)",
                      }}
                    >
                      <span>Accept Order</span>
                      <ChevronRight size={16} />
                    </button>
                  )}

                  {/* TAB ACTION: ACCEPTED -> PICKED UP */}
                  {activeTab === "accepted" && (
                    <button
                      type="button"
                      onClick={() => handlePickedUp(order.id)}
                      className="w-full min-h-[48px] rounded-2xl font-black text-xs sm:text-sm text-white flex items-center justify-center gap-2 transition active:scale-[0.99]"
                      style={{
                        background: BRAND_GRADIENT,
                        boxShadow: "0 8px 20px rgba(255,102,0,0.22)",
                      }}
                    >
                      <span>Mark Picked Up</span>
                      <ChevronRight size={16} />
                    </button>
                  )}

                  {/* TAB ACTION: PICKED UP -> DELIVER (AND COD COLLECT) */}
                  {activeTab === "picked-up" && (
                    <div className="space-y-2 pt-1">
                      {shouldShowCodPayment(order) && (
                        <button
                          type="button"
                          onClick={() => handleCollectPayment(order.id)}
                          disabled={collectingPaymentId === order.id}
                          className="w-full min-h-[46px] rounded-2xl font-black text-xs sm:text-sm text-white bg-emerald-600 hover:bg-emerald-700 flex items-center justify-center gap-2 transition disabled:opacity-60 shadow-[0_8px_20px_rgba(16,185,129,0.22)]"
                        >
                          <IndianRupee size={15} />
                          <span>
                            {collectingPaymentId === order.id
                              ? "Collecting..."
                              : `Collect Payment ₹${order.amount_to_collect ?? "0"}`}
                          </span>
                        </button>
                      )}

                      <button
                        type="button"
                        onClick={() => openOtpModal(order.id)}
                        className="w-full min-h-[48px] rounded-2xl font-black text-xs sm:text-sm text-white flex items-center justify-center gap-2 transition active:scale-[0.99]"
                        style={{
                          background: BRAND_GRADIENT,
                          boxShadow: "0 8px 20px rgba(255,102,0,0.22)",
                        }}
                      >
                        <span>Verify OTP & Deliver</span>
                        <ChevronRight size={16} />
                      </button>
                    </div>
                  )}

                  {/* TAB ACTION: DELIVERED */}
                  {activeTab === "delivered" && (
                    <div className="w-full py-3.5 rounded-2xl font-black text-xs sm:text-sm bg-green-50 text-green-700 border border-green-200 flex items-center justify-center gap-2">
                      <CheckCircle2 size={16} />
                      <span>Delivered Successfully</span>
                    </div>
                  )}

                  {/* EXTRA COD BUTTON FOR NON PICKED-UP TABS */}
                  {activeTab !== "picked-up" &&
                    order.payment_method?.toUpperCase() === "COD" &&
                    order.payment_status?.toUpperCase() === "PENDING" && (
                      <button
                        type="button"
                        onClick={() => handleCollectPayment(order.id)}
                        disabled={collectingPaymentId === order.id}
                        className="w-full min-h-[44px] rounded-2xl font-black text-xs text-white bg-emerald-600 hover:bg-emerald-700 flex items-center justify-center gap-2 transition disabled:opacity-60"
                      >
                        <IndianRupee size={14} />
                        <span>
                          {collectingPaymentId === order.id
                            ? "Collecting..."
                            : `Collect Payment ₹${order.amount_to_collect ?? "0"}`}
                        </span>
                      </button>
                    )}
                </div>
              );
            })}
          </div>
        )}

        {/* ===================================================
            FOOTER BADGE (MATCHING PROFILE PAGE)
        =================================================== */}

        <div className="text-center py-2">
          <div className="inline-flex flex-wrap justify-center items-center gap-2 bg-white px-4 sm:px-5 py-2 rounded-full border border-[#E9DED3] text-[9px] sm:text-[10px] font-bold text-[#765F50] shadow-sm">
            <span>© {new Date().getFullYear()} Zatpatt</span>
            <span>•</span>
            <span>Delivery Partner Portal</span>
          </div>
        </div>
      </main>

      {/* =====================================================
          OTP MODAL (MATCHING PROFILE MODALS)
      ===================================================== */}

      {showOtpModal && (
        <div className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center z-50 p-3 sm:p-4">
          <div className="bg-white rounded-[24px] sm:rounded-[32px] w-full max-w-md shadow-2xl border border-[#E9DED3] overflow-hidden flex flex-col">
            {/* MODAL HEADER */}
            <div
              className="text-white p-4 sm:p-5 flex items-center justify-between gap-3 shrink-0"
              style={{
                background: HERO_GRADIENT,
              }}
            >
              <div className="flex items-center gap-3 min-w-0">
                <div className="w-10 h-10 rounded-xl bg-white/15 border border-white/20 flex items-center justify-center shrink-0">
                  <ShieldCheck size={19} />
                </div>

                <div className="min-w-0">
                  <h3 className="font-black text-sm sm:text-base truncate">
                    Delivery OTP Verification
                  </h3>
                  <p className="text-[10px] sm:text-[11px] text-white/90">
                    Ask customer for the 4 or 6-digit OTP
                  </p>
                </div>
              </div>

              <button
                type="button"
                onClick={closeOtpModal}
                disabled={verifyingOtp}
                className="w-9 h-9 rounded-xl bg-white/15 hover:bg-white/25 flex items-center justify-center transition shrink-0"
              >
                <X size={18} />
              </button>
            </div>

            {/* MODAL CONTENT */}
            <div className="p-4 sm:p-6 space-y-4">
              <div>
                <label className="block text-[11px] font-black text-[#17110D] mb-1.5 text-center">
                  Enter OTP Received by Customer
                </label>

                <input
                  type="tel"
                  inputMode="numeric"
                  maxLength={6}
                  autoFocus
                  value={otp}
                  onChange={(e) => setOtp(e.target.value.replace(/\D/g, ""))}
                  placeholder="• • • •"
                  className="w-full border border-[#E9DED3] bg-[#FAF7F3] focus:bg-white focus:border-[#FF6600] focus:ring-4 focus:ring-[#FFE7D3] rounded-2xl px-4 py-4 text-center text-2xl font-extrabold tracking-[10px] outline-none transition"
                />
              </div>

              <div className="flex gap-2 pt-2">
                <button
                  type="button"
                  onClick={closeOtpModal}
                  disabled={verifyingOtp}
                  className="w-1/3 py-3 bg-[#FAF7F3] hover:bg-[#EDE5DE] text-[#765F50] rounded-2xl font-bold text-xs sm:text-sm transition border border-[#E9DED3]"
                >
                  Cancel
                </button>

                <button
                  type="button"
                  onClick={handleVerifyOtp}
                  disabled={verifyingOtp || otp.length < 4}
                  className="w-2/3 py-3 text-white rounded-2xl font-black text-xs sm:text-sm transition flex items-center justify-center gap-2 disabled:opacity-50"
                  style={{
                    background: BRAND_GRADIENT,
                    boxShadow: "0 8px 20px rgba(255,102,0,0.22)",
                  }}
                >
                  {verifyingOtp ? (
                    <>
                      <div className="w-4 h-4 border-2 border-white/40 border-t-white rounded-full animate-spin" />
                      <span>Verifying...</span>
                    </>
                  ) : (
                    <>
                      <CheckCircle2 size={16} />
                      <span>Confirm Delivery</span>
                    </>
                  )}
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
