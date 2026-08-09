import api from "./api";

export const getEarnings = async () => {
  const res = await api.post(
    "/api/v1/common/delivery-partner/my-earnings-dp/"
  );

  return res.data;
};


export const requestPayment = async () => {
  const res = await api.post(
    "/api/v1/common/delivery-partner/payment-request-dp/",
    {
      is_requesting_payment: true
    }
  );

  return res.data;
};
