//src\pages\PaymentSuccessPage.jsx

import { useEffect } from "react";
import { useNavigate } from "react-router-dom";

export default function PaymentSuccessPage() {
  const navigate = useNavigate();

  useEffect(() => {
    const timer = setTimeout(() => {
      navigate("/verification-pending", { replace: true });
    }, 1500);

    return () => clearTimeout(timer);
  }, [navigate]);

  return (
    <div className="h-screen flex flex-col items-center justify-center bg-white">
      <div className="w-20 h-20 rounded-full bg-orange-500 flex items-center justify-center text-white text-3xl">
        ✓
      </div>

      <p className="mt-4 font-semibold text-lg">
        Payment Successful
      </p>

      <p className="text-sm text-gray-500">
        Redirecting…
      </p>
    </div>
  );
}
