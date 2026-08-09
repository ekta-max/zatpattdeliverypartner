// src/Services/profileDp.js

import api from "./api";

/**
 * Get delivery partner's own profile (verification status, kit info, etc.)
 * GET /api/v1/common/delivery-partner/my-profile-dp/
 */
export const getMyProfileDp = async () => {
  const res = await api.get(
    "/api/v1/common/delivery-partner/my-profile-dp/"
  );

  return res.data;
};

/**
 * Request permission to edit a verified/locked profile
 * POST /api/v1/common/delivery-partner/request-to-edit/
 */
export const requestToEditProfile = async () => {
  const res = await api.post(
    "/api/v1/common/delivery-partner/request-to-edit/",
    {
      grant_me: true,
    }
  );

  return res.data;
};

/**
 * Add or edit profile fields once edit access has been granted
 * POST /api/v1/common/delivery-partner/add-or-edit-profile-dp/
 */
export const addOrEditProfileDp = async (payload) => {
  const res = await api.post(
    "/api/v1/common/delivery-partner/add-or-edit-profile-dp/",
    payload
  );

  return res.data;
};