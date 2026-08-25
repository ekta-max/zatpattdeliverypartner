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
  ShieldCheck,
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

  useEffect(() => {
    checkAllPermissions();
    let listener;
    const setupListener = async () => {
      listener = await App.addListener("appStateChange", ({ isActive }) => {
        if (isActive) checkAllPermissions();
      });
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

  const checkBrowserPermissions = async () => {
    const current = { ...DEFAULT_PERMISSIONS };
    try {
      if (navigator.permissions) {
        const p = await navigator.permissions.query({ name: "geolocation" });
        current.location = p.state === "granted";
      }
    } catch {}
    try {
      if (navigator.permissions) {
        const p = await navigator.permissions.query({ name: "camera" });
        current.camera = p.state === "granted";
      }
    } catch {}
    try {
      if ("Notification" in window) {
        current.notifications = Notification.permission === "granted";
      }
    } catch {}
    setPermissions(current);
  };

  const checkNativePermissions = async () => {
    const current = { ...DEFAULT_PERMISSIONS };
    try {
      const res = await Geolocation.checkPermissions();
      current.location = res.location === "granted";
    } catch {}
    try {
      const res = await CapacitorCamera.checkPermissions();
      current.camera = res.camera === "granted";
    } catch {}
    try {
      const res = await PushNotifications.checkPermissions();
      current.notifications = res.receive === "granted";
    } catch {}
    setPermissions(current);
  };

  /* Requests */
  const requestLocationPermission = async () => {
    setError("");
    setLoading((p) => ({ ...p, location: true }));
    try {
      if (isNative) {
        const res = await Geolocation.requestPermissions();
        if (res.location === "granted") {
          setPermissions((p) => ({ ...p, location: true }));
        } else {
          setError("Location access is required. Enable it in Settings.");
        }
        return;
      }
      navigator.geolocation.getCurrentPosition(
        () => setPermissions((p) => ({ ...p, location: true })),
        () => setError("Please allow location access in your browser.")
      );
    } catch {
      setError("Unable to request location permission.");
    } finally {
      setLoading((p) => ({ ...p, location: false }));
    }
  };

  const requestBackgroundLocation = async () => {
    setError("");
    if (!permissions.location) {
      setError("Please allow Foreground Location first.");
      return;
    }
    setLoading((p) => ({ ...p, backgroundLocation: true }));
    try {
      if (!isNative) {
        setError("Background location is available in the Android app.");
        return;
      }
      let granted = false;
      await BackgroundGeolocation.start(
        {
          backgroundMessage: "Tracking deliveries for Zatpatt.",
          backgroundTitle: "Zatpatt Delivery Tracking",
          requestPermissions: true,
        },
        (loc) => {
          if (loc) granted = true;
        }
      );
      await new Promise((r) => setTimeout(r, 1500));
      if (granted) {
        setPermissions((p) => ({ ...p, backgroundLocation: true }));
      } else {
        setError("Please select 'Allow all the time' in Android Settings.");
      }
    } catch {
      setError("Please allow 'All the time' location access in Settings.");
    } finally {
      setLoading((p) => ({ ...p, backgroundLocation: false }));
    }
  };

  const requestCameraPermission = async () => {
    setError("");
    setLoading((p) => ({ ...p, camera: true }));
    try {
      if (isNative) {
        const res = await CapacitorCamera.requestPermissions({ permissions: ["camera"] });
        if (res.camera === "granted") {
          setPermissions((p) => ({ ...p, camera: true }));
        } else {
          setError("Camera permission denied. Enable in Settings.");
        }
        return;
      }
      const stream = await navigator.mediaDevices.getUserMedia({ video: true });
      stream.getTracks().forEach((t) => t.stop());
      setPermissions((p) => ({ ...p, camera: true }));
    } catch {
      setError("Please allow camera access in browser settings.");
    } finally {
      setLoading((p) => ({ ...p, camera: false }));
    }
  };

  const requestNotificationPermission = async () => {
    setError("");
    setLoading((p) => ({ ...p, notifications: true }));
    try {
      if (isNative) {
        const res = await PushNotifications.requestPermissions();
        if (res.receive === "granted") {
          setPermissions((p) => ({ ...p, notifications: true }));
          try {
            await PushNotifications.register();
          } catch {}
          return;
        }
        setError("Notification permission denied. Enable in Settings.");
        return;
      }
      const res = await Notification.requestPermission();
      if (res === "granted") {
        setPermissions((p) => ({ ...p, notifications: true }));
      } else {
        setError("Please allow notifications in browser site settings.");
      }
    } catch {
      setError("Unable to request notification permission.");
    } finally {
      setLoading((p) => ({ ...p, notifications: false }));
    }
  };

  const handlePermissionClick = async (key) => {
    if (loading[key]) return;

    // Toggle off if already granted — UI-only, does not revoke the actual OS permission
    if (permissions[key]) {
      setPermissions((p) => ({ ...p, [key]: false }));
      return;
    }

    if (key === "location") await requestLocationPermission();
    if (key === "backgroundLocation") await requestBackgroundLocation();
    if (key === "camera") await requestCameraPermission();
    if (key === "notifications") await requestNotificationPermission();
  };

  const permissionItems = useMemo(
    () => [
      {
        key: "location",
        icon: Navigation,
        title: "Location Access",
        label: "Essential",
      },
      {
        key: "backgroundLocation",
        icon: MapPin,
        title: "Background Location",
        label: "Recommended",
      },
      {
        key: "camera",
        icon: Camera,
        title: "Camera Access",
        label: "Essential",
      },
      {
        key: "notifications",
        icon: Bell,
        title: "Push Notifications",
        label: "Essential",
      },
    ],
    []
  );

  const grantedCount = [
    permissions.location,
    permissions.camera,
    permissions.notifications,
  ].filter(Boolean).length;

  const allRequiredGranted = grantedCount === 3;

  return (
    <div
      className="min-h-screen w-full flex flex-col justify-between items-center relative overflow-x-hidden p-4 sm:p-6 md:p-8"
      style={{
        backgroundColor: "#FAF6F0",
        backgroundImage: `
          radial-gradient(circle at 10% 15%, rgba(255, 230, 205, 0.65) 0%, transparent 35%),
          radial-gradient(circle at 92% 25%, rgba(255, 226, 195, 0.7) 0%, transparent 32%),
          radial-gradient(circle at 85% 85%, rgba(255, 234, 212, 0.5) 0%, transparent 30%)
        `,
      }}
    >
      {/* Floating Badges */}
      <div className="absolute top-12 left-6 sm:left-14 w-10 h-10 rounded-xl bg-white/90 backdrop-blur-sm border border-[#FFE7D3] shadow-[0_6px_20px_rgba(255,102,0,0.06)] flex items-center justify-center pointer-events-none hidden xs:flex">
        <Store size={18} color="#FF6600" />
      </div>

      <div className="absolute top-20 right-8 sm:right-20 w-9 h-9 rounded-xl bg-white/90 backdrop-blur-sm border border-[#FFE7D3] shadow-[0_6px_20px_rgba(255,102,0,0.06)] flex items-center justify-center pointer-events-none hidden sm:flex">
        <Sparkles size={17} color="#FFA800" />
      </div>

      <div className="w-full h-2" />

      {/* Main Container */}
      <div className="w-full max-w-[620px] my-auto z-10">
        <div className="bg-white rounded-[26px] sm:rounded-[30px] p-6 sm:p-8 md:p-9 shadow-[0_20px_60px_rgba(100,50,15,0.07)] border border-[#F3E7DC]">
          
          {/* Header Brand Badge */}
          <div className="flex items-center justify-between pb-5 border-b border-[#F3E7DC]">
            <div className="flex items-center gap-3">
              <div
                className="w-10 h-10 rounded-xl flex items-center justify-center shadow-md"
                style={{
                  background: "linear-gradient(135deg, #FF6000, #FFA600)",
                }}
              >
                <ShieldCheck size={20} color="white" />
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
              Allow the following permissions to ensure seamless order dispatch and live tracking.
            </p>
          </div>

          {/* Permission List */}
          <div className="space-y-3">
            {permissionItems.map((item) => {
              const Icon = item.icon;
              const granted = permissions[item.key];
              const isItemLoading = loading[item.key];

              return (
                <button
                  key={item.key}
                  type="button"
                  onClick={() => handlePermissionClick(item.key)}
                  disabled={isItemLoading}
                  className="w-full text-left p-3.5 sm:p-4 rounded-2xl border transition-all flex items-center gap-3.5 relative overflow-hidden"
                  style={{
                    backgroundColor: granted ? "#FFFCF9" : "#FFFFFF",
                    borderColor: granted ? "#FED7AA" : "#E5E7EB",
                    boxShadow: granted ? "0 4px 18px rgba(255,102,0,0.06)" : "none",
                  }}
                >
                  {/* Left Active Orange Bar */}
                  {granted && (
                    <div className="absolute left-0 top-0 bottom-0 w-1 bg-[#FF6600]" />
                  )}

                  {/* Icon Box */}
                  <div
                    className="w-11 h-11 rounded-xl flex items-center justify-center shrink-0 border"
                    style={{
                      backgroundColor: granted ? "#FFF5EC" : "#FAF6F0",
                      borderColor: granted ? "#FED7AA" : "#F3E7DC",
                    }}
                  >
                    <Icon
                      size={20}
                      color={granted ? "#FF6600" : "#7C6657"}
                      strokeWidth={2}
                    />
                  </div>

                  {/* Info */}
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2">
                      <h4 className="text-xs sm:text-sm font-bold text-[#2E1A0F] truncate">
                        {item.title}
                      </h4>
                      <span
                        className="px-2 py-0.5 rounded-md text-[9px] font-bold uppercase tracking-wider"
                        style={{
                          backgroundColor:
                            item.label === "Essential" ? "#FFF5EC" : "#F3F4F6",
                          color:
                            item.label === "Essential" ? "#FF6600" : "#6B7280",
                        }}
                      >
                        {item.label}
                      </span>
                    </div>
                    <p className="text-[11px] text-[#7C6657] mt-0.5 line-clamp-1">
                      {item.description}
                    </p>
                  </div>

                  {/* Status Indicator */}
                  <div
                    className="w-8 h-8 rounded-full flex items-center justify-center shrink-0 transition-all"
                    style={{
                      backgroundColor: granted ? "#16A34A" : "#F3F4F6",
                    }}
                  >
                    {isItemLoading ? (
                      <div className="w-4 h-4 border-2 border-orange-500 border-t-transparent rounded-full animate-spin" />
                    ) : granted ? (
                      <Check size={16} color="white" strokeWidth={3} />
                    ) : (
                      <ArrowRight size={15} color="#9CA3AF" />
                    )}
                  </div>
                </button>
              );
            })}
          </div>

          {/* Error Alert */}
          {error && (
            <div className="mt-4 p-3.5 rounded-xl bg-red-50 border border-red-200 flex items-start gap-2.5">
              <Info size={16} color="#DC2626" className="shrink-0 mt-0.5" />
              <div className="flex-1 text-xs text-red-600 font-medium leading-relaxed">
                {error}
                {error.includes("Settings") && (
                  <button
                    type="button"
                    onClick={() => {
                      if (isNative) BackgroundGeolocation.openSettings();
                    }}
                    className="mt-1.5 flex items-center gap-1 px-3 py-1 rounded-lg bg-[#FF6600] text-white text-[10px] font-bold"
                  >
                    <Settings size={12} />
                    Open Settings
                  </button>
                )}
              </div>
            </div>
          )}

          {/* Continue Button */}
          <button
            type="button"
            onClick={() => {
              if (allRequiredGranted) navigate("/location-picker");
              else setError("Please grant all required permissions to continue.");
            }}
            disabled={!allRequiredGranted}
            className="group relative mt-6 w-full h-[50px] rounded-xl font-bold text-sm flex items-center justify-center gap-2 transition-all duration-200 disabled:cursor-not-allowed"
            style={{
              background: allRequiredGranted
                ? "linear-gradient(90deg, #FF6200 0%, #FFA800 100%)"
                : "#E5E7EB",
              color: allRequiredGranted ? "#FFFFFF" : "#9CA3AF",
              boxShadow: allRequiredGranted
                ? "0 10px 24px rgba(255,98,0,0.24)"
                : "none",
            }}
          >
            <span>
              {allRequiredGranted
                ? "Continue to Location Picker"
                : `Allow ${3 - grantedCount} More Required`}
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
          <span>© {new Date().getFullYear()} Zatpatt</span>
          <span>•</span>
          <span>Delivery Partner Portal</span>
        </div>
      </div>
    </div>
  );
}
