// src/Services/dpService.js

const DP_DATA_URL = "http://127.0.0.1:8002/api/v1/common/delivery-partner/dp-data/";

/**
 * Retrieves the stored auth token
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
export const fetchDpData = async () => {
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
      const errorText = await response.text();
      console.error(`dp-data API failed (${response.status}):`, errorText);
      throw new Error(`API error ${response.status}`);
    }

    const result = await response.json();
    if (result.status === true && result.data) {
      syncDpDataToStorage(result.data);
      return result.data;
    }

    return null;
  } catch (error) {
    console.error("Failed to fetch dp-data:", error);
    return null;
  }
};

/**
 * Evaluates completion criteria for all onboarding & verification steps
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

  // Step 1: Requires both city AND vehicle_type
  const step1Done = Boolean(
    data.city && String(data.city).trim() !== "" &&
    data.vehicle_type && String(data.vehicle_type).trim() !== ""
  );

  // Step 2: Requires Aadhaar, PAN, Bank account, and Selfie
  const step2Done = Boolean(
    data.adhaar_card_number && String(data.adhaar_card_number).trim() !== "" &&
    data.pan_card_number && String(data.pan_card_number).trim() !== "" &&
    data.bank_account_number && String(data.bank_account_number).trim() !== "" &&
    data.selfie && String(data.selfie).trim() !== ""
  );

  // Step 3: Requires T-shirt size
  const step3Done = Boolean(
    data.tshirt_size && String(data.tshirt_size).trim() !== ""
  );

  // Verification
  const isVerified = Boolean(data.is_verified);

  // Training Completion (Checks training_data modules or local flag)
  const trainingDone = Boolean(
    (data.training_data && data.training_data.first && data.training_data.second && data.training_data.third) ||
    localStorage.getItem("training_completed") === "true"
  );

  // Determine the next appropriate route in the funnel
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

  const progress = {
    work_details: (data.city && data.vehicle_type) ? "completed" : "pending",
    personal_details: (data.adhaar_card_number && data.pan_card_number) ? "completed" : "pending",
    kit_ordered: Boolean(data.tshirt_size),
  };

  localStorage.setItem("onboarding_progress", JSON.stringify(progress));
  localStorage.setItem("verification_status", data.is_verified ? "verified" : "pending");
  localStorage.setItem(
    "personal_details",
    JSON.stringify({
      firstName: data.first_name || "",
      lastName: data.last_name || "",
      email: data.email || "",
      gender: data.gender || "",
      dob: data.dob || "",
      aadhaar: data.adhaar_card_number || "",
      pan: data.pan_card_number || "",
      vehicleNumber: data.vehicle_number || "",
      bank: data.account_holder_name || "",
      account: data.bank_account_number || "",
      ifsc: data.ifsc_code || "",
    })
  );
};
