// src/Services/training.js

import axios from "axios";

// If you have a base URL in .env, use it; otherwise fallback to relative path
const BASE_URL =
  import.meta.env?.VITE_API_URL ||
  process.env?.REACT_APP_API_URL ||
  "";

const API_URL = `${BASE_URL}/api/v1/common/delivery-partner/store-training-info/`;

/* =========================================================
   GET AUTH TOKEN
========================================================= */
const getToken = () => {
  return (
    localStorage.getItem("access_token") ||
    localStorage.getItem("accessToken") ||
    localStorage.getItem("token") ||
    ""
  );
};

/* =========================================================
   COMMON HEADERS
========================================================= */
const getHeaders = () => {
  const token = getToken();
  return {
    "Content-Type": "application/json",
    ...(token ? { Authorization: `Bearer ${token}` } : {}),
  };
};

/* =========================================================
   1. GET TRAINING STATUS FROM API
========================================================= */
export const getTrainingInfo = async () => {
  try {
    const response = await axios.get(API_URL, {
      headers: getHeaders(),
    });

    const data = response.data?.data || response.data || {};
    
    // Calculate progress number from boolean flags
    let progress = 0;
    if (data.first_video) progress = 1;
    if (data.first_video && data.second_video) progress = 2;
    if (data.first_video && data.second_video && data.third_video) progress = 3;

    // Sync to localStorage
    localStorage.setItem("training_progress", String(progress));
    if (progress === 3) {
      localStorage.setItem("training_completed", "true");
    }

    return {
      raw: data,
      first_video: Boolean(data.first_video),
      second_video: Boolean(data.second_video),
      third_video: Boolean(data.third_video),
      progress,
    };
  } catch (error) {
    console.error("Error fetching training info:", error);
    // Fallback to localStorage if offline/network fails
    const localProgress = Number(localStorage.getItem("training_progress") || 0);
    return {
      first_video: localProgress >= 1,
      second_video: localProgress >= 2,
      third_video: localProgress >= 3,
      progress: localProgress,
    };
  }
};

/* =========================================================
   2. MARK TRAINING VIDEO COMPLETED
========================================================= */
export const markTrainingVideoCompleted = async (videoNumber) => {
  const num = Number(videoNumber);

  // Send cumulative payload so previously completed videos stay true
  const payload = {
    first_video: num >= 1,
    second_video: num >= 2,
    third_video: num >= 3,
  };

  console.log(`[Training API] Sending completion for Video ${num}:`, payload);

  try {
    const response = await axios.post(API_URL, payload, {
      headers: getHeaders(),
    });

    console.log("[Training API] Response:", response.data);

    // Update local storage on success
    localStorage.setItem("training_progress", String(num));
    if (num >= 3) {
      localStorage.setItem("training_completed", "true");
    }

    return response.data;
  } catch (error) {
    console.error(
      "[Training API] Error saving training info:",
      error.response?.data || error.message
    );
    throw error;
  }
};
