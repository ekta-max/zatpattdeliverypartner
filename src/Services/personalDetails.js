//src\Services\personalDetails.js

import api from "./api";

export const submitPersonalDetailsBasic = async ({
  first_name,
  last_name,
  email,
  dob,
  gender,
}) => {
  const res = await api.post(
    "/api/v1/common/delivery-partner/personal_details_basic/",
    {
      user: 37,
      first_name,
      last_name,
      email,
      dob,
      gender,
    }
  );

  return res.data;
};


export const verifyAadhaar = async ({ adhaar_card_number, file }) => {
  const formData = new FormData();

  formData.append("user", 37);
  formData.append("aadhaar_card_number", adhaar_card_number);
  formData.append("adhaar_card", file);

  const res = await api.post(
    "/api/v1/common/delivery-partner/verify-aadhaar/",
    formData,
    {
      headers: {
        "Content-Type": "multipart/form-data",
      },
    }
  );

  return res.data;
};

export const verifyPan = async ({ pan_card_number, file }) => {
  const formData = new FormData();

  formData.append("user", 37);
  formData.append("pan_card_number", pan_card_number); // ✅ exact key
  formData.append("pan_card", file);

  const res = await api.post(
    "/api/v1/common/delivery-partner/verify-pan/",
    formData,
    {
      headers: {
        "Content-Type": "multipart/form-data",
      },
    }
  );

  return res.data;
};

export const submitBankDetails = async ({
  bank_account_number,
  ifsc_code,
  account_holder_name,
}) => {
  const res = await api.post(
    "/api/v1/common/delivery-partner/bank-details/",
    {
      user: 37,
      bank_account_number,
      ifsc_code,
      account_holder_name,
    }
  );

  return res.data;
};

export const uploadSelfie = async ({ file }) => {
  const formData = new FormData();

  formData.append("user", 37);
  formData.append("selfie", file); // ✅ key should match backend

  const res = await api.post(
    "/api/v1/common/delivery-partner/upload-selfie/",
    formData,
    {
      headers: {
        "Content-Type": "multipart/form-data",
      },
    }
  );

  return res.data;
};