//src\pages\PersonalDetailsPage.jsx

import React, { useState, useEffect, useRef } from "react";
import { useNavigate } from "react-router-dom";
import { ArrowLeft, HelpCircle, UploadCloud, FileCheck } from "lucide-react";
import { DEV_MODE } from "../config/appConfig";
import { submitPersonalDetails } from "../Services/personalDetails";

/* ---------- VALIDATION REGEX (top-level, so every part of the component can use them) ---------- */
const PAN_REGEX = /^[A-Z]{5}[0-9]{4}[A-Z]{1}$/;
const IFSC_REGEX = /^[A-Z]{4}0[A-Z0-9]{6}$/;
const ACCOUNT_REGEX = /^[0-9]{9,18}$/;
const VEHICLE_NUMBER_REGEX = /^[A-Z]{2}[0-9]{1,2}[A-Z]{1,2}[0-9]{4}$/;

export default function PersonalDetailsPage() {
  const navigate = useNavigate();

  /* GUARD */
  useEffect(() => {
    const progress = JSON.parse(
      localStorage.getItem("onboarding_progress")
    );

    if (progress?.personal_details === "completed") {
      navigate("/onboarding-steps", { replace: true });
      return;
    }

    if (!DEV_MODE && progress?.work_details !== "completed") {
      navigate("/onboarding-steps");
    }
  }, [navigate]);

  /* BASIC */
  const [firstName, setFirstName] = useState("");
  const [lastName, setLastName] = useState("");
  const [email, setEmail] = useState("");
  const [dob, setDob] = useState("");
  const [gender, setGender] = useState("");

  /* AADHAAR */
  const [aadhaar, setAadhaar] = useState("");
  const [aadhaarFile, setAadhaarFile] = useState(null);

  /* PAN */
  const [pan, setPan] = useState("");
  const [panFile, setPanFile] = useState(null);
  const [panError, setPanError] = useState("");

  /* VEHICLE */
  const [vehicleNumber, setVehicleNumber] = useState("");
  const [vehicleLicenceFile, setVehicleLicenceFile] = useState(null);
  const [drivingLicenseFile, setDrivingLicenseFile] = useState(null); // ✅ new

  /* BANK */
  const [bank, setBank] = useState("");
  const [account, setAccount] = useState("");
  const [confirmAccount, setConfirmAccount] = useState("");
  const [accountError, setAccountError] = useState("");
  const [confirmAccountError, setConfirmAccountError] = useState("");
  const [ifsc, setIfsc] = useState("");
  const [ifscError, setIfscError] = useState("");

  /* SELFIE */
  const [selfieFile, setSelfieFile] = useState(null);
  const [cameraOpen, setCameraOpen] = useState(false);
  const videoRef = useRef(null);
  const canvasRef = useRef(null);

  const [error, setError] = useState("");
  const [submitting, setSubmitting] = useState(false);

  useEffect(() => {
    return () => {
      if (videoRef.current?.srcObject) {
        videoRef.current.srcObject.getTracks().forEach((t) => t.stop());
      }
    };
  }, []);

  const openCamera = async () => {
    setCameraOpen(true);
    const stream = await navigator.mediaDevices.getUserMedia({ video: true });
    if (videoRef.current) videoRef.current.srcObject = stream;
  };

  const captureSelfie = () => {
    const video = videoRef.current;
    const canvas = canvasRef.current;
    if (!video || !canvas) return;

    const width = video.videoWidth || 640;
    const height = video.videoHeight || 640;
    canvas.width = width;
    canvas.height = height;

    const ctx = canvas.getContext("2d");
    ctx.drawImage(video, 0, 0, width, height);

    canvas.toBlob((blob) => {
      if (!blob) return;
      const file = new File([blob], "selfie.jpg", { type: "image/jpeg" });
      setSelfieFile(file);
      video.srcObject?.getTracks().forEach((t) => t.stop());
      setCameraOpen(false);
    }, "image/jpeg");
  };

  /* ---------- LIVE VALIDATION ---------- */
  useEffect(() => {
    if (!pan) setPanError("");
    else if (pan.length === 10 && !PAN_REGEX.test(pan))
      setPanError("Invalid PAN format (e.g. ABCDE1234F)");
    else setPanError("");
  }, [pan]);

  useEffect(() => {
    if (!ifsc) setIfscError("");
    else if (ifsc.length === 11 && !IFSC_REGEX.test(ifsc))
      setIfscError("Invalid IFSC format (e.g. SBIN0001234)");
    else setIfscError("");
  }, [ifsc]);

  useEffect(() => {
    if (!account) setAccountError("");
    else if (!ACCOUNT_REGEX.test(account))
      setAccountError("Account number must be 9–18 digits");
    else setAccountError("");
  }, [account]);

  useEffect(() => {
    if (!confirmAccount) setConfirmAccountError("");
    else if (confirmAccount !== account)
      setConfirmAccountError("Account numbers do not match");
    else setConfirmAccountError("");
  }, [confirmAccount, account]);

  /* ✅ FIXED: single unbroken chain, no stray semicolon, vehicle fields properly included */
  const isFormValid =
    firstName.trim().length >= 2 &&
    lastName.trim().length >= 2 &&
    email.includes("@") &&
    dob.length > 0 &&
    gender !== "" &&
    aadhaar.length === 12 &&
    aadhaarFile &&
    PAN_REGEX.test(pan) &&
    panFile &&
    bank.trim() &&
    ACCOUNT_REGEX.test(account) &&
    account === confirmAccount &&
    IFSC_REGEX.test(ifsc) &&
    selfieFile &&
    VEHICLE_NUMBER_REGEX.test(vehicleNumber) &&
    vehicleLicenceFile &&
    drivingLicenseFile; // ✅ new

  const handleSubmit = async () => {
    if (!isFormValid) {
      setError("Please fill all fields correctly, upload documents, and capture a selfie.");
      return;
    }
    setError("");

    try {
      setSubmitting(true);

      await submitPersonalDetails({
        firstName,
        lastName,
        email,
        dob,
        gender,
        aadhaarNumber: aadhaar,
        aadhaarFile,
        panNumber: pan,
        panFile,
        selfieFile,
        bankAccountNumber: account,
        ifscCode: ifsc,
        accountHolderName: `${firstName} ${lastName}`,
        vehicleNumber,
        vehicleLicenceFile,
        drivingLicenseFile, // ✅ new
      });

      console.log("Personal details submitted ✅");

      localStorage.setItem(
        "personal_details",
        JSON.stringify({
          firstName,
          lastName,
          gender,
          aadhaar_last4: aadhaar.slice(-4),
          pan,
          bank,
          account,
          ifsc,
        })
      );

      const existing =
        JSON.parse(localStorage.getItem("onboarding_progress")) || {};

      localStorage.setItem(
        "onboarding_progress",
        JSON.stringify({
          ...existing,
          personal_details: "completed",
          kit_ordered: false,
        })
      );

      navigate("/onboarding-steps", { replace: true });
    } catch (err) {
      console.error("Personal details API error ❌", err);
      setError("Failed to submit. Please check your details and try again.");
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="min-h-screen bg-white flex flex-col">
      {/* HEADER */}
      <div className="flex items-center px-4 py-3 border-b">
        <button onClick={() => navigate(-1)}>
          <ArrowLeft />
        </button>
        <h1 className="flex-1 text-center text-base font-semibold text-gray-900">
          Create your profile
        </h1>
        <HelpCircle className="text-orange-500" />
      </div>

      {/* CONTENT */}
      <div className="flex-1 px-4 pt-6 pb-6 overflow-y-auto">
        <h2 className="text-lg font-semibold mb-4">Enter your details</h2>

        <Input label="First name" value={firstName} setValue={(v) => setFirstName(v.replace(/[^a-zA-Z]/g, ""))} />
        <Input label="Last name" value={lastName} setValue={(v) => setLastName(v.replace(/[^a-zA-Z]/g, ""))} />
        <Input label="Email" value={email} setValue={setEmail} />

        <div className="mb-4">
          <label className="text-sm text-gray-600">Date of Birth</label>
          <input
            type="date"
            value={dob}
            onChange={(e) => setDob(e.target.value)}
            className="w-full border rounded-xl px-4 py-3 mt-1 focus:ring-2 focus:ring-orange-500 outline-none"
          />
        </div>

        <p className="mb-2 font-medium">Select your gender</p>
        <div className="flex gap-4 mb-6">
          <GenderButton label="Male" active={gender === "male"} onClick={() => setGender("male")} />
          <GenderButton label="Female" active={gender === "female"} onClick={() => setGender("female")} />
        </div>

        {/* AADHAAR */}
        <h2 className="text-lg font-semibold mb-3">Aadhaar details</h2>
        <Input
          label="Aadhaar number"
          value={aadhaar}
          setValue={(v) => setAadhaar(v.replace(/\D/g, ""))}
          maxLength={12}
        />
        <FileUpload
          label="Upload Aadhaar Card"
          file={aadhaarFile}
          onChange={(e) => setAadhaarFile(e.target.files[0])}
        />

        {/* PAN */}
        <h2 className="text-lg font-semibold mb-3 mt-6">PAN details</h2>
        <Input
          label="PAN number"
          value={pan}
          setValue={(v) => setPan(v.toUpperCase().replace(/[^A-Z0-9]/g, ""))}
          maxLength={10}
          error={panError}
        />
        <FileUpload
          label="Upload PAN Card"
          file={panFile}
          onChange={(e) => setPanFile(e.target.files[0])}
        />

        {/* VEHICLE */}
        <h2 className="text-lg font-semibold mb-3 mt-6">Vehicle details</h2>
        <Input
          label="Vehicle number"
          value={vehicleNumber}
          setValue={(v) => setVehicleNumber(v.toUpperCase().replace(/[^A-Z0-9]/g, ""))}
          maxLength={10}
          error={
            vehicleNumber.length === 10 && !VEHICLE_NUMBER_REGEX.test(vehicleNumber)
              ? "Invalid format (e.g. MH12AB1234)"
              : ""
          }
        />
        <FileUpload
          label="Upload Vehicle Licence"
          file={vehicleLicenceFile}
          onChange={(e) => setVehicleLicenceFile(e.target.files[0])}
        />

        {/* DRIVING LICENSE — new */}
        <FileUpload
          label="Upload Driving License"
          file={drivingLicenseFile}
          onChange={(e) => setDrivingLicenseFile(e.target.files[0])}
        />

        {/* BANK */}
        <h2 className="text-lg font-semibold mb-2 mt-6">Bank account details</h2>
        <p className="text-xs text-red-500 mb-4">
          <strong>Note:</strong> Payouts will be credited only to the account entered below.
        </p>
        <Input label="Bank name" value={bank} setValue={setBank} />
        <Input
          label="Account number"
          value={account}
          setValue={(v) => setAccount(v.replace(/\D/g, ""))}
          maxLength={18}
          error={accountError}
        />
        <Input
          label="Confirm account number"
          value={confirmAccount}
          setValue={(v) => setConfirmAccount(v.replace(/\D/g, ""))}
          maxLength={18}
          error={confirmAccountError}
        />
        <Input
          label="IFSC code"
          value={ifsc}
          setValue={(v) => setIfsc(v.toUpperCase().replace(/[^A-Z0-9]/g, ""))}
          maxLength={11}
          error={ifscError}
        />

        {/* SELFIE */}
        <h2 className="text-lg font-semibold mb-3 mt-6">Selfie</h2>

        {!cameraOpen && !selfieFile && (
          <button
            onClick={openCamera}
            className="w-full py-3 rounded-xl font-semibold bg-orange-100 text-orange-600"
          >
            Open Camera
          </button>
        )}

        {cameraOpen && (
          <div className="flex flex-col items-center">
            <video
              ref={videoRef}
              autoPlay
              playsInline
              className="w-56 h-56 rounded-full border-4 border-green-500 object-cover mb-4"
            />
            <button
              onClick={captureSelfie}
              className="w-16 h-16 rounded-full bg-blue-600 flex items-center justify-center text-white"
            >
              📷
            </button>
          </div>
        )}

        {selfieFile && !cameraOpen && (
          <div className="flex flex-col items-center">
            <img
              src={URL.createObjectURL(selfieFile)}
              alt="Selfie preview"
              className="w-40 h-40 rounded-full object-cover mb-3"
            />
            <button onClick={openCamera} className="text-orange-500 text-sm">
              Retake selfie
            </button>
          </div>
        )}

        <canvas ref={canvasRef} className="hidden" />

        {/* Debug checklist */}
        {!isFormValid && (
          <div className="mt-4 p-3 bg-gray-50 rounded-lg text-xs text-gray-600 space-y-1">
            <p className="font-semibold mb-1">Still needed:</p>
            {firstName.trim().length < 2 && <p>• First name</p>}
            {lastName.trim().length < 2 && <p>• Last name</p>}
            {!email.includes("@") && <p>• Valid email</p>}
            {!dob && <p>• Date of birth</p>}
            {!gender && <p>• Gender selection</p>}
            {aadhaar.length !== 12 && <p>• Aadhaar (12 digits)</p>}
            {!aadhaarFile && <p>• Aadhaar file upload</p>}
            {(pan.length !== 10 || !PAN_REGEX.test(pan)) && <p>• Valid PAN format</p>}
            {!panFile && <p>• PAN file upload</p>}
            {(vehicleNumber.length !== 10 || !VEHICLE_NUMBER_REGEX.test(vehicleNumber)) && <p>• Valid vehicle number</p>}
            {!vehicleLicenceFile && <p>• Vehicle licence upload</p>}
            {!drivingLicenseFile && <p>• Driving license upload</p>}
            {!bank.trim() && <p>• Bank name</p>}
            {(account.length < 9 || account.length > 18) && <p>• Valid account number</p>}
            {account !== confirmAccount && <p>• Account numbers must match</p>}
            {(ifsc.length !== 11 || !IFSC_REGEX.test(ifsc)) && <p>• Valid IFSC format</p>}
            {!selfieFile && <p>• Selfie capture</p>}
          </div>
        )}

        {error && (
          <p className="text-sm text-red-500 mt-4 text-center">{error}</p>
        )}
      </div>

      {/* CTA */}
      <div className="p-4 border-t">
        <button
          disabled={!isFormValid || submitting}
          onClick={handleSubmit}
          className={`w-full py-3 rounded-xl font-semibold transition ${
            isFormValid && !submitting
              ? "bg-orange-500 text-white active:bg-orange-600"
              : "bg-gray-200 text-gray-400 cursor-not-allowed"
          }`}
        >
          {submitting ? "Submitting..." : "Submit"}
        </button>
      </div>
    </div>
  );
}

/* ---------- HELPERS ---------- */

function Input({ label, value, setValue, maxLength, error }) {
  return (
    <div className="mb-4">
      <label className="text-sm text-gray-600">{label}</label>
      <input
        value={value}
        maxLength={maxLength}
        onChange={(e) => setValue(e.target.value)}
        className={`w-full border rounded-xl px-4 py-3 mt-1 outline-none focus:ring-2 ${
          error
            ? "border-red-400 focus:ring-red-400"
            : "border-gray-300 focus:ring-orange-500"
        }`}
      />
      {error && <p className="text-xs text-red-500 mt-1">{error}</p>}
    </div>
  );
}

function FileUpload({ label, file, onChange }) {
  return (
    <div className="mb-4">
      <label className="text-sm text-gray-600">{label}</label>

      <label
        className={`mt-2 flex items-center gap-3 border-2 border-dashed rounded-xl px-4 py-4 cursor-pointer transition ${
          file
            ? "border-green-400 bg-green-50"
            : "border-gray-300 hover:border-orange-400 hover:bg-orange-50"
        }`}
      >
        {file ? (
          <FileCheck size={22} className="text-green-600 shrink-0" />
        ) : (
          <UploadCloud size={22} className="text-gray-400 shrink-0" />
        )}

        <div className="flex-1 min-w-0">
          <p className={`text-sm font-medium truncate ${file ? "text-green-700" : "text-gray-600"}`}>
            {file ? file.name : "Tap to upload (image or PDF)"}
          </p>
          {!file && (
            <p className="text-xs text-gray-400">PNG, JPG or PDF</p>
          )}
        </div>

        <input
          type="file"
          accept="image/*,.pdf"
          onChange={onChange}
          className="hidden"
        />
      </label>
    </div>
  );
}

function GenderButton({ label, active, onClick }) {
  return (
    <button
      onClick={onClick}
      className={`px-5 py-2 rounded-full border text-sm font-medium transition ${
        active
          ? "bg-orange-500 text-white border-orange-500"
          : "border-gray-300 text-gray-600"
      }`}
    >
      {label}
    </button>
  );
}