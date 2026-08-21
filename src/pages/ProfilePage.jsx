// src/pages/ProfilePage.jsx
import React, { useEffect, useState, useContext, useRef } from "react";
import { useNavigate } from "react-router-dom";
import {
  ArrowLeft,
  IdCard,
  Bike,
  ShieldCheck,
  User,
  Mail,
  Phone,
  CalendarDays,
  CreditCard,
  Landmark,
  Languages,
  Bell,
  Bug,
  Headphones,
  Star,
  ChevronDown,
  CheckCircle2,
  Clock3,
  Pencil,
  Save,
  Send,
  MessageCircle,
  X,
  Upload,
} from "lucide-react";

import { LanguageContext } from "../context/LanguageContext";
import { NotificationContext } from "../context/NotificationContext";
import { API_BASE_URL } from "../Services/api";
import { reportBug, updateProfile } from "../Services/profile";
import { getMyProfileDp } from "../Services/profileDp";
import { requestToEdit, saveProfileEdit } from "../Services/profileEdit";
import { sendMessage, getSupportChatList } from "../Services/chat";

/**
 * ProfilePage for Delivery Partner
 *
 * UI preserved.
 * Merchant App color palette applied:
 *
 * Primary       #ff6b00
 * Secondary     #ff7a00
 * Highlight     #ff8a00
 * Light Orange  #fff0e4 / #fff8ed
 * Border        #ffe0c7
 * Background    #fffaf5 / #fff5ea
 */

const PRIMARY_ORANGE = "#ff6b00";
const SECONDARY_ORANGE = "#ff7a00";
const HIGHLIGHT_ORANGE = "#ff8a00";

const DOC_FIELDS = [
  {
    key: "adhaar_card",
    numberKey: "adhaarCardNumber",
    label: "Aadhaar Card",
    icon: IdCard,
  },
  {
    key: "pan_card",
    numberKey: "panCardNumber",
    label: "PAN Card",
    icon: IdCard,
  },
  {
    key: "driving_license",
    numberKey: null,
    label: "Driving Licence",
    icon: ShieldCheck,
  },
  {
    key: "vehicle_licence",
    numberKey: null,
    label: "Vehicle Licence",
    icon: Bike,
  },
];

const fileUrl = (path) => (path ? `${API_BASE_URL}${path}` : null);

