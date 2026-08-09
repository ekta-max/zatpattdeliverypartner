//src\Services\deliveryPartner.js

import api from "./api";

/**
 * Update Delivery Partner Location
 * POST /api/v1/common/delivery-partner/update-location/
 */

export const updateDeliveryPartnerLocation = async ({
  user,
  latitude,
  longitude,
}) => {
  const res = await api.post(
    "/api/v1/common/delivery-partner/update-location/",
    {
      user,
      latitude,
      longitude,
    }
  );

  return res.data;
};

/**
 * Delivery Partner Permissions (stored locally, no API call)
 */

const PERMISSIONS_KEY = "delivery_partner_permissions";

const defaultPermissions = {
  location_permission: false,
  background_location_permission: false,
  camera_permission: false,
  notification_permission: false,
};

export const getDeliveryPartnerPermissions = () => {
  const stored = localStorage.getItem(PERMISSIONS_KEY);
  return stored ? JSON.parse(stored) : { ...defaultPermissions };
};

export const updateDeliveryPartnerPermissions = (permissions = {}) => {
  const current = getDeliveryPartnerPermissions();
  const updated = { ...current, ...permissions };

  localStorage.setItem(PERMISSIONS_KEY, JSON.stringify(updated));

  return updated;
};

export const clearDeliveryPartnerPermissions = () => {
  localStorage.removeItem(PERMISSIONS_KEY);
};