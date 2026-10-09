import React, { useEffect, useMemo, useState } from "react";
import { useNavigate } from "react-router-dom";

import {
  MapPin,
  Navigation,
  Camera,
  Bell,
  Check,
  ArrowRight,
  Settings,
  Info,
  Store,
  Sparkles,
} from "lucide-react";

import { Capacitor } from "@capacitor/core";
import { App } from "@capacitor/app";
import { Camera as CapacitorCamera } from "@capacitor/camera";
import { Geolocation } from "@capacitor/geolocation";
import { PushNotifications } from "@capacitor/push-notifications";
import { BackgroundGeolocation } from "@capgo/background-geolocation";

const DEFAULT_PERMISSIONS = {
  location: false,
  backgroundLocation: false,
  camera: false,
  notifications: false,
};

export default function PermissionsPage() {
  const navigate = useNavigate();
  const isNative = Capacitor.isNativePlatform();

  const [permissions, setPermissions] = useState(DEFAULT_PERMISSIONS);

  const [loading, setLoading] = useState({
    location: false,
    backgroundLocation: false,
    camera: false,
    notifications: false,
  });

  const [error, setError] = useState("");

  // --------------------------------------------------
  // CHECK ALL PERMISSIONS
  // --------------------------------------------------

  useEffect(() => {
    checkAllPermissions();

    let listener;

    const setupListener = async () => {
      listener = await App.addListener(
        "appStateChange",
        ({ isActive }) => {
          if (isActive) {
            checkAllPermissions();
          }
        }
      );
    };

    setupListener();

    return () => {
      listener?.remove();
    };
  }, []);

  const checkAllPermissions = async () => {
    try {
      if (isNative) {
        await checkNativePermissions();
      } else {
        await checkBrowserPermissions();
      }
    } catch (err) {
      console.error("Permission check error:", err);
    }
  };

  // --------------------------------------------------
  // BROWSER PERMISSIONS
  // --------------------------------------------------

  const checkBrowserPermissions = async () => {
    const current = { ...DEFAULT_PERMISSIONS };

    try {
      if (navigator.permissions) {
        const locationPermission =
          await navigator.permissions.query({
            name: "geolocation",
          });

        current.location =
          locationPermission.state === "granted";
      }
    } catch (err) {
      console.log("Browser location check failed", err);
    }

    try {
      if (navigator.permissions) {
        const cameraPermission =
          await navigator.permissions.query({
            name: "camera",
          });

        current.camera =
          cameraPermission.state === "granted";
      }
    } catch (err) {
      console.log("Browser camera check failed", err);
    }

    try {
      if ("Notification" in window) {
        current.notifications =
          Notification.permission === "granted";
      }
    } catch (err) {
      console.log("Browser notification check failed", err);
    }

    setPermissions(current);
  };

  // --------------------------------------------------
  // NATIVE ANDROID PERMISSIONS
  // --------------------------------------------------

  const checkNativePermissions = async () => {
    const current = { ...DEFAULT_PERMISSIONS };

    // LOCATION
    try {
      const locationResult =
        await Geolocation.checkPermissions();

      console.log(
        "Location permission:",
        locationResult
      );

      current.location =
        locationResult.location === "granted";
    } catch (err) {
      console.error(
        "Location permission check failed:",
        err
      );
    }

    // CAMERA
    try {
      const cameraResult =
        await CapacitorCamera.checkPermissions();

      console.log(
        "Camera permission:",
        cameraResult
      );

      current.camera =
        cameraResult.camera === "granted";
    } catch (err) {
      console.error(
        "Camera permission check failed:",
        err
      );
    }

    // NOTIFICATIONS
    try {
      const notificationResult =
        await PushNotifications.checkPermissions();

      console.log(
        "Notification permission:",
        notificationResult
      );

      current.notifications =
        notificationResult.receive === "granted";
    } catch (err) {
      console.error(
        "Notification permission check failed:",
        err
      );
    }

    setPermissions(current);
  };

  // --------------------------------------------------
  // LOCATION PERMISSION
  // --------------------------------------------------

  const requestLocationPermission = async () => {
    setError("");

    setLoading((prev) => ({
      ...prev,
      location: true,
    }));

    try {
      console.log(
        "Requesting location permission..."
      );

      // ----------------------------------------------
      // ANDROID / NATIVE
      // ----------------------------------------------

      if (isNative) {
        const current =
          await Geolocation.checkPermissions();

        console.log(
          "Current location permission:",
          current
        );

        // Already granted
        if (current.location === "granted") {
          console.log(
            "Location permission already granted"
          );

          setPermissions((prev) => ({
            ...prev,
            location: true,
          }));

          return;
        }

        // Request permission
        const result =
          await Geolocation.requestPermissions();

        console.log(
          "Location permission result:",
          result
        );

        if (result.location === "granted") {
          setPermissions((prev) => ({
            ...prev,
            location: true,
          }));

          setError("");

          console.log(
            "Location permission granted"
          );
        } else {
          setPermissions((prev) => ({
            ...prev,
            location: false,
          }));

          setError(
            "Location permission was not granted. Please allow location access in Android Settings."
          );
        }

        return;
      }

      // ----------------------------------------------
      // BROWSER
      // ----------------------------------------------

      navigator.geolocation.getCurrentPosition(
        (position) => {
          console.log(
            "Browser location:",
            position.coords.latitude,
            position.coords.longitude
          );

          setPermissions((prev) => ({
            ...prev,
            location: true,
          }));

          setError("");
        },
        (err) => {
          console.error(
            "Browser location error:",
            err
          );

          setError(
            "Please allow location access in your browser."
          );
        }
      );
    } catch (err) {
      console.error(
        "Location permission error:",
        err
      );

      setError(
        "Unable to request location permission. Please check Android Settings."
      );
    } finally {
      setLoading((prev) => ({
        ...prev,
        location: false,
      }));
    }
  };

  // --------------------------------------------------
  // BACKGROUND LOCATION
  // --------------------------------------------------

  const requestBackgroundLocation = async () => {
    setError("");

    if (!permissions.location) {
      setError(
        "Please allow Location Access first."
      );

      return;
    }

    setLoading((prev) => ({
      ...prev,
      backgroundLocation: true,
    }));

    try {
      if (!isNative) {
        setError(
          "Background location is available in the Android app."
        );

        return;
      }

      console.log(
        "Starting background location..."
      );

      let locationReceived = false;

      await BackgroundGeolocation.start(
        {
          backgroundMessage:
            "Tracking deliveries for Zatpatt.",

          backgroundTitle:
            "Zatpatt Delivery Tracking",

          requestPermissions: true,
        },

        (location) => {
          console.log(
            "Background location received:",
            location
          );

          locationReceived = true;
        }
      );

      await new Promise((resolve) =>
        setTimeout(resolve, 1500)
      );

      if (locationReceived) {
        setPermissions((prev) => ({
          ...prev,
          backgroundLocation: true,
        }));

        setError("");
      } else {
        setError(
          "Please allow 'Allow all the time' location access in Android Settings."
        );
      }
    } catch (err) {
      console.error(
        "Background location error:",
        err
      );

      setError(
        "Please allow 'All the time' location access in Android Settings."
      );
    } finally {
      setLoading((prev) => ({
        ...prev,
        backgroundLocation: false,
      }));
    }
  };

  // --------------------------------------------------
  // CAMERA
  // --------------------------------------------------

  const requestCameraPermission = async () => {
    setError("");

    setLoading((prev) => ({
      ...prev,
      camera: true,
    }));

    try {
      if (isNative) {
        const result =
          await CapacitorCamera.requestPermissions({
            permissions: ["camera"],
          });

        console.log(
          "Camera permission result:",
          result
        );

        if (result.camera === "granted") {
          setPermissions((prev) => ({
            ...prev,
            camera: true,
          }));
        } else {
          setError(
            "Camera permission denied. Please enable camera access in Settings."
          );
        }

        return;
      }

      const stream =
        await navigator.mediaDevices.getUserMedia({
          video: true,
        });

      stream
        .getTracks()
        .forEach((track) => track.stop());

      setPermissions((prev) => ({
        ...prev,
        camera: true,
      }));
    } catch (err) {
      console.error(
        "Camera permission error:",
        err
      );

      setError(
        "Please allow camera access in browser/device settings."
      );
    } finally {
      setLoading((prev) => ({
        ...prev,
        camera: false,
      }));
    }
  };

  // --------------------------------------------------
  // NOTIFICATIONS
  // --------------------------------------------------

  const requestNotificationPermission = async () => {
    setError("");

    setLoading((prev) => ({
      ...prev,
      notifications: true,
    }));

    try {
      if (isNative) {
        const result =
          await PushNotifications.requestPermissions();

        console.log(
          "Notification permission:",
          result
        );

        if (result.receive === "granted") {
          setPermissions((prev) => ({
            ...prev,
            notifications: true,
          }));

          try {
            await PushNotifications.register();
          } catch (registerError) {
            console.error(
              "Notification registration error:",
              registerError
            );
          }

          return;
        }

        setError(
          "Notification permission denied. Please enable notifications in Settings."
        );

        return;
      }

      const result =
        await Notification.requestPermission();

      if (result === "granted") {
        setPermissions((prev) => ({
          ...prev,
          notifications: true,
        }));
      } else {
        setError(
          "Please allow notifications in browser settings."
        );
      }
    } catch (err) {
      console.error(
        "Notification permission error:",
        err
      );

      setError(
        "Unable to request notification permission."
      );
    } finally {
      setLoading((prev) => ({
        ...prev,
        notifications: false,
      }));
    }
  };

  // --------------------------------------------------
  // HANDLE PERMISSION CLICK
  // --------------------------------------------------

  const handlePermissionClick = async (key) => {
    if (loading[key]) {
      return;
    }

    console.log(
      "Permission clicked:",
      key
    );

    /*
      IMPORTANT:

      Do NOT simply turn the UI off when permission
      is already granted.

      The Android permission must be controlled by
      Android itself.
    */

    if (key === "location") {
      await requestLocationPermission();
      return;
    }

    if (key === "backgroundLocation") {
      await requestBackgroundLocation();
      return;
    }

    if (key === "camera") {
      await requestCameraPermission();
      return;
    }

    if (key === "notifications") {
      await requestNotificationPermission();
      return;
    }
  };

  // --------------------------------------------------
  // PERMISSION LIST
  // --------------------------------------------------

  const permissionItems = useMemo(
    () => [
      {
        key: "location",
        icon: Navigation,
        title: "Location Access",
        label: "Essential",
        description:
          "Allow the app to access your current location.",
      },
      {
        key: "backgroundLocation",
        icon: MapPin,
        title: "Background Location",
        label: "Recommended",
        description:
          "Allow location tracking while the app is in the background.",
      },
      {
        key: "camera",
        icon: Camera,
        title: "Camera Access",
        label: "Essential",
        description:
          "Required to capture documents and photos.",
      },
      {
        key: "notifications",
        icon: Bell,
        title: "Push Notifications",
        label: "Essential",
        description:
          "Receive important order and delivery updates.",
      },
    ],
    []
  );

  // --------------------------------------------------
  // REQUIRED PERMISSIONS
  // --------------------------------------------------

  const grantedCount = [
    permissions.location,
    permissions.camera,
    permissions.notifications,
  ].filter(Boolean).length;

  const allRequiredGranted =
    grantedCount === 3;

  // --------------------------------------------------
  // OPEN ANDROID SETTINGS
  // --------------------------------------------------

  const openSettings = async () => {
    try {
      if (isNative) {
        await BackgroundGeolocation.openSettings();
      }
    } catch (err) {
      console.error(
        "Unable to open settings:",
        err
      );
    }
  };

  // --------------------------------------------------
  // UI
  // --------------------------------------------------

  return (
    <div
      className="min-h-screen w-full flex flex-col justify-between items-center relative overflow-x-hidden p-4 sm:p-6 md:p-8"
      style={{
        backgroundColor: "#FAF6F0",

        backgroundImage: `
          radial-gradient(
            circle at 10% 15%,
            rgba(255, 230, 205, 0.65) 0%,
            transparent 35%
          ),
          radial-gradient(
            circle at 92% 25%,
            rgba(255, 226, 195, 0.7) 0%,
            transparent 32%
          ),
          radial-gradient(
            circle at 85% 85%,
            rgba(255, 234, 212, 0.5) 0%,
            transparent 30%
          )
        `,
      }}
    >
      {/* Floating badges */}

      <div className="absolute top-12 left-6 sm:left-14 w-10 h-10 rounded-xl bg-white/90 backdrop-blur-sm border border-[#FFE7D3] shadow-[0_6px_20px_rgba(255,102,0,0.06)] flex items-center justify-center pointer-events-none hidden xs:flex">
        <Store size={18} color="#FF6600" />
      </div>

      <div className="absolute top-20 right-8 sm:right-20 w-9 h-9 rounded-xl bg-white/90 backdrop-blur-sm border border-[#FFE7D3] shadow-[0_6px_20px_rgba(255,102,0,0.06)] flex items-center justify-center pointer-events-none hidden sm:flex">
        <Sparkles size={17} color="#FFA800" />
      </div>

      <div className="w-full h-2" />

      {/* Main container */}

      <div className="w-full max-w-[620px] my-auto z-10">
        <div className="bg-white rounded-[26px] sm:rounded-[30px] p-6 sm:p-8 md:p-9 shadow-[0_20px_60px_rgba(100,50,15,0.07)] border border-[#F3E7DC]">

          {/* Header */}

          <div className="flex items-center justify-between pb-5 border-b border-[#F3E7DC]">
            <div className="flex items-center gap-3">

              <div
                className="w-10 h-10 rounded-xl flex items-center justify-center shadow-md"
                style={{
                  background:
                    "linear-gradient(135deg, #FF6000, #FFA600)",
                }}
              >
                <Settings
                  size={20}
                  color="white"
                />
              </div>

              <div>
                <span className="text-[10px] font-extrabold uppercase tracking-[1.4px] text-[#FF6600]">
                  ZATPATT
                </span>

                <h3 className="text-sm font-bold text-[#2E1A0F]">
                  App Permissions
                </h3>
              </div>

            </div>
          </div>

          {/* Heading */}

          <div className="mt-6 mb-5">
            <h1 className="text-[22px] sm:text-[24px] font-black text-[#2E1A0F] leading-tight">
              Let's get you ready to deliver.
            </h1>

            <p className="text-xs sm:text-sm text-[#7C6657] mt-1.5">
              Allow the following permissions to ensure
              seamless order dispatch and live tracking.
            </p>
          </div>

          {/* Permission list */}

          <div className="space-y-3">

            {permissionItems.map((item) => {
              const Icon = item.icon;

              const granted =
                permissions[item.key];

              const isItemLoading =
                loading[item.key];

              return (
                <button
                  key={item.key}
                  type="button"
                  onClick={() =>
                    handlePermissionClick(item.key)
                  }
                  disabled={isItemLoading}
                  className="w-full text-left p-3.5 sm:p-4 rounded-2xl border transition-all flex items-center gap-3.5 relative overflow-hidden"
                  style={{
                    backgroundColor: granted
                      ? "#FFFCF9"
                      : "#FFFFFF",

                    borderColor: granted
                      ? "#FED7AA"
                      : "#E5E7EB",

                    boxShadow: granted
                      ? "0 4px 18px rgba(255,102,0,0.06)"
                      : "none",
                  }}
                >

                  {/* Orange active bar */}

                  {granted && (
                    <div className="absolute left-0 top-0 bottom-0 w-1 bg-[#FF6600]" />
                  )}

                  {/* Icon */}

                  <div
                    className="w-11 h-11 rounded-xl flex items-center justify-center shrink-0 border"
                    style={{
                      backgroundColor: granted
                        ? "#FFF5EC"
                        : "#FAF6F0",

                      borderColor: granted
                        ? "#FED7AA"
                        : "#F3E7DC",
                    }}
                  >
                    <Icon
                      size={20}
                      color={
                        granted
                          ? "#FF6600"
                          : "#7C6657"
                      }
                      strokeWidth={2}
                    />
                  </div>

                  {/* Information */}

                  <div className="flex-1 min-w-0">

                    <div className="flex items-center gap-2">

                      <h4 className="text-xs sm:text-sm font-bold text-[#2E1A0F] truncate">
                        {item.title}
                      </h4>

                      <span
                        className="px-2 py-0.5 rounded-md text-[9px] font-bold uppercase tracking-wider"
                        style={{
                          backgroundColor:
                            item.label === "Essential"
                              ? "#FFF5EC"
                              : "#F3F4F6",

                          color:
                            item.label === "Essential"
                              ? "#FF6600"
                              : "#6B7280",
                        }}
                      >
                        {item.label}
                      </span>

                    </div>

                    <p className="text-[11px] text-[#7C6657] mt-0.5 line-clamp-1">
                      {item.description}
                    </p>

                  </div>

                  {/* Status */}

                  <div
                    className="w-8 h-8 rounded-full flex items-center justify-center shrink-0 transition-all"
                    style={{
                      backgroundColor: granted
                        ? "#16A34A"
                        : "#F3F4F6",
                    }}
                  >

                    {isItemLoading ? (
                      <div className="w-4 h-4 border-2 border-orange-500 border-t-transparent rounded-full animate-spin" />
                    ) : granted ? (
                      <Check
                        size={16}
                        color="white"
                        strokeWidth={3}
                      />
                    ) : (
                      <ArrowRight
                        size={15}
                        color="#9CA3AF"
                      />
                    )}

                  </div>

                </button>
              );
            })}

          </div>

          {/* Error */}

          {error && (
            <div className="mt-4 p-3.5 rounded-xl bg-red-50 border border-red-200 flex items-start gap-2.5">

              <Info
                size={16}
                color="#DC2626"
                className="shrink-0 mt-0.5"
              />

              <div className="flex-1 text-xs text-red-600 font-medium leading-relaxed">

                {error}

                {isNative && (
                  <button
                    type="button"
                    onClick={openSettings}
                    className="mt-1.5 flex items-center gap-1 px-3 py-1 rounded-lg bg-[#FF6600] text-white text-[10px] font-bold"
                  >
                    <Settings size={12} />
                    Open Settings
                  </button>
                )}

              </div>

            </div>
          )}

          {/* Continue */}

          <button
            type="button"
            onClick={() => {

              if (allRequiredGranted) {
                navigate("/location-picker");
              } else {
                setError(
                  "Please grant all required permissions to continue."
                );
              }

            }}
            disabled={!allRequiredGranted}
            className="group relative mt-6 w-full h-[50px] rounded-xl font-bold text-sm flex items-center justify-center gap-2 transition-all duration-200 disabled:cursor-not-allowed"
            style={{
              background: allRequiredGranted
                ? "linear-gradient(90deg, #FF6200 0%, #FFA800 100%)"
                : "#E5E7EB",

              color: allRequiredGranted
                ? "#FFFFFF"
                : "#9CA3AF",

              boxShadow: allRequiredGranted
                ? "0 10px 24px rgba(255,98,0,0.24)"
                : "none",
            }}
          >

            <span>
              {allRequiredGranted
                ? "Continue to Location Picker"
                : `Allow ${
                    3 - grantedCount
                  } More Required`}
            </span>

            <ArrowRight
              size={16}
              className="transition-transform duration-200 group-hover:translate-x-1"
            />

          </button>

        </div>
      </div>

      {/* Footer */}

      <div className="relative mt-8 z-10 flex justify-center">

        <div className="bg-[#FFEADA]/70 backdrop-blur-md px-8 py-2 rounded-full border border-[#FED7AA]/60 flex items-center gap-2 text-[10px] sm:text-[11px] font-medium text-[#7C6657]">

          <span>
            © {new Date().getFullYear()} Zatpatt
          </span>

          <span>•</span>

          <span>
            Delivery Partner Portal
          </span>

        </div>

      </div>

    </div>
  );
}