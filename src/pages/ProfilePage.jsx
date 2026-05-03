// src/pages/ProfilePage.jsx
import React, { useEffect, useState, useContext, useRef } from "react";
import { useNavigate } from "react-router-dom";
import { ArrowLeft, Download, Trash2 } from "lucide-react";
import { LanguageContext } from "../context/LanguageContext";
import { NotificationContext } from "../context/NotificationContext";
import { getProfile } from "../Services/profile";
import { updateProfile } from "../Services/profile";
import { reportBug } from "../Services/profile";


/**
 * ProfilePage for Delivery Partner
 *
 * Features implemented:
 * - Personal info (firstName, lastName, email, phone) loaded from signup (localStorage)
 *   and displayed as UNEDITABLE fields.
 * - Documents: license, vehicle, idProof, insurance, bankProof
 *   - Upload files (images / pdf). Files are stored as { name, dataUrl, uploadedAt, verified }
 *     in localStorage under partner_profile.documents. Small files only — this is a demo.
 *   - Preview (image) or download (file) and remove file.
 *   - "Request Verification" marks documents as "submitted" (simulated).
 *   - "Save Documents" persist changes to localStorage.
 * - Settings:
 *   - Language selector (marked "Upcoming" as requested — disabled).
 *   - Push notification toggles (several granular options).
 * - Support:
 *   - Report a bug (mailto prefilled)
 *   - Contact support (shows modal/contact info)
 *   - FAQ accordion
 * - Rate us -> opens Play Store (placeholder link)
 * - Extra professional fields: vehicle type, bank (masked), verification status summary
 *
 * Note: This is a local/demo implementation using localStorage as the "backend".
 * In production replace file storage and verification flows with server APIs.
 */

