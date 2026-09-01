// src/Services/dpService.js

import api from "./api";

/**
 * Fetch delivery partner data from Django API
 *
 * The base URL and Authorization token are handled
 * automatically by src/Services/api.js
 */
export const fetchDpData = async () => {
  try {
    const response = await api.get(
      "/api/v1/common/delivery-partner/dp-data/"
    );

    console.log("DP data response:", response.data);

    if (
      response.data?.status === true &&
      response.data?.data
    ) {
      const data = response.data.data;

      // Sync API data with localStorage
      syncDpDataToStorage(data);

      return data;
    }

    return null;
  } catch (error) {
    console.error(
      "Failed to fetch dp-data:",
      error
    );

    console.error(
      "DP API response:",
      error?.response?.data
    );

    return null;
  }
};

/**
 * Evaluates completion criteria for all
 * onboarding & verification steps
 */
export const evaluateDpProgress = (data) => {
  if (!data) {
    return {
      step1Done: false,
      step2Done: false,
      step3Done: false,
      isVerified: false,
      trainingDone: false,
      nextRoute: "/work-details",
    };
  }

  // =========================================================
  // STEP 1
  // Requires city AND vehicle_type
  // =========================================================

  const step1Done = Boolean(
    data.city &&
      String(data.city).trim() !== "" &&
      data.vehicle_type &&
      String(data.vehicle_type).trim() !== ""
  );

  // =========================================================
  // STEP 2
  // Requires Aadhaar, PAN, Bank Account & Selfie
  // =========================================================

  const step2Done = Boolean(
    data.adhaar_card_number &&
      String(data.adhaar_card_number).trim() !== "" &&
      data.pan_card_number &&
      String(data.pan_card_number).trim() !== "" &&
      data.bank_account_number &&
      String(data.bank_account_number).trim() !== "" &&
      data.selfie &&
      String(data.selfie).trim() !== ""
  );

  // =========================================================
  // STEP 3
  // Requires T-shirt size
  // =========================================================

  const step3Done = Boolean(
    data.tshirt_size &&
      String(data.tshirt_size).trim() !== ""
  );

  // =========================================================
  // VERIFICATION
  // =========================================================

  const isVerified = Boolean(data.is_verified);

  // =========================================================
  // TRAINING COMPLETION
  // =========================================================

  const trainingDone = Boolean(
    (
      data.training_data &&
      data.training_data.first &&
      data.training_data.second &&
      data.training_data.third
    ) ||
      localStorage.getItem("training_completed") ===
        "true"
  );

  // =========================================================
  // DETERMINE NEXT ROUTE
  // =========================================================

  let nextRoute = "/work-details";

  if (!step1Done) {
    nextRoute = "/work-details";
  } else if (!step2Done) {
    nextRoute = "/personal-details";
  } else if (!step3Done) {
    nextRoute = "/order-partner-kit";
  } else if (!isVerified) {
    nextRoute = "/verification-pending";
  } else if (!trainingDone) {
    nextRoute = "/training-intro";
  } else {
    nextRoute = "/seva-shifts";
  }

  return {
    step1Done,
    step2Done,
    step3Done,
    isVerified,
    trainingDone,
    nextRoute,
  };
};

/**
 * Synchronize incoming API data with localStorage
 */
export const syncDpDataToStorage = (data) => {
  if (!data) return;

  // =========================================================
  // ONBOARDING PROGRESS
  // =========================================================

  const progress = {
    work_details:
      data.city && data.vehicle_type
        ? "completed"
        : "pending",

    personal_details:
      data.adhaar_card_number &&
      data.pan_card_number
        ? "completed"
        : "pending",

    kit_ordered: Boolean(data.tshirt_size),
  };

  localStorage.setItem(
    "onboarding_progress",
    JSON.stringify(progress)
  );

  // =========================================================
  // VERIFICATION STATUS
  // =========================================================

  localStorage.setItem(
    "verification_status",
    data.is_verified
      ? "verified"
      : "pending"
  );

  // =========================================================
  // PERSONAL DETAILS
  // =========================================================

  localStorage.setItem(
    "personal_details",
    JSON.stringify({
      firstName: data.first_name || "",
      lastName: data.last_name || "",
      email: data.email || "",
      gender: data.gender || "",
      dob: data.dob || "",

      aadhaar:
        data.adhaar_card_number || "",

      pan:
        data.pan_card_number || "",

      vehicleNumber:
        data.vehicle_number || "",

      bank:
        data.account_holder_name || "",

      account:
        data.bank_account_number || "",

      ifsc:
        data.ifsc_code || "",
    })
  );
};