//src\pages\VerificationPendingPage.jsx

import { useEffect } from "react";
import { useNavigate } from "react-router-dom";

export default function VerificationPendingPage() {
  const navigate = useNavigate();

  useEffect(() => {
    // 🚫 Hard block onboarding
    localStorage.setItem("onboarding_locked", "true");

    const checkVerification = () => {
      // 🔁 MOCK (replace with Django API later)
      const status =
        localStorage.getItem("verification_status") || "pending";

      if (status === "verified") {
        navigate("/training-intro", { replace: true });
      }
    };

    // initial check
    checkVerification();

    // poll every 5 seconds
    const interval = setInterval(checkVerification, 5000);

    return () => clearInterval(interval);
  }, [navigate]);

  return (
    <div className="min-h-screen flex flex-col items-center justify-center px-6 bg-white">
      <div className="w-14 h-14 rounded-full border-4 border-orange-500 border-t-transparent animate-spin mb-6" />

      <h2 className="text-lg font-semibold text-center">
        We’re verifying your documents
      </h2>

      <p className="text-sm text-gray-500 mt-2 text-center max-w-xs">
        This usually takes a few hours.  
        You’ll automatically move forward once verified.
      </p>
    </div>
  );
}
