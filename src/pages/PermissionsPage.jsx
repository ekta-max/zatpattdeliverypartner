//src\pages\PermissionsPage.jsx

import React from "react";
import { useNavigate } from "react-router-dom";
import {
  MapPin,
  Navigation,
  Camera,
  Bell,
  CheckCircle,
} from "lucide-react";
 import { updateDeliveryPartnerPermissions } from "../Services/deliveryPartner";


export default function PermissionsPage() {
  const navigate = useNavigate();


  // ✅ ALL PERMISSIONS GRANTED (READ-ONLY)
  const permissions = {
  location: "granted",
  background_location: "granted",
  camera: "granted",
  notifications: "granted",
};

  const handleContinue = async () => {
  console.log("Button clicked ✅");

  try {
    await updateDeliveryPartnerPermissions();

    console.log("Permissions sent ✅");

    // optional: save locally
    localStorage.setItem(
      "delivery_permissions",
      JSON.stringify(permissions)
    );

    // 👉 move next
    navigate("/location-picker");

  } catch (error) {
    console.error("Permission API failed ❌", error);
    alert("Failed to update permissions");
  }
};

  return (
    <div className="min-h-screen bg-white flex flex-col">
      {/* TOP ICON */}
      <div className="flex justify-center mt-10 mb-4">
        <div className="w-20 h-20 bg-orange-100 rounded-full flex items-center justify-center">
          <MapPin size={36} className="text-orange-500" />
        </div>
      </div>

      {/* TITLE */}
      <h1 className="text-center text-lg font-semibold text-gray-900 px-6">
        These permissions help us assign orders accurately
      </h1>

      {/* SUBTEXT (OPTIONAL BUT RECOMMENDED)
      <p className="text-center text-sm text-gray-500 px-6 mt-2">
        Permissions are already enabled on your device
      </p> */}

      {/* PERMISSIONS LIST */}
      <div className="mt-8 px-6 space-y-6">
        <PermissionRow
          icon={<Navigation />}
          title="Location"
          description="Used to detect your delivery area and assign nearby orders"
        />

        <PermissionRow
          icon={<MapPin />}
          title="Background Location"
          description="Required for live tracking and geofence-based order updates"
        />

        <PermissionRow
          icon={<Camera />}
          title="Camera"
          description="Used to scan order QR codes and upload delivery proof"
        />

        <PermissionRow
          icon={<Bell />}
          title="Push Notifications"
          description="Used to notify you about new orders and updates"
        />
      </div>

      {/* CTA */}
      <div className="mt-auto p-6">
        <button
          onClick={handleContinue}
          className="w-full py-3 rounded-xl font-semibold text-white bg-orange-500 active:bg-orange-600"
        >
          Grant Permission
        </button>
      </div>
    </div>
  );
}

/* ---------- Permission Row (READ-ONLY + GRANTED) ---------- */

function PermissionRow({ icon, title, description }) {
  return (
    <div className="flex items-start gap-4">
      <div className="mt-1 text-gray-700">{icon}</div>

      <div className="flex-1">
        <h3 className="font-medium text-gray-900">{title}</h3>
        <p className="text-sm text-gray-500 mt-1">{description}</p>
      </div>

      {/* GRANTED INDICATOR */}
      <div className="flex items-center gap-1 text-orange-500 text-sm font-medium">
        <CheckCircle size={18} />
        
      </div>
    </div>
  );
}
