// src/pages/PermissionsPage.jsx

import React, { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import {
  MapPin,
  Navigation,
  Camera,
  Bell,
  CheckCircle,
  Circle,
} from "lucide-react";

const DEFAULT_PERMISSIONS = {
  location: false,
  background_location: false,
  camera: false,
  notifications: false,
};

export default function PermissionsPage() {
  const navigate = useNavigate();

  const [permissions, setPermissions] = useState(
    DEFAULT_PERMISSIONS
  );

  /* ==========================================
     LOAD SAVED PERMISSIONS
  ========================================== */

  useEffect(() => {
    const savedPermissions = localStorage.getItem(
      "delivery_permissions"
    );

    if (savedPermissions) {
      try {
        setPermissions(JSON.parse(savedPermissions));
      } catch (error) {
        console.error(
          "Invalid saved permissions:",
          error
        );
      }
    }
  }, []);

  /* ==========================================
     TOGGLE PERMISSION
  ========================================== */

  const togglePermission = (permission) => {
    setPermissions((prev) => {
      const updatedPermissions = {
        ...prev,
        [permission]: !prev[permission],
      };

      localStorage.setItem(
        "delivery_permissions",
        JSON.stringify(updatedPermissions)
      );

      return updatedPermissions;
    });
  };

  /* ==========================================
     CONTINUE
  ========================================== */

  const handleContinue = () => {
    localStorage.setItem(
      "delivery_permissions",
      JSON.stringify(permissions)
    );

    localStorage.setItem(
      "permissions_completed",
      "true"
    );

    console.log(
      "Selected permissions:",
      permissions
    );

    navigate("/location-picker");
  };

  /* ==========================================
     UI
  ========================================== */

  return (
    <div
      className="
        fixed
        inset-0
        w-full
        h-[100dvh]

        flex
        flex-col

        overflow-hidden

        bg-gradient-to-br
        from-[#fffaf5]
        via-[#fff5ea]
        to-[#fffaf6]

        text-[#101828]
      "
    >
      {/* ======================================
          MAIN CONTENT
      ====================================== */}

      <div
        className="
          w-full
          max-w-xl
          mx-auto

          flex-1
          min-h-0

          px-4
          sm:px-6
          md:px-8

          pt-5
          sm:pt-7
          md:pt-8

          overflow-hidden
        "
      >
        {/* ====================================
            TOP ICON
        ==================================== */}

        <div
          className="
            flex
            justify-center

            mb-3
            sm:mb-4
            md:mb-5
          "
        >
          <div
            className="
              w-12
              h-12

              sm:w-14
              sm:h-14

              md:w-16
              md:h-16

              rounded-full

              flex
              items-center
              justify-center

              bg-gradient-to-br
              from-[#fff0e4]
              to-[#fff8ed]

              border
              border-[#ffe0c7]

              shadow-[0_6px_18px_rgba(255,107,0,0.08)]
            "
          >
            <MapPin
              className="
                w-6
                h-6

                sm:w-7
                sm:h-7

                md:w-8
                md:h-8

                text-[#ff6b00]
              "
              strokeWidth={2}
            />
          </div>
        </div>

        {/* ====================================
            TITLE
        ==================================== */}

        <h1
          className="
            text-center

            text-lg
            sm:text-xl
            md:text-2xl

            font-bold

            leading-6
            sm:leading-7
            md:leading-8

            text-[#101828]

            px-2
          "
        >
          These permissions help us
          <br />

          <span className="text-[#ff6b00]">
            assign orders accurately
          </span>
        </h1>

        {/* ====================================
            SUBTITLE
        ==================================== */}

        <p
          className="
            text-center

            text-[11px]
            sm:text-xs
            md:text-sm

            leading-4
            sm:leading-5

            text-[#667085]

            mt-2
            sm:mt-2.5

            px-5
          "
        >
          Enable the permissions you need to
          receive and manage delivery orders.
        </p>

        {/* ====================================
            PERMISSION LIST
        ==================================== */}

        <div
          className="
            mt-5
            sm:mt-6
            md:mt-7

            space-y-2.5
            sm:space-y-3
          "
        >
          {/* LOCATION */}

          <PermissionRow
            icon={<Navigation />}
            title="Location"
            description="Used to detect your delivery area and assign nearby orders"
            checked={permissions.location}
            onChange={() =>
              togglePermission("location")
            }
          />

          {/* BACKGROUND LOCATION */}

          <PermissionRow
            icon={<MapPin />}
            title="Background Location"
            description="Required for live tracking and geofence-based order updates"
            checked={
              permissions.background_location
            }
            onChange={() =>
              togglePermission(
                "background_location"
              )
            }
          />

          {/* CAMERA */}

          <PermissionRow
            icon={<Camera />}
            title="Camera"
            description="Used to scan order QR codes and upload delivery proof"
            checked={permissions.camera}
            onChange={() =>
              togglePermission("camera")
            }
          />

          {/* NOTIFICATIONS */}

          <PermissionRow
            icon={<Bell />}
            title="Push Notifications"
            description="Used to notify you about new orders and updates"
            checked={
              permissions.notifications
            }
            onChange={() =>
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
          w-full
          max-w-xl
          mx-auto

          flex-shrink-0

          px-4
          sm:px-6
          md:px-8

          pt-3
          sm:pt-4

          pb-[max(10px,env(safe-area-inset-bottom))]
          sm:pb-4
        "
      >
        <button
          type="button"
          onClick={handleContinue}
          className="
            w-full

            h-[46px]
            sm:h-[50px]
            md:h-[52px]

            px-4

            rounded-xl

            font-bold

            text-sm
            sm:text-base

            text-white

            bg-gradient-to-r
            from-[#ff6b00]
            to-[#ff8a00]

            hover:from-[#f45f00]
            hover:to-[#ff7a00]

            active:scale-[0.99]

            transition-all
            duration-200

            focus:outline-none
            focus:ring-2
            focus:ring-[#ffb066]
            focus:ring-offset-2

            shadow-[0_7px_16px_rgba(255,107,0,0.18)]

            hover:shadow-[0_10px_20px_rgba(255,107,0,0.22)]
          "
        >
          Continue
        </button>
      </div>
    </div>
  );
}

/* ==========================================
   PERMISSION ROW
========================================== */

function PermissionRow({
  icon,
  title,
  description,
  checked,
  onChange,
}) {
  return (
    <div
      className={`
        flex
        items-center

        gap-2.5
        sm:gap-3

        w-full

        rounded-xl
        sm:rounded-2xl

        px-2.5
        py-2.5

        sm:px-3
        sm:py-3

        bg-white

        border

        ${
          checked
            ? "border-[#ffd0ad]"
            : "border-[#eaecf0]"
        }

        shadow-[0_3px_12px_rgba(80,48,20,0.04)]

        transition-all
        duration-200

        hover:border-[#ffc08f]
        hover:shadow-[0_6px_18px_rgba(255,107,0,0.07)]
      `}
    >
      {/* ====================================
          LEFT ICON
      ==================================== */}

      <div
        className={`
          flex-shrink-0

          w-8
          h-8

          sm:w-9
          sm:h-9

          rounded-lg
          sm:rounded-xl

          flex
          items-center
          justify-center

          transition-colors
          duration-200

          ${
            checked
              ? "bg-[#fff0e4] text-[#ff6b00]"
              : "bg-[#f9fafb] text-[#667085]"
          }
        `}
      >
        {React.cloneElement(icon, {
          className: `
            w-4
            h-4

            sm:w-5
            sm:h-5
          `,
          strokeWidth: 2,
        })}
      </div>

      {/* ====================================
          CONTENT
      ==================================== */}

      <div
        className="
          flex-1
          min-w-0

          cursor-pointer
        "
        onClick={onChange}
      >
        <h3
          className={`
            font-bold

            text-xs
            sm:text-sm
            md:text-base

            leading-4
            sm:leading-5

            transition-colors
            duration-200

            ${
              checked
                ? "text-[#101828]"
                : "text-[#344054]"
            }
          `}
        >
          {title}
        </h3>

        <p
          className="
            text-[10px]
            sm:text-xs

            leading-4
            sm:leading-5

            text-[#667085]

            mt-0.5
          "
        >
          {description}
        </p>
      </div>

      {/* ====================================
          CHECKBOX
      ==================================== */}

      <button
        type="button"
        onClick={onChange}
        aria-label={`Toggle ${title}`}
        aria-pressed={checked}
        className="
          flex-shrink-0

          rounded-full

          focus:outline-none

          focus:ring-2
          focus:ring-[#ffb066]
          focus:ring-offset-1

          transition-transform

          active:scale-90
        "
      >
        {checked ? (
          <CheckCircle
            className="
              w-5
              h-5

              sm:w-6
              sm:h-6

              text-[#ff6b00]

              drop-shadow-[0_2px_4px_rgba(255,107,0,0.15)]
            "
            strokeWidth={2.3}
          />
        ) : (
          <Circle
            className="
              w-5
              h-5

              sm:w-6
              sm:h-6

              text-[#d0d5dd]

              hover:text-[#ffb066]

              transition-colors
            "
            strokeWidth={2}
          />
        )}
      </button>
    </div>
  );
}