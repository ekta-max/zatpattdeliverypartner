// src/pages/ProfilePage.jsx

import React, { useEffect, useState, useContext } from "react";
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

/* =========================================================
   ZATPATT THEME
========================================================= */

const BRAND_ORANGE = "#FF6600";
const BRAND_ORANGE_LIGHT = "#FF7A00";
const BRAND_YELLOW = "#FFA800";

const BRAND_GRADIENT =
  "linear-gradient(90deg, #FF6200 0%, #FF7A00 55%, #FFA800 100%)";

const HERO_GRADIENT =
  "linear-gradient(145deg, #FF6600 0%, #FF7A00 48%, #FFA800 100%)";

const PAGE_BG = "#F8F0E6";
const CARD_BG = "#FFFFFF";

const TEXT_DARK = "#17110D";
const TEXT_MUTED = "#765F50";

const BORDER = "#E9DED3";

const SOFT_ORANGE = "#FFF2E8";
const SOFT_ORANGE_2 = "#FFF7F0";

/* =========================================================
   DOCUMENT FIELDS
========================================================= */

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

/* =========================================================
   FILE URL
========================================================= */

const fileUrl = (path) => {
  if (!path) return null;

  if (
    path.startsWith("http://") ||
    path.startsWith("https://")
  ) {
    return path;
  }

  return `${API_BASE_URL}${path}`;
};

/* =========================================================
   COMPONENT
========================================================= */

