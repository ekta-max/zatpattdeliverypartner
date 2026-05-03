import api from "./api";

/**
 * Get Delivery Partner Earnings
 * POST /api/v1/common/delivery-partner/my-earnings-dp/
 */
export const getEarnings = async () => {
  const res = await api.post(
    "/api/v1/common/delivery-partner/my-earnings-dp/",
    {
      user: 10, // ⚠️ change later dynamically
    }
  );

  return res.data;
};

/**
 * Request Payment
 * POST /api/v1/common/delivery-partner/payment-request-dp/
 */
export const requestPayment = async () => {
  const res = await api.post(
    "/api/v1/common/delivery-partner/payment-request-dp/",
    {
      user: 10,
      is_requesting_payment: true,
    }
  );

  return res.data;
};
