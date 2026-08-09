// src/Services/otp.js

import api from "./api";

export const verifyOtp = async ({ mobile, otp }) => {
  const res = await api.post(
    "/api/v1/users/admin/verify-otp/",
    {
      mobile,
      otp,
      role: "delivery partner",
    }
  );

  return res.data;
};