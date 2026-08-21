import React, {
  useEffect,
  useState,
} from "react";

import { useNavigate } from "react-router-dom";

import {
  MapPin,
  Navigation,
  Camera,
  Bell,
  Check,
} from "lucide-react";

import {
  updateDeliveryPartnerPermissions,
} from "../Services/deliveryPartner";

const ORANGE = "#f97316";

const DEFAULT_PERMISSIONS = {
  location: true,
  background_location: true,
  camera: true,
  notifications: true,
};

export default function PermissionsPage() {
  const navigate = useNavigate();

  const [permissions, setPermissions] =
    useState(DEFAULT_PERMISSIONS);

  const [loading, setLoading] =
    useState(false);

  /* ==========================================
     LOAD SAVED PERMISSIONS
  ========================================== */

  useEffect(() => {
    try {
      const saved =
        localStorage.getItem(
          "delivery_permissions"
        );

      if (saved) {
        const parsed =
          JSON.parse(saved);

        setPermissions({
          ...DEFAULT_PERMISSIONS,
          ...parsed,
        });
      }
    } catch (error) {
      console.error(
        "Failed to load permissions",
        error
      );
    }
  }, []);

  /* ==========================================
     TOGGLE PERMISSION
  ========================================== */

  const togglePermission =
    (key) => {
      setPermissions(
        (previous) => ({
          ...previous,
          [key]:
            !previous[key],
        })
      );
    };

  /* ==========================================
     ALL GRANTED?
  ========================================== */

  const allGranted =
    Object.values(
      permissions
    ).every(Boolean);

  /* ==========================================
     CONTINUE
  ========================================== */

  const handleContinue =
    async () => {
      if (
        !allGranted ||
        loading
      ) {
        return;
      }

      try {
        setLoading(true);

        console.log(
          "Permissions:",
          permissions
        );

        /*
         * Save locally
         */
        localStorage.setItem(
          "delivery_permissions",
          JSON.stringify(
            permissions
          )
        );

        /*
         * Send to backend
         */
        await updateDeliveryPartnerPermissions(
          permissions
        );

        console.log(
          "Permissions API ✅"
        );

        /*
         * Go to next page
         */
        navigate(
          "/location-picker"
        );
      } catch (error) {
        console.error(
          "Permission API failed ❌",
          error
        );

        alert(
          "Failed to update permissions"
        );
      } finally {
        setLoading(false);
      }
    };

  return (
    <div className="min-h-[100dvh] bg-white flex flex-col overflow-x-hidden">
      {/* ======================================
          MAIN CONTENT
      ====================================== */}

      <div
        className="
          w-full
          max-w-xl
          mx-auto

          px-4
          sm:px-6
          md:px-8

          pt-7
          sm:pt-10
          md:pt-12
        "
      >
        {/* ====================================
            TOP ICON
        ==================================== */}

        <div className="flex justify-center mb-4 sm:mb-5">
          <div
            className="
              w-16
              h-16

              sm:w-20
              sm:h-20

              md:w-24
              md:h-24

              rounded-full

              flex
              items-center
              justify-center
            "
            style={{
              backgroundColor:
                "#fff1e6",
            }}
          >
            <MapPin
              className="
                w-8
                h-8

                sm:w-9
                sm:h-9

                md:w-11
                md:h-11
              "
              style={{
                color: ORANGE,
              }}
            />
          </div>
        </div>

        {/* ====================================
            TITLE
        ==================================== */}

        <h1
          className="
            text-center

            text-base
            sm:text-lg
            md:text-xl

            font-semibold

            leading-6
            sm:leading-7
            md:leading-8

            text-gray-900

            px-2
            sm:px-4
          "
        >
          These permissions help us
          assign orders accurately
        </h1>

        {/* ====================================
            PERMISSIONS
        ==================================== */}

        <div
          className="
            mt-7
            sm:mt-8
            md:mt-10

            space-y-4
            sm:space-y-5
            md:space-y-6
          "
        >
          <PermissionRow
            icon={<Navigation />}
            title="Location"
            description="Used to detect your delivery area and assign nearby orders"
            checked={
              permissions.location
            }
            onClick={() =>
              togglePermission(
                "location"
              )
            }
          />

          <PermissionRow
            icon={<MapPin />}
            title="Background Location"
            description="Required for live tracking and geofence-based order updates"
            checked={
              permissions.background_location
            }
            onClick={() =>
              togglePermission(
                "background_location"
              )
            }
          />

          <PermissionRow
            icon={<Camera />}
            title="Camera"
            description="Used to scan order QR codes and upload delivery proof"
            checked={
              permissions.camera
            }
            onClick={() =>
              togglePermission(
                "camera"
              )
            }
          />

          <PermissionRow
            icon={<Bell />}
            title="Push Notifications"
            description="Used to notify you about new orders and updates"
            checked={
              permissions.notifications
            }
            onClick={() =>
              togglePermission(
                "notifications"
              )
            }
          />
        </div>
      </div>

      {/* ======================================
          CTA
      ====================================== */}

      <div
        className="
          mt-auto

          w-full
          max-w-xl
          mx-auto

          px-4
          sm:px-6
          md:px-8

          py-5
          sm:py-6
        "
      >
        <button
          type="button"
          onClick={
            handleContinue
          }
          disabled={
            !allGranted ||
            loading
          }
          className="
            w-full

            min-h-[48px]

            sm:min-h-[52px]

            py-3
            sm:py-3.5

            px-4

            rounded-xl
            sm:rounded-2xl

            font-semibold

            text-sm
            sm:text-base

            text-white

            transition

            disabled:cursor-not-allowed
            disabled:opacity-50
          "
          style={{
            backgroundColor:
              ORANGE,
          }}
        >
          {loading
            ? "Saving..."
            : "Grant Permission"}
        </button>
      </div>
    </div>
  );
}

/* ============================================
   PERMISSION ROW
============================================ */

function PermissionRow({
  icon,
  title,
  description,
  checked,
  onClick,
}) {
  return (
    <button
      type="button"
      onClick={onClick}
      className="
        w-full

        flex
        items-start

        gap-3
        sm:gap-4

        text-left

        rounded-xl

        p-2

        transition

        hover:bg-gray-50
        active:bg-gray-100
      "
    >
      {/* ICON */}

      <div
        className="
          flex-shrink-0

          mt-0.5
          sm:mt-1

          text-gray-700
        "
      >
        {React.cloneElement(
          icon,
          {
            className: `
              w-5
              h-5

              sm:w-6
              sm:h-6
            `,
          }
        )}
      </div>

      {/* CONTENT */}

      <div className="flex-1 min-w-0 pr-1">
        <h3
          className="
            font-medium

            text-sm
            sm:text-base
            md:text-lg

            leading-5
            sm:leading-6

            text-gray-900
          "
        >
          {title}
        </h3>

        <p
          className="
            text-xs
            sm:text-sm
            md:text-base

            leading-5
            sm:leading-6

            text-gray-500

            mt-1
          "
        >
          {description}
        </p>
      </div>

      {/* CHECKBOX */}

      <div
        className="
          flex-shrink-0

          w-6
          h-6

          sm:w-7
          sm:h-7

          rounded-md

          border-2

          flex
          items-center
          justify-center

          transition
        "
        style={{
          backgroundColor:
            checked
              ? ORANGE
              : "#ffffff",

          borderColor:
            checked
              ? ORANGE
              : "#d1d5db",
        }}
      >
        {checked && (
          <Check
            className="
              w-4
              h-4

              sm:w-5
              sm:h-5

              text-white
            "
            strokeWidth={3}
          />
        )}
      </div>
    </button>
  );
}