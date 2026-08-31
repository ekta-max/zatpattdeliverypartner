// src/Services/dpData.js

const DP_DATA_URL = "http://127.0.0.1:8002/api/v1/common/delivery-partner/dp-data/";

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
 */
export const getDpData = async () => {
  try {
    const token = getAuthToken();
    const headers = {
      "Content-Type": "application/json",
    };

    if (token) {
      headers.Authorization = `Bearer ${token}`;
    }

    const response = await fetch(DP_DATA_URL, {
      method: "GET",
      headers,
      credentials: "include",
    });

    if (!response.ok) {
      console.error(`dp-data API error (${response.status})`);
      return null;
    }

    const result = await response.json();

    if (result && result.status === true && result.data) {
      // Sync cache in localStorage
      localStorage.setItem("dp_data", JSON.stringify(result.data));
      return result.data;
    }

    return null;
  } catch (error) {
    console.error("Failed to fetch getDpData:", error);
    return null;
  }
};

// Also export as default and fetchDpData alias for flexible imports
export const fetchDpData = getDpData;
export default getDpData;
