//src\Services\profile.js

import api from "./api";

/**
 * Get Delivery Partner Profile
 * POST /api/v1/common/delivery-partner/my-profile-dp/
 */
export const getProfile = async () => {
  const res = await api.post(
    "/api/v1/common/delivery-partner/my-profile-dp/",
    {
      user: 10, // ⚠️ make dynamic later
    }
  );

  return res.data;
};

/**
 * Add / Edit Profile API
 * POST /api/v1/common/delivery-partner/add-or-edit-profile-dp/
 */
export const updateProfile = async ({
  vehicle_type,
  bank_account_number,
  location_permission,
  background_location_permission,
  camera_permission,
  notification_permission,
}) => {
  const res = await api.post(
    "/api/v1/common/delivery-partner/add-or-edit-profile-dp/",
    {
      user: 10, // ⚠️ make dynamic later
      vehicle_type,
      bank_account_number,
      location_permission,
      background_location_permission,
      camera_permission,
      notification_permission,
    }
  );

  return res.data;
};

/**
 * Report Bug API
 * POST /api/v1/common/delivery-partner/report-bug/
 */
export const reportBug = async ({ report }) => {
  const res = await api.post(
    "/api/v1/common/delivery-partner/report-bug/",
    {
      user: 10,
      report,
    }
  );

  return res.data;
};