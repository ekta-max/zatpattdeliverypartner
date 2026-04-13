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
 * Update Delivery Partner Permissions
 */

export const updateDeliveryPartnerPermissions = async () => {
  const res = await api.post(
    "/api/v1/common/delivery-partner/update-permission/",
    {
      user: 37,
      location_permission: true,
      background_location_permission: true,
      camera_permission: true,
      notification_permission: true,
    }
  );

  return res.data;
};