// src/Services/redirection.js

import api from "./api";

/**
 * Ask backend which page the delivery partner should land on
 * GET /api/v1/common/delivery-partner/page-redirection/
 */
export const getPageRedirection = async () => {
  const res = await api.get(
    "/api/v1/common/delivery-partner/page-redirection/"
  );
  return res.data; // { status: true, data: { page: "select-slot" } }
};