export default function ProfilePage() {
  const navigate = useNavigate();

  const { t } = useContext(
    LanguageContext || {
      t: (s) => s,
    }
  );

  const { addNotification } = useContext(
    NotificationContext || {
      addNotification: () => {},
    }
  );

  /* =========================================================
     STATES
  ========================================================= */

  const [loadingProfile, setLoadingProfile] =
    useState(true);

  const [savingEdit, setSavingEdit] =
    useState(false);

  const [requestingEdit, setRequestingEdit] =
    useState(false);

  const [bugText, setBugText] = useState("");

  const [showBugModal, setShowBugModal] =
    useState(false);

  const [showSupport, setShowSupport] =
    useState(false);

  const [sendingMessage, setSendingMessage] =
    useState(false);

  const [loadingSupportChat, setLoadingSupportChat] =
    useState(false);

  const [supportMessage, setSupportMessage] =
    useState("");

  const [supportMessages, setSupportMessages] =
    useState([]);

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

  const [faqOpen, setFaqOpen] = useState({});

  const isEditable =
    profile.conditionalKey === "edit";

  /* =========================================================
     FETCH PROFILE
  ========================================================= */

  const fetchProfile = async () => {
    try {
      const res = await getMyProfileDp();

      const data = res?.data || {};

      const nameParts = (data.full_name || "")
        .trim()
        .split(/\s+/);

      /*
       IMPORTANT:
       API returns:

       vehicle_type: {
         value: "electric_bike",
         label: "Electric bike"
       }

       We display the label.
      */

      const vehicleTypeLabel =
        typeof data.vehicle_type === "object"
          ? data.vehicle_type?.label || ""
          : data.vehicle_type || "";

      setProfile((prev) => ({
        ...prev,

        firstName: nameParts[0] || "",

        lastName:
          nameParts.slice(1).join(" ") || "",

        email: data.email || "",

        mobile: data.mobile || "",

        dob: data.dob || "",

        gender: data.gender || "",

        /*
         FIXED VEHICLE TYPE
        */
        vehicleType: vehicleTypeLabel,

        vehicleNumber:
          data.vehicle_number || "",

        bankAccountNumber:
          data.bank_account_number || "",

        ifscCode:
          data.ifsc_code || "",

        accountHolderName:
          data.account_holder_name || "",

        adhaarCardNumber:
          data.adhaar_card_number || "",

        panCardNumber:
          data.pan_card_number || "",

        preferredLanguage:
          data.preferred_language || "en",

        notifications: {
          all:
            data.notification_permission ??
            true,

          orders:
            prev.notifications.orders,

          promos:
            prev.notifications.promos,

          system:
            prev.notifications.system,
        },

        documents: {
          adhaar_card:
            data.adhaar_card || null,

          pan_card:
            data.pan_card || null,

          driving_license:
            data.driving_license || null,

          vehicle_licence:
            data.vehicle_licence || null,

          selfie:
            data.selfie || null,
        },

        isVerified:
          !!data.is_verified,

        conditionalKey:
          data.conditional_key ||
          "request_edit",

        chatRoomId:
          data.chat_room_id || null,
      }));

      setEditFiles({});

      setDocPreviews({});
    } catch (err) {
      console.error(
        "Profile API error ❌",
        err
      );

      addNotification?.(
        "Failed to load profile"
      );
    } finally {
      setLoadingProfile(false);
    }
  };

  useEffect(() => {
    fetchProfile();

    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  /* =========================================================
     FIELD HELPERS
  ========================================================= */

  const setField = (key, value) => {
    if (!isEditable) return;

    setProfile((prev) => ({
      ...prev,
      [key]: value,
    }));
  };

  const toggleNotification = (key) => {
    setProfile((prev) => ({
      ...prev,

      notifications: {
        ...prev.notifications,

        [key]:
          !prev.notifications[key],
      },
    }));
  };

  /* =========================================================
     DOCUMENT UPLOAD
  ========================================================= */

  const handleDocFileChange = (e, key) => {
    const file =
      e.target.files &&
      e.target.files[0];

    if (!file) return;

    const maxBytes = 5 * 1024 * 1024;

    if (file.size > maxBytes) {
      addNotification?.(
        "File too large. Please upload < 5MB."
      );

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
    docPreviews[key] ||
    fileUrl(profile.documents[key]);

  /* =========================================================
     REQUEST EDIT
  ========================================================= */

  const handleRequestEdit = async () => {
    if (requestingEdit) return;

    setRequestingEdit(true);

    try {
      await requestToEdit();

      addNotification?.(
        "Edit request sent ✅"
      );

      setProfile((prev) => ({
        ...prev,

        conditionalKey:
          "request_sent",
      }));
    } catch (err) {
      console.error(
        "Request edit error ❌",
        err
      );

      addNotification?.(
        "Failed to send edit request"
      );
    } finally {
      setRequestingEdit(false);
    }
  };

  /* =========================================================
     SAVE PROFILE
  ========================================================= */

  const handleSaveEdit = async () => {
    if (savingEdit) return;

    setSavingEdit(true);

    const getCoords = () =>
      new Promise((resolve) => {
        if (!navigator.geolocation) {
          return resolve({});
        }

        navigator.geolocation.getCurrentPosition(
          (pos) =>
            resolve({
              latitude:
                pos.coords.latitude,

              longitude:
                pos.coords.longitude,
            }),

          () => resolve({}),

          {
            timeout: 3000,
          }
        );
      });

    try {
      const coords =
        await getCoords();

      const fields = {
        first_name:
          profile.firstName,

        last_name:
          profile.lastName,

        email:
          profile.email,

        dob:
          profile.dob,

        gender:
          profile.gender,

        adhaar_card:
          editFiles.adhaar_card ||
          null,

        adhaar_card_number:
          profile.adhaarCardNumber,

        pan_card:
          editFiles.pan_card ||
          null,

        pan_card_number:
          profile.panCardNumber,

        selfie:
          editFiles.selfie ||
          null,

        bank_account_number:
          profile.bankAccountNumber,

        ifsc_code:
          profile.ifscCode,

        account_holder_name:
          profile.accountHolderName,

        latitude:
          coords.latitude ??
          null,

        longitude:
          coords.longitude ??
          null,

        vehicle_number:
          profile.vehicleNumber,

        vehicle_licence:
          editFiles.vehicle_licence ||
          null,

        driving_license:
          editFiles.driving_license ||
          null,

        preferred_language:
          profile.preferredLanguage,
      };

      await saveProfileEdit(fields);

      addNotification?.(
        "Profile updated successfully ✅"
      );

      await fetchProfile();
    } catch (err) {
      console.error(
        "Save profile edit error ❌",
        err
      );

      addNotification?.(
        "Failed to update profile"
      );
    } finally {
      setSavingEdit(false);
    }
  };

  /* =========================================================
     NOTIFICATIONS
  ========================================================= */

  const handleSaveNotifications =
    async () => {
      try {
        await updateProfile({
          notification_permission:
            profile.notifications?.all ??
            true,
        });

        addNotification?.(
          "Notification settings saved ✅"
        );
      } catch (err) {
        console.error(
          "Save notifications error ❌",
          err
        );

        addNotification?.(
          "Failed to save notification settings"
        );
      }
    };

  /* =========================================================
     SUPPORT
  ========================================================= */

  const openSupportModal =
    async () => {
      setShowSupport(true);

      setLoadingSupportChat(true);

      try {
        const res =
          await getSupportChatList();

        setSupportMessages(
          res?.data?.data || []
        );
      } catch (err) {
        console.error(
          "Support chat list error ❌",
          err
        );

        addNotification?.(
          "Failed to load messages"
        );
      } finally {
        setLoadingSupportChat(false);
      }
    };

  const handleSendSupportMessage =
    async () => {
      if (
        !supportMessage.trim() ||
        !profile.chatRoomId
      ) {
        return;
      }

      setSendingMessage(true);

      try {
        await sendMessage({
          chatRoomId:
            profile.chatRoomId,

          message:
            supportMessage,
        });

        setSupportMessages(
          (prev) => [
            ...prev,

            {
              message:
                supportMessage,

              identity: "self",
            },
          ]
        );

        setSupportMessage("");

        addNotification?.(
          "Message sent"
        );
      } catch (err) {
        console.error(
          "Support message error ❌",
          err
        );

        addNotification?.(
          "Failed to send message"
        );
      } finally {
        setSendingMessage(false);
      }
    };

  /* =========================================================
     BUG REPORT
  ========================================================= */

  const handleReportBug = async () => {
    if (!bugText.trim()) {
      addNotification?.(
        "Please enter bug details"
      );

      return;
    }

    try {
      await reportBug({
        report: bugText,
      });

      addNotification?.(
        "Bug reported successfully ✅"
      );

      setBugText("");

      setShowBugModal(false);
    } catch (err) {
      console.error(
        "Bug API error ❌",
        err
      );

      addNotification?.(
        "Failed to report bug"
      );
    }
  };

  /* =========================================================
     FAQ
  ========================================================= */

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

  /* =========================================================
     LOADING STATE
  ========================================================= */

  if (loadingProfile) {
    return (
      <div
        className="min-h-screen w-full flex items-center justify-center p-4"
        style={{
          background: PAGE_BG,
        }}
      >
        <div className="bg-white rounded-[28px] px-8 py-7 text-center border border-[#E9DED3] shadow-[0_15px_45px_rgba(80,40,10,0.08)]">
          <div className="mx-auto mb-4 h-11 w-11 rounded-full border-4 border-[#FFE0C7] border-t-[#FF6600] animate-spin" />

          <p
            className="font-black text-sm"
            style={{
              color: TEXT_DARK,
            }}
          >
            Loading profile...
          </p>

          <p
            className="text-[11px] mt-1"
            style={{
              color: TEXT_MUTED,
            }}
          >
            Please wait a moment
          </p>
        </div>
      </div>
    );
  }

  /* =========================================================
     UI HELPERS
  ========================================================= */

  const fieldClasses = (
    extra = ""
  ) =>
    `
      w-full
      min-w-0
      px-3.5
      sm:px-4
      py-3
      border
      rounded-2xl
      text-xs
      sm:text-sm
      font-semibold
      outline-none
      transition-all
      duration-200
      ${
        isEditable
          ? "bg-white border-[#E9DED3] text-[#17110D] focus:border-[#FF6600] focus:ring-4 focus:ring-[#FFE7D3]"
          : "bg-[#FAF7F3] border-[#E9DED3] text-[#765F50]"
      }
      ${extra}
    `;

  const sectionTitle = (
    icon,
    title,
    subtitle
  ) => (
    <div className="flex items-start gap-3 min-w-0">
      <div
        className="w-10 h-10 rounded-2xl flex items-center justify-center shrink-0"
        style={{
          background:
            SOFT_ORANGE,
          color:
            BRAND_ORANGE,
          border:
            "1px solid #FFD7B8",
        }}
      >
        {icon}
      </div>

      <div className="min-w-0">
        <h2
          className="text-base sm:text-lg font-black leading-tight"
          style={{
            color: TEXT_DARK,
          }}
        >
          {title}
        </h2>

        {subtitle && (
          <p
            className="text-[11px] mt-1 leading-relaxed"
            style={{
              color: TEXT_MUTED,
            }}
          >
            {subtitle}
          </p>
        )}
      </div>
    </div>
  );

  const inputLabel = (
    icon,
    label
  ) => (
    <label
      className="flex items-center gap-1.5 text-[11px] font-black mb-1.5"
      style={{
        color: TEXT_DARK,
      }}
    >
      {icon}

      {label}
    </label>
  );

  /* =========================================================
     MAIN UI
  ========================================================= */

  return (
    <div
      className="min-h-screen overflow-x-hidden"
      style={{
        background: PAGE_BG,
        color: TEXT_DARK,
      }}
    >
      {/* =====================================================
          HEADER
      ===================================================== */}

      <header
        className="sticky top-0 z-40 text-white shadow-md"
        style={{
          background:
            HERO_GRADIENT,
        }}
      >
        <div className="max-w-5xl mx-auto px-3 sm:px-6 py-3 flex items-center justify-between gap-3">
          <button
            type="button"
            onClick={() =>
              navigate(-1)
            }
            className="w-9 h-9 sm:w-10 sm:h-10 rounded-xl bg-white/15 hover:bg-white/25 border border-white/25 flex items-center justify-center transition shrink-0"
          >
            <ArrowLeft
              size={18}
            />
          </button>

          <div className="text-center min-w-0">
            <div className="inline-flex items-center gap-2 px-2.5 sm:px-3 py-1 rounded-full bg-white/15 border border-white/30">
              <span className="w-1.5 h-1.5 sm:w-2 sm:h-2 rounded-full bg-white" />

              <span className="text-[8px] sm:text-[9px] font-black tracking-[1.5px] uppercase">
                ZATPATT
              </span>
            </div>

            <h1 className="text-sm sm:text-lg font-black mt-1 truncate">
              Partner Profile
            </h1>
          </div>

          <div className="w-9 h-9 sm:w-10 sm:h-10 rounded-xl bg-white/15 border border-white/25 flex items-center justify-center shrink-0">
            <User
              size={17}
            />
          </div>
        </div>
      </header>

      {/* =====================================================
          MAIN
      ===================================================== */}

      <main className="max-w-5xl mx-auto px-3 sm:px-6 py-4 sm:py-7 space-y-4 sm:space-y-6">

        {/* ===================================================
            PROFILE HERO
        =================================================== */}

        <div
          className="relative overflow-hidden bg-white rounded-[24px] sm:rounded-[32px] border p-4 sm:p-7"
          style={{
            borderColor:
              BORDER,

            boxShadow:
              "0 18px 50px rgba(80,40,10,0.07)",
          }}
        >
          <div className="relative flex flex-col sm:flex-row sm:items-center gap-4 sm:gap-5">

            {/* AVATAR */}

            <div className="relative shrink-0 self-center sm:self-auto">
              <div
                className="w-20 h-20 sm:w-24 sm:h-24 rounded-[24px] sm:rounded-[26px] flex items-center justify-center text-white"
                style={{
                  background:
                    HERO_GRADIENT,

                  boxShadow:
                    "0 12px 28px rgba(255,102,0,0.25)",
                }}
              >
                <User
                  size={36}
                  className="sm:hidden"
                />

                <User
                  size={42}
                  className="hidden sm:block"
                />
              </div>

              <div
                className={`absolute -right-1 -bottom-1 w-7 h-7 rounded-full border-2 border-white flex items-center justify-center ${
                  profile.isVerified
                    ? "bg-green-500"
                    : "bg-[#FF6600]"
                }`}
              >
                {profile.isVerified ? (
                  <CheckCircle2
                    size={15}
                    className="text-white"
                  />
                ) : (
                  <Clock3
                    size={14}
                    className="text-white"
                  />
                )}
              </div>
            </div>

            {/* NAME */}

            <div className="flex-1 min-w-0 text-center sm:text-left">
              <div className="flex flex-wrap items-center justify-center sm:justify-start gap-2">
                <h2
                  className="text-xl sm:text-2xl font-black break-words"
                  style={{
                    color:
                      TEXT_DARK,
                  }}
                >
                  {profile.firstName ||
                    "Delivery"}{" "}
                  {profile.lastName ||
                    "Partner"}
                </h2>

                <span
                  className={`inline-flex items-center gap-1 px-3 py-1 rounded-full text-[10px] font-black uppercase tracking-wider ${
                    profile.isVerified
                      ? "bg-green-50 text-green-700 border border-green-200"
                      : "bg-[#FFF2E8] text-[#FF6600] border border-[#FFD7B8]"
                  }`}
                >
                  {profile.isVerified ? (
                    <>
                      <CheckCircle2
                        size={12}
                      />
                      Verified
                    </>
                  ) : (
                    <>
                      <Clock3
                        size={12}
                      />
                      Under Review
                    </>
                  )}
                </span>
              </div>

              <div className="flex flex-col sm:flex-row flex-wrap items-center sm:items-start justify-center sm:justify-start gap-1.5 sm:gap-x-4 sm:gap-y-1.5 mt-2 text-xs font-semibold text-[#765F50]">
                {profile.email && (
                  <span className="flex items-center gap-1.5 max-w-full break-all">
                    <Mail
                      size={13}
                      className="text-[#FF6600] shrink-0"
                    />

                    {profile.email}
                  </span>
                )}

                {profile.mobile && (
                  <span className="flex items-center gap-1.5">
                    <Phone
                      size={13}
                      className="text-[#FF6600]"
                    />

                    {profile.mobile}
                  </span>
                )}
              </div>

              {isEditable && (
                <div className="mt-3 inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-[11px] font-black bg-[#FFF0E5] border border-[#FFB77D] text-[#FF6600]">
                  <Pencil
                    size={11}
                  />
                  Editing Mode Unlocked
                </div>
              )}
            </div>

            {/* REQUEST EDIT */}

            <div className="relative shrink-0 w-full sm:w-auto">
              {profile.conditionalKey ===
                "request_edit" && (
                <button
                  type="button"
                  onClick={
                    handleRequestEdit
                  }
                  disabled={
                    requestingEdit
                  }
                  className="w-full sm:w-auto inline-flex items-center justify-center gap-2 px-5 py-3 rounded-2xl text-white text-xs sm:text-sm font-black transition active:scale-95 disabled:opacity-60"
                  style={{
                    background:
                      BRAND_GRADIENT,

                    boxShadow:
                      "0 8px 20px rgba(255,102,0,0.22)",
                  }}
                >
                  <Pencil
                    size={14}
                  />

                  {requestingEdit
                    ? "Requesting..."
                    : "Request Edit"}
                </button>
              )}

              {profile.conditionalKey ===
                "request_sent" && (
                <div className="w-full sm:w-auto inline-flex justify-center items-center gap-2 px-4 py-3 rounded-2xl bg-[#FAF7F3] text-[#765F50] text-xs font-black border border-[#E9DED3]">
                  <Clock3
                    size={14}
                    className="text-[#FF6600]"
                  />

                  Request Pending
                </div>
              )}

              {profile.conditionalKey ===
                "edit" && (
                <div className="w-full sm:w-auto inline-flex justify-center items-center gap-1.5 px-4 py-3 rounded-2xl text-xs font-black bg-[#FFF0E5] text-[#FF6600] border border-[#FFD7B8]">
                  <Pencil
                    size={13}
                  />

                  Unlocked for edit
                </div>
              )}
            </div>
          </div>
        </div>

        {/* ===================================================
            PERSONAL INFORMATION
        =================================================== */}

        <section
          className="bg-white rounded-[24px] sm:rounded-[32px] border overflow-hidden"
          style={{
            borderColor:
              BORDER,

            boxShadow:
              "0 18px 50px rgba(80,40,10,0.06)",
          }}
        >
          <div className="p-4 sm:p-6 border-b border-[#E9DED3]">
            {sectionTitle(
              <User size={18} />,
              "Personal Information",
              "Your basic delivery partner account and personal details"
            )}
          </div>

          <div className="p-4 sm:p-6">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">

              <div className="min-w-0">
                {inputLabel(
                  null,
                  "First name"
                )}

                <input
                  className={fieldClasses()}
                  value={
                    profile.firstName
                  }
                  disabled={
                    !isEditable
                  }
                  onChange={(e) =>
                    setField(
                      "firstName",
                      e.target.value
                    )
                  }
                  placeholder="First name"
                />
              </div>

              <div className="min-w-0">
                {inputLabel(
                  null,
                  "Last name"
                )}

                <input
                  className={fieldClasses()}
                  value={
                    profile.lastName
                  }
                  disabled={
                    !isEditable
                  }
                  onChange={(e) =>
                    setField(
                      "lastName",
                      e.target.value
                    )
                  }
                  placeholder="Last name"
                />
              </div>

              <div className="min-w-0">
                {inputLabel(
                  <Mail
                    size={12}
                    className="text-[#FF6600]"
                  />,
                  "Email"
                )}

                <input
                  type="email"
                  className={fieldClasses()}
                  value={
                    profile.email
                  }
                  disabled={
                    !isEditable
                  }
                  onChange={(e) =>
                    setField(
                      "email",
                      e.target.value
                    )
                  }
                  placeholder="Email address"
                />
              </div>

              <div className="min-w-0">
                {inputLabel(
                  <Phone
                    size={12}
                    className="text-[#FF6600]"
                  />,
                  "Phone"
                )}

                <input
                  className={fieldClasses()}
                  value={
                    profile.mobile
                  }
                  readOnly
                  disabled
                  placeholder="Phone"
                />
              </div>

              <div className="min-w-0">
                {inputLabel(
                  <CalendarDays
                    size={12}
                    className="text-[#FF6600]"
                  />,
                  "Date of birth"
                )}

                <input
                  type="date"
                  className={fieldClasses()}
                  value={
                    profile.dob ||
                    ""
                  }
                  disabled={
                    !isEditable
                  }
                  onChange={(e) =>
                    setField(
                      "dob",
                      e.target.value
                    )
                  }
                />
              </div>

              <div className="min-w-0">
                {inputLabel(
                  null,
                  "Gender"
                )}

                <select
                  className={fieldClasses()}
                  value={
                    profile.gender ||
                    ""
                  }
                  disabled={
                    !isEditable
                  }
                  onChange={(e) =>
                    setField(
                      "gender",
                      e.target.value
                    )
                  }
                >
                  <option value="">
                    Select gender
                  </option>

                  <option value="male">
                    Male
                  </option>

                  <option value="female">
                    Female
                  </option>

                  <option value="other">
                    Other
                  </option>
                </select>
              </div>
            </div>
          </div>
        </section>

        {/* ===================================================
            VEHICLE & BANK
        =================================================== */}

        <section
          className="bg-white rounded-[24px] sm:rounded-[32px] border overflow-hidden"
          style={{
            borderColor:
              BORDER,

            boxShadow:
              "0 18px 50px rgba(80,40,10,0.06)",
          }}
        >
          <div className="p-4 sm:p-6 border-b border-[#E9DED3]">
            {sectionTitle(
              <Bike size={18} />,
              "Vehicle & Bank Details",
              "Manage your vehicle and weekly payout bank info"
            )}
          </div>

          <div className="p-4 sm:p-6 space-y-5 sm:space-y-6">

            {/* VEHICLE */}

            <div>
              <div className="flex items-center gap-2 mb-3.5">
                <div
                  className="w-8 h-8 rounded-xl flex items-center justify-center"
                  style={{
                    background:
                      SOFT_ORANGE,
                    color:
                      BRAND_ORANGE,
                  }}
                >
                  <Bike
                    size={15}
                  />
                </div>

                <h3 className="text-xs sm:text-sm font-black">
                  Vehicle Information
                </h3>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">

                <div className="min-w-0">
                  {inputLabel(
                    null,
                    "Vehicle type"
                  )}

                  <input
                    className={fieldClasses()}
                    value={
                      profile.vehicleType ||
                      ""
                    }
                    readOnly
                    disabled
                    placeholder="Vehicle type"
                  />
                </div>

                <div className="min-w-0">
                  {inputLabel(
                    null,
                    "Vehicle number"
                  )}

                  <input
                    className={fieldClasses()}
                    value={
                      profile.vehicleNumber ||
                      ""
                    }
                    disabled={
                      !isEditable
                    }
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

            <div className="h-px bg-[#E9DED3]" />

            {/* IDENTITY */}

            <div>
              <div className="flex items-center gap-2 mb-3.5">
                <div
                  className="w-8 h-8 rounded-xl flex items-center justify-center"
                  style={{
                    background:
                      SOFT_ORANGE,
                    color:
                      BRAND_ORANGE,
                  }}
                >
                  <IdCard
                    size={15}
                  />
                </div>

                <h3 className="text-xs sm:text-sm font-black">
                  Identity Verification Numbers
                </h3>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">

                <div className="min-w-0">
                  {inputLabel(
                    null,
                    "Aadhaar number"
                  )}

                  <input
                    className={fieldClasses()}
                    value={
                      profile.adhaarCardNumber ||
                      ""
                    }
                    disabled={
                      !isEditable
                    }
                    onChange={(e) =>
                      setField(
                        "adhaarCardNumber",
                        e.target.value
                      )
                    }
                    placeholder="Aadhaar number"
                  />
                </div>

                <div className="min-w-0">
                  {inputLabel(
                    null,
                    "PAN number"
                  )}

                  <input
                    className={fieldClasses()}
                    value={
                      profile.panCardNumber ||
                      ""
                    }
                    disabled={
                      !isEditable
                    }
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

            <div className="h-px bg-[#E9DED3]" />

            {/* BANK */}

            <div>
              <div className="flex items-center gap-2 mb-3.5">
                <div
                  className="w-8 h-8 rounded-xl flex items-center justify-center"
                  style={{
                    background:
                      SOFT_ORANGE,
                    color:
                      BRAND_ORANGE,
                  }}
                >
                  <Landmark
                    size={15}
                  />
                </div>

                <h3 className="text-xs sm:text-sm font-black">
                  Bank Payout Account
                </h3>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">

                <div className="min-w-0">
                  {inputLabel(
                    <CreditCard
                      size={12}
                      className="text-[#FF6600]"
                    />,
                    "Bank account number"
                  )}

                  <input
                    className={fieldClasses()}
                    value={
                      profile.bankAccountNumber ||
                      ""
                    }
                    disabled={
                      !isEditable
                    }
                    onChange={(e) =>
                      setField(
                        "bankAccountNumber",
                        e.target.value
                      )
                    }
                    placeholder="Bank account number"
                  />
                </div>

                <div className="min-w-0">
                  {inputLabel(
                    <Landmark
                      size={12}
                      className="text-[#FF6600]"
                    />,
                    "IFSC code"
                  )}

                  <input
                    className={fieldClasses()}
                    value={
                      profile.ifscCode ||
                      ""
                    }
                    disabled={
                      !isEditable
                    }
                    onChange={(e) =>
                      setField(
                        "ifscCode",
                        e.target.value.toUpperCase()
                      )
                    }
                    placeholder="IFSC code"
                  />
                </div>

                <div className="md:col-span-2 min-w-0">
                  {inputLabel(
                    <User
                      size={12}
                      className="text-[#FF6600]"
                    />,
                    "Account holder name"
                  )}

                  <input
                    className={fieldClasses()}
                    value={
                      profile.accountHolderName ||
                      ""
                    }
                    disabled={
                      !isEditable
                    }
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

        {/* ===================================================
            DOCUMENTS
        =================================================== */}

        <section
          className="bg-white rounded-[24px] sm:rounded-[32px] border overflow-hidden"
          style={{
            borderColor:
              BORDER,

            boxShadow:
              "0 18px 50px rgba(80,40,10,0.06)",
          }}
        >
          <div className="p-4 sm:p-6 border-b border-[#E9DED3] flex flex-col lg:flex-row lg:items-center justify-between gap-3">
            {sectionTitle(
              <IdCard size={18} />,
              "Uploaded Documents",
              isEditable
                ? "Tap any document to upload a replacement"
                : "Your verified partner documents"
            )}

            <div className="flex items-center gap-1.5 text-xs font-bold text-[#765F50]">
              <ShieldCheck
                size={14}
                className="text-[#FF6600]"
              />

              Encrypted & Secured
            </div>
          </div>

          <div className="p-4 sm:p-6">
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 sm:gap-4">

              {DOC_FIELDS.map(
                ({
                  key,
                  label,
                  icon: Icon,
                }) => {
                  const url =
                    docDisplayUrl(
                      key
                    );

                  return (
                    <div
                      key={key}
                      className="group min-w-0"
                    >
                      <div className="relative aspect-square rounded-2xl overflow-hidden border border-[#E9DED3] bg-[#FFFDFB] shadow-sm group-hover:shadow-md transition-all">

                        {url ? (
                          <img
                            src={url}
                            alt={label}
                            className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                          />
                        ) : (
                          <div className="absolute inset-0 flex flex-col items-center justify-center bg-[#FFF8F2] p-2 text-center">
                            <div
                              className="w-9 h-9 sm:w-10 sm:h-10 rounded-xl flex items-center justify-center mb-2"
                              style={{
                                background:
                                  "#FFEBDD",
                                color:
                                  BRAND_ORANGE,
                              }}
                            >
                              <Icon
                                size={18}
                              />
                            </div>

                            <span className="text-[9px] sm:text-[10px] font-bold text-[#765F50]">
                              Not uploaded
                            </span>
                          </div>
                        )}

                        {url && (
                          <div className="absolute top-2 right-2 w-6 h-6 rounded-full bg-white shadow flex items-center justify-center">
                            <CheckCircle2
                              size={14}
                              className="text-green-600"
                            />
                          </div>
                        )}

                        {isEditable && (
                          <label
                            htmlFor={`doc-${key}`}
                            className="absolute inset-x-0 bottom-0 bg-black/70 backdrop-blur-sm text-white text-[10px] font-bold text-center py-2 cursor-pointer opacity-95 sm:opacity-0 group-hover:opacity-100 transition"
                          >
                            <span className="inline-flex items-center gap-1">
                              <Upload
                                size={11}
                              />

                              Change
                            </span>

                            <input
                              id={`doc-${key}`}
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

                      <div className="mt-2 flex items-center gap-1.5 min-w-0">
                        <Icon
                          size={13}
                          className="text-[#FF6600] shrink-0"
                        />

                        <span className="text-[10px] sm:text-[11px] font-bold text-[#17110D] truncate">
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

        {/* ===================================================
            SAVE PROFILE
        =================================================== */}

        <section
          className="bg-white rounded-[24px] sm:rounded-[32px] border p-4 sm:p-6"
          style={{
            borderColor:
              BORDER,

            boxShadow:
              "0 18px 50px rgba(80,40,10,0.06)",
          }}
        >
          <button
            type="button"
            onClick={
              handleSaveEdit
            }
            disabled={
              !isEditable ||
              savingEdit
            }
            className={`w-full min-h-[50px] sm:h-[52px] px-4 rounded-2xl font-black text-xs sm:text-sm flex items-center justify-center gap-2 transition-all ${
              isEditable &&
              !savingEdit
                ? "text-white active:scale-[0.99]"
                : "bg-[#EDE5DE] text-[#8B776A] cursor-not-allowed"
            }`}
            style={
              isEditable &&
              !savingEdit
                ? {
                    background:
                      BRAND_GRADIENT,

                    boxShadow:
                      "0 10px 25px rgba(255,102,0,0.23)",
                  }
                : undefined
            }
          >
            {savingEdit ? (
              <>
                <div className="w-4 h-4 rounded-full border-2 border-white/40 border-t-white animate-spin" />

                <span>
                  Saving Profile...
                </span>
              </>
            ) : (
              <>
                <Save
                  size={16}
                />

                <span className="text-center">
                  {isEditable
                    ? "Save Profile Changes"
                    : "Save Profile (Locked — Request Edit Access)"}
                </span>
              </>
            )}
          </button>

          {!isEditable && (
            <p className="text-center text-[11px] text-[#765F50] mt-2 leading-relaxed">
              Your profile is currently locked.
              Tap "Request Edit" above to unlock
              fields.
            </p>
          )}
        </section>

        {/* ===================================================
            SETTINGS
        =================================================== */}

        <section
          className="bg-white rounded-[24px] sm:rounded-[32px] border overflow-hidden"
          style={{
            borderColor:
              BORDER,

            boxShadow:
              "0 18px 50px rgba(80,40,10,0.06)",
          }}
        >
          <div className="p-4 sm:p-6 border-b border-[#E9DED3]">
            {sectionTitle(
              <Bell size={18} />,
              "Settings & Preferences",
              "Manage language and push notification settings"
            )}
          </div>

          <div className="p-4 sm:p-6">
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-4 sm:gap-5">

              {/* LANGUAGE */}

              <div className="rounded-2xl p-4 bg-[#FFF8F2] border border-[#FFE3CF]">
                <div className="flex items-center gap-3 mb-4">
                  <div className="w-9 h-9 rounded-xl bg-white flex items-center justify-center shadow-sm border border-[#FFD7B8] text-[#FF6600] shrink-0">
                    <Languages
                      size={17}
                    />
                  </div>

                  <div className="min-w-0">
                    <h3 className="text-xs sm:text-sm font-black">
                      Preferred Language
                    </h3>

                    <p className="text-[10px] sm:text-[11px] text-[#765F50]">
                      Choose your app language
                    </p>
                  </div>
                </div>

                <select
                  className={fieldClasses()}
                  value={
                    profile.preferredLanguage
                  }
                  disabled={
                    !isEditable
                  }
                  onChange={(e) =>
                    setField(
                      "preferredLanguage",
                      e.target.value
                    )
                  }
                >
                  <option value="en">
                    English
                  </option>

                  <option value="hi">
                    Hindi
                  </option>

                  <option value="es">
                    Spanish
                  </option>
                </select>

                {!isEditable && (
                  <div className="text-[10px] text-[#765F50] mt-2 flex items-start gap-1">
                    <Clock3
                      size={11}
                      className="text-[#FF6600] mt-0.5 shrink-0"
                    />

                    Request edit access to switch
                    language.
                  </div>
                )}
              </div>

              {/* NOTIFICATIONS */}

              <div className="rounded-2xl border border-[#E9DED3] p-4 bg-white">
                <div className="flex items-center gap-3 mb-4">
                  <div className="w-9 h-9 rounded-xl bg-[#FFF2E8] border border-[#FFD7B8] flex items-center justify-center text-[#FF6600] shrink-0">
                    <Bell
                      size={17}
                    />
                  </div>

                  <div>
                    <h3 className="text-xs sm:text-sm font-black">
                      Notifications
                    </h3>

                    <p className="text-[10px] sm:text-[11px] text-[#765F50]">
                      Control alerts and notifications
                    </p>
                  </div>
                </div>

                <div className="space-y-3">
                  {[
                    {
                      key: "all",
                      label:
                        "All Notifications",
                    },

                    {
                      key: "orders",
                      label:
                        "Order Alerts & Updates",
                    },

                    {
                      key: "promos",
                      label:
                        "Surge & Promotions",
                    },

                    {
                      key: "system",
                      label:
                        "System Messages",
                    },
                  ].map(
                    (item) => {
                      const enabled =
                        profile
                          .notifications?.[
                          item.key
                        ];

                      return (
                        <div
                          key={
                            item.key
                          }
                          className="flex items-center justify-between gap-3"
                        >
                          <span className="text-xs sm:text-sm font-bold text-[#17110D]">
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
                            className={`relative w-11 h-6 rounded-full transition-all duration-200 shrink-0 ${
                              enabled
                                ? "bg-[#FF6600]"
                                : "bg-[#DDD5CF]"
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
                    }
                  )}
                </div>
              </div>
            </div>

            <button
              type="button"
              onClick={
                handleSaveNotifications
              }
              className="mt-4 sm:mt-5 w-full min-h-[48px] rounded-2xl font-black text-xs sm:text-sm bg-[#FFF2E8] border border-[#FFD7B8] text-[#FF6600] hover:bg-[#FFE8D7] transition flex items-center justify-center gap-2 px-4"
            >
              <Save
                size={15}
              />

              Save Notification Settings
            </button>
          </div>
        </section>

        {/* ===================================================
            SUPPORT
        =================================================== */}

        <section
          className="bg-white rounded-[24px] sm:rounded-[32px] border overflow-hidden"
          style={{
            borderColor:
              BORDER,

            boxShadow:
              "0 18px 50px rgba(80,40,10,0.06)",
          }}
        >
          <div className="p-4 sm:p-6 border-b border-[#E9DED3]">
            {sectionTitle(
              <Headphones size={18} />,
              "Support & Help Center",
              "We're here 24/7 to assist delivery partners"
            )}
          </div>

          <div className="p-4 sm:p-6">
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">

              {/* BUG */}

              <button
                type="button"
                onClick={() =>
                  setShowBugModal(
                    true
                  )
                }
                className="group text-left p-4 rounded-2xl bg-[#FFF5F3] border border-[#F3D4CE] hover:shadow-md transition"
              >
                <div className="w-10 h-10 rounded-xl bg-white text-red-500 flex items-center justify-center shadow-sm mb-3">
                  <Bug
                    size={18}
                  />
                </div>

                <div className="font-black text-xs sm:text-sm">
                  Report a bug
                </div>

                <div className="text-[11px] text-[#765F50] mt-0.5">
                  Let us know about an app issue
                </div>

                <div className="mt-3 text-xs font-black text-red-500 flex items-center gap-1">
                  Report issue

                  <ArrowLeft
                    size={12}
                    className="rotate-180"
                  />
                </div>
              </button>

              {/* SUPPORT */}

              <button
                type="button"
                onClick={
                  openSupportModal
                }
                className="group text-left p-4 rounded-2xl bg-[#FFF8F2] border border-[#FFE3CF] hover:shadow-md transition"
              >
                <div className="w-10 h-10 rounded-xl bg-white flex items-center justify-center shadow-sm mb-3 text-[#FF6600] border border-[#FFD7B8]">
                  <MessageCircle
                    size={18}
                  />
                </div>

                <div className="font-black text-xs sm:text-sm">
                  Contact Support
                </div>

                <div className="text-[11px] text-[#765F50] mt-0.5">
                  Chat directly with fleet support
                </div>

                <div className="mt-3 text-xs font-black text-[#FF6600] flex items-center gap-1">
                  Open chat

                  <ArrowLeft
                    size={12}
                    className="rotate-180"
                  />
                </div>
              </button>

              {/* RATE */}

              <button
                type="button"
                onClick={() =>
                  window.open(
                    "https://play.google.com/store",
                    "_blank"
                  )
                }
                className="group text-left p-4 rounded-2xl bg-[#F2FAF3] border border-[#D3EAD7] hover:shadow-md transition sm:col-span-2 lg:col-span-1"
              >
                <div className="w-10 h-10 rounded-xl bg-white text-green-600 flex items-center justify-center shadow-sm mb-3">
                  <Star
                    size={18}
                  />
                </div>

                <div className="font-black text-xs sm:text-sm">
                  Rate App / Feedback
                </div>

                <div className="text-[11px] text-[#765F50] mt-0.5">
                  Share your partner experience
                </div>

                <div className="mt-3 text-xs font-black text-green-600 flex items-center gap-1">
                  Rate app

                  <ArrowLeft
                    size={12}
                    className="rotate-180"
                  />
                </div>
              </button>
            </div>

            {/* FAQ */}

            <div className="mt-6 sm:mt-7">
              <div className="flex items-center gap-2 mb-3">
                <div
                  className="w-8 h-8 rounded-xl flex items-center justify-center shrink-0"
                  style={{
                    background:
                      SOFT_ORANGE,

                    color:
                      BRAND_ORANGE,
                  }}
                >
                  <MessageCircle
                    size={15}
                  />
                </div>

                <div>
                  <h3 className="font-black text-xs sm:text-sm">
                    Frequently Asked Questions
                  </h3>

                  <p className="text-[10px] sm:text-[11px] text-[#765F50]">
                    Quick answers to common partner
                    questions
                  </p>
                </div>
              </div>

              <div className="space-y-2">
                {faqs.map(
                  (f, i) => {
                    const open =
                      faqOpen[i];

                    return (
                      <div
                        key={i}
                        className={`border rounded-2xl overflow-hidden transition ${
                          open
                            ? "bg-[#FFF8F2] border-[#FFD7B8]"
                            : "border-[#E9DED3] bg-white"
                        }`}
                      >
                        <button
                          type="button"
                          onClick={() =>
                            setFaqOpen(
                              (prev) => ({
                                ...prev,

                                [i]:
                                  !prev[
                                    i
                                  ],
                              })
                            )
                          }
                          className="w-full px-3.5 sm:px-4 py-3.5 text-left flex justify-between items-center gap-3"
                        >
                          <span className="text-xs sm:text-sm font-black">
                            {f.q}
                          </span>

                          <span
                            className={`w-7 h-7 rounded-lg flex items-center justify-center shrink-0 transition ${
                              open
                                ? "bg-[#FFE8D7] text-[#FF6600]"
                                : "bg-[#F8F3EE] text-[#765F50]"
                            }`}
                          >
                            <ChevronDown
                              size={
                                16
                              }
                              className={`transition-transform duration-200 ${
                                open
                                  ? "rotate-180"
                                  : ""
                              }`}
                            />
                          </span>
                        </button>

                        {open && (
                          <div className="px-3.5 sm:px-4 pb-4 text-xs font-semibold text-[#765F50] leading-relaxed">
                            {f.a}
                          </div>
                        )}
                      </div>
                    );
                  }
                )}
              </div>
            </div>
          </div>
        </section>

        {/* ===================================================
            FOOTER
        =================================================== */}

        <div className="text-center py-1 sm:py-2">
          <div className="inline-flex flex-wrap justify-center items-center gap-2 bg-white px-4 sm:px-5 py-2 rounded-full border border-[#E9DED3] text-[9px] sm:text-[10px] font-bold text-[#765F50] shadow-sm">
            <span>
              ©{" "}
              {new Date().getFullYear()}{" "}
              Zatpatt
            </span>

            <span>•</span>

            <span>
              Delivery Partner Portal
            </span>
          </div>
        </div>
      </main>

      {/* =====================================================
          SUPPORT CHAT MODAL
      ===================================================== */}

      {showSupport && (
        <div className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center z-50 p-3 sm:p-4">
          <div className="bg-white rounded-[24px] sm:rounded-[32px] w-full max-w-xl max-h-[92vh] overflow-hidden shadow-2xl border border-[#E9DED3] flex flex-col">

            <div
              className="text-white p-4 sm:p-5 flex items-center justify-between gap-3 shrink-0"
              style={{
                background:
                  HERO_GRADIENT,
              }}
            >
              <div className="flex items-center gap-3 min-w-0">
                <div className="w-10 h-10 rounded-xl bg-white/15 border border-white/20 flex items-center justify-center shrink-0">
                  <Headphones
                    size={19}
                  />
                </div>

                <div className="min-w-0">
                  <h3 className="font-black text-sm sm:text-base truncate">
                    Contact Fleet Support
                  </h3>

                  <p className="text-[10px] sm:text-[11px] text-white/90">
                    We're happy to help you
                  </p>
                </div>
              </div>

              <button
                type="button"
                onClick={() =>
                  setShowSupport(
                    false
                  )
                }
                className="w-9 h-9 rounded-xl bg-white/15 hover:bg-white/25 flex items-center justify-center transition shrink-0"
              >
                <X
                  size={18}
                />
              </button>
            </div>

            <div className="p-3 sm:p-6 overflow-y-auto max-h-[calc(92vh-80px)] space-y-4">

              <div className="grid grid-cols-1 sm:grid-cols-3 gap-2">

                <div className="p-3 rounded-xl bg-[#FFF8F2] border border-[#FFE3CF]">
                  <div className="text-[10px] font-bold text-[#765F50]">
                    Support Helpline
                  </div>

                  <a
                    className="text-xs font-black text-[#FF6600]"
                    href="tel:+911234567890"
                  >
                    +91 12345 67890
                  </a>
                </div>

                <div className="p-3 rounded-xl bg-[#FFF8F2] border border-[#FFE3CF]">
                  <div className="text-[10px] font-bold text-[#765F50]">
                    Official Email
                  </div>

                  <a
                    className="text-xs font-black text-[#FF6600] break-all"
                    href="mailto:zatpatt@example.com"
                  >
                    support@zatpatt.com
                  </a>
                </div>

                <div className="p-3 rounded-xl bg-[#FFF8F2] border border-[#FFE3CF]">
                  <div className="text-[10px] font-bold text-[#765F50]">
                    Partner Hours
                  </div>

                  <div className="text-xs font-black text-[#17110D]">
                    24 / 7 Available
                  </div>
                </div>
              </div>

              <div className="flex items-center gap-2">
                <MessageCircle
                  size={16}
                  className="text-[#FF6600]"
                />

                <span className="font-black text-xs sm:text-sm">
                  Send a Direct Message
                </span>
              </div>

              {loadingSupportChat && (
                <div className="flex items-center gap-2 text-xs font-bold text-[#765F50]">
                  <div className="w-3.5 h-3.5 border-2 border-[#FFD7B8] border-t-[#FF6600] rounded-full animate-spin" />

                  Loading messages...
                </div>
              )}

              {!loadingSupportChat &&
                supportMessages.length >
                  0 && (
                  <div className="max-h-48 overflow-y-auto space-y-2 bg-[#FAF7F3] rounded-2xl p-3 border border-[#E9DED3]">
                    {supportMessages.map(
                      (m, i) => (
                        <div
                          key={i}
                          className={`flex ${
                            m.identity ===
                            "self"
                              ? "justify-end"
                              : "justify-start"
                          }`}
                        >
                          <div
                            className={`text-xs px-3.5 py-2 rounded-2xl max-w-[80%] font-semibold break-words ${
                              m.identity ===
                              "self"
                                ? "text-white rounded-br-none"
                                : "bg-white text-[#17110D] border border-[#E9DED3] rounded-bl-none shadow-sm"
                            }`}
                            style={
                              m.identity ===
                              "self"
                                ? {
                                    background:
                                      BRAND_GRADIENT,
                                  }
                                : undefined
                            }
                          >
                            {m.message}
                          </div>
                        </div>
                      )
                    )}
                  </div>
                )}

              {!profile.chatRoomId && (
                <div className="p-3 rounded-xl bg-[#FFF8F2] border border-[#FFE3CF] text-xs font-bold text-[#765F50]">
                  Chat room initializing. You can
                  still call or email support.
                </div>
              )}

              <textarea
                value={
                  supportMessage
                }
                onChange={(e) =>
                  setSupportMessage(
                    e.target.value
                  )
                }
                placeholder="Type your message to support..."
                className="w-full border border-[#E9DED3] focus:border-[#FF6600] focus:ring-4 focus:ring-[#FFE7D3] outline-none rounded-2xl p-3.5 h-24 text-xs sm:text-sm font-semibold resize-none transition bg-[#FAF7F3] focus:bg-white"
              />

              <button
                type="button"
                onClick={
                  handleSendSupportMessage
                }
                disabled={
                  sendingMessage ||
                  !supportMessage.trim() ||
                  !profile.chatRoomId
                }
                className="w-full min-h-[48px] rounded-2xl font-black text-xs sm:text-sm text-white flex items-center justify-center gap-2 transition disabled:opacity-50 px-4"
                style={{
                  background:
                    BRAND_GRADIENT,

                  boxShadow:
                    "0 8px 20px rgba(255,102,0,0.22)",
                }}
              >
                {sendingMessage ? (
                  <>
                    <div className="w-4 h-4 border-2 border-white/40 border-t-white rounded-full animate-spin" />

                    <span>
                      Sending...
                    </span>
                  </>
                ) : (
                  <>
                    <Send
                      size={15}
                    />

                    <span>
                      Send Message
                    </span>
                  </>
                )}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* =====================================================
          BUG REPORT MODAL
      ===================================================== */}

      {showBugModal && (
        <div className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center z-50 p-3 sm:p-4">
          <div className="bg-white rounded-[24px] sm:rounded-[32px] p-4 sm:p-6 w-full max-w-md shadow-2xl border border-[#E9DED3]">

            <div className="flex items-center justify-between mb-4 gap-3">

              <div className="flex items-center gap-3 min-w-0">
                <div className="w-10 h-10 rounded-xl bg-red-50 text-red-500 flex items-center justify-center border border-red-200 shrink-0">
                  <Bug
                    size={19}
                  />
                </div>

                <div className="min-w-0">
                  <h3 className="font-black text-base sm:text-lg">
                    Report an Issue
                  </h3>

                  <p className="text-[10px] sm:text-[11px] text-[#765F50]">
                    Help us improve the partner app
                  </p>
                </div>
              </div>

              <button
                type="button"
                onClick={() =>
                  setShowBugModal(
                    false
                  )
                }
                className="w-8 h-8 rounded-lg bg-[#F8F3EE] text-[#765F50] flex items-center justify-center hover:bg-[#EDE5DE] shrink-0"
              >
                <X
                  size={16}
                />
              </button>
            </div>

            <textarea
              value={bugText}
              onChange={(e) =>
                setBugText(
                  e.target.value
                )
              }
              placeholder="Describe what happened..."
              className="w-full border border-[#E9DED3] focus:border-[#FF6600] focus:ring-4 focus:ring-[#FFE7D3] outline-none rounded-2xl p-3.5 h-32 text-xs sm:text-sm font-semibold resize-none transition bg-[#FAF7F3] focus:bg-white"
            />

            <div className="flex flex-col-reverse sm:flex-row justify-end gap-2 mt-4">

              <button
                type="button"
                onClick={() =>
                  setShowBugModal(
                    false
                  )
                }
                className="w-full sm:w-auto px-5 py-2.5 bg-[#F8F3EE] hover:bg-[#EDE5DE] text-[#765F50] rounded-xl font-bold text-xs sm:text-sm transition"
              >
                Cancel
              </button>

              <button
                type="button"
                onClick={
                  handleReportBug
                }
                className="w-full sm:w-auto px-5 py-2.5 text-white rounded-xl font-black text-xs sm:text-sm shadow-md transition flex items-center justify-center gap-2"
                style={{
                  background:
                    BRAND_GRADIENT,

                  boxShadow:
                    "0 8px 20px rgba(255,102,0,0.22)",
                }}
              >
                <Send
                  size={14}
                />

                Submit Report
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}