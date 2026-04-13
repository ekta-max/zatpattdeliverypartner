//src\pages\PersonalDetailsPage.jsx

import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { ArrowLeft, HelpCircle } from "lucide-react";
import AadhaarSample from "../assets/aadhaar-sample.png";
import Confetti from "react-confetti";
import PANsample from "../assets/pan-sample.png";
import { DEV_MODE } from "../config/appConfig";
import { submitPersonalDetailsBasic } from "../Services/personalDetails";
import { verifyAadhaar } from "../Services/personalDetails";
import { verifyPan } from "../Services/personalDetails";
import { submitBankDetails } from "../Services/personalDetails";
import { uploadSelfie } from "../Services/personalDetails";




export default function PersonalDetailsPage() {
  const navigate = useNavigate();
 
  const [aadhaarFile, setAadhaarFile] = useState(null);
  const [panFile, setPanFile] = useState(null);
  const [email, setEmail] = useState("");
  const [dob, setDob] = useState("");

  useEffect(() => {
  const progress = JSON.parse(
    localStorage.getItem("onboarding_progress")
  );

  // ❌ Prevent re-entry once completed
  if (progress?.personal_details === "completed") {
    navigate("/onboarding-steps", { replace: true });
  }

  // ❌ Do not allow without work details
  // if (progress?.work_details !== "completed") {
  //   navigate("/work-details", { replace: true });
  // }


 if (!DEV_MODE && progress?.work_details !== "completed") {
  navigate("/onboarding-steps");
}
}, [navigate]);

  const [step, setStep] = useState(1);

  /* BASIC DETAILS */
  const [firstName, setFirstName] = useState("");
  const [lastName, setLastName] = useState("");
  const [gender, setGender] = useState("");
  const [referral, setReferral] = useState("");

  /* AADHAAR */
  const [aadhaar, setAadhaar] = useState("");
  // const [aadhaarOtp, setAadhaarOtp] = useState("");
  // const [aadhaarVerified, setAadhaarVerified] = useState(false);
  // const [aadhaarStage, setAadhaarStage] = useState("number"); 
  // number | otp | verified

  const [aadhaarError, setAadhaarError] = useState("");
  // const [otpTimer, setOtpTimer] = useState(30);

  // useEffect(() => {
  //   if (aadhaarStage !== "otp" || otpTimer <= 0) return;
  //   const t = setInterval(() => setOtpTimer((s) => s - 1), 1000);
  //   return () => clearInterval(t);
  // }, [aadhaarStage, otpTimer]);

  const [showAadhaarPopup, setShowAadhaarPopup] = useState(false);

  /* PAN */
  const [pan, setPan] = useState("");
  const [panStage, setPanStage] = useState("number"); 
  // number | verified

  const [showPanPopup, setShowPanPopup] = useState(false);
  const [panError, setPanError] = useState("");

  /* BANK */
  const [bank, setBank] = useState("");
  const [account, setAccount] = useState("");
  const [confirmAccount, setConfirmAccount] = useState("");
  const [ifsc, setIfsc] = useState("");
  const [bankError, setBankError] = useState("");
  const [bankConfirmed, setBankConfirmed] = useState(false);

  const isBankFormValid =
  bank.trim() &&
  account.length >= 9 &&
  account === confirmAccount &&
  ifsc.length === 11 &&
  bankConfirmed;

  /* SELFIE */
  const [selfieTaken, setSelfieTaken] = useState(false);
  /* SELFIE */
  const [selfieStage, setSelfieStage] = useState("intro"); 
  // intro | camera | preview

  const videoRef = React.useRef(null);
  const canvasRef = React.useRef(null);
  const [selfieFile, setSelfieFile] = useState(null);

  useEffect(() => {
  return () => {
    if (videoRef.current?.srcObject) {
      videoRef.current.srcObject.getTracks().forEach((t) => t.stop());
    }
  };
}, []);


  const isStep1Valid =
  firstName.trim().length >= 2 &&
  lastName.trim().length >= 2 &&
  gender !== "" &&
  email.includes("@") &&
  dob.length > 0;


  return (
    <div className="min-h-screen bg-white flex flex-col">
      {/* ---------- HEADER ---------- */}
      <div className="flex items-center px-4 py-3 border-b">
  {/* Back */}
   <button onClick={() => (step > 1 ? setStep(step - 1) : navigate(-1))}>
        <ArrowLeft />
    </button>

  {/* Title */}
  <h1 className="flex-1 text-center text-base font-semibold text-gray-900">
    Create your profile
  </h1>

  {/* Help */}
  <HelpCircle className="text-orange-500" />
</div>

      {/* ---------- PROGRESS ---------- */}
      <div className="px-4 mt-3">
        <div className="h-1 bg-gray-200 rounded">
          <div
            className="h-1 bg-orange-500 rounded transition-all"
            style={{ width: `${(step / 6) * 100}%` }}
          />
        </div>
      </div>

      {/* ---------- CONTENT ---------- */}
      <div className="flex-1 px-4 pt-6">
        {/* STEP 1 – BASIC DETAILS */}
        {step === 1 && (
          <>
            <h2 className="text-lg font-semibold mb-4">
              Enter some basic details
            </h2>

            <Input
            label="First name"
            value={firstName}
            setValue={(v) => setFirstName(v.replace(/[^a-zA-Z]/g, ""))}
            />

            <Input
            label="Last name"
            value={lastName}
            setValue={(v) => setLastName(v.replace(/[^a-zA-Z]/g, ""))}
            />

            <Input
              label="Email"
              value={email}
              setValue={setEmail}
            />

         <div className="mb-4">
        <label className="text-sm text-gray-600">Date of Birth</label>

        <input
          type="date"
          value={dob}
          onChange={(e) => setDob(e.target.value)}
          className="w-full border rounded-xl px-4 py-3 mt-1 focus:ring-2 focus:ring-orange-500 outline-none"
        />
      </div>

            <p className="mt-4 font-semibold font-medium">Select your gender</p>
            <div className="flex gap-4 mt-3">
            <button
                onClick={() => setGender("male")}
                className={`px-5 py-2 rounded-full border text-sm font-medium transition ${
                gender === "male"
                    ? "bg-orange-500 text-white border-orange-500"
                    : "border-gray-300 text-gray-600"
                }`}
            > Male
            </button>

            <button
                onClick={() => setGender("female")}
                className={`px-5 py-2 rounded-full border text-sm font-medium transition ${
                gender === "female"
                    ? "bg-orange-500 text-white border-orange-500"
                    : "border-gray-300 text-gray-600"
                }`}
            >
                Female
            </button>
            </div>

           <button

        onClick={async () => {
  if (!isStep1Valid) return;

  try {
    await submitPersonalDetailsBasic({
      first_name: firstName,
      last_name: lastName,
      email,
      dob,
      gender,
    });

    console.log("Personal basic saved ✅");

    setStep(2); // move forward
  } catch (err) {
    console.error("Personal API error ❌", err);
    alert("Failed to save personal details");
  }
}}

        disabled={!isStep1Valid}
        className={`mt-8 w-full py-3 rounded-xl font-semibold transition ${
            isStep1Valid
            ? "bg-orange-500 text-white active:bg-orange-600"
            : "bg-gray-200 text-gray-400 cursor-not-allowed"
        }`}
        >
        Continue
        </button>
          </>
        )}

        {/* STEP 2 – REFERRAL */}
        {step === 2 && (
          <>
            <h2 className="text-lg font-semibold mb-4">
              Referral Code (Optional)
            </h2>

            <Input label="Referral code" value={referral} setValue={setReferral} />

            <button
              onClick={() => setStep(3)}
              className="mt-8 w-full bg-orange-500 text-white py-3 rounded-xl font-semibold"
            >
              Continue
            </button>
          </>
        )}

       {/* STEP 3 – AADHAAR */}
       {/* STEP 3 – AADHAAR */}
{step === 3 && (
  <div className="flex flex-col h-full">
    <div className="flex-1">

      {/* IMAGE */}
      <div className="mb-4">
        <img
          src={AadhaarSample}
          alt="Aadhaar sample"
          className="w-full rounded-xl border"
        />
      </div>

      <h2 className="text-lg font-semibold mb-1">
        Enter your Aadhaar details
      </h2>

      <p className="text-sm text-gray-500 mb-4">
        Upload your Aadhaar card for verification
      </p>

      {/* AADHAAR NUMBER */}
      <Input
        label="Aadhaar number"
        value={aadhaar}
        setValue={(v) => {
          setAadhaar(v.replace(/\D/g, ""));
          setAadhaarError("");
        }}
        maxLength={12}
      />

      {/* FILE UPLOAD */}
      <div className="mb-4">
        <label className="text-sm text-gray-600">
          Upload Aadhaar Card
        </label>

        <input
          type="file"
          accept="image/*,.pdf"
          onChange={(e) => setAadhaarFile(e.target.files[0])}
          className="w-full mt-2"
        />
         
         {aadhaarFile && (
        <p className="text-xs text-green-600 mt-1">
          File selected: {aadhaarFile.name}
        </p>
      )}
      </div>

      {/* ERROR */}
      {aadhaarError && (
        <p className="text-xs text-red-500 mt-1">
          {aadhaarError}
        </p>
      )}
    </div>

    {/* BUTTON */}
    <div className="pb-4">
      <button
        onClick={async () => {
          if (aadhaar.length !== 12) {
            setAadhaarError("Aadhaar must be 12 digits");
            return;
          }

          if (!aadhaarFile) {
            setAadhaarError("Please upload Aadhaar file");
            return;
          }

          try {
           await verifyAadhaar({
            adhaar_card_number: aadhaar,
            file: aadhaarFile,
          });

            console.log("Aadhaar verified ✅");

            setShowAadhaarPopup(true);

          } catch (err) {
            console.error("Aadhaar API error ❌", err);
            setAadhaarError("Verification failed");
          }
        }}
        className="w-full py-3 rounded-xl font-semibold bg-orange-500 text-white"
      >
        Verify Aadhaar
      </button>
    </div>
  </div>
)}

       {/* STEP 4 – PAN */}
        {step === 4 && (
  <div className="flex flex-col h-full">
    <div className="flex-1">
      
      {/* IMAGE */}
      <div className="mb-4">
        <img
          src={PANsample}
          alt="PAN sample"
          className="w-full rounded-xl border"
        />
      </div>

      <h2 className="text-lg font-semibold mb-1">
        Enter your PAN details
      </h2>

      <p className="text-sm text-gray-500 mb-4">
        Upload your PAN card for verification
      </p>

      {/* PAN NUMBER */}
      <Input
        label="PAN number"
        value={pan}
        setValue={(v) => {
          setPan(v.toUpperCase().replace(/[^A-Z0-9]/g, ""));
          setPanError("");
        }}
        maxLength={10}
      />

      {/* FILE UPLOAD */}
      <div className="mb-4">
        <label className="text-sm text-gray-600">
          Upload PAN Card
        </label>

        <input
          type="file"
          accept="image/*,.pdf"
          onChange={(e) => setPanFile(e.target.files[0])}
          className="w-full mt-2"
        />

        {panFile && (
          <p className="text-xs text-green-600 mt-1">
            File selected: {panFile.name}
          </p>
        )}
      </div>

      {/* ERROR */}
      {panError && (
        <p className="text-xs text-red-500 mt-1">
          {panError}
        </p>
      )}
    </div>

    {/* BUTTON */}
    <div className="pb-4">
      <button
        onClick={async () => {
          if (pan.length !== 10) {
            setPanError("PAN must be 10 characters");
            return;
          }

          if (!panFile) {
            setPanError("Please upload PAN file");
            return;
          }

          try {
            await verifyPan({
              pan_card_number: pan,
              file: panFile,
            });

            console.log("PAN verified ✅");

            setShowPanPopup(true);

          } catch (err) {
            console.error("PAN API error ❌", err);
            setPanError("Verification failed");
          }
        }}
        className="w-full py-3 rounded-xl font-semibold bg-orange-500 text-white"
      >
        Verify PAN
      </button>
    </div>
  </div>
)}


{/* STEP 5 – BANK ACCOUNT */}
{step === 5 && (
  <>
    <h2 className="text-lg font-semibold mb-2">
      Bank account details
    </h2>

    {/* 🔴 IMPORTANT NOTE */}
    <p className="text-xs text-red-500 mt-2 mb-5">
      <strong>Note:</strong> Please enter correct bank details. Payouts will be
      credited <strong>only</strong> to the account mentioned above.
    </p>

    <Input label="Bank name" value={bank} setValue={setBank} />

    <Input
      label="Account number"
      value={account}
      setValue={(v) => setAccount(v.replace(/\D/g, ""))}
    />

    <Input
      label="Confirm account number"
      value={confirmAccount}
      setValue={(v) => setConfirmAccount(v.replace(/\D/g, ""))}
    />

    <Input
      label="IFSC code"
      value={ifsc}
      setValue={(v) => setIfsc(v.toUpperCase())}
      maxLength={11}
    />

    {/* ❌ ERROR */}
    {bankError && (
      <p className="text-xs text-red-500 mt-2">{bankError}</p>
    )}

    {/* ☑️ CONFIRMATION CHECKBOX */}
    <div className="flex items-start gap-2 mt-4">
      <input
        type="checkbox"
        checked={bankConfirmed}
        onChange={(e) => setBankConfirmed(e.target.checked)}
        className="mt-1 accent-orange-500"
      />
      <p className="text-xs text-gray-600">
        I confirm that the bank details entered above are correct and belong to me
      </p>
    </div>

    {/* ✅ VERIFY BUTTON */}
    <button
      disabled={!isBankFormValid}
      onClick={async () => {
  if (!bank || !account || !confirmAccount || !ifsc) {
    setBankError("All fields are required");
    return;
  }

  if (account !== confirmAccount) {
    setBankError("Account numbers do not match");
    return;
  }

  if (ifsc.length !== 11) {
    setBankError("Invalid IFSC code");
    return;
  }

  try {
    await submitBankDetails({
      bank_account_number: account,
      ifsc_code: ifsc,
      account_holder_name: `${firstName} ${lastName}`, // ✅ important
    });

    console.log("Bank details saved ✅");

    setBankError("");
    setStep(6); // 👉 move to selfie

  } catch (err) {
    console.error("Bank API error ❌", err);
    setBankError("Failed to save bank details");
  }
}}
      className={`mt-6 w-full py-3 rounded-xl font-semibold transition ${
        isBankFormValid
          ? "bg-orange-500 text-white"
          : "bg-gray-200 text-gray-400 cursor-not-allowed"
      }`}
    >
      Verify
    </button>
  </>
)}

       {/* STEP 6 – SELFIE */}
        {step === 6 && (
        <div className="flex flex-col h-full">
         {/* ===== CONTENT ===== */}
       <div className="flex-1">
      {/* ===== INTRO ===== */}
      {selfieStage === "intro" && (
        <>
          <h2 className="text-lg font-semibold mb-1">
            Let’s click a selfie
          </h2>
          <p className="text-sm text-gray-500 mb-6">
            See how to take a good photo
          </p>

          <div className="flex justify-center mb-6">
            <div className="w-40 h-40 bg-gray-200 rounded-full" />
          </div>

          <button
            onClick={async () => {
              setSelfieStage("camera");
              const stream = await navigator.mediaDevices.getUserMedia({
                video: true,
              });
              videoRef.current.srcObject = stream;
            }}
            className="w-full bg-orange-500 text-white py-3 rounded-xl font-semibold"
          >
            Open Camera
          </button>
        </>
      )}

      {/* ===== CAMERA ===== */}
      {selfieStage === "camera" && (
        <>
        <h2 className="text-lg font-semibold mb-4">
        Stay still and capture now
        </h2>

        <p className="text-xs text-gray-500 text-center mb-4">
        Remove spectacles, hat & mask. Keep your face inside the circle.
        </p>

          <div className="flex justify-center mb-6">
            <video
              ref={videoRef}
              autoPlay
              playsInline
              className="w-64 h-64 rounded-full border-4 border-green-500 object-cover"
            />
          </div>

          <button
        onClick={() => {
            const canvas = canvasRef.current;
            const video = videoRef.current;

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
            setSelfieStage("preview");
            }, "image/jpeg");

            // stop camera AFTER capture
            video.srcObject?.getTracks().forEach((t) => t.stop());
        }}
        className="mx-auto w-16 h-16 rounded-full bg-blue-600 flex items-center justify-center"
        >
        📷
        </button>

          <canvas ref={canvasRef} className="hidden" />
        </>
      )}

      {/* ===== PREVIEW ===== */}
      {selfieStage === "preview" && (
        <>
          <h2 className="text-lg font-semibold mb-4">
            Let’s click a selfie
          </h2>

          <div className="flex justify-center mb-4">
            <img
              src={URL.createObjectURL(selfieFile)}
              alt="Selfie preview"
              className="w-40 h-40 rounded-full object-cover"
            />
          </div>

          <button
        onClick={async () => {
            setSelfieStage("camera");

            const stream = await navigator.mediaDevices.getUserMedia({
            video: true,
            });

            if (videoRef.current) {
            videoRef.current.srcObject = stream;
            }
        }}
        className="text-orange-500 text-sm mb-6"
        >
        Click again?
        </button>

        </>
      )}
    </div>

    {/* ===== FIXED BOTTOM BUTTON ===== */}
    {selfieStage === "preview" && (
      <div className="pb-4">
        <button
         onClick={async () => {
  if (!selfieFile) {
    alert("Please capture selfie");
    return;
  }

  try {
    // ✅ CALL SELFIE API
    await uploadSelfie({
      file: selfieFile,
    });

    console.log("Selfie uploaded ✅");

    // ✅ SAVE LOCAL DATA
    localStorage.setItem(
      "personal_details",
      JSON.stringify({
        firstName,
        lastName,
        gender,
        referral,
        aadhaar_last4: aadhaar.slice(-4),
        pan,
        bank,
        account,
        ifsc,
      })
    );

    // ✅ UPDATE PROGRESS
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

    // ✅ NEXT PAGE
    navigate("/order-partner-kit", { replace: true });

  } catch (err) {
    console.error("Selfie API error ❌", err);
    alert("Failed to upload selfie");
  }
}}
         className="w-full py-3 rounded-xl font-semibold bg-orange-500 text-white"
        >
          Continue
        </button>
      </div>
    )}
  </div>
)}

      </div>

      {/* ================= AADHAAR VERIFIED POPUP ================= */}
{showAadhaarPopup && (
  <div className="fixed inset-0 z-50 flex items-end justify-center bg-black/40">
    {/* Confetti */}
    <Confetti
      numberOfPieces={180}
      recycle={false}
      gravity={0.25}
    />

    {/* Popup Card */}
    <div className="w-full max-w-md bg-gradient-to-b from-green-50 to-white rounded-t-3xl p-6 animate-slideUp">
      {/* Success Icon */}
      <div className="flex justify-center mb-4">
        <div className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center">
          <span className="text-green-600 text-3xl">✔</span>
        </div>
      </div>

      <h3 className="text-center text-lg font-semibold mb-4">
        Aadhaar details verified
      </h3>

      {/* Verified Details */}
      <div className="bg-gray-50 rounded-xl p-4 space-y-2 text-sm">
        <div className="flex justify-between">
          <span className="text-gray-500">Name</span>
          <span className="font-medium">
            {firstName} {lastName}
          </span>
        </div>

        <div className="flex justify-between">
          <span className="text-gray-500">Aadhaar</span>
          <span className="font-medium">
            **** **** {aadhaar.slice(-4)}
          </span>
        </div>

        <div className="flex justify-between">
          <span className="text-gray-500">Status</span>
          <span className="text-green-600 font-semibold">
            Verified
          </span>
        </div>
      </div>

      <button
        onClick={() => {
          setShowAadhaarPopup(false);
          setStep(4);
        }}
        className="mt-6 w-full py-3 rounded-xl font-semibold bg-orange-500 text-white"
      >
        Next
      </button>
    </div>
  </div>
)}

