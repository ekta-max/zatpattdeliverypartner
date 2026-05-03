// src/pages/EarningsPage.jsx
import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { ArrowLeft } from "lucide-react";
import { getEarnings, requestPayment } from "../Services/earnings";


export default function EarningsPage() {
  const navigate = useNavigate();

  const [earnings, setEarnings] = useState({
    daily: 0,
    weekly: 0,
    monthly: 0,
    total: 0,
    bonuses: 0,
  });

  const [pending, setPending] = useState(0);
  const [withdrawStatus, setWithdrawStatus] = useState("none"); 
  // none | pending | completed

  // ------------------------------------------------------
  // LOAD DATA FROM STORAGE
  // ------------------------------------------------------
  useEffect(() => {
  const fetchEarnings = async () => {
    try {
      const data = await getEarnings();

      console.log("Earnings API ✅", data);

      // 🔥 SAFE MAPPING (handles all formats)
      const e = data.data || data;

      setEarnings({
  daily: e.today?.earnings || 0,
  weekly: e.week?.earnings || 0,
  monthly: e.month?.earnings || 0,
  total: e.total?.earnings || 0,
  bonuses: 0, // ❗ backend not sending bonuses yet
});

setPending(e.pending_payment || 0);
      
    } catch (err) {
      console.error("Earnings API error ❌", err);
    }
  };

  fetchEarnings();

  // still keep withdraw status from localStorage
  const withdraw = localStorage.getItem("withdraw_request") || "none";
  setWithdrawStatus(withdraw);

}, []);

  // ------------------------------------------------------
  // HANDLE WITHDRAW REQUEST
  // ------------------------------------------------------
  const handleWithdrawRequest = async () => {
  if (pending === 0) return;

  try {
    await requestPayment();

    console.log("Payment request sent ✅");

    // ✅ Update UI
    setWithdrawStatus("pending");

    // optional local fallback
    localStorage.setItem("withdraw_request", "pending");

  } catch (err) {
    console.error("Payment request API error ❌", err);
    alert("Failed to request payment");
  }
};

  return (
    <div className="min-h-screen bg-orange-50 flex flex-col">

      {/* HEADER */}
      <header className="bg-orange-500 text-white py-4 px-6 shadow-lg flex items-center relative justify-center">
        <button
          onClick={() => navigate(-1)}
          className="absolute left-4 bg-white text-orange-500 p-2 rounded-full shadow hover:bg-gray-100 transition"
        >
          <ArrowLeft size={20} />
        </button>
        <h1 className="text-xl font-bold">Earnings</h1>
      </header>

      <div className="p-6 max-w-4xl mx-auto w-full space-y-4">

        {/* DAILY / WEEKLY / MONTHLY */}
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
          <EarningBox label="Today" value={earnings.daily} />
          <EarningBox label="This Week" value={earnings.weekly} />
          <EarningBox label="This Month" value={earnings.monthly} />
        </div>

        {/* TOTAL & BONUSES */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <EarningBox label="Total Earnings" value={earnings.total} />
          <EarningBox label="Bonuses & Incentives" value={earnings.bonuses} />
        </div>

        {/* WALLET (PENDING ONLY) */}
        <div className="bg-white p-4 rounded-2xl shadow space-y-3">
          <h2 className="text-lg font-semibold">Wallet</h2>

          <div className="flex justify-between text-sm">
            <span>Pending Balance:</span>
            <span className="font-bold text-gray-700">₹{pending}</span>
          </div>

          {/* WITHDRAW STATUS */}
          {withdrawStatus === "pending" && (
            <p className="text-orange-600 text-sm font-semibold mt-1">
              Withdrawal Requested — Awaiting admin approval
            </p>
          )}

          {/* REQUEST WITHDRAW BUTTON */}
          <button
            disabled={pending === 0 || withdrawStatus === "pending"}
            onClick={handleWithdrawRequest}
            className={`mt-2 w-full py-2 rounded-xl text-white font-semibold 
              ${pending === 0 || withdrawStatus === "pending" 
                ? "bg-gray-400 cursor-not-allowed" 
                : "bg-orange-500 active:scale-95"
              }`}
          >
            {withdrawStatus === "pending" ? "Request Sent" : "Request Withdrawal"}
          </button>
        </div>

        {/* NOTES */}
        <div className="text-sm text-gray-500">
          * Earnings update automatically after every delivered order.  
          * Pending balance is the amount to be paid by admin.  
          * Withdrawal resets pending balance to ₹0 after admin approves.
        </div>
      </div>
    </div>
  );
}

// ------------------------------------------------------
// REUSABLE BOX COMPONENT
// ------------------------------------------------------
function EarningBox({ label, value }) {
  return (
    <div className="bg-white p-4 rounded-2xl shadow text-center">
      <div className="text-sm text-gray-500">{label}</div>
      <div className="text-2xl font-bold">₹{value}</div>
    </div>
  );
}
