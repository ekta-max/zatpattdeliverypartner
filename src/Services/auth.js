// src/Services/auth.js

import api from "./api";

export const requestOtp = async (mobile) => {
  const res = await api.post(
    "/api/v1/users/admin/request-otp/",
    {
      mobile,
    }
  );

  return res.data;
};