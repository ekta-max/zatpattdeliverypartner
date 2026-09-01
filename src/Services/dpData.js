// src/Services/dpData.js

import api from "./api";

/**
 * Retrieves stored authentication token
 */
export const getAuthToken = () => {
  return (
    localStorage.getItem("access_token") ||
    localStorage.getItem("accessToken") ||
    localStorage.getItem("access") ||
    localStorage.getItem("token")
  );
};

/**
 * Fetch delivery partner data from Django API
 *
 * Base URL comes from api.js / VITE_API_URL
 * No hardcoded localhost:8002
 */
export const getDpData = async () => {
  try {
    const response = await api.get(
      "/api/v1/common/delivery-partner/dp-data/"
    );

    const result = response.data;

    if (result && result.status === true && result.data) {
      // Sync cache in localStorage
      localStorage.setItem(
        "dp_data",
        JSON.stringify(result.data)
      );

      return result.data;
    }

    return null;
  } catch (error) {
    console.error(
      "Failed to fetch getDpData:",
      error.response?.data || error.message
    );

    return null;
  }
};

// Alias
export const fetchDpData = getDpData;

export default getDpData;