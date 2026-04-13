//src\Services\workdetails.js

import api from "./api"; // ✅ ADD THIS LINE

export const getCities = async () => {
  const res = await api.post(
    "/api/v1/common/delivery-partner/city-dropdown/"
  );

  // 🔥 FIX: return actual array
  return res.data.data; 
};


export const submitWorkDetails = async ({ city, vehicle_type }) => {
  const res = await api.post(
    "/api/v1/common/delivery-partner/work-details/",
    {
      user: 37,
      city,
      vehicle_type,
    }
  );
  return res.data;
};