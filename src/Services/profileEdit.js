// src/Services/profileEdit.js

import api from "./api";

/**
 * Request permission to edit a verified profile
 * POST /api/v1/common/delivery-partner/request-to-edit/
 */
export const requestToEdit = async () => {
  const res = await api.post(
    "/api/v1/common/delivery-partner/request-to-edit/",
    { grant_me: true }
  );
  return res.data;
};

/**
 * Save/edit full profile (only sent once conditional_key === "edit")
 * POST /api/v1/common/delivery-partner/add-or-edit-profile-dp/
 */
export const saveProfileEdit = async (fields) => {
  const formData = new FormData();

  Object.entries(fields).forEach(([key, value]) => {
    // skip null/undefined so we don't overwrite existing backend files
    // with empty values when the user didn't pick a new file
    if (value !== null && value !== undefined && value !== "") {
      formData.append(key, value);
    }
  });

  const res = await api.post(
    "/api/v1/common/delivery-partner/add-or-edit-profile-dp/",
    formData,
    { headers: { "Content-Type": "multipart/form-data" } }
  );

  return res.data;
};