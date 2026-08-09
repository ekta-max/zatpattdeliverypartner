// src/pages/OrdersPage.jsx

import React, { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { ArrowLeft, Phone, MapPin, X } from "lucide-react";
import { collectPaymentApi } from "../Services/orders";

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
  const [collectingPaymentId, setCollectingPaymentId] = useState(null);

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

  const handleCollectPayment = async (orderId) => {
    if (collectingPaymentId) return;
    setCollectingPaymentId(orderId);
    try {
      const res = await collectPaymentApi(orderId);
      console.log("Payment collected ✅", res);
      fetchOrders(activeTab); // refresh so payment_status updates
    } catch (err) {
      console.error("Collect payment error ❌", err);
      alert("Failed to collect payment");
    } finally {
      setCollectingPaymentId(null);
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
                <>
                  {order.payment_flag === "COD" && !order.is_payment_successful && (
                    <button
                      onClick={() => handleCollectPayment(order.id)}
                      disabled={collectingPaymentId === order.id}
                      className="w-full bg-green-600 text-white py-3 rounded-xl font-semibold disabled:opacity-60"
                    >
                      {collectingPaymentId === order.id
                        ? "Collecting..."
                        : `Collect Payment ₹${order.amount_to_collect}`}
                    </button>
                  )}

                  <button
                    onClick={() => openOtpModal(order.id)}
                    className="w-full bg-green-500 text-white py-3 rounded-xl font-semibold"
                  >
                    Slide to Deliver
                  </button>
                </>
              )}

              {activeTab === "delivered" && (
                <div className="w-full bg-green-100 text-green-700 py-3 rounded-xl font-semibold text-center">
                  Delivered Successfully
                </div>
              )}

              {order.payment_method?.toUpperCase() === "COD" &&
                order.payment_status?.toUpperCase() === "PENDING" && (
                  <button
                    onClick={() => handleCollectPayment(order.id)}
                    disabled={collectingPaymentId === order.id}
                    className="w-full mt-2 bg-green-600 text-white py-2 rounded-md font-semibold disabled:opacity-60"
                  >
                    {collectingPaymentId === order.id
                      ? "Collecting..."
                      : `Collect Payment ₹${order.amount_to_collect}`}
                  </button>
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