//src\pages\PartnerKitOrderPage.jsx

import React, { useState } from "react";
import { ArrowLeft, HelpCircle } from "lucide-react";
import { useNavigate } from "react-router-dom";
import { useEffect } from "react";

import KitImage from "../assets/partner-kit.png";
import TshirtModel from "../assets/tshirt-model.png";
import DeliveryConfirm from "../assets/delivery-confirm.png";
import { DEV_MODE } from "../config/appConfig";
import { submitPartnerKit } from "../Services/partnerkit";


const SIZES = ["S", "M", "L", "XL", "2XL"];

export default function PartnerKitOrderPage() {
  const navigate = useNavigate();
  const [step, setStep] = useState(1);

  const [size, setSize] = useState("");
  const [paymentMode, setPaymentMode] = useState("now");

  const [address, setAddress] = useState({
  house: "",
  locality: "",
  landmark: "",
  pincode: "",
  city: "",
  state: "",
  });

  const progressPercent = (step / 5) * 100;

  useEffect(() => {
  const progress = JSON.parse(
    localStorage.getItem("onboarding_progress")
  );

  // ❌ Block access if personal details not done
  // if (progress?.personal_details !== "completed") {
  //   navigate("/personal-details", { replace: true });
  // }


  if (!DEV_MODE && progress?.personal_details !== "completed") {
  navigate("/personal-details");
}


  // ❌ Block access if kit already ordered
  if (progress?.kit_ordered === true) {
    navigate("/verification-pending", { replace: true });
  }
}, [navigate]);


  return (
    <div className="min-h-screen bg-white flex flex-col">
      {/* ===== HEADER ===== */}
      <div className="flex items-center px-4 py-3 border-b">
       <button
          onClick={() => {
            if (step > 1) setStep(step - 1);
            if (step === 1) return;
          }}
        >
          <ArrowLeft />
        </button>
        <h1 className="flex-1 text-center font-semibold">
          Zatpatt Partner Kit
        </h1>
        <HelpCircle className="text-orange-500" />
      </div>

      {/* ===== PROGRESS BAR ===== */}
      <div className="px-4 mt-3">
        <div className="h-1 bg-gray-200 rounded">
          <div
            className="h-1 bg-orange-500 rounded transition-all"
            style={{ width: `${progressPercent}%` }}
          />
        </div>
      </div>

      {/* ===== CONTENT ===== */}
      <div className="flex-1 px-4 pt-6">

        {/* ================= STEP 1 – INTRO ================= */}
        {step === 1 && (
          <>
            <div className="flex justify-center mt-6">
              <img src={KitImage} className="w-64" />
            </div>

            <h2 className="text-xl font-bold text-center mt-6">
              Earn upto ₹5000 in first week!
            </h2>

            <p className="text-sm text-gray-500 text-center mt-2">
              Pay only for bag and get 2 T-shirts free
            </p>

            <button
              onClick={() => setStep(2)}
              className="mt-10 w-full bg-orange-500 text-white py-3 rounded-xl font-semibold"
            >
              Select T-shirt size
            </button>
          </>
        )}

        {/* ================= STEP 2 – SIZE ================= */}
        {step === 2 && (
          <>
            <h2 className="text-lg font-semibold mb-4">
              Select T-shirt Size
            </h2>

            <div className="flex justify-center mb-6">
              <img src={TshirtModel} className="w-48" />
            </div>

            <div className="flex gap-3 justify-center">
              {SIZES.map((s) => (
                <button
                  key={s}
                  onClick={() => setSize(s)}
                  className={`w-12 h-12 rounded-full border ${
                    size === s
                      ? "bg-orange-500 text-white border-orange-500"
                      : "border-gray-300"
                  }`}
                >
                  {s}
                </button>
              ))}
            </div>

            <button
              disabled={!size}
              onClick={() => setStep(3)}
              className={`mt-10 w-full py-3 rounded-xl font-semibold ${
                size
                  ? "bg-orange-500 text-white"
                  : "bg-gray-200 text-gray-400"
              }`}
            >
              Continue
            </button>
          </>
        )}

        {/* ================= STEP 3 – ADDRESS ================= */}
    {step === 3 && (
     <>
     <h2 className="text-lg font-semibold mb-4">
      Shipping address for t-shirt/bag delivery
     </h2>

    <input
      placeholder="House / Flat number"
      value={address.house}
      onChange={(e) =>
        setAddress({ ...address, house: e.target.value })
      }
      className="w-full border rounded-xl px-4 py-3 mb-3"
    />

    <input
      placeholder="Building / Locality"
      value={address.locality}
      onChange={(e) =>
        setAddress({ ...address, locality: e.target.value })
      }
      className="w-full border rounded-xl px-4 py-3 mb-3"
    />

    <input
      placeholder="Landmark (optional)"
      value={address.landmark}
      onChange={(e) =>
        setAddress({ ...address, landmark: e.target.value })
      }
      className="w-full border rounded-xl px-4 py-3 mb-3"
    />

    <input
      placeholder="Pin code"
      value={address.pincode}
      onChange={(e) =>
        setAddress({ ...address, pincode: e.target.value })
      }
      className="w-full border rounded-xl px-4 py-3 mb-3"
    />

    <input
      placeholder="City"
      value={address.city}
      onChange={(e) =>
        setAddress({ ...address, city: e.target.value })
      }
      className="w-full border rounded-xl px-4 py-3 mb-3"
    />

    <input
      placeholder="State"
      value={address.state}
      onChange={(e) =>
        setAddress({ ...address, state: e.target.value })
      }
      className="w-full border rounded-xl px-4 py-3 mb-3"
    />

   <button
  disabled={
    !address.house ||
    !address.locality ||
    !address.pincode ||
    !address.city ||
    !address.state
  }
  onClick={() => setStep(4)}
  className={`mt-6 w-full py-3 rounded-xl font-semibold ${
    address.house &&
    address.locality &&
    address.pincode &&
    address.city &&
    address.state
      ? "bg-orange-500 text-white"
      : "bg-gray-200 text-gray-400 cursor-not-allowed"
  }`}
>
  Continue
</button>

  </>
)}

        {/* ================= STEP 4 – CONFIRM ================= */}
    {step === 4 && (
       <>
        <img
            src={DeliveryConfirm}
            className="w-full h-64 object-cover rounded-xl"
        />

    {/* 📍 ADDRESS PREVIEW */}
    <div className="bg-gray-50 border rounded-xl p-4 mt-4 text-sm">
      <p className="font-semibold text-gray-900 mb-1">
        Deliver to this address:
      </p>

      <p>
        {address.house}, {address.locality}
      </p>

      {address.landmark && (
        <p>Near {address.landmark}</p>
      )}

      <p>
        {address.city}, {address.state} – {address.pincode}
      </p>
    </div>

    <button
      onClick={() => setStep(5)}
      className="mt-6 w-full bg-orange-500 text-white py-3 rounded-xl font-semibold"
    >
      Yes, deliver here
    </button>

    <button
      onClick={() => setStep(3)}
      className="mt-3 w-full border border-orange-500 text-orange-500 py-3 rounded-xl font-semibold"
    >
      No, change address
    </button>
  </>
)}

        {/* ================= STEP 5 – PAYMENT ================= */}
        {step === 5 && (
          <>
            <h2 className="text-lg font-semibold mb-4">
              Pay Onboarding Fee
            </h2>

            <PaymentOption
              checked={paymentMode === "now"}
              onClick={() => setPaymentMode("now")}
              title="Pay Now"
              subtitle="₹1,599 (₹400 discount)"
            />

            <PaymentOption
              checked={paymentMode === "installments"}
              onClick={() => setPaymentMode("installments")}
              title="Pay in Installments"
              subtitle="₹499 now"
            />

            <button
            onClick={async () => {
  if (!size) {
    alert("Please select T-shirt size");
    return;
  }

  try {
    // ✅ CALL NEW API
    await submitPartnerKit({
      tshirt_size: size,
    });

    console.log("Partner kit submitted ✅");

    // ✅ SAVE LOCAL DATA
    localStorage.setItem(
      "partner_kit",
      JSON.stringify({
        tshirt_size: size,
        address,
        payment_mode: paymentMode,
      })
    );

    // ✅ UPDATE PROGRESS
    const existing =
      JSON.parse(localStorage.getItem("onboarding_progress")) || {};

    localStorage.setItem(
      "onboarding_progress",
      JSON.stringify({
        ...existing,
        kit_ordered: true,
      })
    );

    // ✅ REDIRECT
    navigate("/payment-success", { replace: true });

  } catch (err) {
    console.error("Partner kit API error ❌", err);
    alert("Failed to submit partner kit");
  }
}}

              className="mt-8 w-full bg-orange-500 text-white py-3 rounded-xl font-semibold"
            >
              Proceed to Pay
            </button>
          </>
        )}
      </div>
    </div>
  );
}

function PaymentOption({ checked, onClick, title, subtitle }) {
  return (
    <div
      onClick={onClick}
      className={`border rounded-xl p-4 mb-3 cursor-pointer ${
        checked ? "border-orange-500 bg-orange-50" : ""
      }`}
    >
      <p className="font-semibold">{title}</p>
      <p className="text-xs text-gray-500">{subtitle}</p>
    </div>
  );
}
