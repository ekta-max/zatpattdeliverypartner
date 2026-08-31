// services/onboardingSteps.service.js

/**
 * Computes completion status for each onboarding step based on dp-data response.
 * @param {object} data - the "data" object from /dp-data/ response
 * @returns {Array<{step: number, label: string, completed: boolean}>}
 */
export function getOnboardingStepStatus(data) {
  return [
    {
      step: 1,
      label: "City",
      completed: !!data?.city, // false if city is null
    },
    {
      step: 2,
      label: "Aadhaar",
      completed: !!data?.adhaar_card_number, // false if adhaar_card_number is null
    },
    {
      step: 3,
      label: "T-Shirt Size",
      completed: !!data?.tshirt_size, // false if tshirt_size is null
    },
  ];
}