// src/Services/otp.js

import api from "./api";

/**
 * Verify OTP
 * POST /api/v1/users/delivery-partner/verify-otp/
 */
export const verifyOtp = async ({ mobile, otp }) => {
  const res = await api.post(
    "/api/v1/users/delivery-partner/verify-otp/",
    {
      mobile,
      otp,
    }
  );

  return res.data;
};