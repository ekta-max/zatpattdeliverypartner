// src/pages/PersonalDetailsPage.jsx

import React, { useState, useEffect, useRef } from "react";
import { useNavigate } from "react-router-dom";
import {
  ArrowLeft,
  HelpCircle,
  UploadCloud,
  FileCheck,
  Camera,
  CheckCircle2,
  AlertCircle,
  ArrowRight,
} from "lucide-react";

import { DEV_MODE } from "../config/appConfig";
import { submitPersonalDetails } from "../Services/personalDetails";

/* =========================================================
   VALIDATION CONSTANTS
========================================================= */

const MAX_FILE_SIZE = 10 * 1024 * 1024; // 10 MB

const PAN_REGEX = /^[A-Z]{5}[0-9]{4}[A-Z]$/;

const IFSC_REGEX = /^[A-Z]{4}0[A-Z0-9]{6}$/;

const ACCOUNT_REGEX = /^[0-9]{9,18}$/;

const AADHAAR_REGEX = /^[0-9]{12}$/;

/*
  Common Indian vehicle registration formats:

  MH12AB1234
  DL01AB1234
  KA01A1234
  MH12A1234
  MH12ABC1234

  State/UT code + district code + series + 4 digits
*/
const VEHICLE_NUMBER_REGEX =
  /^[A-Z]{2}[0-9]{1,2}[A-Z]{1,3}[0-9]{4}$/;

const EMAIL_REGEX =
  /^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$/;

const NAME_REGEX =
  /^[A-Za-z]{2,30}$/;

const ALLOWED_DOCUMENT_TYPES = [
  "image/jpeg",
  "image/jpg",
  "image/png",
  "application/pdf",
];

const ALLOWED_IMAGE_TYPES = [
  "image/jpeg",
  "image/jpg",
  "image/png",
];

/* =========================================================
   HELPER FUNCTIONS
========================================================= */

const getCleanAadhaar = (value) =>
  value.replace(/\D/g, "").slice(0, 12);

const getCleanPAN = (value) =>
  value
    .toUpperCase()
    .replace(/[^A-Z0-9]/g, "")
    .slice(0, 10);

const getCleanVehicleNumber = (value) =>
  value
    .toUpperCase()
    .replace(/[^A-Z0-9]/g, "")
    .slice(0, 10);

const getCleanIFSC = (value) =>
  value
    .toUpperCase()
    .replace(/[^A-Z0-9]/g, "")
    .slice(0, 11);

const getCleanAccount = (value) =>
  value.replace(/\D/g, "").slice(0, 18);

const getCleanName = (value) =>
  value.replace(/[^A-Za-z]/g, "").slice(0, 30);

const getCleanEmail = (value) =>
  value.toLowerCase().replace(/\s/g, "");

/* =========================================================
   DOB AGE VALIDATION
========================================================= */

const calculateAge = (dob) => {
  if (!dob) return 0;

  const birthDate = new Date(dob);
  const today = new Date();

  if (Number.isNaN(birthDate.getTime())) {
    return 0;
  }

  let age =
    today.getFullYear() -
    birthDate.getFullYear();

  const monthDifference =
    today.getMonth() -
    birthDate.getMonth();

  if (
    monthDifference < 0 ||
    (monthDifference === 0 &&
      today.getDate() <
        birthDate.getDate())
  ) {
    age--;
  }

  return age;
};

/* =========================================================
   FILE VALIDATION
========================================================= */

const validateDocumentFile = (
  file,
  label
) => {
  if (!file) {
    return `${label} is required.`;
  }

  if (file.size > MAX_FILE_SIZE) {
    return `${label} is too large. Maximum file size is 10 MB.`;
  }

  if (
    !ALLOWED_DOCUMENT_TYPES.includes(
      file.type
    )
  ) {
    return `${label} must be JPG, JPEG, PNG or PDF.`;
  }

  return "";
};

const validateImageFile = (
  file,
  label
) => {
  if (!file) {
    return `${label} is required.`;
  }

  if (file.size > MAX_FILE_SIZE) {
    return `${label} is too large. Maximum file size is 10 MB.`;
  }

  if (
    !ALLOWED_IMAGE_TYPES.includes(
      file.type
    )
  ) {
    return `${label} must be JPG, JPEG or PNG.`;
  }

  return "";
};

/* =========================================================
   MAIN COMPONENT
========================================================= */

