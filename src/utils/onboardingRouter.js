// src/utils/onboardingRouter.js

/**
 * Determines the appropriate route based on DP data
 */
export const resolveOnboardingRoute = (data) => {
  if (!data) {
    return "/work-details";
  }

  // Step 1: Work Details (City & Vehicle Type)
  const isStep1Done = Boolean(
    data.city && String(data.city).trim() !== "" &&
    data.vehicle_type && String(data.vehicle_type).trim() !== ""
  );

  if (!isStep1Done) {
    return "/work-details";
  }

  // Step 2: Personal & KYC (Aadhaar, PAN, Bank, Selfie)
  const isStep2Done = Boolean(
    data.adhaar_card_number && String(data.adhaar_card_number).trim() !== "" &&
    data.pan_card_number && String(data.pan_card_number).trim() !== "" &&
    data.bank_account_number && String(data.bank_account_number).trim() !== ""
  );

  if (!isStep2Done) {
    return "/personal-details";
  }

  // Step 3: Partner Kit (T-Shirt Size)
  const isStep3Done = Boolean(
    data.tshirt_size && String(data.tshirt_size).trim() !== ""
  );

  if (!isStep3Done) {
    return "/order-partner-kit";
  }

  // Step 4: Verification Gate
  if (!data.is_verified) {
    return "/verification-pending";
  }

  // Step 5: Training
  const isTrainingDone = Boolean(
    (data.training_data && data.training_data.first && data.training_data.second && data.training_data.third) ||
    localStorage.getItem("training_completed") === "true"
  );

  if (!isTrainingDone) {
    return "/training-intro";
  }

  // Step 6: Seva Shifts
  const sevaShiftsBooked = Boolean(localStorage.getItem("seva_shifts"));
  if (!sevaShiftsBooked) {
    return "/seva-shifts";
  }

  return "/dashboard";
};
