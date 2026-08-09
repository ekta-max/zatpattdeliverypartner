// src/pages/ProfilePage.jsx
import React, { useEffect, useState, useContext, useRef } from "react";
import { useNavigate } from "react-router-dom";
import { ArrowLeft, IdCard, Bike, ShieldCheck, Camera } from "lucide-react";
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
 * - Loads full profile from getMyProfileDp() (single source of truth — includes
 *   conditional_key, chat_room_id, verification + onboarding flags).
 * - conditional_key drives the edit lifecycle:
 *     "request_edit" -> show "Request Edit" button (POST request-to-edit)
 *     "request_sent" -> show disabled "Sent Request" badge
 *     "edit"         -> all fields + documents become editable, "Save Profile"
 *                       posts to add-or-edit-profile-dp
 * - Documents section only shows: Aadhaar Card, PAN Card, Driving Licence, Vehicle Licence
 *   as small thumbnails. No download/remove/staging — replacing a file is only
 *   possible while conditional_key === "edit".
 */

const DOC_FIELDS = [
  { key: "adhaar_card", numberKey: "adhaarCardNumber", label: "Aadhaar Card", icon: IdCard },
  { key: "pan_card", numberKey: "panCardNumber", label: "PAN Card", icon: IdCard },
  { key: "driving_license", numberKey: null, label: "Driving Licence", icon: ShieldCheck },
  { key: "vehicle_licence", numberKey: null, label: "Vehicle Licence", icon: Bike },
];

const fileUrl = (path) => (path ? `${API_BASE_URL}${path}` : null);

