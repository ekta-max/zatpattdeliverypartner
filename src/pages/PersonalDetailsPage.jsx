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
import { submitPersonalDetails } from "../Services/personalDetails";
import { fetchDpData, evaluateDpProgress } from "../Services/dpService";

const MAX_FILE_SIZE = 10 * 1024 * 1024; // 10 MB
const PAN_REGEX = /^[A-Z]{5}[0-9]{4}[A-Z]$/;
const IFSC_REGEX = /^[A-Z]{4}0[A-Z0-9]{6}$/;
const ACCOUNT_REGEX = /^[0-9]{9,18}$/;
const AADHAAR_REGEX = /^[0-9]{12}$/;
const VEHICLE_NUMBER_REGEX = /^[A-Z]{2}[0-9]{1,2}[A-Z]{1,3}[0-9]{4}$/;
const EMAIL_REGEX = /^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$/;
const NAME_REGEX = /^[A-Za-z]{2,30}$/;
const ALLOWED_DOCUMENT_TYPES = ["image/jpeg", "image/jpg", "image/png", "application/pdf"];
const ALLOWED_IMAGE_TYPES = ["image/jpeg", "image/jpg", "image/png"];

export default function PersonalDetailsPage() {
  const navigate = useNavigate();

  const [loading, setLoading] = useState(true);

  // Basic Information
  const [firstName, setFirstName] = useState("");
  const [lastName, setLastName] = useState("");
  const [email, setEmail] = useState("");
  const [dob, setDob] = useState("");
  const [gender, setGender] = useState("");
  const [basicErrors, setBasicErrors] = useState({});

  // Aadhaar
  const [aadhaar, setAadhaar] = useState("");
  const [aadhaarFile, setAadhaarFile] = useState(null);
  const [existingAadhaarUrl, setExistingAadhaarUrl] = useState(null);
  const [aadhaarError, setAadhaarError] = useState("");

  // PAN
  const [pan, setPan] = useState("");
  const [panFile, setPanFile] = useState(null);
  const [existingPanUrl, setExistingPanUrl] = useState(null);
  const [panError, setPanError] = useState("");

  // Vehicle
  const [vehicleNumber, setVehicleNumber] = useState("");
  const [vehicleLicenceFile, setVehicleLicenceFile] = useState(null);
  const [existingVehicleLicenceUrl, setExistingVehicleLicenceUrl] = useState(null);
  const [drivingLicenseFile, setDrivingLicenseFile] = useState(null);
  const [existingDrivingLicenseUrl, setExistingDrivingLicenseUrl] = useState(null);
  const [vehicleError, setVehicleError] = useState("");

  // Bank
  const [bank, setBank] = useState("");
  const [account, setAccount] = useState("");
  const [confirmAccount, setConfirmAccount] = useState("");
  const [accountError, setAccountError] = useState("");
  const [confirmAccountError, setConfirmAccountError] = useState("");
  const [ifsc, setIfsc] = useState("");
  const [ifscError, setIfscError] = useState("");

  // Selfie
  const [selfieFile, setSelfieFile] = useState(null);
  const [existingSelfieUrl, setExistingSelfieUrl] = useState(null);
  const [cameraOpen, setCameraOpen] = useState(false);
  const videoRef = useRef(null);
  const canvasRef = useRef(null);

  // Submit & Validation
  const [errorsList, setErrorsList] = useState([]);
  const [submitting, setSubmitting] = useState(false);

  /*
   * Verify Flow Gate with Django dp-data API
   */
  useEffect(() => {
    const initPage = async () => {
      setLoading(true);
      const data = await fetchDpData();

      if (!data) {
        navigate("/onboarding-steps", { replace: true });
        return;
      }

      const progress = evaluateDpProgress(data);

      // Gate: Step 1 (Work Details) must be completed
      if (!progress.step1Done) {
        navigate("/work-details", { replace: true });
        return;
      }

      // Pre-fill existing data from API
      if (data.first_name) setFirstName(data.first_name);
      if (data.last_name) setLastName(data.last_name);
      if (data.email) setEmail(data.email);
      if (data.dob) setDob(data.dob);
      if (data.gender) setGender(data.gender);

      if (data.adhaar_card_number) setAadhaar(data.adhaar_card_number);
      if (data.adhaar_card) setExistingAadhaarUrl(data.adhaar_card);

      if (data.pan_card_number) setPan(data.pan_card_number);
      if (data.pan_card) setExistingPanUrl(data.pan_card);

      if (data.vehicle_number) setVehicleNumber(data.vehicle_number);
      if (data.vehicle_licence) setExistingVehicleLicenceUrl(data.vehicle_licence);
      if (data.driving_license) setExistingDrivingLicenseUrl(data.driving_license);

      if (data.account_holder_name) setBank(data.account_holder_name);
      if (data.bank_account_number) {
        setAccount(data.bank_account_number);
        setConfirmAccount(data.bank_account_number);
      }
      if (data.ifsc_code) setIfsc(data.ifsc_code);
      if (data.selfie) setExistingSelfieUrl(data.selfie);

      setLoading(false);
    };

    initPage();
  }, [navigate]);

  // Clean up camera stream
  useEffect(() => {
    return () => {
      if (videoRef.current?.srcObject) {
        videoRef.current.srcObject.getTracks().forEach((track) => track.stop());
      }
    };
  }, []);

  const calculateAge = (dobVal) => {
    if (!dobVal) return 0;
    const birthDate = new Date(dobVal);
    const today = new Date();
    let age = today.getFullYear() - birthDate.getFullYear();
    const m = today.getMonth() - birthDate.getMonth();
    if (m < 0 || (m === 0 && today.getDate() < birthDate.getDate())) age--;
    return age;
  };

  const openCamera = async () => {
    try {
      if (!navigator.mediaDevices?.getUserMedia) {
        alert("Camera is not supported in this browser.");
        return;
      }
      setCameraOpen(true);
      const stream = await navigator.mediaDevices.getUserMedia({
        video: { facingMode: "user" },
        audio: false,
      });
      if (videoRef.current) videoRef.current.srcObject = stream;
    } catch (error) {
      setCameraOpen(false);
      alert("Camera access denied. Please enable permissions.");
    }
  };

  const captureSelfie = () => {
    const video = videoRef.current;
    const canvas = canvasRef.current;
    if (!video || !canvas) return;

    canvas.width = video.videoWidth || 640;
    canvas.height = video.videoHeight || 640;
    const ctx = canvas.getContext("2d");
    if (!ctx) return;

    ctx.drawImage(video, 0, 0, canvas.width, canvas.height);
    canvas.toBlob(
      (blob) => {
        if (!blob) return;
        const file = new File([blob], "selfie.jpg", { type: "image/jpeg" });
        setSelfieFile(file);
        setExistingSelfieUrl(null);
        if (video.srcObject) {
          video.srcObject.getTracks().forEach((track) => track.stop());
        }
        setCameraOpen(false);
      },
      "image/jpeg",
      0.9
    );
  };

  const validateForm = () => {
    const missing = [];
    if (!NAME_REGEX.test(firstName.trim())) missing.push("First Name: minimum 2 letters.");
    if (!NAME_REGEX.test(lastName.trim())) missing.push("Last Name: minimum 2 letters.");
    if (!EMAIL_REGEX.test(email.trim().toLowerCase())) missing.push("Enter a valid Email address.");
    if (!dob || calculateAge(dob) < 18) missing.push("Partner must be at least 18 years old.");
    if (!gender) missing.push("Gender selection is required.");

    if (!AADHAAR_REGEX.test(aadhaar.replace(/\D/g, ""))) missing.push("Aadhaar must contain 12 digits.");
    if (!aadhaarFile && !existingAadhaarUrl) missing.push("Upload Aadhaar Card document.");

    if (!PAN_REGEX.test(pan.trim().toUpperCase())) missing.push("PAN must be valid (e.g. ABCDE1234F).");
    if (!panFile && !existingPanUrl) missing.push("Upload PAN Card.");

    if (!VEHICLE_NUMBER_REGEX.test(vehicleNumber.trim().toUpperCase())) missing.push("Vehicle number is invalid (e.g. MH12AB1234).");
    if (!vehicleLicenceFile && !existingVehicleLicenceUrl) missing.push("Upload Vehicle RC.");
    if (!drivingLicenseFile && !existingDrivingLicenseUrl) missing.push("Upload Driving License.");

    if (!ACCOUNT_REGEX.test(account.trim())) missing.push("Valid Bank Account (9-18 digits) required.");
    if (confirmAccount.trim() !== account.trim()) missing.push("Account numbers do not match.");
    if (!IFSC_REGEX.test(ifsc.trim().toUpperCase())) missing.push("Valid IFSC code required.");
    if (!selfieFile && !existingSelfieUrl) missing.push("Live Selfie capture is required.");

    return missing;
  };

  const handleSubmit = async () => {
    if (submitting) return;

    const validationErrors = validateForm();
    if (validationErrors.length > 0) {
      setErrorsList(validationErrors);
      window.scrollTo({ top: document.body.scrollHeight, behavior: "smooth" });
      return;
    }

    setErrorsList([]);

    try {
      setSubmitting(true);
      const payload = {
        firstName: firstName.trim(),
        lastName: lastName.trim(),
        email: email.trim().toLowerCase(),
        dob,
        gender,
        aadhaarNumber: aadhaar.replace(/\D/g, ""),
        aadhaarFile,
        panNumber: pan.trim().toUpperCase(),
        panFile,
        selfieFile,
        bankAccountNumber: account.trim(),
        ifscCode: ifsc.trim().toUpperCase(),
        accountHolderName: `${firstName.trim()} ${lastName.trim()}`,
        vehicleNumber: vehicleNumber.trim().toUpperCase(),
        vehicleLicenceFile,
        drivingLicenseFile,
      };

      await submitPersonalDetails(payload);
      await fetchDpData(); // Update cache

      navigate("/onboarding-steps", { replace: true });
    } catch (err) {
      console.error("KYC Submission error:", err);
      setErrorsList(["Failed to submit details. Please verify your fields and files."]);
    } finally {
      setSubmitting(false);
    }
  };

  if (loading) {
    return (
      <div
        className="min-h-screen flex items-center justify-center"
        style={{ backgroundColor: "#FAF6F0" }}
      >
        <div className="flex items-center gap-2 text-sm font-bold text-[#FF6600]">
          <div className="w-5 h-5 border-2 border-[#FF6600] border-t-transparent rounded-full animate-spin" />
          Loading partner profile...
        </div>
      </div>
    );
  }

  return (
    <div
      className="min-h-screen w-full flex flex-col justify-between items-center relative overflow-x-hidden p-3.5 sm:p-5 md:p-7 select-none"
      style={{
        backgroundColor: "#FAF6F0",
        backgroundImage: `
          radial-gradient(circle at 10% 15%, rgba(255, 230, 205, 0.7) 0%, transparent 40%),
          radial-gradient(circle at 92% 25%, rgba(255, 226, 195, 0.75) 0%, transparent 38%)
        `,
      }}
    >
      <div className="w-full max-w-[840px] my-4 z-10 bg-white rounded-[26px] sm:rounded-[32px] shadow-[0_20px_60px_rgba(100,50,15,0.08)] border border-[#F3E7DC] overflow-hidden flex flex-col">
        {/* HEADER */}
        <div className="px-5 py-4 border-b border-[#F3E7DC] flex items-center justify-between bg-white sticky top-0 z-20">
          <button
            type="button"
            onClick={() => navigate("/onboarding-steps")}
            className="w-9 h-9 rounded-xl border border-[#E5E7EB] flex items-center justify-center text-[#2E1A0F] hover:bg-[#FAF6F0]"
          >
            <ArrowLeft size={18} />
          </button>
          <div className="text-center">
            <span className="text-[10px] font-black uppercase tracking-[1.4px] text-[#FF6600]">
              Step 2 of 3 • Partner Verification
            </span>
            <h1 className="text-sm sm:text-base font-black text-[#2E1A0F]">
              Personal & KYC Details
            </h1>
          </div>
          <div className="w-9 h-9 rounded-xl bg-[#FFF5EC] border border-[#FED7AA] flex items-center justify-center text-[#FF6600]">
            <HelpCircle size={18} />
          </div>
        </div>

        {/* FORM CONTENT */}
        <div className="p-5 sm:p-8 space-y-7">
          {/* SECTION 1: BASIC INFO */}
          <div className="p-4 sm:p-5 rounded-2xl bg-[#FAF8F5] border border-[#F3E7DC]">
            <h2 className="text-sm sm:text-base font-black text-[#2E1A0F] mb-4 pb-2 border-b border-[#F3E7DC]">
              1. Basic Information
            </h2>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="block text-xs font-bold text-[#2E1A0F] mb-1.5">First Name</label>
                <input
                  value={firstName}
                  onChange={(e) => setFirstName(e.target.value.replace(/[^A-Za-z]/g, ""))}
                  placeholder="e.g. Rahul"
                  className="w-full border rounded-xl px-4 py-3 text-sm font-semibold text-[#2E1A0F] outline-none bg-white border-[#E5E7EB] focus:border-[#FF6600]"
                />
              </div>
              <div>
                <label className="block text-xs font-bold text-[#2E1A0F] mb-1.5">Last Name</label>
                <input
                  value={lastName}
                  onChange={(e) => setLastName(e.target.value.replace(/[^A-Za-z]/g, ""))}
                  placeholder="e.g. Sharma"
                  className="w-full border rounded-xl px-4 py-3 text-sm font-semibold text-[#2E1A0F] outline-none bg-white border-[#E5E7EB] focus:border-[#FF6600]"
                />
              </div>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 mt-4">
              <div>
                <label className="block text-xs font-bold text-[#2E1A0F] mb-1.5">Email Address</label>
                <input
                  value={email}
                  onChange={(e) => setEmail(e.target.value.toLowerCase().trim())}
                  placeholder="e.g. rahul@gmail.com"
                  className="w-full border rounded-xl px-4 py-3 text-sm font-semibold text-[#2E1A0F] outline-none bg-white border-[#E5E7EB] focus:border-[#FF6600]"
                />
              </div>
              <div>
                <label className="block text-xs font-bold text-[#2E1A0F] mb-1.5">Date of Birth</label>
                <input
                  type="date"
                  value={dob}
                  onChange={(e) => setDob(e.target.value)}
                  className="w-full border rounded-xl px-4 py-3 text-sm font-semibold text-[#2E1A0F] outline-none bg-white border-[#E5E7EB] focus:border-[#FF6600]"
                />
              </div>
            </div>

            <div className="mt-4">
              <label className="block text-xs font-bold text-[#2E1A0F] mb-1.5">Gender</label>
              <div className="flex gap-3">
                {["male", "female"].map((g) => (
                  <button
                    key={g}
                    type="button"
                    onClick={() => setGender(g)}
                    className="px-6 py-2.5 rounded-xl font-bold text-xs capitalize transition-all"
                    style={{
                      background: gender === g ? "linear-gradient(90deg, #FF6200 0%, #FFA800 100%)" : "#FFFFFF",
                      color: gender === g ? "#FFFFFF" : "#7C6657",
                      border: gender === g ? "none" : "1px solid #E5E7EB",
                    }}
                  >
                    {g}
                  </button>
                ))}
              </div>
            </div>
          </div>

          {/* SECTION 2: AADHAAR */}
          <div className="p-4 sm:p-5 rounded-2xl bg-[#FAF8F5] border border-[#F3E7DC]">
            <h2 className="text-sm sm:text-base font-black text-[#2E1A0F] mb-4 pb-2 border-b border-[#F3E7DC]">
              2. Aadhaar Verification
            </h2>
            <div>
              <label className="block text-xs font-bold text-[#2E1A0F] mb-1.5">Aadhaar Card Number</label>
              <input
                value={aadhaar}
                maxLength={12}
                onChange={(e) => setAadhaar(e.target.value.replace(/\D/g, "").slice(0, 12))}
                placeholder="12-digit number"
                className="w-full border rounded-xl px-4 py-3 text-sm font-semibold text-[#2E1A0F] outline-none bg-white border-[#E5E7EB]"
              />
            </div>
            <div className="mt-4">
              <label className="block text-xs font-bold text-[#2E1A0F] mb-1.5">Upload Aadhaar Card</label>
              <label className="flex items-center gap-3 border-2 border-dashed rounded-xl px-4 py-3.5 cursor-pointer bg-white">
                <UploadCloud size={20} className="text-[#FF6600]" />
                <span className="text-xs font-bold text-[#2E1A0F]">
                  {aadhaarFile ? aadhaarFile.name : existingAadhaarUrl ? "Aadhaar Document Uploaded (Tap to replace)" : "Tap to upload (Image or PDF)"}
                </span>
                <input
                  type="file"
                  accept="image/jpeg,image/jpg,image/png,application/pdf"
                  onChange={(e) => setAadhaarFile(e.target.files?.[0])}
                  className="hidden"
                />
              </label>
            </div>
          </div>

          {/* SECTION 3: PAN */}
          <div className="p-4 sm:p-5 rounded-2xl bg-[#FAF8F5] border border-[#F3E7DC]">
            <h2 className="text-sm sm:text-base font-black text-[#2E1A0F] mb-4 pb-2 border-b border-[#F3E7DC]">
              3. PAN Verification
            </h2>
            <div>
              <label className="block text-xs font-bold text-[#2E1A0F] mb-1.5">PAN Card Number</label>
              <input
                value={pan}
                maxLength={10}
                onChange={(e) => setPan(e.target.value.toUpperCase().replace(/[^A-Z0-9]/g, "").slice(0, 10))}
                placeholder="ABCDE1234F"
                className="w-full border rounded-xl px-4 py-3 text-sm font-semibold text-[#2E1A0F] outline-none bg-white border-[#E5E7EB]"
              />
            </div>
            <div className="mt-4">
              <label className="block text-xs font-bold text-[#2E1A0F] mb-1.5">Upload PAN Card</label>
              <label className="flex items-center gap-3 border-2 border-dashed rounded-xl px-4 py-3.5 cursor-pointer bg-white">
                <UploadCloud size={20} className="text-[#FF6600]" />
                <span className="text-xs font-bold text-[#2E1A0F]">
                  {panFile ? panFile.name : existingPanUrl ? "PAN Card Uploaded (Tap to replace)" : "Tap to upload (Image or PDF)"}
                </span>
                <input
                  type="file"
                  accept="image/jpeg,image/jpg,image/png,application/pdf"
                  onChange={(e) => setPanFile(e.target.files?.[0])}
                  className="hidden"
                />
              </label>
            </div>
          </div>

          {/* SECTION 4: VEHICLE & DL */}
          <div className="p-4 sm:p-5 rounded-2xl bg-[#FAF8F5] border border-[#F3E7DC]">
            <h2 className="text-sm sm:text-base font-black text-[#2E1A0F] mb-4 pb-2 border-b border-[#F3E7DC]">
              4. Vehicle & Driving License
            </h2>
            <div>
              <label className="block text-xs font-bold text-[#2E1A0F] mb-1.5">Vehicle Registration Number</label>
              <input
                value={vehicleNumber}
                maxLength={10}
                onChange={(e) => setVehicleNumber(e.target.value.toUpperCase().replace(/[^A-Z0-9]/g, "").slice(0, 10))}
                placeholder="MH12AB1234"
                className="w-full border rounded-xl px-4 py-3 text-sm font-semibold text-[#2E1A0F] outline-none bg-white border-[#E5E7EB]"
              />
            </div>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 mt-4">
              <div>
                <label className="block text-xs font-bold text-[#2E1A0F] mb-1.5">Vehicle RC</label>
                <label className="flex items-center gap-3 border-2 border-dashed rounded-xl px-4 py-3.5 cursor-pointer bg-white">
                  <UploadCloud size={20} className="text-[#FF6600]" />
                  <span className="text-xs font-bold text-[#2E1A0F] truncate">
                    {vehicleLicenceFile ? vehicleLicenceFile.name : existingVehicleLicenceUrl ? "RC Uploaded" : "Upload RC"}
                  </span>
                  <input
                    type="file"
                    accept="image/jpeg,image/jpg,image/png,application/pdf"
                    onChange={(e) => setVehicleLicenceFile(e.target.files?.[0])}
                    className="hidden"
                  />
                </label>
              </div>
              <div>
                <label className="block text-xs font-bold text-[#2E1A0F] mb-1.5">Driving License</label>
                <label className="flex items-center gap-3 border-2 border-dashed rounded-xl px-4 py-3.5 cursor-pointer bg-white">
                  <UploadCloud size={20} className="text-[#FF6600]" />
                  <span className="text-xs font-bold text-[#2E1A0F] truncate">
                    {drivingLicenseFile ? drivingLicenseFile.name : existingDrivingLicenseUrl ? "DL Uploaded" : "Upload DL"}
                  </span>
                  <input
                    type="file"
                    accept="image/jpeg,image/jpg,image/png,application/pdf"
                    onChange={(e) => setDrivingLicenseFile(e.target.files?.[0])}
                    className="hidden"
                  />
                </label>
              </div>
            </div>
          </div>

          {/* SECTION 5: BANK */}
          <div className="p-4 sm:p-5 rounded-2xl bg-[#FAF8F5] border border-[#F3E7DC]">
            <h2 className="text-sm sm:text-base font-black text-[#2E1A0F] mb-4 pb-2 border-b border-[#F3E7DC]">
              5. Bank Details
            </h2>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="block text-xs font-bold text-[#2E1A0F] mb-1.5">Account Number</label>
                <input
                  value={account}
                  maxLength={18}
                  onChange={(e) => setAccount(e.target.value.replace(/\D/g, ""))}
                  placeholder="9-18 digits"
                  className="w-full border rounded-xl px-4 py-3 text-sm font-semibold text-[#2E1A0F] outline-none bg-white border-[#E5E7EB]"
                />
              </div>
              <div>
                <label className="block text-xs font-bold text-[#2E1A0F] mb-1.5">Confirm Account</label>
                <input
                  value={confirmAccount}
                  maxLength={18}
                  onChange={(e) => setConfirmAccount(e.target.value.replace(/\D/g, ""))}
                  placeholder="Re-enter account"
                  className="w-full border rounded-xl px-4 py-3 text-sm font-semibold text-[#2E1A0F] outline-none bg-white border-[#E5E7EB]"
                />
              </div>
            </div>
            <div className="mt-4">
              <label className="block text-xs font-bold text-[#2E1A0F] mb-1.5">IFSC Code</label>
              <input
                value={ifsc}
                maxLength={11}
                onChange={(e) => setIfsc(e.target.value.toUpperCase().replace(/[^A-Z0-9]/g, "").slice(0, 11))}
                placeholder="e.g. SBIN0001234"
                className="w-full border rounded-xl px-4 py-3 text-sm font-semibold text-[#2E1A0F] outline-none bg-white border-[#E5E7EB]"
              />
            </div>
          </div>

          {/* SECTION 6: SELFIE */}
          <div className="p-4 sm:p-5 rounded-2xl bg-[#FAF8F5] border border-[#F3E7DC]">
            <h2 className="text-sm sm:text-base font-black text-[#2E1A0F] mb-4 pb-2 border-b border-[#F3E7DC]">
              6. Live Selfie
            </h2>
            {!cameraOpen && !selfieFile && !existingSelfieUrl && (
              <button
                type="button"
                onClick={openCamera}
                className="w-full py-4 rounded-2xl bg-[#FFF5EC] border-2 border-dashed border-[#FED7AA] font-bold text-sm text-[#FF6600] flex items-center justify-center gap-2"
              >
                <Camera size={20} />
                <span>Take Live Selfie</span>
              </button>
            )}

            {cameraOpen && (
              <div className="flex flex-col items-center p-5 bg-white rounded-2xl border border-[#F3E7DC]">
                <video ref={videoRef} autoPlay playsInline className="w-48 h-48 rounded-full border-4 border-[#FF6600] object-cover mb-4" />
                <button
                  type="button"
                  onClick={captureSelfie}
                  className="px-6 py-2.5 rounded-full font-bold text-white shadow-md flex items-center gap-2 bg-[#FF6600]"
                >
                  <Camera size={18} /> Capture
                </button>
              </div>
            )}

            {(selfieFile || existingSelfieUrl) && !cameraOpen && (
              <div className="flex items-center gap-4 p-4 rounded-2xl bg-green-50 border border-green-200">
                <img
                  src={selfieFile ? URL.createObjectURL(selfieFile) : `http://127.0.0.1:8002${existingSelfieUrl}`}
                  alt="Selfie preview"
                  className="w-16 h-16 rounded-full object-cover border-2 border-green-500 shadow-sm shrink-0"
                />
                <div className="flex-1">
                  <p className="text-xs font-bold text-green-800">Selfie Ready</p>
                  <button
                    type="button"
                    onClick={openCamera}
                    className="text-xs font-bold text-[#FF6600] hover:underline"
                  >
                    Retake photo
                  </button>
                </div>
                <CheckCircle2 size={24} className="text-green-600 shrink-0" />
              </div>
            )}
            <canvas ref={canvasRef} className="hidden" />
          </div>

          {/* ERRORS */}
          {errorsList.length > 0 && (
            <div className="p-4 rounded-2xl bg-red-50 border border-red-200">
              <div className="flex items-center gap-2 mb-2 text-red-700 font-extrabold text-sm">
                <AlertCircle size={18} />
                <span>Please complete the required details:</span>
              </div>
              <ul className="space-y-1 pl-6 list-disc text-xs font-semibold text-red-600">
                {errorsList.map((err, i) => (
                  <li key={i}>{err}</li>
                ))}
              </ul>
            </div>
          )}
        </div>

        {/* SUBMIT BUTTON */}
        <div className="p-5 sm:p-6 border-t border-[#F3E7DC] bg-[#FAF8F5]">
          <button
            type="button"
            onClick={handleSubmit}
            disabled={submitting}
            className="w-full h-[52px] rounded-2xl font-extrabold text-base flex items-center justify-center gap-2 text-white shadow-lg disabled:opacity-70"
            style={{ background: "linear-gradient(90deg, #FF6200 0%, #FFA800 100%)" }}
          >
            {submitting ? "Submitting KYC..." : "Submit & Complete KYC"}
            <ArrowRight size={18} />
          </button>
        </div>
      </div>
    </div>
  );
}
