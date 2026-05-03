//src\Services\dashboard.js

import api from "./api";

/**
 * Delivery Partner Dashboard API
 * POST /api/v1/common/delivery-partner/dp-dashboard/
 */
export const getDashboardData = async () => {
  const res = await api.post(
    "/api/v1/common/delivery-partner/dp-dashboard/",
    {
      user: 10, // ✅ change dynamically later
    }
  );

  return res.data;
};