export default function ProfilePage() {
  const navigate = useNavigate();

  const { t } = useContext(LanguageContext || { t: (s) => s });
  const { addNotification } = useContext(
    NotificationContext || { addNotification: () => {} }
  );

  const [loadingProfile, setLoadingProfile] = useState(true);
  const [savingEdit, setSavingEdit] = useState(false);
  const [requestingEdit, setRequestingEdit] = useState(false);

  const [bugText, setBugText] = useState("");
  const [showBugModal, setShowBugModal] = useState(false);

  const [showSupport, setShowSupport] = useState(false);
  const [sendingMessage, setSendingMessage] = useState(false);
  const [loadingSupportChat, setLoadingSupportChat] = useState(false);
  const [supportMessage, setSupportMessage] = useState("");
  const [supportMessages, setSupportMessages] = useState([]);

  const [profile, setProfile] = useState({
    firstName: "",
    lastName: "",
    email: "",
    mobile: "",
    dob: "",
    gender: "",

    vehicleType: "",
    vehicleNumber: "",
    bankAccountNumber: "",
    ifscCode: "",
    accountHolderName: "",
    adhaarCardNumber: "",
    panCardNumber: "",
    preferredLanguage: "en",

    notifications: {
      all: true,
      orders: true,
      promos: false,
      system: true,
    },

    documents: {
      adhaar_card: null,
      pan_card: null,
      driving_license: null,
      vehicle_licence: null,
      selfie: null,
    },

    isVerified: false,
    conditionalKey: "request_edit",
    chatRoomId: null,
  });

  const [editFiles, setEditFiles] = useState({});
  const [docPreviews, setDocPreviews] = useState({});
  const fileInputsRef = useRef({});

  const [faqOpen, setFaqOpen] = useState({});

  const isEditable = profile.conditionalKey === "edit";

  /* ---------------- FETCH PROFILE ---------------- */

  const fetchProfile = async () => {
    try {
      const res = await getMyProfileDp();

      console.log("Profile API ✅", res);

      const data = res?.data || {};
      const nameParts = (data.full_name || "").split(" ");

      setProfile((prev) => ({
        ...prev,

        firstName: nameParts[0] || "",
        lastName: nameParts.slice(1).join(" ") || "",
        email: data.email || "",
        mobile: data.mobile || "",
        dob: data.dob || "",
        gender: data.gender || "",

        vehicleType: data.vehicle_type || "",
        vehicleNumber: data.vehicle_number || "",
        bankAccountNumber: data.bank_account_number || "",
        ifscCode: data.ifsc_code || "",
        accountHolderName: data.account_holder_name || "",
        adhaarCardNumber: data.adhaar_card_number || "",
        panCardNumber: data.pan_card_number || "",
        preferredLanguage: data.preferred_language || "en",

        notifications: {
          all: data.notification_permission ?? true,
          orders: prev.notifications.orders,
          promos: prev.notifications.promos,
          system: prev.notifications.system,
        },

        documents: {
          adhaar_card: data.adhaar_card || null,
          pan_card: data.pan_card || null,
          driving_license: data.driving_license || null,
          vehicle_licence: data.vehicle_licence || null,
          selfie: data.selfie || null,
        },

        isVerified: !!data.is_verified,
        conditionalKey: data.conditional_key || "request_edit",
        chatRoomId: data.chat_room_id || null,
      }));

      setEditFiles({});
      setDocPreviews({});
    } catch (err) {
      console.error("Profile API error ❌", err);
      addNotification?.("Failed to load profile");
    } finally {
      setLoadingProfile(false);
    }
  };

  useEffect(() => {
    fetchProfile();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  /* ---------------- FIELD HELPERS ---------------- */

  const setField = (key, value) => {
    if (!isEditable) return;

    setProfile((p) => ({
      ...p,
      [key]: value,
    }));
  };

  const toggleNotification = (key) => {
    setProfile((p) => ({
      ...p,
      notifications: {
        ...p.notifications,
        [key]: !p.notifications[key],
      },
    }));
  };

  /* ---------------- DOCUMENT UPLOAD ---------------- */

  const handleDocFileChange = (e, key) => {
    const file = e.target.files && e.target.files[0];

    if (!file) return;

    const maxBytes = 5 * 1024 * 1024;

    if (file.size > maxBytes) {
      addNotification?.("File too large. Please upload < 5MB.");
      return;
    }

    setEditFiles((prev) => ({
      ...prev,
      [key]: file,
    }));

    setDocPreviews((prev) => ({
      ...prev,
      [key]: URL.createObjectURL(file),
    }));
  };

  const docDisplayUrl = (key) =>
    docPreviews[key] || fileUrl(profile.documents[key]);

  /* ---------------- REQUEST EDIT ---------------- */

  const handleRequestEdit = async () => {
    if (requestingEdit) return;

    setRequestingEdit(true);

    try {
      await requestToEdit();

      addNotification?.("Edit request sent ✅");

      setProfile((p) => ({
        ...p,
        conditionalKey: "request_sent",
      }));
    } catch (err) {
      console.error("Request edit error ❌", err);
      addNotification?.("Failed to send edit request");
    } finally {
      setRequestingEdit(false);
    }
  };

  /* ---------------- SAVE PROFILE ---------------- */

  const handleSaveEdit = async () => {
    if (savingEdit) return;

    setSavingEdit(true);

    const getCoords = () =>
      new Promise((resolve) => {
        if (!navigator.geolocation) return resolve({});

        navigator.geolocation.getCurrentPosition(
          (pos) =>
            resolve({
              latitude: pos.coords.latitude,
              longitude: pos.coords.longitude,
            }),
          () => resolve({}),
          { timeout: 3000 }
        );
      });

    try {
      const coords = await getCoords();

      const fields = {
        first_name: profile.firstName,
        last_name: profile.lastName,
        email: profile.email,
        dob: profile.dob,
        gender: profile.gender,

        adhaar_card: editFiles.adhaar_card || null,
        adhaar_card_number: profile.adhaarCardNumber,

        pan_card: editFiles.pan_card || null,
        pan_card_number: profile.panCardNumber,

        selfie: editFiles.selfie || null,

        bank_account_number: profile.bankAccountNumber,
        ifsc_code: profile.ifscCode,
        account_holder_name: profile.accountHolderName,

        latitude: coords.latitude ?? null,
        longitude: coords.longitude ?? null,

        vehicle_number: profile.vehicleNumber,
        vehicle_licence: editFiles.vehicle_licence || null,
        driving_license: editFiles.driving_license || null,

        preferred_language: profile.preferredLanguage,
      };

      await saveProfileEdit(fields);

      addNotification?.("Profile updated successfully ✅");

      await fetchProfile();
    } catch (err) {
      console.error("Save profile edit error ❌", err);
      addNotification?.("Failed to update profile");
    } finally {
      setSavingEdit(false);
    }
  };

  /* ---------------- NOTIFICATIONS ---------------- */

  const handleSaveNotifications = async () => {
    try {
      await updateProfile({
        notification_permission:
          profile.notifications?.all ?? true,
      });

      addNotification?.("Notification settings saved ✅");
    } catch (err) {
      console.error("Save notifications error ❌", err);
      addNotification?.("Failed to save notification settings");
    }
  };

  /* ---------------- SUPPORT ---------------- */

  const openSupportModal = async () => {
    setShowSupport(true);
    setLoadingSupportChat(true);

    try {
      const res = await getSupportChatList();

      setSupportMessages(res?.data?.data || []);
    } catch (err) {
      console.error("Support chat list error ❌", err);
      addNotification?.("Failed to load messages");
    } finally {
      setLoadingSupportChat(false);
    }
  };

  const handleSendSupportMessage = async () => {
    if (!supportMessage.trim() || !profile.chatRoomId) return;

    setSendingMessage(true);

    try {
      const res = await sendMessage({
        chatRoomId: profile.chatRoomId,
        message: supportMessage,
      });

      console.log("Support message sent ✅", res);

      setSupportMessages((prev) => [
        ...prev,
        {
          message: supportMessage,
          identity: "self",
        },
      ]);

      setSupportMessage("");

      addNotification?.("Message sent");
    } catch (err) {
      console.error("Support message error ❌", err);
      addNotification?.("Failed to send message");
    } finally {
      setSendingMessage(false);
    }
  };

  /* ---------------- BUG REPORT ---------------- */

  const handleReportBug = async () => {
    if (!bugText.trim()) {
      addNotification?.("Please enter bug details");
      return;
    }

    try {
      await reportBug({
        report: bugText,
      });

      addNotification?.("Bug reported successfully ✅");

      setBugText("");
      setShowBugModal(false);
    } catch (err) {
      console.error("Bug API error ❌", err);
      addNotification?.("Failed to report bug");
    }
  };

  const faqs = [
    {
      q: "How do I get verified?",
      a: "Complete onboarding and upload your documents. Admin will review and verify your account.",
    },
    {
      q: "How do payouts work?",
      a: "Pending balance shows what admin owes you. Withdraw requests are handled by admin.",
    },
    {
      q: "How do I edit my profile once verified?",
      a: "Tap Request Edit. Once admin approves, your fields and documents will unlock for editing.",
    },
  ];

  /* ---------------- LOADING ---------------- */

  if (loadingProfile) {
    return (
      <div
        className="min-h-screen flex items-center justify-center px-4"
        style={{
          background:
            "linear-gradient(135deg, #fffaf5 0%, #fff5ea 45%, #fffaf6 100%)",
        }}
      >
        <div className="bg-white rounded-2xl shadow-xl px-8 py-7 text-center border border-[#ffe0c7]">
          <div
            className="mx-auto mb-4 h-12 w-12 rounded-full border-4 border-[#fff0e4] border-t-[#ff6b00] animate-spin"
          />

          <p className="font-semibold text-gray-700">
            Loading profile...
          </p>

          <p className="text-xs text-gray-400 mt-1">
            Please wait a moment
          </p>
        </div>
      </div>
    );
  }

  /* ---------------- UI HELPERS ---------------- */

  const fieldClasses = (extra = "") =>
    `w-full px-3.5 py-3 border rounded-xl text-sm outline-none transition-all duration-200 ${
      isEditable
        ? "bg-white border-[#d0d5dd] text-gray-800 focus:border-[#ff7a00] focus:ring-4 focus:ring-[#fff0e4]"
        : "bg-gray-50 border-gray-100 text-gray-500"
    } ${extra}`;

  const sectionTitle = (icon, title, subtitle) => (
    <div className="flex items-start gap-3">
      <div
        className="w-10 h-10 rounded-xl flex items-center justify-center shrink-0"
        style={{
          background: "#fff0e4",
          color: PRIMARY_ORANGE,
        }}
      >
        {icon}
      </div>

      <div>
        <h2 className="text-lg font-bold text-gray-900">
          {title}
        </h2>

        {subtitle && (
          <p className="text-xs text-gray-400 mt-0.5">
            {subtitle}
          </p>
        )}
      </div>
    </div>
  );

  const inputLabel = (icon, label) => (
    <label className="flex items-center gap-1.5 text-xs font-medium text-gray-500 mb-1.5">
      {icon}
      {label}
    </label>
  );

  return (
    <div
      className="min-h-screen text-gray-900"
      style={{
        background:
          "linear-gradient(135deg, #fffaf5 0%, #fff5ea 45%, #fffaf6 100%)",
      }}
    >
      {/* ================= HEADER ================= */}

      <header
        className="sticky top-0 z-40 text-white shadow-lg"
        style={{
          background:
            "linear-gradient(135deg, #ff6b00 0%, #ff7a00 45%, #ffae00 100%)",
        }}
      >
        <div className="max-w-5xl mx-auto px-4 sm:px-6 py-3.5 flex items-center justify-between">
          <button
            onClick={() => navigate(-1)}
            className="w-10 h-10 rounded-xl bg-white/15 hover:bg-white/25 flex items-center justify-center transition"
          >
            <ArrowLeft size={20} />
          </button>

          <div className="text-center">
            <h1 className="text-lg sm:text-xl font-bold">
              Profile
            </h1>

            <p className="text-[11px] text-orange-100">
              Manage your delivery partner account
            </p>
          </div>

          <div className="w-10 h-10 rounded-xl bg-white/15 flex items-center justify-center">
            <User size={19} />
          </div>
        </div>
      </header>

      <main className="max-w-5xl mx-auto px-4 sm:px-6 py-6 sm:py-8 space-y-5">
        {/* ================= PROFILE SUMMARY ================= */}

        <div className="relative overflow-hidden bg-white rounded-3xl shadow-sm border border-[#ffe0c7] p-5 sm:p-6">
          <div
            className="absolute -right-12 -top-12 w-40 h-40 rounded-full"
            style={{ background: "rgba(255, 107, 0, 0.08)" }}
          />

          <div
            className="absolute -right-6 -bottom-16 w-32 h-32 rounded-full"
            style={{ background: "#fffaf5" }}
          />

          <div className="relative flex flex-col sm:flex-row sm:items-center gap-5">
            <div className="relative shrink-0">
              <div
                className="w-20 h-20 sm:w-24 sm:h-24 rounded-3xl flex items-center justify-center text-white shadow-lg"
                style={{
                  background:
                    "linear-gradient(135deg, #ff6b00 0%, #ff7a00 45%, #ffae00 100%)",
                  boxShadow:
                    "0 12px 30px rgba(255, 107, 0, 0.22)",
                }}
              >
                <User size={38} />
              </div>

              <div
                className={`absolute -right-1 -bottom-1 w-7 h-7 rounded-full border-4 border-white flex items-center justify-center ${
                  profile.isVerified
                    ? "bg-green-500"
                    : "bg-gray-400"
                }`}
              >
                {profile.isVerified ? (
                  <CheckCircle2 size={14} className="text-white" />
                ) : (
                  <Clock3 size={13} className="text-white" />
                )}
              </div>
            </div>

            <div className="flex-1 min-w-0">
              <div className="flex flex-wrap items-center gap-2">
                <h2 className="text-xl sm:text-2xl font-bold text-gray-900 truncate">
                  {profile.firstName || "Delivery"}{" "}
                  {profile.lastName || "Partner"}
                </h2>

                <span
                  className={`inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-[11px] font-semibold ${
                    profile.isVerified
                      ? "bg-green-50 text-green-700 border border-green-100"
                      : "bg-gray-100 text-gray-600 border border-gray-200"
                  }`}
                >
                  {profile.isVerified && (
                    <CheckCircle2 size={12} />
                  )}

                  {profile.isVerified
                    ? "Verified"
                    : "Not Verified"}
                </span>
              </div>

              <div className="flex flex-wrap gap-x-4 gap-y-2 mt-2 text-xs text-gray-500">
                {profile.email && (
                  <span className="flex items-center gap-1.5">
                    <Mail size={13} />
                    {profile.email}
                  </span>
                )}

                {profile.mobile && (
                  <span className="flex items-center gap-1.5">
                    <Phone size={13} />
                    {profile.mobile}
                  </span>
                )}
              </div>

              {isEditable && (
                <div
                  className="mt-3 inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full text-xs font-semibold"
                  style={{
                    background: "#fff0e4",
                    border: "1px solid #ffe0c7",
                    color: PRIMARY_ORANGE,
                  }}
                >
                  <Pencil size={12} />
                  Editing mode enabled
                </div>
              )}
            </div>

            <div className="relative shrink-0">
              {profile.conditionalKey === "request_edit" && (
                <button
                  onClick={handleRequestEdit}
                  disabled={requestingEdit}
                  className="w-full sm:w-auto inline-flex items-center justify-center gap-2 px-4 py-2.5 rounded-xl text-white text-sm font-semibold transition disabled:opacity-60"
                  style={{
                    background:
                      "linear-gradient(135deg, #ff6b00, #ff8a00)",
                    boxShadow:
                      "0 10px 22px rgba(255, 107, 0, 0.22)",
                  }}
                >
                  <Pencil size={15} />

                  {requestingEdit
                    ? "Requesting..."
                    : "Request Edit"}
                </button>
              )}

              {profile.conditionalKey === "request_sent" && (
                <div className="inline-flex items-center gap-2 px-4 py-2.5 rounded-xl bg-gray-100 text-gray-500 text-sm font-semibold border border-gray-200">
                  <Clock3 size={15} />
                  Sent Request
                </div>
              )}

              {profile.conditionalKey === "edit" && (
                <div
                  className="inline-flex items-center gap-2 px-4 py-2.5 rounded-xl text-xs font-semibold"
                  style={{
                    background: "#fff0e4",
                    color: PRIMARY_ORANGE,
                    border: "1px solid #ffe0c7",
                  }}
                >
                  <Pencil size={14} />
                  You can edit your details
                </div>
              )}
            </div>
          </div>
        </div>

        {/* ================= PERSONAL INFORMATION ================= */}

        <section className="bg-white rounded-3xl shadow-sm border border-gray-100 overflow-hidden">
          <div className="p-5 sm:p-6 border-b border-gray-100">
            {sectionTitle(
              <User size={19} />,
              "Personal Information",
              "Your basic account and personal details"
            )}
          </div>

          <div className="p-5 sm:p-6">
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                {inputLabel(null, "First name")}

                <input
                  className={fieldClasses()}
                  value={profile.firstName}
                  disabled={!isEditable}
                  onChange={(e) =>
                    setField("firstName", e.target.value)
                  }
                  placeholder="First name"
                />
              </div>

              <div>
                {inputLabel(null, "Last name")}

                <input
                  className={fieldClasses()}
                  value={profile.lastName}
                  disabled={!isEditable}
                  onChange={(e) =>
                    setField("lastName", e.target.value)
                  }
                  placeholder="Last name"
                />
              </div>

              <div>
                {inputLabel(
                  <Mail size={12} />,
                  "Email"
                )}

                <input
                  type="email"
                  className={fieldClasses()}
                  value={profile.email}
                  disabled={!isEditable}
                  onChange={(e) =>
                    setField("email", e.target.value)
                  }
                  placeholder="Email address"
                />
              </div>

              <div>
                {inputLabel(
                  <Phone size={12} />,
                  "Phone"
                )}

                <input
                  className={fieldClasses()}
                  value={profile.mobile}
                  readOnly
                  disabled
                  placeholder="Phone"
                />
              </div>

              <div>
                {inputLabel(
                  <CalendarDays size={12} />,
                  "Date of birth"
                )}

                <input
                  type="date"
                  className={fieldClasses()}
                  value={profile.dob || ""}
                  disabled={!isEditable}
                  onChange={(e) =>
                    setField("dob", e.target.value)
                  }
                />
              </div>

              <div>
                {inputLabel(null, "Gender")}

                <select
                  className={fieldClasses()}
                  value={profile.gender || ""}
                  disabled={!isEditable}
                  onChange={(e) =>
                    setField("gender", e.target.value)
                  }
                >
                  <option value="">Select gender</option>
                  <option value="male">Male</option>
                  <option value="female">Female</option>
                  <option value="other">Other</option>
                </select>
              </div>
            </div>
          </div>
        </section>

        {/* ================= VEHICLE & BANK ================= */}

        <section className="bg-white rounded-3xl shadow-sm border border-gray-100 overflow-hidden">
          <div className="p-5 sm:p-6 border-b border-gray-100">
            {sectionTitle(
              <Bike size={19} />,
              "Vehicle & Bank Details",
              "Manage your vehicle and payout information"
            )}
          </div>

          <div className="p-5 sm:p-6 space-y-6">
            <div>
              <div className="flex items-center gap-2 mb-4">
                <div
                  className="w-7 h-7 rounded-lg flex items-center justify-center"
                  style={{
                    background: "#fff0e4",
                    color: PRIMARY_ORANGE,
                  }}
                >
                  <Bike size={15} />
                </div>

                <h3 className="text-sm font-bold text-gray-800">
                  Vehicle Information
                </h3>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  {inputLabel(null, "Vehicle type")}

                  <input
                    className={fieldClasses()}
                    value={profile.vehicleType || ""}
                    readOnly
                    disabled
                    placeholder="Vehicle type"
                  />
                </div>

                <div>
                  {inputLabel(null, "Vehicle number")}

                  <input
                    className={fieldClasses()}
                    value={profile.vehicleNumber || ""}
                    disabled={!isEditable}
                    onChange={(e) =>
                      setField(
                        "vehicleNumber",
                        e.target.value.toUpperCase()
                      )
                    }
                    placeholder="Vehicle number"
                  />
                </div>
              </div>
            </div>

            <div className="h-px bg-gray-100" />

            <div>
              <div className="flex items-center gap-2 mb-4">
                <div
                  className="w-7 h-7 rounded-lg flex items-center justify-center"
                  style={{
                    background: "#fff0e4",
                    color: PRIMARY_ORANGE,
                  }}
                >
                  <IdCard size={15} />
                </div>

                <h3 className="text-sm font-bold text-gray-800">
                  Identity Information
                </h3>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  {inputLabel(null, "Aadhaar number")}

                  <input
                    className={fieldClasses()}
                    value={profile.adhaarCardNumber || ""}
                    disabled={!isEditable}
                    onChange={(e) =>
                      setField(
                        "adhaarCardNumber",
                        e.target.value
                      )
                    }
                    placeholder="Aadhaar number"
                  />
                </div>

                <div>
                  {inputLabel(null, "PAN number")}

                  <input
                    className={fieldClasses()}
                    value={profile.panCardNumber || ""}
                    disabled={!isEditable}
                    onChange={(e) =>
                      setField(
                        "panCardNumber",
                        e.target.value.toUpperCase()
                      )
                    }
                    placeholder="PAN number"
                  />
                </div>
              </div>
            </div>

            <div className="h-px bg-gray-100" />

            <div>
              <div className="flex items-center gap-2 mb-4">
                <div
                  className="w-7 h-7 rounded-lg flex items-center justify-center"
                  style={{
                    background: "#fff0e4",
                    color: PRIMARY_ORANGE,
                  }}
                >
                  <Landmark size={15} />
                </div>

                <h3 className="text-sm font-bold text-gray-800">
                  Bank Information
                </h3>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  {inputLabel(
                    <CreditCard size={12} />,
                    "Bank account number"
                  )}

                  <input
                    className={fieldClasses()}
                    value={
                      profile.bankAccountNumber || ""
                    }
                    disabled={!isEditable}
                    onChange={(e) =>
                      setField(
                        "bankAccountNumber",
                        e.target.value
                      )
                    }
                    placeholder="Bank account number"
                  />
                </div>

                <div>
                  {inputLabel(
                    <Landmark size={12} />,
                    "IFSC code"
                  )}

                  <input
                    className={fieldClasses()}
                    value={profile.ifscCode || ""}
                    disabled={!isEditable}
                    onChange={(e) =>
                      setField(
                        "ifscCode",
                        e.target.value.toUpperCase()
                      )
                    }
                    placeholder="IFSC code"
                  />
                </div>

                <div className="sm:col-span-2">
                  {inputLabel(
                    <User size={12} />,
                    "Account holder name"
                  )}

                  <input
                    className={fieldClasses()}
                    value={
                      profile.accountHolderName || ""
                    }
                    disabled={!isEditable}
                    onChange={(e) =>
                      setField(
                        "accountHolderName",
                        e.target.value
                      )
                    }
                    placeholder="Account holder name"
                  />
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* ================= DOCUMENTS ================= */}

        <section className="bg-white rounded-3xl shadow-sm border border-gray-100 overflow-hidden">
          <div className="p-5 sm:p-6 border-b border-gray-100 flex flex-col sm:flex-row sm:items-center justify-between gap-3">
            {sectionTitle(
              <IdCard size={19} />,
              "Documents",
              isEditable
                ? "Tap a document to replace it"
                : "Your submitted documents"
            )}

            <div className="flex items-center gap-2 text-xs text-gray-400">
              <ShieldCheck
                size={14}
                style={{ color: PRIMARY_ORANGE }}
              />
              Secure documents
            </div>
          </div>

          <div className="p-5 sm:p-6">
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 sm:gap-4">
              {DOC_FIELDS.map(
                ({ key, label, icon: Icon }) => {
                  const url = docDisplayUrl(key);

                  return (
                    <div
                      key={key}
                      className="group"
                    >
                      <div
                        className="relative aspect-[1.25/1] sm:aspect-square rounded-2xl overflow-hidden border bg-gradient-to-br from-[#fff0e4] to-white shadow-sm group-hover:shadow-md transition-all"
                        style={{
                          borderColor: "#ffe0c7",
                        }}
                      >
                        {url ? (
                          <img
                            src={url}
                            alt={label}
                            className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                          />
                        ) : (
                          <div className="absolute inset-0 flex flex-col items-center justify-center text-[#ff6b00]/40">
                            <div
                              className="w-11 h-11 rounded-xl flex items-center justify-center mb-2"
                              style={{
                                background: "#fff0e4",
                              }}
                            >
                              <Icon size={21} />
                            </div>

                            <span className="text-[10px] text-gray-400">
                              Not uploaded
                            </span>
                          </div>
                        )}

                        {url && (
                          <div className="absolute top-2 right-2 w-6 h-6 rounded-full bg-white/90 shadow flex items-center justify-center">
                            <CheckCircle2
                              size={15}
                              className="text-green-500"
                            />
                          </div>
                        )}

                        {isEditable && (
                          <label
                            htmlFor={`doc-${key}`}
                            className="absolute inset-x-0 bottom-0 bg-black/65 backdrop-blur-sm text-white text-[11px] text-center py-2 cursor-pointer opacity-95 sm:opacity-0 group-hover:opacity-100 transition"
                          >
                            <span className="inline-flex items-center gap-1">
                              <Upload size={12} />
                              Change document
                            </span>

                            <input
                              id={`doc-${key}`}
                              ref={(el) =>
                                (fileInputsRef.current[key] =
                                  el)
                              }
                              type="file"
                              accept="image/*,.pdf"
                              className="hidden"
                              onChange={(e) =>
                                handleDocFileChange(
                                  e,
                                  key
                                )
                              }
                            />
                          </label>
                        )}
                      </div>

                      <div className="mt-2 flex items-center gap-1.5">
                        <Icon
                          size={13}
                          style={{
                            color: PRIMARY_ORANGE,
                          }}
                          className="shrink-0"
                        />

                        <span className="text-[11px] sm:text-xs font-medium text-gray-600 truncate">
                          {label}
                        </span>
                      </div>
                    </div>
                  );
                }
              )}
            </div>
          </div>
        </section>

        {/* ================= SAVE PROFILE ================= */}

        <section className="bg-white rounded-3xl shadow-sm border border-gray-100 p-5 sm:p-6">
          <button
            onClick={handleSaveEdit}
            disabled={!isEditable || savingEdit}
            className={`w-full py-3.5 rounded-xl font-bold text-sm flex items-center justify-center gap-2 transition-all ${
              isEditable && !savingEdit
                ? "text-white hover:shadow-xl active:scale-[0.99]"
                : "bg-gray-100 text-gray-400 cursor-not-allowed"
            }`}
            style={
              isEditable && !savingEdit
                ? {
                    background:
                      "linear-gradient(135deg, #ff6b00, #ff8a00)",
                    boxShadow:
                      "0 10px 22px rgba(255, 107, 0, 0.22)",
                  }
                : undefined
            }
          >
            {savingEdit ? (
              <>
                <div className="w-4 h-4 rounded-full border-2 border-white/40 border-t-white animate-spin" />
                Saving...
              </>
            ) : (
              <>
                <Save size={17} />

                {isEditable
                  ? "Save Profile"
                  : "Save Profile — Request Edit Access First"}
              </>
            )}
          </button>

          {!isEditable && (
            <p className="text-center text-[11px] text-gray-400 mt-2">
              Your profile is currently locked.
              Request edit access to make changes.
            </p>
          )}
        </section>

        {/* ================= SETTINGS ================= */}

        <section className="bg-white rounded-3xl shadow-sm border border-gray-100 overflow-hidden">
          <div className="p-5 sm:p-6 border-b border-gray-100">
            {sectionTitle(
              <Bell size={19} />,
              "Settings",
              "Manage your preferences and notifications"
            )}
          </div>

          <div className="p-5 sm:p-6">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
              {/* LANGUAGE */}

              <div
                className="rounded-2xl p-4"
                style={{
                  background: "rgba(255, 107, 0, 0.05)",
                  border: "1px solid #ffe0c7",
                }}
              >
                <div className="flex items-center gap-3 mb-4">
                  <div
                    className="w-9 h-9 rounded-xl bg-white flex items-center justify-center shadow-sm"
                    style={{ color: PRIMARY_ORANGE }}
                  >
                    <Languages size={17} />
                  </div>

                  <div>
                    <h3 className="text-sm font-bold">
                      Preferred language
                    </h3>

                    <p className="text-[11px] text-gray-400">
                      Choose your app language
                    </p>
                  </div>
                </div>

                <select
                  className={fieldClasses()}
                  value={profile.preferredLanguage}
                  disabled={!isEditable}
                  onChange={(e) =>
                    setField(
                      "preferredLanguage",
                      e.target.value
                    )
                  }
                >
                  <option value="en">English</option>
                  <option value="hi">Hindi</option>
                  <option value="es">Spanish</option>
                </select>

                {!isEditable && (
                  <div className="text-[11px] text-gray-400 mt-2 flex items-center gap-1">
                    <Clock3 size={11} />
                    Request edit access to change language.
                  </div>
                )}
              </div>

              {/* NOTIFICATIONS */}

              <div className="rounded-2xl border border-gray-100 p-4">
                <div className="flex items-center gap-3 mb-4">
                  <div
                    className="w-9 h-9 rounded-xl flex items-center justify-center"
                    style={{
                      background: "#fff0e4",
                      color: PRIMARY_ORANGE,
                    }}
                  >
                    <Bell size={17} />
                  </div>

                  <div>
                    <h3 className="text-sm font-bold">
                      Notifications
                    </h3>

                    <p className="text-[11px] text-gray-400">
                      Control what you receive
                    </p>
                  </div>
                </div>

                <div className="space-y-3">
                  {[
                    {
                      key: "all",
                      label: "All Notifications",
                    },
                    {
                      key: "orders",
                      label: "Order Updates",
                    },
                    {
                      key: "promos",
                      label: "Promotions",
                    },
                    {
                      key: "system",
                      label: "System Messages",
                    },
                  ].map((item) => {
                    const enabled =
                      profile.notifications?.[
                        item.key
                      ];

                    return (
                      <div
                        key={item.key}
                        className="flex items-center justify-between"
                      >
                        <span className="text-sm text-gray-700">
                          {item.label}
                        </span>

                        <button
                          type="button"
                          onClick={() =>
                            toggleNotification(
                              item.key
                            )
                          }
                          aria-label={`Toggle ${item.label}`}
                          className={`relative w-11 h-6 rounded-full transition-all duration-200 ${
                            enabled
                              ? "bg-[#ff6b00]"
                              : "bg-gray-200"
                          }`}
                        >
                          <span
                            className={`absolute top-0.5 left-0.5 w-5 h-5 rounded-full bg-white shadow-sm transition-transform duration-200 ${
                              enabled
                                ? "translate-x-5"
                                : "translate-x-0"
                            }`}
                          />
                        </button>
                      </div>
                    );
                  })}
                </div>
              </div>
            </div>

            <button
              onClick={handleSaveNotifications}
              className="mt-5 w-full py-3 rounded-xl font-semibold text-sm transition"
              style={{
                background: "#fff0e4",
                color: PRIMARY_ORANGE,
                border: "1px solid #ffe0c7",
              }}
            >
              Save Notification Settings
            </button>
          </div>
        </section>

        {/* ================= SUPPORT ================= */}

        <section className="bg-white rounded-3xl shadow-sm border border-gray-100 overflow-hidden">
          <div className="p-5 sm:p-6 border-b border-gray-100">
            {sectionTitle(
              <Headphones size={19} />,
              "Support & Feedback",
              "We're here when you need us"
            )}
          </div>

          <div className="p-5 sm:p-6">
            <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
              {/* BUG */}

              <button
                onClick={() => setShowBugModal(true)}
                className="group text-left p-4 rounded-2xl bg-red-50 border border-red-100 hover:border-red-200 hover:shadow-md transition"
              >
                <div className="w-10 h-10 rounded-xl bg-white text-red-500 flex items-center justify-center shadow-sm mb-3">
                  <Bug size={18} />
                </div>

                <div className="font-bold text-sm text-gray-800">
                  Report a bug
                </div>

                <div className="text-xs text-gray-500 mt-1">
                  Tell us what went wrong
                </div>

                <div className="mt-3 text-xs font-semibold text-red-500 flex items-center gap-1">
                  Report issue
                  <ArrowLeft
                    size={12}
                    className="rotate-180"
                  />
                </div>
              </button>

              {/* SUPPORT */}

              <button
                onClick={openSupportModal}
                className="group text-left p-4 rounded-2xl hover:shadow-md transition"
                style={{
                  background: "rgba(255, 107, 0, 0.05)",
                  border: "1px solid #ffe0c7",
                }}
              >
                <div
                  className="w-10 h-10 rounded-xl bg-white flex items-center justify-center shadow-sm mb-3"
                  style={{ color: PRIMARY_ORANGE }}
                >
                  <MessageCircle size={18} />
                </div>

                <div className="font-bold text-sm text-gray-800">
                  Contact support
                </div>

                <div className="text-xs text-gray-500 mt-1">
                  Call or message support
                </div>

                <div
                  className="mt-3 text-xs font-semibold flex items-center gap-1"
                  style={{ color: PRIMARY_ORANGE }}
                >
                  Contact us
                  <ArrowLeft
                    size={12}
                    className="rotate-180"
                  />
                </div>
              </button>

              {/* RATE */}

              <button
                onClick={() =>
                  window.open(
                    "https://play.google.com/store",
                    "_blank"
                  )
                }
                className="group text-left p-4 rounded-2xl bg-green-50 border border-green-100 hover:border-green-200 hover:shadow-md transition"
              >
                <div className="w-10 h-10 rounded-xl bg-white text-green-600 flex items-center justify-center shadow-sm mb-3">
                  <Star size={18} />
                </div>

                <div className="font-bold text-sm text-gray-800">
                  Rate us / Feedback
                </div>

                <div className="text-xs text-gray-500 mt-1">
                  Share your experience
                </div>

                <div className="mt-3 text-xs font-semibold text-green-600 flex items-center gap-1">
                  Rate app
                  <ArrowLeft
                    size={12}
                    className="rotate-180"
                  />
                </div>
              </button>
            </div>

            {/* FAQ */}

            <div className="mt-7">
              <div className="flex items-center gap-2 mb-3">
                <div
                  className="w-8 h-8 rounded-lg flex items-center justify-center"
                  style={{
                    background: "#fff0e4",
                    color: PRIMARY_ORANGE,
                  }}
                >
                  <MessageCircle size={15} />
                </div>

                <div>
                  <h3 className="font-bold text-sm">
                    Frequently Asked Questions
                  </h3>

                  <p className="text-[11px] text-gray-400">
                    Quick answers to common questions
                  </p>
                </div>
              </div>

              <div className="space-y-2">
                {faqs.map((f, i) => {
                  const open = faqOpen[i];

                  return (
                    <div
                      key={i}
                      className={`border rounded-2xl overflow-hidden transition ${
                        open
                          ? "bg-[#fffaf5]"
                          : "border-gray-100 bg-white"
                      }`}
                      style={
                        open
                          ? {
                              borderColor: "#ffe0c7",
                            }
                          : undefined
                      }
                    >
                      <button
                        onClick={() =>
                          setFaqOpen((s) => ({
                            ...s,
                            [i]: !s[i],
                          }))
                        }
                        className="w-full px-4 py-3.5 text-left flex justify-between items-center gap-3"
                      >
                        <span className="text-sm font-semibold text-gray-700">
                          {f.q}
                        </span>

                        <span
                          className="w-7 h-7 rounded-lg flex items-center justify-center shrink-0 transition"
                          style={{
                            background: open
                              ? "#fff0e4"
                              : "#f9fafb",
                            color: open
                              ? PRIMARY_ORANGE
                              : "#98a2b3",
                          }}
                        >
                          <ChevronDown
                            size={16}
                            className={`transition-transform ${
                              open
                                ? "rotate-180"
                                : ""
                            }`}
                          />
                        </span>
                      </button>

                      {open && (
                        <div className="px-4 pb-4 text-sm text-gray-500 leading-relaxed">
                          {f.a}
                        </div>
                      )}
                    </div>
                  );
                })}
              </div>
            </div>
          </div>
        </section>
      </main>

      {/* ================= SUPPORT MODAL ================= */}

      {showSupport && (
        <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-3xl w-full max-w-xl max-h-[90vh] overflow-hidden shadow-2xl">
            <div
              className="text-white p-5 flex items-center justify-between"
              style={{
                background:
                  "linear-gradient(135deg, #ff6b00, #ff8a00)",
              }}
            >
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-xl bg-white/15 flex items-center justify-center">
                  <Headphones size={19} />
                </div>

                <div>
                  <h3 className="font-bold">
                    Contact Support
                  </h3>

                  <p className="text-[11px] text-orange-100">
                    We're happy to help
                  </p>
                </div>
              </div>

              <button
                onClick={() => setShowSupport(false)}
                className="w-9 h-9 rounded-xl bg-white/10 hover:bg-white/20 flex items-center justify-center transition"
              >
                <X size={18} />
              </button>
            </div>

            <div className="p-5 overflow-y-auto max-h-[calc(90vh-80px)]">
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-2 mb-5">
                <div
                  className="p-3 rounded-xl"
                  style={{
                    background: "#fff0e4",
                    border: "1px solid #ffe0c7",
                  }}
                >
                  <div className="text-[10px] text-gray-400">
                    Phone
                  </div>

                  <a
                    className="text-xs font-semibold"
                    style={{ color: PRIMARY_ORANGE }}
                    href="tel:+911234567890"
                  >
                    +91 12345 67890
                  </a>
                </div>

                <div
                  className="p-3 rounded-xl"
                  style={{
                    background: "#fff0e4",
                    border: "1px solid #ffe0c7",
                  }}
                >
                  <div className="text-[10px] text-gray-400">
                    Email
                  </div>

                  <a
                    className="text-xs font-semibold break-all"
                    style={{ color: PRIMARY_ORANGE }}
                    href="mailto:zatpatt@example.com"
                  >
                    zatpatt@example.com
                  </a>
                </div>

                <div
                  className="p-3 rounded-xl"
                  style={{
                    background: "#fff0e4",
                    border: "1px solid #ffe0c7",
                  }}
                >
                  <div className="text-[10px] text-gray-400">
                    Working hours
                  </div>

                  <div className="text-xs font-semibold text-gray-700">
                    Mon - Sat
                  </div>

                  <div className="text-[10px] text-gray-400">
                    9 AM - 8 PM
                  </div>
                </div>
              </div>

              <div className="flex items-center gap-2 mb-2">
                <MessageCircle
                  size={16}
                  style={{ color: PRIMARY_ORANGE }}
                />

                <span className="font-bold text-sm">
                  Send a message
                </span>
              </div>

              {loadingSupportChat && (
                <div className="flex items-center gap-2 text-xs text-gray-400 mb-3">
                  <div
                    className="w-3.5 h-3.5 border-2 rounded-full animate-spin"
                    style={{
                      borderColor: "#ffe0c7",
                      borderTopColor: PRIMARY_ORANGE,
                    }}
                  />

                  Loading messages...
                </div>
              )}

              {!loadingSupportChat &&
                supportMessages.length > 0 && (
                  <div className="max-h-48 overflow-y-auto space-y-2 mb-3 bg-gray-50 rounded-2xl p-3 border border-gray-100">
                    {supportMessages.map((m, i) => (
                      <div
                        key={i}
                        className={`flex ${
                          m.identity === "self"
                            ? "justify-end"
                            : "justify-start"
                        }`}
                      >
                        <div
                          className={`text-xs px-3 py-2 rounded-2xl max-w-[80%] ${
                            m.identity === "self"
                              ? "text-white rounded-br-md"
                              : "bg-white text-gray-700 border border-gray-100 rounded-bl-md shadow-sm"
                          }`}
                          style={
                            m.identity === "self"
                              ? {
                                  background:
                                    "linear-gradient(135deg, #ff6b00, #ff8a00)",
                                }
                              : undefined
                          }
                        >
                          {m.message}
                        </div>
                      </div>
                    ))}
                  </div>
                )}

              {!profile.chatRoomId && (
                <div className="p-3 rounded-xl bg-gray-50 border border-gray-100 text-xs text-gray-400 mb-3">
                  Chat unavailable right now.
                </div>
              )}

              <textarea
                value={supportMessage}
                onChange={(e) =>
                  setSupportMessage(e.target.value)
                }
                placeholder="Type your message..."
                className="w-full border border-gray-200 focus:border-[#ff7a00] focus:ring-4 focus:ring-[#fff0e4] outline-none rounded-2xl p-3.5 h-24 text-sm resize-none transition"
              />

              <button
                onClick={handleSendSupportMessage}
                disabled={
                  sendingMessage ||
                  !supportMessage.trim() ||
                  !profile.chatRoomId
                }
                className={`mt-3 w-full py-3 rounded-xl font-semibold text-sm flex items-center justify-center gap-2 transition ${
                  sendingMessage ||
                  !supportMessage.trim() ||
                  !profile.chatRoomId
                    ? "bg-gray-100 text-gray-400 cursor-not-allowed"
                    : "text-white shadow-md"
                }`}
                style={
                  !sendingMessage &&
                  supportMessage.trim() &&
                  profile.chatRoomId
                    ? {
                        background:
                          "linear-gradient(135deg, #ff6b00, #ff8a00)",
                        boxShadow:
                          "0 10px 22px rgba(255, 107, 0, 0.18)",
                      }
                    : undefined
                }
              >
                {sendingMessage ? (
                  <>
                    <div className="w-4 h-4 border-2 border-white/40 border-t-white rounded-full animate-spin" />
                    Sending...
                  </>
                ) : (
                  <>
                    <Send size={15} />
                    Send Message
                  </>
                )}
              </button>

              <button
                onClick={() => setShowSupport(false)}
                className="mt-2 w-full py-3 rounded-xl bg-gray-100 hover:bg-gray-200 text-gray-600 font-semibold text-sm transition"
              >
                Close
              </button>
            </div>
          </div>
        </div>
      )}

      {/* ================= BUG MODAL ================= */}

      {showBugModal && (
        <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-3xl p-5 sm:p-6 w-full max-w-md shadow-2xl">
            <div className="flex items-center justify-between mb-5">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-xl bg-red-50 text-red-500 flex items-center justify-center">
                  <Bug size={19} />
                </div>

                <div>
                  <h3 className="font-bold text-lg">
                    Report a Bug
                  </h3>

                  <p className="text-[11px] text-gray-400">
                    Help us improve your experience
                  </p>
                </div>
              </div>

              <button
                onClick={() => setShowBugModal(false)}
                className="w-8 h-8 rounded-lg bg-gray-100 text-gray-500 flex items-center justify-center hover:bg-gray-200"
              >
                <X size={16} />
              </button>
            </div>

            <textarea
              value={bugText}
              onChange={(e) =>
                setBugText(e.target.value)
              }
              placeholder="Describe the issue..."
              className="w-full border border-gray-200 focus:border-[#ff7a00] focus:ring-4 focus:ring-[#fff0e4] outline-none rounded-2xl p-3.5 h-32 text-sm resize-none transition"
            />

            <div className="flex flex-col-reverse sm:flex-row justify-end gap-2 mt-4">
              <button
                onClick={() => setShowBugModal(false)}
                className="px-5 py-2.5 bg-gray-100 hover:bg-gray-200 text-gray-600 rounded-xl font-semibold text-sm transition"
              >
                Cancel
              </button>

              <button
                onClick={handleReportBug}
                className="px-5 py-2.5 text-white rounded-xl font-semibold text-sm shadow-md transition flex items-center justify-center gap-2"
                style={{
                  background:
                    "linear-gradient(135deg, #ff6b00, #ff8a00)",
                  boxShadow:
                    "0 10px 22px rgba(255, 107, 0, 0.20)",
                }}
              >
                <Send size={14} />
                Submit Report
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}