// src/Services/orders.js

import api from "./api";

/**
 * CASE TRACKING API
 * Tabs:
 * new
 * accepted
 * picked-up
 * delivered
 */
export const getOrdersByStatus = async (status = "new") => {
  const res = await api.post(
    "/api/v1/common/delivery-partner/case-tracking/",
    {
      user: 10, // ⚠️ make dynamic later
      status,
    }
  );

  return res.data;
};

/**
 * ACCEPT ORDER
 */
export const acceptOrderApi = async (orderId) => {
  const res = await api.post(
    "/api/v1/common/delivery-partner/accept-order/",
    {
      user: 10,
      order_id: orderId,
    }
  );

  return res.data;
};

/**
 * MARK PICKED UP
 */
export const markPickedUpApi = async (orderId) => {
  const res = await api.post(
    "/api/v1/common/delivery-partner/mark-picked-up/",
    {
      user: 10,
      order_id: orderId,
    }
  );

  return res.data;
};

/**
 * VERIFY DELIVERY OTP
 * POST /otp-match/
 */
export const verifyDeliveryOtpApi = async ({
  orderId,
  otp,
}) => {
  const res = await api.post(
    "/api/v1/common/delivery-partner/otp-match/",
    {
      user: 10,
      order_id: orderId,
      otp,
    }
  );

  return res.data;
};

/**
 * MARK DELIVERED
 */
export const markDeliveredApi = async (orderId) => {
  const res = await api.post(
    "/api/v1/common/delivery-partner/mark-delivered/",
    {
      user: 10,
      order_id: orderId,
    }
  );

  return res.data;
};