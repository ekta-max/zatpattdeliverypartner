// src/Services/orders.js

import api from "./api";

/**
 * CASE TRACKING API
 *
 * Tabs:
 * new
 * accepted
 * picked-up
 * delivered
 *
 * User is taken from request.user in the backend.
 */
export const getOrdersByStatus = async (status = "new") => {
  const res = await api.post(
    "/api/v1/common/delivery-partner/case-tracking/",
    {
      status,
    }
  );

  return res.data;
};

/**
 * ACCEPT ORDER
 *
 * Backend gets logged-in user from request.user
 */
export const acceptOrderApi = async (orderId) => {
  const res = await api.post(
    "/api/v1/common/delivery-partner/accept-order/",
    {
      order_id: orderId,
    }
  );

  return res.data;
};

/**
 * MARK PICKED UP
 *
 * Backend gets logged-in user from request.user
 */
export const markPickedUpApi = async (orderId) => {
  const res = await api.post(
    "/api/v1/common/delivery-partner/mark-picked-up/",
    {
      order_id: orderId,
    }
  );

  return res.data;
};

/**
 * VERIFY DELIVERY OTP
 *
 * POST /otp-match/
 *
 * Backend gets logged-in user from request.user
 */
export const verifyDeliveryOtpApi = async ({
  orderId,
  otp,
}) => {
  const res = await api.post(
    "/api/v1/common/delivery-partner/otp-match/",
    {
      order_id: orderId,
      otp,
    }
  );

  return res.data;
};

/**
 * MARK DELIVERED
 *
 * Backend gets logged-in user from request.user
 */
export const markDeliveredApi = async (orderId) => {
  const res = await api.post(
    "/api/v1/common/delivery-partner/mark-delivered/",
    {
      order_id: orderId,
    }
  );

  return res.data;
};

/**
 * COLLECT PAYMENT (COD)
 *
 * POST /collect-payment/
 *
 * Backend gets logged-in user from request.user
 */
export const collectPaymentApi = async (orderId) => {
  const res = await api.post(
    "/api/v1/common/delivery-partner/collect-payment/",
    {
      order_id: orderId,
    }
  );

  return res.data;
};