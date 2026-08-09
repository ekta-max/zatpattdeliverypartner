//src\pages\VerificationPendingPage.jsx

import React, { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { Clock3 } from "lucide-react";
import { getMyProfileDp } from "../Services/profileDp";

export default function VerificationPendingPage() {
  const navigate = useNavigate();
  const [checking, setChecking] = useState(true);

  useEffect(() => {
    const checkStatus = async () => {
      try {
        const profileRes = await getMyProfileDp();
        console.log("Verification status check ✅", profileRes);

        const profile = profileRes?.data;

        if (profile?.is_verified) {
          navigate("/training-intro", { replace: true });
          return;
        }

        // still not verified — stay on this page
        setChecking(false);
      } catch (err) {
        console.error("Verification status check failed ❌", err);
        // if the check fails, don't strand the user — just show the pending screen
        setChecking(false);
      }
    };

    checkStatus();
  }, [navigate]);

  if (checking) {
    return (
      <div className="min-h-screen flex flex-col items-center justify-center bg-white">
        <div className="animate-spin w-10 h-10 border-4 border-orange-500 border-t-transparent rounded-full" />
        <p className="mt-4 text-sm text-gray-500">Checking your status…</p>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-white flex flex-col items-center justify-center px-6 text-center">
      <div className="w-20 h-20 rounded-full bg-orange-100 flex items-center justify-center mb-6">
        <Clock3 size={36} className="text-orange-500" />
      </div>

      <h1 className="text-lg font-semibold mb-2">
        Verification in progress
      </h1>

      <p className="text-sm text-gray-500 max-w-xs">
        Your documents are being reviewed. This usually takes 24–48 hours.
        We'll notify you once you're verified.
      </p>
    </div>
  );
}