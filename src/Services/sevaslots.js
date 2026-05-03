import api from "./api";

/**
 * Get available slots
 * POST /list-slots/
 */
export const getSevaSlots = async () => {
  const res = await api.post(
    "/api/v1/common/delivery-partner/list-slots/",
    {
      user: 10,
    }
  );

  return res.data;
};

/**
 * Select slots
 * POST /select-slots/
 */
export const selectSevaSlots = async (slots) => {
  const res = await api.post(
    "/api/v1/common/delivery-partner/select-slots/",
    {
      user: 10,
      slots, // [1,2]
    }
  );

  return res.data;
};