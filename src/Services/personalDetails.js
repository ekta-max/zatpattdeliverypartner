// src/Services/personalDetails.js

import api from "./api";

export const submitPersonalDetails = async ({
  firstName,
  lastName,
  email,
  dob,
  gender,
  aadhaarNumber,
  aadhaarFile,
  panNumber,
  panFile,
  selfieFile,
  bankAccountNumber,
  ifscCode,
  accountHolderName,
  latitude,
  longitude,
  vehicleNumber,
  vehicleLicenceFile,
  drivingLicenseFile, // ✅ new
}) => {
  const formData = new FormData();

  formData.append("first_name", firstName);
  formData.append("last_name", lastName);
  formData.append("email", email);
  formData.append("dob", dob);
  formData.append("gender", gender);
  formData.append("adhaar_card_number", aadhaarNumber);
  formData.append("adhaar_card", aadhaarFile);
  formData.append("pan_card_number", panNumber);
  formData.append("pan_card", panFile);
  formData.append("selfie", selfieFile);
  formData.append("bank_account_number", bankAccountNumber);
  formData.append("ifsc_code", ifscCode);
  formData.append("account_holder_name", accountHolderName);
  formData.append("vehicle_number", vehicleNumber);
  formData.append("vehicle_licence", vehicleLicenceFile);
  formData.append("driving_license", drivingLicenseFile); // ✅ new

  if (latitude !== null && latitude !== undefined) {
    formData.append("latitude", latitude);
  }
  if (longitude !== null && longitude !== undefined) {
    formData.append("longitude", longitude);
  }

  const res = await api.post(
    "/api/v1/common/delivery-partner/personal-details-basic/",
    formData,
    {
      headers: { "Content-Type": "multipart/form-data" },
    }
  );

  return res.data;
};