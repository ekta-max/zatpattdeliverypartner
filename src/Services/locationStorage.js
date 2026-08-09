// src/Services/locationStorage.js

const LOCATION_KEY = "delivery_partner_location";

const defaultLocation = {
  city: "",
  state: "",
  latitude: null,
  longitude: null,
};

/**
 * Get location from localStorage
 */
export const getStoredLocation = () => {
  const stored = localStorage.getItem(LOCATION_KEY);
  return stored ? JSON.parse(stored) : { ...defaultLocation };
};

/**
 * Save (merge) location in localStorage
 */
export const saveLocation = ({ city, state, latitude, longitude }) => {
  const current = getStoredLocation();

  const updated = {
    ...current,
    ...(city !== undefined && { city }),
    ...(state !== undefined && { state }),
    ...(latitude !== undefined && { latitude }),
    ...(longitude !== undefined && { longitude }),
  };

  localStorage.setItem(LOCATION_KEY, JSON.stringify(updated));

  return updated;
};

/**
 * Clear stored location
 */
export const clearStoredLocation = () => {
  localStorage.removeItem(LOCATION_KEY);
};