export default function ProfilePage() {
  const navigate = useNavigate();
  const { t } = useContext(LanguageContext || { t: (s) => s });
  const { addNotification } = useContext(NotificationContext || { addNotification: () => {} });

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

  // holds newly picked File objects (only relevant while editable)
  const [editFiles, setEditFiles] = useState({});
  // local object-URL previews for newly picked files
  const [docPreviews, setDocPreviews] = useState({});
  const fileInputsRef = useRef({});

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

      // clear any stale local file picks/previews on fresh fetch
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

  /* ---------------- FIELD CHANGE HELPERS ---------------- */
  const setField = (key, value) => {
    if (!isEditable) return; // extra guard, inputs are also disabled
    setProfile((p) => ({ ...p, [key]: value }));
  };

  const toggleNotification = (key) => {
    setProfile((p) => ({
      ...p,
      notifications: { ...p.notifications, [key]: !p.notifications[key] },
    }));
  };

  /* ---------------- DOCUMENT FILE PICK (only while editable) ---------------- */
  const handleDocFileChange = (e, key) => {
    const file = e.target.files && e.target.files[0];
    if (!file) return;

    const maxBytes = 5 * 1024 * 1024;
    if (file.size > maxBytes) {
      addNotification?.("File too large. Please upload < 5MB.");
      return;
    }

    setEditFiles((prev) => ({ ...prev, [key]: file }));
    setDocPreviews((prev) => ({ ...prev, [key]: URL.createObjectURL(file) }));
  };

  const docDisplayUrl = (key) => docPreviews[key] || fileUrl(profile.documents[key]);

  /* ---------------- REQUEST EDIT ---------------- */
  const handleRequestEdit = async () => {
    if (requestingEdit) return;
    setRequestingEdit(true);
    try {
      await requestToEdit();
      addNotification?.("Edit request sent ✅");
      setProfile((p) => ({ ...p, conditionalKey: "request_sent" }));
    } catch (err) {
      console.error("Request edit error ❌", err);
      addNotification?.("Failed to send edit request");
    } finally {
      setRequestingEdit(false);
    }
  };

  /* ---------------- SAVE PROFILE (edit mode) ---------------- */
  const handleSaveEdit = async () => {
    if (savingEdit) return;
    setSavingEdit(true);

    // best-effort geolocation, non-blocking if denied/unavailable
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

  /* ---------------- NOTIFICATIONS SAVE ---------------- */
  const handleSaveNotifications = async () => {
    try {
      await updateProfile({
        notification_permission: profile.notifications?.all ?? true,
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
      setSupportMessages((prev) => [...prev, { message: supportMessage, identity: "self" }]);
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
      await reportBug({ report: bugText });
      addNotification?.("Bug reported successfully ✅");
      setBugText("");
      setShowBugModal(false);
    } catch (err) {
      console.error("Bug API error ❌", err);
      addNotification?.("Failed to report bug");
    }
  };

  const faqs = [
    { q: "How do I get verified?", a: "Complete onboarding and upload your documents. Admin will review and verify your account." },
    { q: "How do payouts work?", a: "Pending balance shows what admin owes you. Withdraw requests are handled by admin." },
    { q: "How do I edit my profile once verified?", a: "Tap Request Edit. Once admin approves, your fields and documents will unlock for editing." },
  ];
  const [faqOpen, setFaqOpen] = useState({});

  if (loadingProfile) {
    return (
      <div className="h-screen flex items-center justify-center">
        Loading profile...
      </div>
    );
  }

  const fieldClasses = (extra = "") =>
    `w-full p-2 border rounded-md text-sm transition ${
      isEditable ? "bg-white border-orange-300" : "bg-gray-50 text-gray-500"
    } ${extra}`;

  return (
    <div className="min-h-screen bg-orange-50 flex flex-col">
      {/* Header */}
      <header className="bg-orange-500 text-white py-4 px-6 shadow-lg flex items-center relative justify-center">
        <button
          onClick={() => navigate(-1)}
          className="absolute left-4 bg-white text-orange-500 p-2 rounded-full shadow hover:bg-gray-100 transition"
        >
          <ArrowLeft size={20} />
        </button>
        <h1 className="text-xl font-bold">Profile</h1>
      </header>

      <div className="p-6 max-w-4xl mx-auto w-full space-y-6">
        {/* Personal Info */}
        <div className="bg-white p-4 rounded-2xl shadow space-y-3">
          <div className="flex items-center justify-between flex-wrap gap-2">
            <div>
              <h2 className="font-semibold text-lg">Personal Info</h2>
              <div className="flex items-center gap-2 mt-1">
                <span
                  className={`text-xs px-2 py-0.5 rounded-full font-medium ${
                    profile.isVerified
                      ? "bg-green-100 text-green-700"
                      : "bg-gray-100 text-gray-600"
                  }`}
                >
                  {profile.isVerified ? "Verified" : "Not Verified"}
                </span>
                {isEditable && (
                  <span className="text-xs px-2 py-0.5 rounded-full bg-orange-100 text-orange-700 font-medium">
                    Editing enabled
                  </span>
                )}
              </div>
            </div>

            {/* conditional_key driven action */}
            <div>
              {profile.conditionalKey === "request_edit" && (
                <button
                  onClick={handleRequestEdit}
                  disabled={requestingEdit}
                  className="px-3 py-1.5 bg-orange-500 text-white rounded-md text-sm font-semibold disabled:opacity-60"
                >
                  {requestingEdit ? "Requesting..." : "Request Edit"}
                </button>
              )}

              {profile.conditionalKey === "request_sent" && (
                <button
                  disabled
                  className="px-3 py-1.5 bg-gray-200 text-gray-500 rounded-md text-sm font-semibold cursor-not-allowed"
                >
                  Sent Request
                </button>
              )}

              {profile.conditionalKey === "edit" && (
                <span className="text-xs text-orange-600 font-medium">
                  You can edit your details below
                </span>
              )}
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <div>
              <label className="text-xs text-gray-500">First name</label>
              <input
                className={fieldClasses()}
                value={profile.firstName}
                disabled={!isEditable}
                onChange={(e) => setField("firstName", e.target.value)}
                placeholder="First name"
              />
            </div>

            <div>
              <label className="text-xs text-gray-500">Last name</label>
              <input
                className={fieldClasses()}
                value={profile.lastName}
                disabled={!isEditable}
                onChange={(e) => setField("lastName", e.target.value)}
                placeholder="Last name"
              />
            </div>

            <div>
              <label className="text-xs text-gray-500">Email</label>
              <input
                className={fieldClasses()}
                value={profile.email}
                disabled={!isEditable}
                onChange={(e) => setField("email", e.target.value)}
                placeholder="Email"
              />
            </div>

            <div>
              <label className="text-xs text-gray-500">Phone</label>
              <input
                className={fieldClasses()}
                value={profile.mobile}
                readOnly
                disabled
                placeholder="Phone"
              />
            </div>

            <div>
              <label className="text-xs text-gray-500">Date of birth</label>
              <input
                type="date"
                className={fieldClasses()}
                value={profile.dob || ""}
                disabled={!isEditable}
                onChange={(e) => setField("dob", e.target.value)}
              />
            </div>

            <div>
              <label className="text-xs text-gray-500">Gender</label>
              <select
                className={fieldClasses()}
                value={profile.gender || ""}
                disabled={!isEditable}
                onChange={(e) => setField("gender", e.target.value)}
              >
                <option value="">Select gender</option>
                <option value="male">Male</option>
                <option value="female">Female</option>
                <option value="other">Other</option>
              </select>
            </div>
          </div>

          {/* Vehicle / bank */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 mt-1">
            <div>
              <label className="text-xs text-gray-500">Vehicle type</label>
              <input
                className={fieldClasses()}
                value={profile.vehicleType || ""}
                readOnly
                disabled
                placeholder="Vehicle type"
              />
            </div>

            <div>
              <label className="text-xs text-gray-500">Vehicle number</label>
              <input
                className={fieldClasses()}
                value={profile.vehicleNumber || ""}
                disabled={!isEditable}
                onChange={(e) => setField("vehicleNumber", e.target.value)}
                placeholder="Vehicle number"
              />
            </div>

            <div>
              <label className="text-xs text-gray-500">Aadhaar number</label>
              <input
                className={fieldClasses()}
                value={profile.adhaarCardNumber || ""}
                disabled={!isEditable}
                onChange={(e) => setField("adhaarCardNumber", e.target.value)}
                placeholder="Aadhaar number"
              />
            </div>

            <div>
              <label className="text-xs text-gray-500">PAN number</label>
              <input
                className={fieldClasses()}
                value={profile.panCardNumber || ""}
                disabled={!isEditable}
                onChange={(e) => setField("panCardNumber", e.target.value)}
                placeholder="PAN number"
              />
            </div>

            <div>
              <label className="text-xs text-gray-500">Bank account number</label>
              <input
                className={fieldClasses()}
                value={profile.bankAccountNumber || ""}
                disabled={!isEditable}
                onChange={(e) => setField("bankAccountNumber", e.target.value)}
                placeholder="Bank account number"
              />
            </div>

            <div>
              <label className="text-xs text-gray-500">IFSC code</label>
              <input
                className={fieldClasses()}
                value={profile.ifscCode || ""}
                disabled={!isEditable}
                onChange={(e) => setField("ifscCode", e.target.value.toUpperCase())}
                placeholder="IFSC code"
              />
            </div>

            <div className="sm:col-span-2">
              <label className="text-xs text-gray-500">Account holder name</label>
              <input
                className={fieldClasses()}
                value={profile.accountHolderName || ""}
                disabled={!isEditable}
                onChange={(e) => setField("accountHolderName", e.target.value)}
                placeholder="Account holder name"
              />
            </div>
          </div>
        </div>

        {/* Documents — small thumbnails */}
        <div className="bg-white p-4 rounded-2xl shadow space-y-3">
          <div className="flex items-center justify-between">
            <h2 className="font-semibold text-lg">Documents</h2>
            <div className="text-xs text-gray-500">
              {isEditable ? "Tap a document to replace it" : "Submitted documents"}
            </div>
          </div>

          <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
            {DOC_FIELDS.map(({ key, label, icon: Icon }) => {
              const url = docDisplayUrl(key);
              return (
                <div key={key} className="flex flex-col items-center gap-1.5">
                  <div className="relative w-full aspect-square rounded-xl overflow-hidden border border-orange-200 bg-orange-50 flex items-center justify-center group">
                    {url ? (
                      <img src={url} alt={label} className="w-full h-full object-cover" />
                    ) : (
                      <Icon size={22} className="text-orange-300" />
                    )}

                    {isEditable && (
                      <label
                        htmlFor={`doc-${key}`}
                        className="absolute inset-x-0 bottom-0 bg-black/55 text-white text-[10px] text-center py-1 cursor-pointer opacity-90 group-hover:opacity-100"
                      >
                        Change
                        <input
                          id={`doc-${key}`}
                          ref={(el) => (fileInputsRef.current[key] = el)}
                          type="file"
                          accept="image/*,.pdf"
                          className="hidden"
                          onChange={(e) => handleDocFileChange(e, key)}
                        />
                      </label>
                    )}
                  </div>
                  <span className="text-[11px] text-gray-600 text-center leading-tight">
                    {label}
                  </span>
                </div>
              );
            })}
          </div>
        </div>

        {/* Save Profile — placed right after Documents */}
        <div className="bg-white p-4 rounded-2xl shadow">
          <button
            onClick={handleSaveEdit}
            disabled={!isEditable || savingEdit}
            className={`w-full py-3 rounded-md font-semibold transition ${
              isEditable && !savingEdit
                ? "bg-orange-500 text-white hover:bg-orange-600"
                : "bg-gray-200 text-gray-400 cursor-not-allowed"
            }`}
          >
            {savingEdit
              ? "Saving..."
              : isEditable
              ? "Save Profile"
              : "Save Profile (request edit access first)"}
          </button>
        </div>

        {/* Settings */}
        <div className="bg-white p-4 rounded-2xl shadow space-y-3">
          <h2 className="font-semibold text-lg">Settings</h2>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
            {/* Language */}
            <div>
              <label className="text-xs text-gray-500">Preferred language</label>
              <select
                className={fieldClasses()}
                value={profile.preferredLanguage}
                disabled={!isEditable}
                onChange={(e) => setField("preferredLanguage", e.target.value)}
              >
                <option value="en">English</option>
                <option value="hi">Hindi</option>
                <option value="es">Spanish</option>
              </select>
              {!isEditable && (
                <div className="text-xs text-gray-400 mt-1">
                  Request edit access to change your language.
                </div>
              )}
            </div>

            {/* Notifications */}
            <div>
              <label className="text-xs text-gray-500">Notifications</label>
              <div className="mt-2 space-y-3">
                {[
                  { key: "all", label: "All Notifications" },
                  { key: "orders", label: "Order Updates" },
                  { key: "promos", label: "Promotions" },
                  { key: "system", label: "System Messages" },
                ].map((item) => (
                  <div key={item.key} className="flex items-center justify-between text-sm">
                    <span>{item.label}</span>
                    <div
                      onClick={() => toggleNotification(item.key)}
                      className={`w-12 h-6 flex items-center rounded-full p-1 cursor-pointer transition ${
                        profile.notifications?.[item.key] ? "bg-orange-500" : "bg-gray-300"
                      }`}
                    >
                      <div
                        className={`bg-white w-5 h-5 rounded-full shadow transform transition ${
                          profile.notifications?.[item.key] ? "translate-x-6" : "translate-x-0"
                        }`}
                      />
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>

          <button
            onClick={handleSaveNotifications}
            className="px-4 py-2 bg-orange-100 text-orange-600 rounded-md w-full font-semibold text-sm"
          >
            Save Notification Settings
          </button>
        </div>

        {/* Support & Feedback */}
        <div className="bg-white p-4 rounded-2xl shadow space-y-3">
          <h2 className="font-semibold text-lg">Support & Feedback</h2>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
            <button
              onClick={() => setShowBugModal(true)}
              className="px-3 py-2 bg-red-100 rounded-md text-left"
            >
              <div className="font-medium">Report a bug</div>
              <div className="text-xs text-gray-500">Tell us what went wrong</div>
            </button>

            <button onClick={openSupportModal} className="px-3 py-2 bg-blue-100 rounded-md text-left">
              <div className="font-medium">Contact support</div>
              <div className="text-xs text-gray-500">Call or message support</div>
            </button>

            <button
              onClick={() => window.open("https://play.google.com/store", "_blank")}
              className="px-3 py-2 bg-green-100 rounded-md text-left"
            >
              <div className="font-medium">Rate us / Feedback</div>
              <div className="text-xs text-gray-500">Opens Play Store</div>
            </button>
          </div>

          {/* FAQ */}
          <div className="mt-3">
            <h3 className="font-semibold">FAQ</h3>
            <div className="space-y-2 mt-2">
              {faqs.map((f, i) => (
                <div key={i} className="border rounded-md">
                  <button
                    onClick={() => setFaqOpen((s) => ({ ...s, [i]: !s[i] }))}
                    className="w-full px-3 py-2 text-left flex justify-between items-center"
                  >
                    <span>{f.q}</span>
                    <span className="text-sm text-gray-500">{faqOpen[i] ? "▲" : "▼"}</span>
                  </button>
                  {faqOpen[i] && <div className="px-3 py-2 text-sm text-gray-600">{f.a}</div>}
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>

      {/* Support Modal */}
      {showSupport && (
        <div className="fixed inset-0 bg-black bg-opacity-40 flex items-center justify-center z-50">
          <div className="bg-white rounded-2xl p-6 w-[90%] max-w-xl">
            <div className="flex justify-between items-center">
              <h3 className="font-semibold">Contact Support</h3>
              <button onClick={() => setShowSupport(false)} className="text-gray-500">Close</button>
            </div>

            <div className="mt-4 space-y-3 text-sm text-gray-700">
              <div>
                <div className="font-medium">Phone</div>
                <a className="text-orange-500" href="tel:+911234567890">+91 12345 67890</a>
              </div>

              <div>
                <div className="font-medium">Email</div>
                <a className="text-orange-500" href="mailto:zatpatt@example.com">zatpatt@example.com</a>
              </div>

              <div>
                <div className="font-medium">Working hours</div>
                <div>Mon - Sat, 9:00 AM - 8:00 PM</div>
              </div>
            </div>

            <div className="font-medium text-sm mb-2">Send a message</div>

              {loadingSupportChat && (
                <p className="text-xs text-gray-400 mb-2">Loading messages...</p>
              )}

              {!loadingSupportChat && supportMessages.length > 0 && (
                <div className="max-h-40 overflow-y-auto space-y-1 mb-2 border rounded-md p-2">
                  {supportMessages.map((m, i) => (
                    <div
                      key={i}
                      className={`text-xs px-2 py-1 rounded-md w-fit max-w-[80%] ${
                        m.identity === "self" ? "ml-auto text-right" : "mr-auto text-left"
                      }`}
                      style={{
                        backgroundColor: m.identity === "self" ? "#E1E100" : "#8ECA3C",
                      }}
                    >
                      {m.message}
                    </div>
                  ))}
                </div>
              )}

              {!profile.chatRoomId && (
                  <p className="text-xs text-gray-400 mb-2">Chat unavailable right now.</p>
                )}

                <textarea
                  value={supportMessage}
                  onChange={(e) => setSupportMessage(e.target.value)}
                  placeholder="Type your message..."
                  className="w-full border rounded-md p-2 h-20 text-sm"
                />

                <button
                  onClick={handleSendSupportMessage}
                  disabled={sendingMessage || !supportMessage.trim() || !profile.chatRoomId}
                  className={`mt-2 w-full py-2 rounded-md font-semibold text-white ${
                    sendingMessage || !supportMessage.trim() || !profile.chatRoomId
                      ? "bg-gray-300 cursor-not-allowed"
                      : "bg-orange-500"
                  }`}
                >
                  {sendingMessage ? "Sending..." : "Send"}
                </button>

                <div className="mt-4 flex justify-end gap-2">
              <button onClick={() => setShowSupport(false)} className="px-4 py-2 rounded-md bg-gray-100">Close</button>
            </div>
          </div>
        </div>
      )}

      {showBugModal && (
        <div className="fixed inset-0 bg-orange-50 bg-opacity-40 flex items-center justify-center z-50">
          <div className="bg-white rounded-2xl p-6 w-[90%] max-w-md">
            <h3 className="font-semibold text-lg mb-3">Report a Bug</h3>

            <textarea
              value={bugText}
              onChange={(e) => setBugText(e.target.value)}
              placeholder="Describe the issue..."
              className="w-full border rounded-md p-2 h-28 text-sm"
            />

            <div className="flex justify-end gap-2 mt-4">
              <button
                onClick={() => setShowBugModal(false)}
                className="px-4 py-2 bg-gray-200 rounded-md"
              >
                Cancel
              </button>

              <button
                onClick={handleReportBug}
                className="px-4 py-2 bg-orange-500 text-white rounded-md"
              >
                Submit
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}