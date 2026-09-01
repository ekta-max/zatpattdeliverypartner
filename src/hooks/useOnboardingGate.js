// src/hooks/useOnboardingGate.js

import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { getDpData } from "../Services/dpData";
import { resolveOnboardingRoute } from "../utils/onboardingRouter";

export function useOnboardingGate(currentRoute) {
  const navigate = useNavigate();
  const [loading, setLoading] = useState(true);
  const [dpData, setDpData] = useState(null);

  useEffect(() => {
    let isMounted = true;

    const checkAccess = async () => {
      setLoading(true);
      const data = await getDpData();

      if (!isMounted) return;

      setDpData(data);
      const targetRoute = resolveOnboardingRoute(data);

      // If partner is on a page ahead of their completion status, redirect them back
      if (currentRoute && targetRoute !== currentRoute && shouldRedirect(currentRoute, targetRoute)) {
        navigate(targetRoute, { replace: true });
      }

      setLoading(false);
    };

    checkAccess();

    return () => {
      isMounted = false;
    };
  }, [currentRoute, navigate]);

  return { loading, dpData };
}

function shouldRedirect(current, target) {
  const order = [
    "/work-details",
    "/personal-details",
    "/order-partner-kit",
    "/verification-pending",
    "/training-intro",
    "/training",
    "/training-completed",
    "/seva-shifts",
    "/dashboard",
  ];

  const currentIndex = order.indexOf(current);
  const targetIndex = order.indexOf(target);

  // If the user tries to access a step beyond what they have completed, redirect
  if (currentIndex > targetIndex && targetIndex !== -1) {
    return true;
  }

  return false;
}
