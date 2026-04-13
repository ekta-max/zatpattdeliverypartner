import api from "./api";

/**
 * Final Step - Partner Kit Selection
 * POST /api/v1/common/delivery-partner/final-step/
 */
export const submitPartnerKit = async ({ tshirt_size }) => {
  const res = await api.post(
    "/api/v1/common/delivery-partner/final-step/",
    {
      user: 37,
      tshirt_size: tshirt_size.toLowerCase(), // ✅ backend format
    }
  );

  return res.data;
};
