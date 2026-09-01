// src/Services/profile.js

import api from "./api";

/**
 * Get delivery partner's own profile
 * GET /api/v1/common/delivery-partner/my-profile-dp/
 */
export const getProfile = async () => {
  const res = await api.get(
    "/api/v1/common/delivery-partner/my-profile-dp/"
  );

  return res.data;
};

/**
 * Get delivery partner course/training content
 * GET /api/v1/common/delivery-partner/content-data/
 */
export const getCourseContent = async () => {
  const res = await api.get(
    "/api/v1/common/delivery-partner/content-data/"
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
      report,
    }
  );

  return res.data;
};