// src/pages/LoginPage.jsx

import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { requestOtp } from "../Services/auth";

export default function LoginPage() {
  const navigate = useNavigate();

  const [mobile, setMobile] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (!mobile) setError("");
    else if (!/^[6-9]\d{9}$/.test(mobile))
      setError("Enter a valid 10 digit mobile number");
    else setError("");
  }, [mobile]);

  const isValid = /^[6-9]\d{9}$/.test(mobile);

  const handleContinue = async () => {
    if (!isValid || loading) return;

    try {
      setLoading(true);

      const res = await requestOtp(mobile);

      console.log("OTP API ✅", res);

      localStorage.setItem("login_mobile", mobile);

      navigate("/otp", {
        state: { phone: mobile },
      });

    } catch (err) {
      console.error("OTP API error ❌", err);
      alert("Failed to send OTP");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-white flex flex-col px-6">
      {/* BRAND */}
      <div className="mt-14 mb-10 text-center">
        <div className="text-4xl font-extrabold text-orange-500">
          ZatPatt
        </div>

        <div className="mt-1 text-sm font-semibold text-gray-800 tracking-wide">
          Delivery Partner
        </div>
      </div>

      {/* TITLE */}
      <div className="text-center mb-8">
        <h2 className="text-xl font-semibold text-gray-900">
          Sign in to your account
        </h2>

        <p className="text-sm text-gray-500 mt-1">
          Login or create an account
        </p>
      </div>

      {/* MOBILE INPUT */}
      <div>
        <div
          className={`
            flex items-center
            border rounded-xl px-4 py-3
            transition
            ${
              mobile
                ? "border-orange-400"
                : "border-gray-300"
            }
            focus-within:ring-2 focus-within:ring-orange-500
          `}
        >
          <span className="text-lg mr-2">🇮🇳</span>

          <span className="text-sm font-semibold text-gray-800">
            +91
          </span>

          <div className="mx-3 h-5 w-px bg-gray-300" />

          <input
            type="tel"
            inputMode="numeric"
            pattern="[0-9]*"
            placeholder="Enter mobile number"
            value={mobile}
            onChange={(e) =>
              setMobile(
                e.target.value.replace(/\D/g, "")
              )
            }
            maxLength={10}
            className="flex-1 bg-transparent outline-none text-sm text-gray-900"
          />
        </div>

        {error && (
          <p className="text-xs text-red-500 mt-2">
            {error}
          </p>
        )}
      </div>

      <div className="flex-1" />

      {/* FOOTER */}
      <div className="pb-6">
        <p className="text-[11px] text-gray-500 text-center mb-3">
          By continuing you agree to our
          <span className="text-orange-500 font-medium">
            {" "}Terms{" "}
          </span>
          &
          <span className="text-orange-500 font-medium">
            {" "}Privacy Policy
          </span>
        </p>

        <button
          onClick={handleContinue}
          disabled={!isValid || loading}
          className={`
            w-full py-3 rounded-xl font-semibold transition
            ${
              isValid && !loading
                ? "bg-orange-500 text-white active:bg-orange-600"
                : "bg-gray-200 text-gray-400 cursor-not-allowed"
            }
          `}
        >
          {loading ? "Sending OTP..." : "Continue"}
        </button>
      </div>
    </div>
  );
}