export default function ProfilePage() {
  const navigate = useNavigate();
  const { t } = useContext(LanguageContext || { t: (s) => s });
  const { addNotification } = useContext(NotificationContext || { addNotification: () => {} });
  const [loadingProfile, setLoadingProfile] = useState(true);
  const [bugText, setBugText] = useState("");
  const [showBugModal, setShowBugModal] = useState(false);



  // base profile structure
  // const defaultProfile = {
  //   // personal info (these should come from signup flow — uneditable here)
  //   firstName: "",
  //   lastName: "",
  //   email: "",
  //   phone: "",

  //   // extra fields
  //   vehicleType: "", // i.e. Bike / Car / Cycle
  //   bankMasked: "", // last 4 digits or masked display

  //   // settings
  //   language: "en",
  //   notifications: {
  //     all: true,
  //     orders: true,
  //     promos: false,
  //     system: true,
  //   },

  //   // documents
  //   documents: {
  //     license: null,
  //     vehicle: null,
  //     idProof: null,
  //     insurance: null,
  //     bankProof: null,
  //   },

  //   // verification overview
  //   verification: {
  //     status: "Not submitted", // Not submitted / Pending / Verified / Rejected
  //     lastRequestedAt: null,
  //   },
  // };

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


  useEffect(() => {
  const fetchProfile = async () => {
    try {
      const res = await getProfile();

      console.log("Profile API ✅", res);

      const data = res.data || {};

      // 🔥 SPLIT full_name into first + last
      const nameParts = (data.full_name || "").split(" ");

      setProfile((prev) => ({
        ...prev,

        firstName: nameParts[0] || "",
        lastName: nameParts.slice(1).join(" ") || "",

        email: data.email || "",
        phone: data.mobile || "", // ✅ FIXED

        vehicleType: data.vehicle_type || "",

        bankMasked: data.bank_account_number
          ? "****" + data.bank_account_number.slice(-4)
          : "",

        language: data.preferred_language || "en",

        // 🔥 Permissions mapping (optional but good)
        notifications: {
          all: data.notification_permission ?? true,
          orders: true,
          promos: false,
          system: true,
        },

        verification: {
          status:
            data.adhaar_card && data.pan_card
              ? "Verified"
              : "Not submitted",
          lastRequestedAt: null,
        },
      }));
    } catch (err) {
      console.error("Profile API error ❌", err);
    } finally {
      setLoadingProfile(false);
    }
  };

  fetchProfile();
}, []);

const handleSaveProfile = async () => {
  try {
    await updateProfile({
      vehicle_type: profile.vehicleType,
      bank_account_number: profile.bankMasked || null,

      location_permission: true, // 🔥 you can make toggle later
      background_location_permission: false,
      camera_permission: false,

      notification_permission: profile.notifications?.all ?? true,
    });

    addNotification?.("Profile updated successfully ✅");

  } catch (err) {
    console.error("Update profile error ❌", err);
    addNotification?.("Failed to update profile");
  }
};


  // load profile from localStorage
const [profile, setProfile] = useState({
  firstName: "",
  lastName: "",
  email: "",
  phone: "",

  vehicleType: "",
  bankMasked: "",

  language: "en",
  notifications: {
    all: true,
    orders: true,
    promos: false,
    system: true,
  },

  documents: {
    license: null,
    vehicle: null,
    idProof: null,
    insurance: null,
    bankProof: null,
  },

  verification: {
    status: "Not submitted",
    lastRequestedAt: null,
  },
});

  // support modal & FAQ state
  const [showSupport, setShowSupport] = useState(false);
  const [faqOpen, setFaqOpen] = useState({});
  const fileInputsRef = useRef({});

  // Keep local staging for documents so "Save Documents" is explicit
  const [stagedDocs, setStagedDocs] = useState(profile.documents);

  useEffect(() => {
    // whenever profile in localStorage changes externally, sync (auto refresh)
    const onStorage = (e) => {
      if (e.key === "partner_profile") {
        try {
          const saved = JSON.parse(e.newValue || "{}");
          setProfile((p) => ({ ...p, ...saved }));
          setStagedDocs((d) => ({ ...d, ...(saved.documents || {}) }));
        } catch {}
      }
    };
    window.addEventListener("storage", onStorage);
    return () => window.removeEventListener("storage", onStorage);
  }, []);

  // helper to persist profile to localStorage
  const persistProfile = (next) => {
    const merged = { ...profile, ...next };
    localStorage.setItem("partner_profile", JSON.stringify(merged));
    setProfile(merged);
  };

  // file -> dataURL helper
  const fileToDataUrl = (file) =>
    new Promise((resolve, reject) => {
      const reader = new FileReader();
      reader.onerror = () => reject("file read error");
      reader.onload = () => resolve(reader.result);
      reader.readAsDataURL(file);
    });

  // handle upload (staged only until Save Documents clicked)
  const handleDocUpload = async (e, key) => {
    const file = e.target.files && e.target.files[0];
    if (!file) return;

    // small size guard (demo) — 3.5MB
    const maxBytes = 3.5 * 1024 * 1024;
    if (file.size > maxBytes) {
      addNotification?.("File too large. Please upload < 3.5MB.");
      return;
    }

    const dataUrl = await fileToDataUrl(file).catch(() => null);
    const docObj = {
      name: file.name,
      dataUrl,
      uploadedAt: new Date().toISOString(),
      verified: false,
      status: "uploaded", // uploaded / submitted / verified / rejected
    };

    setStagedDocs((prev) => ({ ...prev, [key]: docObj }));
    addNotification?.(`${key} uploaded (staged). Click Save Documents to persist.`);
  };

  // remove staged or saved doc
  const removeDoc = (key) => {
    setStagedDocs((prev) => ({ ...prev, [key]: null }));
    addNotification?.(`${key} removed (staged). Click Save Documents to persist removal.`);
    // reset file input so same file can be uploaded again
    if (fileInputsRef.current[key]) fileInputsRef.current[key].value = "";
  };

  // Save documents and other editable profile fragments
  const saveProfile = () => {
    const next = {
      // don't overwrite personal info here — keep them as-is (since uneditable)
      vehicleType: profile.vehicleType,
      bankMasked: profile.bankMasked,
      language: profile.language,
      notifications: profile.notifications,
      documents: stagedDocs,
      verification: profile.verification,
      firstName: profile.firstName,
      lastName: profile.lastName,
      email: profile.email,
      phone: profile.phone,
    };
    persistProfile(next);
    addNotification?.("Profile & documents saved.");
  };

  // Request verification -> set verification.status = "Pending" and stamp time
  const requestVerification = () => {
    // basic check: at least license + idProof and bankProof must exist
    if (!stagedDocs.license || !stagedDocs.idProof || !stagedDocs.bankProof) {
      addNotification?.("Please upload License, ID Proof and Bank Proof before requesting verification.");
      return;
    }

    const next = {
      verification: {
        status: "Pending",
        lastRequestedAt: new Date().toISOString(),
      },
    };

    persistProfile(next);
    addNotification?.("Verification requested. Admin will review documents.");
  };

  // simulate admin verifying (this function is only local-demo)
  const _adminVerifyAll = (accept = true) => {
    // mark docs verified/unverified and update verification status
    const updatedDocs = {};
    Object.keys(stagedDocs).forEach((k) => {
      const d = stagedDocs[k];
      if (d) updatedDocs[k] = { ...d, verified: accept, status: accept ? "verified" : "rejected" };
      else updatedDocs[k] = null;
    });

    const next = {
      documents: updatedDocs,
      verification: {
        status: accept ? "Verified" : "Rejected",
        lastRequestedAt: profile.verification?.lastRequestedAt || new Date().toISOString(),
      },
    };
    persistProfile(next);
    addNotification?.(`Admin marked documents as ${accept ? "Verified" : "Rejected"} (demo).`);
  };

  // download file helper
  const downloadFile = (doc) => {
    if (!doc || !doc.dataUrl) return;
    const a = document.createElement("a");
    a.href = doc.dataUrl;
    a.download = doc.name || "file";
    document.body.appendChild(a);
    a.click();
    a.remove();
  };

  // mask bank display (if storing masked string)
  const bankDisplay = (s) => {
    if (!s) return "";
    if (s.length <= 4) return "****" + s;
    const last4 = s.slice(-4);
    return "**** **** " + last4;
  };

  // Uneditable personal info: if signup saved values exist, use them; else show placeholders
  // For demo allow editing only if empty (first run) — but per request these should be uneditable
  const personalReadonly = true;

  // FAQ items
  const faqs = [
    { q: "How do I get verified?", a: "Upload License, ID proof and Bank proof then tap Request Verification. Admin will review." },
    { q: "How do payouts work?", a: "Pending balance shows what admin owes you. Withdraw requests are handled by admin." },
    { q: "How do I change vehicle type?", a: "Update vehicle type in this screen and Save Profile." },
  ];


  if (loadingProfile) {
  return (
    <div className="h-screen flex items-center justify-center">
      Loading profile...
    </div>
  );
}


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
          <div className="flex items-center justify-between">
            <h2 className="font-semibold text-lg">Personal Info</h2>
            <div className="text-sm text-gray-500">Profile is created at signup — read only here</div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <div>
              <label className="text-xs text-gray-500">First name</label>
              <input
                className="w-full p-2 border rounded-md bg-gray-50"
                value={profile.firstName || ""}
                readOnly={personalReadonly}
                onChange={(e) => setProfile({ ...profile, firstName: e.target.value })}
                placeholder="First name"
              />
            </div>

            <div>
              <label className="text-xs text-gray-500">Last name</label>
              <input
                className="w-full p-2 border rounded-md bg-gray-50"
                value={profile.lastName || ""}
                readOnly={personalReadonly}
                onChange={(e) => setProfile({ ...profile, lastName: e.target.value })}
                placeholder="Last name"
              />
            </div>

            <div>
              <label className="text-xs text-gray-500">Email</label>
              <input
                className="w-full p-2 border rounded-md bg-gray-50"
                value={profile.email || ""}
                readOnly={personalReadonly}
                onChange={(e) => setProfile({ ...profile, email: e.target.value })}
                placeholder="Email"
              />
            </div>

            <div>
              <label className="text-xs text-gray-500">Phone</label>
              <input
                className="w-full p-2 border rounded-md bg-gray-50"
                value={profile.phone || ""}
                readOnly={personalReadonly}
                onChange={(e) => setProfile({ ...profile, phone: e.target.value })}
                placeholder="Phone"
              />
            </div>
          </div>

          {/* Professional extras */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 mt-3">
            <div>
              <label className="text-xs text-gray-500">Vehicle type</label>
              <select
                className="w-full p-2 border rounded-md"
                value={profile.vehicleType || ""}
                onChange={(e) => setProfile({ ...profile, vehicleType: e.target.value })}
              >
                <option value="">Select vehicle</option>
                <option value="scooter">Scooter</option>
                <option value="bike">Bike</option>
                <option value="bicycle">Bicycle</option>
              </select>
            </div>

            <div>
              <label className="text-xs text-gray-500">Bank (last 4 digits)</label>
              <input
                className="w-full p-2 border rounded-md"
                value={profile.bankMasked || ""}
                onChange={(e) => setProfile({ ...profile, bankMasked: e.target.value })}
                placeholder="Enter last 4 digits"
              />
            </div>
          </div>

          {/* verification summary */}
          <div className="mt-3 p-3 bg-orange-50 rounded-md">
            <div className="flex items-center justify-between">
              <div className="text-sm">
                <div className="font-semibold">Verification status</div>
                <div className="text-xs text-gray-600">{profile.verification?.status || "Not submitted"}</div>
                {profile.verification?.lastRequestedAt && (
                  <div className="text-xs text-gray-500">Requested: {new Date(profile.verification.lastRequestedAt).toLocaleString()}</div>
                )}
              </div>

              <div className="flex gap-2">
                <button
                  onClick={requestVerification}
                  className="px-3 py-1 bg-orange-400 text-white rounded-md"
                >
                  Request Verification
                </button>

                {/* Demo admin verify buttons — remove in production */}
                <button
                  onClick={() => _adminVerifyAll(true)}
                  className="px-3 py-1 bg-green-500 text-white rounded-md text-sm"
                >
                  (demo) Approve
                </button>
                <button
                  onClick={() => _adminVerifyAll(false)}
                  className="px-3 py-1 bg-red-500 text-white rounded-md text-sm"
                >
                  (demo) Reject
                </button>
              </div>
            </div>
          </div>
        </div>

        {/* Documents */}
        <div className="bg-white p-4 rounded-2xl shadow space-y-3">
          <div className="flex items-center justify-between">
            <h2 className="font-semibold text-lg">Documents</h2>
            <div className="text-sm text-gray-500">Upload and Save Documents</div>
          </div>

          {/* documents grid */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {[
              { key: "license", label: "Driving License" },
              { key: "vehicle", label: "Vehicle Papers" },
              { key: "idProof", label: "ID Proof" },
              { key: "insurance", label: "Insurance" },
              { key: "bankProof", label: "Bank Account Proof" },
            ].map((doc) => {
              const d = stagedDocs[doc.key];
              return (
               <div key={doc.key} className="p-3 border rounded-md flex flex-col gap-3">
  <div className="flex items-center justify-between">
    <div className="font-medium">{doc.label}</div>
    <div className="text-xs text-gray-500">{d?.status || "none"}</div>
  </div>

  {/* File name */}
  <div className="text-sm text-gray-600">{d?.name || "No file uploaded"}</div>

  {/* Preview if image */}
  {d?.dataUrl && d.dataUrl.startsWith("data:image") && (
    <img
      src={d.dataUrl}
      alt={d.name}
      className="w-full h-36 object-contain rounded-md border"
    />
  )}

  {/* File input (SEPARATED FOR ALIGNMENT) */}
  <div>
    <input
      ref={(el) => (fileInputsRef.current[doc.key] = el)}
      type="file"
      accept="image/*,.pdf"
      className="w-full text-sm"
      onChange={(e) => handleDocUpload(e, doc.key)}
    />
  </div>

  {/* Buttons ROW — FIXED ALIGNMENT */}
  <div className="flex justify-end gap-2 mt-1">
    <button
      onClick={() => {
        if (d) downloadFile(d);
        else addNotification?.("No file to download");
      }}
      className="px-3 py-1 bg-blue-500 text-white rounded-md flex items-center gap-2"
    >
      <Download size={14} /> Download
    </button>

    <button
      onClick={() => removeDoc(doc.key)}
      className="px-3 py-1 bg-red-500 text-white rounded-md flex items-center gap-2"
      title="Remove file"
    >
      <Trash2 size={14} /> Remove
    </button>
  </div>

  {/* Uploaded info */}
  <div className="text-xs text-gray-500">
    Uploaded: {d?.uploadedAt ? new Date(d.uploadedAt).toLocaleString() : "—"}
    {d?.verified && <span className="ml-2 text-green-600">• Verified</span>}
  </div>
</div>

              );
            })}
          </div>

          <div className="flex items-center gap-2 mt-3">
            <button
              onClick={() => {
                // commit stagedDocs to profile.documents and keep verification state "submitted"
                persistProfile({ documents: stagedDocs, verification: { ...profile.verification } });
                addNotification?.("Documents saved.");
              }}
              className="px-4 py-2 bg-orange-500 text-white rounded-md"
            >
              Save Documents
            </button>

            <button
              onClick={() => {
                // quick remove all staged docs
                setStagedDocs({ license: null, vehicle: null, idProof: null, insurance: null, bankProof: null });
                addNotification?.("All staged documents cleared. Click Save Documents to persist.");
              }}
              className="px-4 py-2 bg-gray-200 rounded-md"
            >
              Clear Staged
            </button>
          </div>
        </div>

       {/* Settings */}
<div className="bg-white p-4 rounded-2xl shadow space-y-3">
  <h2 className="font-semibold text-lg">Settings</h2>

  <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
    {/* Language */}
    <div>
      <label className="text-xs text-gray-500">Language (Upcoming)</label>
      <select
        disabled
        className="w-full p-2 border rounded-md bg-gray-50 cursor-not-allowed"
        value={profile.language}
      >
        <option value="en">English</option>
        <option value="hi">Hindi</option>
        <option value="es">Spanish</option>
      </select>
      <div className="text-xs text-gray-400 mt-1">Language support coming soon.</div>
    </div>

    {/* Notifications */}
    <div>
      <label className="text-xs text-gray-500">Notifications</label>

      <div className="mt-2 space-y-3">

        {/* Toggle Component */}
        {[
          { key: "all", label: "All Notifications" },
          { key: "orders", label: "Order Updates" },
          { key: "promos", label: "Promotions" },
          { key: "system", label: "System Messages" },
        ].map((item) => (
          <div
            key={item.key}
            className="flex items-center justify-between text-sm"
          >
            <span>{item.label}</span>

            {/* Toggle Switch */}
            <div
              onClick={() =>
                setProfile((p) => ({
                  ...p,
                  notifications: {
                    ...p.notifications,
                    [item.key]: !p.notifications[item.key],
                  },
                }))
              }
              className={`w-12 h-6 flex items-center rounded-full p-1 cursor-pointer transition 
                ${profile.notifications?.[item.key] ? "bg-orange-500" : "bg-gray-300"}`}
            >
              <div
                className={`bg-white w-5 h-5 rounded-full shadow transform transition 
                  ${profile.notifications?.[item.key] ? "translate-x-6" : "translate-x-0"}`}
              ></div>
            </div>
          </div>
        ))}

      </div>
    </div>
  </div>

  {/* Save Button */}
  <div>
   <button
  onClick={handleSaveProfile}
  className="px-4 py-2 bg-orange-500 text-white rounded-md w-full font-semibold"
>
  Save Profile
</button>
  </div>
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
              <div className="text-xs text-gray-500">Opens email client</div>
            </button>

            <button onClick={() => setShowSupport(true)} className="px-3 py-2 bg-blue-100 rounded-md text-left">
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
                <a className="text-orange-500" href="mailto:support@example.com">support@example.com</a>
              </div>

              <div>
                <div className="font-medium">Working hours</div>
                <div>Mon - Sat, 9:00 AM - 8:00 PM</div>
              </div>

              <div>
                <div className="font-medium">Live chat</div>
                <div>Use the in-app chat (coming soon)</div>
              </div>
            </div>

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