export default function PersonalDetailsPage() {
  const navigate = useNavigate();

  /* =========================================================
     ONBOARDING CHECK
  ========================================================= */

  useEffect(() => {
    const progress =
      JSON.parse(
        localStorage.getItem(
          "onboarding_progress"
        )
      ) || {};

    if (
      progress?.personal_details ===
      "completed"
    ) {
      navigate("/onboarding-steps", {
        replace: true,
      });
      return;
    }

    if (
      !DEV_MODE &&
      progress?.work_details !==
        "completed"
    ) {
      navigate("/onboarding-steps");
    }
  }, [navigate]);

  /* =========================================================
     BASIC INFORMATION
  ========================================================= */

  const [firstName, setFirstName] =
    useState("");

  const [lastName, setLastName] =
    useState("");

  const [email, setEmail] =
    useState("");

  const [dob, setDob] =
    useState("");

  const [gender, setGender] =
    useState("");

  const [basicErrors, setBasicErrors] =
    useState({});

  /* =========================================================
     AADHAAR
  ========================================================= */

  const [aadhaar, setAadhaar] =
    useState("");

  const [aadhaarFile, setAadhaarFile] =
    useState(null);

  const [aadhaarError, setAadhaarError] =
    useState("");

  /* =========================================================
     PAN
  ========================================================= */

  const [pan, setPan] =
    useState("");

  const [panFile, setPanFile] =
    useState(null);

  const [panError, setPanError] =
    useState("");

  /* =========================================================
     VEHICLE
  ========================================================= */

  const [vehicleNumber, setVehicleNumber] =
    useState("");

  const [
    vehicleLicenceFile,
    setVehicleLicenceFile,
  ] = useState(null);

  const [
    drivingLicenseFile,
    setDrivingLicenseFile,
  ] = useState(null);

  const [
    vehicleError,
    setVehicleError,
  ] = useState("");

  /* =========================================================
     BANK
  ========================================================= */

  const [bank, setBank] =
    useState("");

  const [account, setAccount] =
    useState("");

  const [
    confirmAccount,
    setConfirmAccount,
  ] = useState("");

  const [
    accountError,
    setAccountError,
  ] = useState("");

  const [
    confirmAccountError,
    setConfirmAccountError,
  ] = useState("");

  const [ifsc, setIfsc] =
    useState("");

  const [ifscError, setIfscError] =
    useState("");

  /* =========================================================
     SELFIE
  ========================================================= */

  const [selfieFile, setSelfieFile] =
    useState(null);

  const [cameraOpen, setCameraOpen] =
    useState(false);

  const videoRef =
    useRef(null);

  const canvasRef =
    useRef(null);

  /* =========================================================
     SUBMIT
  ========================================================= */

  const [errorsList, setErrorsList] =
    useState([]);

  const [submitting, setSubmitting] =
    useState(false);

  /* =========================================================
     STOP CAMERA
  ========================================================= */

  useEffect(() => {
    return () => {
      if (videoRef.current?.srcObject) {
        videoRef.current.srcObject
          .getTracks()
          .forEach((track) =>
            track.stop()
          );
      }
    };
  }, []);

  /* =========================================================
     BASIC LIVE VALIDATION
========================================================= */

  useEffect(() => {
    const errors = {};

    if (firstName && !NAME_REGEX.test(firstName)) {
      errors.firstName =
        "First name must contain only letters (2–30 characters).";
    }

    if (lastName && !NAME_REGEX.test(lastName)) {
      errors.lastName =
        "Last name must contain only letters (2–30 characters).";
    }

    if (
      email &&
      !EMAIL_REGEX.test(
        email.trim()
      )
    ) {
      errors.email =
        "Please enter a valid email address.";
    }

    if (dob) {
      const age = calculateAge(dob);

      if (age < 18) {
        errors.dob =
          "You must be at least 18 years old.";
      }
    }

    setBasicErrors(errors);
  }, [
    firstName,
    lastName,
    email,
    dob,
  ]);

  /* =========================================================
     AADHAAR LIVE VALIDATION
========================================================= */

  useEffect(() => {
    if (!aadhaar) {
      setAadhaarError("");
      return;
    }

    if (!/^[0-9]*$/.test(aadhaar)) {
      setAadhaarError(
        "Aadhaar can contain digits only."
      );
      return;
    }

    if (aadhaar.length < 12) {
      setAadhaarError(
        `${12 - aadhaar.length} digits remaining.`
      );
      return;
    }

    if (
      aadhaar.length === 12 &&
      !AADHAAR_REGEX.test(aadhaar)
    ) {
      setAadhaarError(
        "Invalid Aadhaar number."
      );
      return;
    }

    setAadhaarError("");
  }, [aadhaar]);

  /* =========================================================
     PAN LIVE VALIDATION
========================================================= */

  useEffect(() => {
    const cleanPan =
      pan.trim().toUpperCase();

    if (!cleanPan) {
      setPanError("");
      return;
    }

    if (!/^[A-Z0-9]*$/.test(cleanPan)) {
      setPanError(
        "PAN can contain letters and digits only."
      );
      return;
    }

    if (cleanPan.length < 10) {
      setPanError(
        `PAN must contain exactly 10 characters. ${10 - cleanPan.length} remaining.`
      );
      return;
    }

    if (!PAN_REGEX.test(cleanPan)) {
      setPanError(
        "Invalid PAN format. Example: ABCDE1234F"
      );
      return;
    }

    setPanError("");
  }, [pan]);

  /* =========================================================
     VEHICLE LIVE VALIDATION
========================================================= */

  useEffect(() => {
    const cleanVehicle =
      vehicleNumber
        .trim()
        .toUpperCase();

    if (!cleanVehicle) {
      setVehicleError("");
      return;
    }

    if (
      !/^[A-Z0-9]*$/.test(
        cleanVehicle
      )
    ) {
      setVehicleError(
        "Vehicle number can contain letters and digits only."
      );
      return;
    }

    if (cleanVehicle.length < 8) {
      setVehicleError(
        "Enter a complete vehicle registration number."
      );
      return;
    }

    if (
      !VEHICLE_NUMBER_REGEX.test(
        cleanVehicle
      )
    ) {
      setVehicleError(
        "Invalid format. Example: MH12AB1234"
      );
      return;
    }

    setVehicleError("");
  }, [vehicleNumber]);

  /* =========================================================
     ACCOUNT VALIDATION
========================================================= */

  useEffect(() => {
    const cleanAccount =
      account.trim();

    if (!cleanAccount) {
      setAccountError("");
      return;
    }

    if (!/^[0-9]*$/.test(cleanAccount)) {
      setAccountError(
        "Account number can contain digits only."
      );
      return;
    }

    if (
      cleanAccount.length < 9
    ) {
      setAccountError(
        `Account number must contain 9–18 digits.`
      );
      return;
    }

    if (
      cleanAccount.length > 18
    ) {
      setAccountError(
        "Account number cannot exceed 18 digits."
      );
      return;
    }

    setAccountError("");
  }, [account]);

  /* =========================================================
     CONFIRM ACCOUNT
========================================================= */

  useEffect(() => {
    if (!confirmAccount) {
      setConfirmAccountError("");
      return;
    }

    if (
      confirmAccount !== account
    ) {
      setConfirmAccountError(
        "Account numbers do not match."
      );
      return;
    }

    setConfirmAccountError("");
  }, [
    confirmAccount,
    account,
  ]);

  /* =========================================================
     IFSC VALIDATION
========================================================= */

  useEffect(() => {
    const cleanIfsc =
      ifsc.trim().toUpperCase();

    if (!cleanIfsc) {
      setIfscError("");
      return;
    }

    if (
      !/^[A-Z0-9]*$/.test(
        cleanIfsc
      )
    ) {
      setIfscError(
        "IFSC can contain letters and digits only."
      );
      return;
    }

    if (cleanIfsc.length < 11) {
      setIfscError(
        `IFSC must contain exactly 11 characters. ${11 - cleanIfsc.length} remaining.`
      );
      return;
    }

    if (
      !IFSC_REGEX.test(cleanIfsc)
    ) {
      setIfscError(
        "Invalid IFSC format. Example: SBIN0001234"
      );
      return;
    }

    setIfscError("");
  }, [ifsc]);

  /* =========================================================
     CAMERA
========================================================= */

  const openCamera = async () => {
    try {
      if (
        !navigator.mediaDevices?.getUserMedia
      ) {
        alert(
          "Camera is not supported in this browser."
        );
        return;
      }

      setCameraOpen(true);

      const stream =
        await navigator.mediaDevices.getUserMedia(
          {
            video: {
              facingMode: "user",
            },
            audio: false,
          }
        );

      if (videoRef.current) {
        videoRef.current.srcObject =
          stream;
      }
    } catch (error) {
      console.error(
        "Camera error:",
        error
      );

      setCameraOpen(false);

      alert(
        "Camera access was denied or unavailable. Please check browser permissions."
      );
    }
  };

  /* =========================================================
     CAPTURE SELFIE
========================================================= */

  const captureSelfie = () => {
    const video =
      videoRef.current;

    const canvas =
      canvasRef.current;

    if (!video || !canvas) return;

    const width =
      video.videoWidth || 640;

    const height =
      video.videoHeight || 640;

    canvas.width = width;
    canvas.height = height;

    const ctx =
      canvas.getContext("2d");

    if (!ctx) return;

    ctx.drawImage(
      video,
      0,
      0,
      width,
      height
    );

    canvas.toBlob(
      (blob) => {
        if (!blob) return;

        const file = new File(
          [blob],
          "selfie.jpg",
          {
            type: "image/jpeg",
          }
        );

        if (
          file.size >
          MAX_FILE_SIZE
        ) {
          alert(
            "Selfie is too large. Please try again."
          );
          return;
        }

        setSelfieFile(file);

        if (video.srcObject) {
          video.srcObject
            .getTracks()
            .forEach((track) =>
              track.stop()
            );

          video.srcObject = null;
        }

        setCameraOpen(false);
      },
      "image/jpeg",
      0.9
    );
  };

  /* =========================================================
     FORM VALIDATION
========================================================= */

  const validateForm = () => {
    const missing = [];

    /* ================= BASIC ================= */

    if (
      !NAME_REGEX.test(
        firstName.trim()
      )
    ) {
      missing.push(
        "First Name: only letters, minimum 2 characters."
      );
    }

    if (
      !NAME_REGEX.test(
        lastName.trim()
      )
    ) {
      missing.push(
        "Last Name: only letters, minimum 2 characters."
      );
    }

    const cleanEmail =
      email.trim().toLowerCase();

    if (
      !EMAIL_REGEX.test(
        cleanEmail
      )
    ) {
      missing.push(
        "Enter a valid Email address."
      );
    }

    if (!dob) {
      missing.push(
        "Date of Birth is required."
      );
    } else {
      const age =
        calculateAge(dob);

      if (age < 18) {
        missing.push(
          "Partner must be at least 18 years old."
        );
      }

      if (age > 100) {
        missing.push(
          "Please enter a valid Date of Birth."
        );
      }
    }

    if (!gender) {
      missing.push(
        "Gender selection is required."
      );
    }

    /* ================= AADHAAR ================= */

    const cleanAadhaar =
      aadhaar.replace(/\D/g, "");

    if (
      !AADHAAR_REGEX.test(
        cleanAadhaar
      )
    ) {
      missing.push(
        "Aadhaar must contain exactly 12 digits."
      );
    }

    if (!aadhaarFile) {
      missing.push(
        "Upload Aadhaar Card document."
      );
    }

    /* ================= PAN ================= */

    const cleanPan =
      pan.trim().toUpperCase();

    if (
      !PAN_REGEX.test(cleanPan)
    ) {
      missing.push(
        "PAN must be exactly 10 characters, e.g. ABCDE1234F."
      );
    }

    if (!panFile) {
      missing.push(
        "Upload PAN Card image."
      );
    }

    /* ================= VEHICLE ================= */

    const cleanVehicle =
      vehicleNumber
        .replace(
          /[^A-Z0-9]/gi,
          ""
        )
        .toUpperCase();

    if (
      !VEHICLE_NUMBER_REGEX.test(
        cleanVehicle
      )
    ) {
      missing.push(
        "Vehicle number is invalid. Example: MH12AB1234."
      );
    }

    if (!vehicleLicenceFile) {
      missing.push(
        "Upload Vehicle RC / Licence."
      );
    }

    if (!drivingLicenseFile) {
      missing.push(
        "Upload Driving License (DL)."
      );
    }

    /* ================= BANK ================= */

    if (!bank.trim()) {
      missing.push(
        "Bank Name is required."
      );
    }

    const cleanAccount =
      account.trim();

    if (
      !ACCOUNT_REGEX.test(
        cleanAccount
      )
    ) {
      missing.push(
        "Bank Account Number must contain 9–18 digits."
      );
    }

    if (
      confirmAccount.trim() !==
      cleanAccount
    ) {
      missing.push(
        "Account Numbers must match."
      );
    }

    const cleanIfsc =
      ifsc.trim().toUpperCase();

    if (
      !IFSC_REGEX.test(
        cleanIfsc
      )
    ) {
      missing.push(
        "IFSC must be exactly 11 characters, e.g. SBIN0001234."
      );
    }

    /* ================= SELFIE ================= */

    if (!selfieFile) {
      missing.push(
        "Live Partner Selfie capture is required."
      );
    }

    return missing;
  };

  /* =========================================================
     FILE VALIDATION
========================================================= */

  const validateAllFiles = () => {
    const errors = [];

    const files = [
      [
        aadhaarFile,
        "Aadhaar Card",
      ],
      [
        panFile,
        "PAN Card",
      ],
      [
        vehicleLicenceFile,
        "Vehicle RC / Licence",
      ],
      [
        drivingLicenseFile,
        "Driving License",
      ],
    ];

    files.forEach(
      ([file, label]) => {
        if (file) {
          const error =
            validateDocumentFile(
              file,
              label
            );

          if (error) {
            errors.push(error);
          }
        }
      }
    );

    if (selfieFile) {
      const selfieError =
        validateImageFile(
          selfieFile,
          "Selfie"
        );

      if (selfieError) {
        errors.push(
          selfieError
        );
      }
    }

    return errors;
  };

  /* =========================================================
     SUBMIT
========================================================= */

  const handleSubmit = async () => {
    if (submitting) return;

    console.log(
      "========== SUBMIT CLICKED =========="
    );

    const validationErrors =
      validateForm();

    const fileErrors =
      validateAllFiles();

    const allErrors = [
      ...validationErrors,
      ...fileErrors,
    ];

    console.log(
      "Validation errors:",
      allErrors
    );

    if (allErrors.length > 0) {
      setErrorsList(
        allErrors
      );

      setTimeout(() => {
        window.scrollTo({
          top:
            document.body.scrollHeight,
          behavior: "smooth",
        });
      }, 100);

      return;
    }

    setErrorsList([]);

    try {
      setSubmitting(true);

      const cleanEmail =
        email.trim().toLowerCase();

      const cleanAadhaar =
        aadhaar.replace(/\D/g, "");

      const cleanPan =
        pan.trim().toUpperCase();

      const cleanAccount =
        account.trim();

      const cleanIfsc =
        ifsc.trim().toUpperCase();

      const cleanVehicle =
        vehicleNumber
          .replace(
            /[^A-Z0-9]/gi,
            ""
          )
          .toUpperCase();

      const payload = {
        firstName:
          firstName.trim(),

        lastName:
          lastName.trim(),

        email:
          cleanEmail,

        dob,

        gender,

        aadhaarNumber:
          cleanAadhaar,

        aadhaarFile,

        panNumber:
          cleanPan,

        panFile,

        selfieFile,

        bankAccountNumber:
          cleanAccount,

        ifscCode:
          cleanIfsc,

        accountHolderName:
          `${firstName.trim()} ${lastName.trim()}`,

        vehicleNumber:
          cleanVehicle,

        vehicleLicenceFile,

        drivingLicenseFile,
      };

      console.log(
        "Submitting files:",
        {
          aadhaar: aadhaarFile?.name,
          aadhaarSize:
            aadhaarFile?.size,

          pan: panFile?.name,
          panSize:
            panFile?.size,

          vehicle:
            vehicleLicenceFile?.name,
          vehicleSize:
            vehicleLicenceFile?.size,

          dl:
            drivingLicenseFile?.name,
          dlSize:
            drivingLicenseFile?.size,

          selfie:
            selfieFile?.name,
          selfieSize:
            selfieFile?.size,
        }
      );

      /* =====================================================
         API
      ===================================================== */

      const response =
        await submitPersonalDetails(
          payload
        );

      console.log(
        "Personal details API SUCCESS:",
        response
      );

      /* =====================================================
         LOCAL STORAGE
      ===================================================== */

      localStorage.setItem(
        "personal_details",
        JSON.stringify({
          firstName:
            firstName.trim(),

          lastName:
            lastName.trim(),

          email:
            cleanEmail,

          gender,

          aadhaar_last4:
            cleanAadhaar.slice(-4),

          pan:
            cleanPan,

          bank:
            bank.trim(),

          account:
            cleanAccount,

          ifsc:
            cleanIfsc,
        })
      );

      const existing =
        JSON.parse(
          localStorage.getItem(
            "onboarding_progress"
          )
        ) || {};

      localStorage.setItem(
        "onboarding_progress",
        JSON.stringify({
          ...existing,
          personal_details:
            "completed",
          kit_ordered:
            false,
        })
      );

      navigate(
        "/onboarding-steps",
        {
          replace: true,
        }
      );
    } catch (err) {
      console.error(
        "========== API ERROR =========="
      );

      console.error(
        "Error:",
        err
      );

      console.error(
        "Message:",
        err?.message
      );

      console.error(
        "Response:",
        err?.response
      );

      console.error(
        "Status:",
        err?.response?.status
      );

      console.error(
        "Response data:",
        err?.response?.data
      );

      console.error(
        "Request:",
        err?.request
      );

      console.error(
        "================================"
      );

      const responseData =
        err?.response?.data;

      let errorMessage =
        "Submission failed. Please verify your file sizes and network connection.";

      if (
        typeof responseData ===
        "string"
      ) {
        errorMessage =
          responseData;
      } else if (
        responseData?.message
      ) {
        errorMessage =
          responseData.message;
      } else if (
        responseData?.detail
      ) {
        errorMessage =
          responseData.detail;
      } else if (
        responseData?.error
      ) {
        errorMessage =
          responseData.error;
      } else if (
        responseData &&
        typeof responseData ===
          "object"
      ) {
        const messages = [];

        Object.entries(
          responseData
        ).forEach(
          ([field, value]) => {
            if (
              Array.isArray(value)
            ) {
              messages.push(
                `${field}: ${value.join(
                  ", "
                )}`
              );
            } else if (
              typeof value ===
              "object"
            ) {
              messages.push(
                `${field}: ${JSON.stringify(
                  value
                )}`
              );
            } else {
              messages.push(
                `${field}: ${value}`
              );
            }
          }
        );

        if (
          messages.length > 0
        ) {
          errorMessage =
            messages.join("\n");
        }
      } else if (
        err?.message
      ) {
        errorMessage =
          err.message;
      }

      setErrorsList([
        errorMessage,
      ]);
    } finally {
      setSubmitting(false);
    }
  };

  /* =========================================================
     SECTION STATUS
========================================================= */

  const isSection1Done =
    NAME_REGEX.test(
      firstName.trim()
    ) &&
    NAME_REGEX.test(
      lastName.trim()
    ) &&
    EMAIL_REGEX.test(
      email.trim().toLowerCase()
    ) &&
    !!dob &&
    calculateAge(dob) >= 18 &&
    !!gender;

  const isSection2Done =
    AADHAAR_REGEX.test(
      aadhaar
    ) &&
    !!aadhaarFile;

  const isSection3Done =
    PAN_REGEX.test(
      pan.trim().toUpperCase()
    ) &&
    !!panFile;

  const isSection4Done =
    VEHICLE_NUMBER_REGEX.test(
      vehicleNumber
        .replace(
          /[^A-Z0-9]/gi,
          ""
        )
        .toUpperCase()
    ) &&
    !!vehicleLicenceFile &&
    !!drivingLicenseFile;

  const isSection5Done =
    !!bank.trim() &&
    ACCOUNT_REGEX.test(
      account.trim()
    ) &&
    account.trim() ===
      confirmAccount.trim() &&
    IFSC_REGEX.test(
      ifsc.trim().toUpperCase()
    );

  const isSection6Done =
    !!selfieFile;

  /* =========================================================
     UI
========================================================= */

  return (
    <div
      className="
        min-h-screen
        w-full
        flex
        flex-col
        justify-between
        items-center
        relative
        overflow-x-hidden
        p-3.5
        sm:p-5
        md:p-7
        select-none
      "
      style={{
        backgroundColor:
          "#FAF6F0",

        backgroundImage: `
          radial-gradient(
            circle at 10% 15%,
            rgba(255, 230, 205, 0.7) 0%,
            transparent 40%
          ),
          radial-gradient(
            circle at 92% 25%,
            rgba(255, 226, 195, 0.75) 0%,
            transparent 38%
          )
        `,
      }}
    >
      {/* =====================================================
          MAIN CARD
      ===================================================== */}

      <div
        className="
          w-full
          max-w-[840px]
          my-4
          z-10
          bg-white
          rounded-[26px]
          sm:rounded-[32px]
          shadow-[0_20px_60px_rgba(100,50,15,0.08)]
          border
          border-[#F3E7DC]
          overflow-hidden
          flex
          flex-col
        "
      >
        {/* HEADER */}

        <div
          className="
            px-5
            py-4
            border-b
            border-[#F3E7DC]
            flex
            items-center
            justify-between
            bg-white
            sticky
            top-0
            z-20
          "
        >
          <button
            type="button"
            onClick={() =>
              navigate(-1)
            }
            className="
              w-9
              h-9
              rounded-xl
              border
              border-[#E5E7EB]
              flex
              items-center
              justify-center
              text-[#2E1A0F]
              hover:bg-[#FAF6F0]
              transition
            "
          >
            <ArrowLeft size={18} />
          </button>

          <div className="text-center">
            <span
              className="
                text-[10px]
                font-black
                uppercase
                tracking-[1.4px]
                text-[#FF6600]
              "
            >
              Step 2 of 3 • Partner Verification
            </span>

            <h1
              className="
                text-sm
                sm:text-base
                font-black
                text-[#2E1A0F]
              "
            >
              Personal & KYC Details
            </h1>
          </div>

          <div
            className="
              w-9
              h-9
              rounded-xl
              bg-[#FFF5EC]
              border
              border-[#FED7AA]
              flex
              items-center
              justify-center
              text-[#FF6600]
            "
          >
            <HelpCircle size={18} />
          </div>
        </div>

        {/* FORM */}

        <div
          className="
            p-5
            sm:p-8
            space-y-7
          "
        >
          {/* =================================================
              SECTION 1
          ================================================= */}

          <SectionCard>
            <SectionHeader
              number="1"
              title="Basic Information"
              completed={
                isSection1Done
              }
            />

            <div
              className="
                grid
                grid-cols-1
                sm:grid-cols-2
                gap-4
              "
            >
              <FormInput
                label="First Name"
                value={firstName}
                setValue={(value) =>
                  setFirstName(
                    getCleanName(
                      value
                    )
                  )
                }
                placeholder="e.g. Rahul"
                error={
                  basicErrors.firstName
                }
              />

              <FormInput
                label="Last Name"
                value={lastName}
                setValue={(value) =>
                  setLastName(
                    getCleanName(
                      value
                    )
                  )
                }
                placeholder="e.g. Sharma"
                error={
                  basicErrors.lastName
                }
              />
            </div>

            <div
              className="
                grid
                grid-cols-1
                sm:grid-cols-2
                gap-4
                mt-4
              "
            >
              <FormInput
                label="Email Address"
                value={email}
                setValue={(value) =>
                  setEmail(
                    getCleanEmail(
                      value
                    )
                  )
                }
                placeholder="e.g. rahul@gmail.com"
                error={
                  basicErrors.email
                }
              />

              <div>
                <label
                  className="
                    block
                    text-xs
                    font-bold
                    text-[#2E1A0F]
                    mb-1.5
                  "
                >
                  Date of Birth
                </label>

                <input
                  type="date"
                  value={dob}
                  max={
                    new Date(
                      new Date().setFullYear(
                        new Date().getFullYear() -
                          18
                      )
                    )
                      .toISOString()
                      .split("T")[0]
                  }
                  onChange={(e) =>
                    setDob(
                      e.target.value
                    )
                  }
                  className="
                    w-full
                    border
                    border-[#E5E7EB]
                    rounded-xl
                    px-4
                    py-3
                    text-sm
                    font-semibold
                    text-[#2E1A0F]
                    focus:border-[#FF6600]
                    focus:ring-2
                    focus:ring-[#FF6600]/15
                    outline-none
                    bg-white
                  "
                />

                {basicErrors.dob && (
                  <p className="text-[11px] text-red-500 font-medium mt-1">
                    {basicErrors.dob}
                  </p>
                )}
              </div>
            </div>

            <div className="mt-4">
              <label
                className="
                  block
                  text-xs
                  font-bold
                  text-[#2E1A0F]
                  mb-1.5
                "
              >
                Gender
              </label>

              <div className="flex gap-3">
                <GenderPill
                  label="Male"
                  active={
                    gender === "male"
                  }
                  onClick={() =>
                    setGender("male")
                  }
                />

                <GenderPill
                  label="Female"
                  active={
                    gender ===
                    "female"
                  }
                  onClick={() =>
                    setGender("female")
                  }
                />
              </div>
            </div>
          </SectionCard>

          {/* =================================================
              AADHAAR
          ================================================= */}

          <SectionCard>
            <SectionHeader
              number="2"
              title="Aadhaar Verification"
              completed={
                isSection2Done
              }
            />

            <FormInput
              label="Aadhaar Card Number (12 Digits)"
              value={aadhaar}
              setValue={(value) =>
                setAadhaar(
                  getCleanAadhaar(
                    value
                  )
                )
              }
              maxLength={12}
              error={
                aadhaarError
              }
              placeholder="123456789012"
              inputMode="numeric"
            />

            <div className="pt-5">
              <FileUploadField
                label="Upload Aadhaar Card"
                file={aadhaarFile}
                onChange={(e) => {
                  const file =
                    e.target.files?.[0];

                  if (!file) return;

                  const error =
                    validateDocumentFile(
                      file,
                      "Aadhaar Card"
                    );

                  if (error) {
                    setErrorsList([
                      error,
                    ]);
                    e.target.value = "";
                    return;
                  }

                  setErrorsList([]);
                  setAadhaarFile(
                    file
                  );
                }}
              />
            </div>
          </SectionCard>

          {/* =================================================
              PAN
          ================================================= */}

          <SectionCard>
            <SectionHeader
              number="3"
              title="PAN Verification"
              completed={
                isSection3Done
              }
            />

            <FormInput
              label="PAN Card Number"
              value={pan}
              setValue={(value) =>
                setPan(
                  getCleanPAN(
                    value
                  )
                )
              }
              maxLength={10}
              error={panError}
              placeholder="ABCDE1234F"
            />

            <div className="pt-5">
              <FileUploadField
                label="Upload PAN Card"
                file={panFile}
                onChange={(e) => {
                  const file =
                    e.target.files?.[0];

                  if (!file) return;

                  const error =
                    validateDocumentFile(
                      file,
                      "PAN Card"
                    );

                  if (error) {
                    setErrorsList([
                      error,
                    ]);
                    e.target.value = "";
                    return;
                  }

                  setErrorsList([]);
                  setPanFile(file);
                }}
              />
            </div>
          </SectionCard>

          {/* =================================================
              VEHICLE
          ================================================= */}

          <SectionCard>
            <SectionHeader
              number="4"
              title="Vehicle & Driving License"
              completed={
                isSection4Done
              }
            />

            <FormInput
              label="Vehicle Registration Number"
              value={vehicleNumber}
              setValue={(value) =>
                setVehicleNumber(
                  getCleanVehicleNumber(
                    value
                  )
                )
              }
              maxLength={10}
              error={
                vehicleError
              }
              placeholder="MH12AB1234"
            />

            <div
              className="
                grid
                grid-cols-1
                sm:grid-cols-2
                gap-4
                pt-5
              "
            >
              <FileUploadField
                label="Vehicle RC"
                file={
                  vehicleLicenceFile
                }
                onChange={(e) => {
                  const file =
                    e.target.files?.[0];

                  if (!file) return;

                  const error =
                    validateDocumentFile(
                      file,
                      "Vehicle RC"
                    );

                  if (error) {
                    setErrorsList([
                      error,
                    ]);
                    e.target.value = "";
                    return;
                  }

                  setErrorsList([]);
                  setVehicleLicenceFile(
                    file
                  );
                }}
              />

              <FileUploadField
                label="Driving License"
                file={
                  drivingLicenseFile
                }
                onChange={(e) => {
                  const file =
                    e.target.files?.[0];

                  if (!file) return;

                  const error =
                    validateDocumentFile(
                      file,
                      "Driving License"
                    );

                  if (error) {
                    setErrorsList([
                      error,
                    ]);
                    e.target.value = "";
                    return;
                  }

                  setErrorsList([]);
                  setDrivingLicenseFile(
                    file
                  );
                }}
              />
            </div>
          </SectionCard>

          {/* =================================================
              BANK
          ================================================= */}

          <SectionCard>
            <SectionHeader
              number="5"
              title="Bank Account Details"
              completed={
                isSection5Done
              }
            />

            <div
              className="
                p-3
                rounded-xl
                bg-[#FFF9F3]
                border
                border-[#FFE8D6]
                mb-4
                text-xs
                font-bold
                text-[#FF6600]
              "
            >
              ⚠️ Direct bank transfer payouts will be credited only to this bank account.
            </div>

            <FormInput
              label="Bank Name"
              value={bank}
              setValue={setBank}
              placeholder="e.g. HDFC Bank / State Bank of India"
            />

            <div
              className="
                grid
                grid-cols-1
                sm:grid-cols-2
                gap-4
                mt-4
              "
            >
              <FormInput
                label="Account Number"
                value={account}
                setValue={(value) =>
                  setAccount(
                    getCleanAccount(
                      value
                    )
                  )
                }
                maxLength={18}
                error={
                  accountError
                }
                placeholder="9-18 digit account number"
                inputMode="numeric"
              />

              <FormInput
                label="Confirm Account Number"
                value={confirmAccount}
                setValue={(value) =>
                  setConfirmAccount(
                    getCleanAccount(
                      value
                    )
                  )
                }
                maxLength={18}
                error={
                  confirmAccountError
                }
                placeholder="Re-enter account number"
                inputMode="numeric"
              />
            </div>

            <div className="mt-4">
              <FormInput
                label="Bank IFSC Code"
                value={ifsc}
                setValue={(value) =>
                  setIfsc(
                    getCleanIFSC(
                      value
                    )
                  )
                }
                maxLength={11}
                error={ifscError}
                placeholder="SBIN0001234"
              />
            </div>
          </SectionCard>

          {/* =================================================
              SELFIE
          ================================================= */}

          <SectionCard>
            <SectionHeader
              number="6"
              title="Selfie"
              completed={
                isSection6Done
              }
            />

            {!cameraOpen &&
              !selfieFile && (
                <button
                  type="button"
                  onClick={
                    openCamera
                  }
                  className="
                    w-full
                    py-4
                    rounded-2xl
                    bg-[#FFF5EC]
                    border-2
                    border-dashed
                    border-[#FED7AA]
                    font-bold
                    text-sm
                    text-[#FF6600]
                    flex
                    items-center
                    justify-center
                    gap-2
                    hover:bg-[#FFEADB]
                    transition-all
                  "
                >
                  <Camera size={20} />

                  <span>
                    Open Camera & Take Selfie
                  </span>
                </button>
              )}

            {cameraOpen && (
              <div
                className="
                  flex
                  flex-col
                  items-center
                  p-5
                  bg-white
                  rounded-2xl
                  border
                  border-[#F3E7DC]
                "
              >
                <video
                  ref={videoRef}
                  autoPlay
                  playsInline
                  className="
                    w-48
                    h-48
                    sm:w-56
                    sm:h-56
                    rounded-full
                    border-4
                    border-[#FF6600]
                    object-cover
                    mb-5
                    shadow-lg
                  "
                />

                <button
                  type="button"
                  onClick={
                    captureSelfie
                  }
                  className="
                    px-6
                    py-2.5
                    rounded-full
                    font-bold
                    text-white
                    shadow-md
                    flex
                    items-center
                    gap-2
                  "
                  style={{
                    background:
                      "linear-gradient(90deg, #FF6200 0%, #FFA800 100%)",
                  }}
                >
                  <Camera size={18} />
                  Capture Photo
                </button>
              </div>
            )}

            {selfieFile &&
              !cameraOpen && (
                <div
                  className="
                    flex
                    items-center
                    gap-4
                    p-4
                    rounded-2xl
                    bg-green-50
                    border
                    border-green-200
                  "
                >
                  <img
                    src={URL.createObjectURL(
                      selfieFile
                    )}
                    alt="Selfie preview"
                    className="
                      w-16
                      h-16
                      rounded-full
                      object-cover
                      border-2
                      border-green-500
                      shadow-sm
                      shrink-0
                    "
                  />

                  <div className="flex-1 min-w-0">
                   

                    <button
                      type="button"
                      onClick={
                        openCamera
                      }
                      className="
                        text-xs
                        font-bold
                        text-[#FF6600]
                        hover:underline
                        mt-1
                      "
                    >
                      Retake photo
                    </button>
                  </div>

                  <CheckCircle2
                    size={24}
                    className="text-green-600 shrink-0"
                  />
                </div>
              )}

            <canvas
              ref={canvasRef}
              className="hidden"
            />
          </SectionCard>

          {/* =================================================
              ERROR BOX
          ================================================= */}

          {errorsList.length > 0 && (
            <div
              className="
                p-4
                sm:p-5
                rounded-2xl
                bg-red-50
                border
                border-red-200
              "
            >
              <div
                className="
                  flex
                  items-center
                  gap-2
                  mb-3
                  text-red-700
                  font-extrabold
                  text-sm
                "
              >
                <AlertCircle size={18} />

                <span>
                  Please fix the following:
                </span>
              </div>

              <ul
                className="
                  space-y-2
                  pl-6
                  list-disc
                  text-xs
                  font-semibold
                  text-red-600
                  whitespace-pre-line
                "
              >
                {errorsList.map(
                  (
                    error,
                    index
                  ) => (
                    <li
                      key={index}
                    >
                      {error}
                    </li>
                  )
                )}
              </ul>
            </div>
          )}
        </div>

        {/* ===================================================
            SUBMIT
        =================================================== */}

        <div
          className="
            p-5
            sm:p-6
            border-t
            border-[#F3E7DC]
            bg-[#FAF8F5]
          "
        >
          <button
            type="button"
            onClick={
              handleSubmit
            }
            disabled={
              submitting
            }
            className="
              group
              w-full
              h-[52px]
              sm:h-[56px]
              rounded-xl
              sm:rounded-2xl
              font-extrabold
              text-sm
              sm:text-base
              flex
              items-center
              justify-center
              gap-2
              text-white
              transition-all
              shadow-lg
              active:scale-[0.99]
              disabled:opacity-70
              disabled:cursor-not-allowed
            "
            style={{
              background:
                "linear-gradient(90deg, #FF6200 0%, #FFA800 100%)",

              boxShadow:
                "0 10px 25px rgba(255,98,0,0.25)",
            }}
          >
            {submitting ? (
              <>
                <div
                  className="
                    w-5
                    h-5
                    border-2
                    border-white/40
                    border-t-white
                    rounded-full
                    animate-spin
                  "
                />

                <span>
                  Submitting...
                </span>
              </>
            ) : (
              <>
                <span>
                  Submit & Complete KYC
                </span>

                <ArrowRight
                  size={18}
                  className="
                    group-hover:translate-x-1
                    transition-transform
                  "
                />
              </>
            )}
          </button>
        </div>
      </div>

      {/* FOOTER */}

      <div
        className="
          relative
          z-10
          shrink-0
          mb-2
        "
      >
        <div
          className="
            bg-[#FFEADA]/70
            backdrop-blur-md
            px-8
            py-2
            rounded-full
            border
            border-[#FED7AA]/60
            flex
            items-center
            gap-2
            text-[10px]
            sm:text-xs
            font-medium
            text-[#7C6657]
          "
        >
          <span>
            © {new Date().getFullYear()} Zatpatt
          </span>

          <span>•</span>

          <span>
            Delivery Partner
          </span>
        </div>
      </div>
    </div>
  );
}

/* =========================================================
   SECTION CARD
========================================================= */

function SectionCard({
  children,
}) {
  return (
    <div
      className="
        p-4
        sm:p-5
        rounded-2xl
        bg-[#FAF8F5]
        border
        border-[#F3E7DC]
      "
    >
      {children}
    </div>
  );
}

/* =========================================================
   SECTION HEADER
========================================================= */

function SectionHeader({
  number,
  title,
  completed,
}) {
  return (
    <div
      className="
        flex
        items-center
        justify-between
        pb-3
        mb-4
        border-b
        border-[#F3E7DC]
      "
    >
      <div
        className="
          flex
          items-center
          gap-3
        "
      >
        <span
          className="
            w-8
            h-8
            rounded-full
            bg-[#FF6600]
            text-white
            text-xs
            font-black
            flex
            items-center
            justify-center
            shrink-0
            shadow-[0_4px_12px_rgba(255,102,0,0.22)]
          "
        >
          {number}
        </span>

        <h2
          className="
            text-sm
            sm:text-base
            font-black
            text-[#2E1A0F]
          "
        >
          {title}
        </h2>
      </div>

      {completed && (
        <span
          className="
            flex
            items-center
            gap-1
            text-[11px]
            font-bold
            text-green-600
            bg-green-50
            px-2.5
            py-1
            rounded-full
            border
            border-green-200
          "
        >
          <CheckCircle2 size={14} />
          Completed
        </span>
      )}
    </div>
  );
}

/* =========================================================
   FORM INPUT
========================================================= */

function FormInput({
  label,
  value,
  setValue,
  maxLength,
  error,
  placeholder,
  inputMode,
}) {
  return (
    <div>
      <label
        className="
          block
          text-xs
          font-bold
          text-[#2E1A0F]
          mb-1.5
        "
      >
        {label}
      </label>

      <input
        value={value}
        maxLength={maxLength}
        placeholder={placeholder}
        inputMode={inputMode}
        onChange={(e) =>
          setValue(
            e.target.value
          )
        }
        className="
          w-full
          border
          rounded-xl
          px-4
          py-3
          text-sm
          font-semibold
          text-[#2E1A0F]
          outline-none
          transition-all
          bg-white
          placeholder:text-[#B9A79A]
        "
        style={{
          borderColor: error
            ? "#FCA5A5"
            : value
            ? "#FF6600"
            : "#E5E7EB",

          boxShadow: error
            ? "0 0 0 3px rgba(239,68,68,0.06)"
            : value
            ? "0 0 0 3px rgba(255,102,0,0.06)"
            : "none",
        }}
      />

      {error && (
        <p
          className="
            text-[11px]
            text-red-500
            font-medium
            mt-1
          "
        >
          {error}
        </p>
      )}
    </div>
  );
}

/* =========================================================
   FILE UPLOAD
========================================================= */

function FileUploadField({
  label,
  file,
  onChange,
}) {
  return (
    <div>
      <label
        className="
          block
          text-xs
          font-bold
          text-[#2E1A0F]
          mb-1.5
        "
      >
        {label}
      </label>

      <label
        className="
          flex
          items-center
          gap-3
          border-2
          border-dashed
          rounded-xl
          px-4
          py-3.5
          cursor-pointer
          transition-all
          bg-white
          hover:bg-[#FFF9F3]
        "
        style={{
          borderColor: file
            ? "#22C55E"
            : "#FED7AA",

          backgroundColor: file
            ? "#F0FDF4"
            : "#FFFDFC",
        }}
      >
        {file ? (
          <FileCheck
            size={20}
            className="
              text-green-600
              shrink-0
            "
          />
        ) : (
          <UploadCloud
            size={20}
            className="
              text-[#FF6600]
              shrink-0
            "
          />
        )}

        <div
          className="
            flex-1
            min-w-0
          "
        >
          <p
            className="
              text-xs
              font-bold
              truncate
            "
            style={{
              color: file
                ? "#15803D"
                : "#2E1A0F",
            }}
          >
            {file
              ? file.name
              : "Tap to upload (Image or PDF)"}
          </p>

          {!file && (
            <p
              className="
                text-[10px]
                text-[#7C6657]
                mt-0.5
              "
            >
              PNG, JPG, JPEG, PDF • Max 10 MB
            </p>
          )}
        </div>

        <input
          type="file"
          accept="image/jpeg,image/jpg,image/png,application/pdf"
          onChange={onChange}
          className="hidden"
        />
      </label>
    </div>
  );
}

/* =========================================================
   GENDER PILL
========================================================= */

function GenderPill({
  label,
  active,
  onClick,
}) {
  return (
    <button
      type="button"
      onClick={onClick}
      className="
        px-6
        py-2.5
        rounded-xl
        font-bold
        text-xs
        transition-all
      "
      style={{
        background: active
          ? "linear-gradient(90deg, #FF6200 0%, #FFA800 100%)"
          : "#FFFFFF",

        color: active
          ? "#FFFFFF"
          : "#7C6657",

        border: active
          ? "none"
          : "1px solid #E5E7EB",

        boxShadow: active
          ? "0 4px 14px rgba(255,98,0,0.22)"
          : "none",
      }}
    >
      {label}
    </button>
  );
}