{/* ================= PAN VERIFIED POPUP ================= */}
{showPanPopup && (
  <div className="fixed inset-0 z-50 flex items-end justify-center bg-black/40">
    <Confetti
      numberOfPieces={180}
      recycle={false}
      gravity={0.25}
    />

    <div className="w-full max-w-md bg-gradient-to-b from-green-50 to-white rounded-t-3xl p-6 animate-slideUp">
      <div className="flex justify-center mb-4">
        <div className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center">
          <span className="text-green-600 text-3xl">✔</span>
        </div>
      </div>

      <h3 className="text-center text-lg font-semibold mb-4">
        PAN details verified
      </h3>

      <div className="bg-gray-50 rounded-xl p-4 space-y-2 text-sm">
        <div className="flex justify-between">
          <span className="text-gray-500">Name</span>
          <span className="font-medium">
            {firstName} {lastName}
          </span>
        </div>

        <div className="flex justify-between">
          <span className="text-gray-500">PAN</span>
          <span className="font-medium">
            {pan.slice(0, 4)}******{pan.slice(-4)}
          </span>
        </div>

        <div className="flex justify-between">
          <span className="text-gray-500">Status</span>
          <span className="text-green-600 font-semibold">
            Verified
          </span>
        </div>
      </div>

      <button
        onClick={() => {
          setShowPanPopup(false);
          setPanStage("verified");
          setStep(5); // move to BANK
        }}
        className="mt-6 w-full py-3 rounded-xl font-semibold bg-orange-500 text-white"
      >
        Next
      </button>
    </div>
  </div>
)}

    </div>
  );
}

/* ---------- UI HELPERS ---------- */

function Input({ label, value, setValue, maxLength }) {
  return (
    <div className="mb-4">
      <label className="text-sm text-gray-600">{label}</label>
      <input
        value={value}
        maxLength={maxLength}
        onChange={(e) => setValue(e.target.value)}
        className="w-full border rounded-xl px-4 py-3 mt-1 focus:ring-2 focus:ring-orange-500 outline-none"
      />
    </div>
  );
}

function Radio({ label, active, onClick }) {
  return (
    <div onClick={onClick} className="flex items-center gap-2 cursor-pointer">
      <div
        className={`w-4 h-4 rounded-full border ${
          active ? "bg-orange-500 border-orange-500" : "border-gray-400"
        }`}
      />
      <span>{label}</span>

      
    </div>
  );
}
