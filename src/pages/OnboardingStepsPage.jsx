// src/pages/OnboardingStepsPage.jsx

import React, { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import {
  User,
  Briefcase,
  FileText,
  HelpCircle,
  Lock,
  CheckCircle2,
  ChevronRight,
  Sparkles,
  Store,
} from "lucide-react";
import { DEV_MODE } from "../config/appConfig";

const DEFAULT_PROGRESS = {
  work_details: "pending",
  personal_details: "pending",
  kit_ordered: false,
};

export default function OnboardingStepsPage() {
  const navigate = useNavigate();

  const [progress, setProgress] = useState(null);

  useEffect(() => {
    initializeOnboarding();
  }, []);

  const initializeOnboarding = () => {
    try {
      /*
       * =========================================================
       * 1. GET CURRENT LOGGED-IN USER
       * =========================================================
       */

      const storedUser = localStorage.getItem("user");

      let user = null;

      try {
        user = storedUser ? JSON.parse(storedUser) : null;
      } catch (error) {
        console.error("Invalid user data in localStorage");
        user = null;
      }

      /*
       * =========================================================
       * 2. GET CURRENT MOBILE NUMBER
       *
       * We check multiple possible fields because your API
       * response may use mobile / phone / mobile_number.
       * =========================================================
       */

      const currentMobile =
        user?.mobile ||
        user?.mobile_number ||
        user?.phone ||
        user?.phone_number ||
        localStorage.getItem("login_mobile");

      /*
       * Normalize mobile number.
       *
       * Example:
       * 8898238279
       * +918898238279
       * 08898238279
       *
       * will be converted to comparable digits.
       */

      const normalizeMobile = (mobile) => {
        if (!mobile) return "";

        let value = String(mobile).replace(/\D/g, "");

        // Remove India country code
        if (value.length === 12 && value.startsWith("91")) {
          value = value.substring(2);
        }

        // Remove leading 0
        if (value.length === 11 && value.startsWith("0")) {
          value = value.substring(1);
        }

        return value;
      };

      const normalizedCurrentMobile = normalizeMobile(currentMobile);

      /*
       * =========================================================
       * 3. GET MOBILE NUMBER WHICH OWNED THE SAVED ONBOARDING
       * =========================================================
       */

      const savedOnboardingMobile =
        localStorage.getItem("onboarding_mobile");

      const normalizedSavedMobile =
        normalizeMobile(savedOnboardingMobile);

      /*
       * =========================================================
       * 4. CHECK WHETHER THIS IS THE SAME USER
       * =========================================================
       */

      let onboardingProgress = null;

      if (
        normalizedCurrentMobile &&
        normalizedSavedMobile &&
        normalizedCurrentMobile !== normalizedSavedMobile
      ) {
        /*
         * DIFFERENT USER
         *
         * Example:
         *
         * Old user:
         * 8898238279
         *
         * New user:
         * 9876543210
         *
         * Remove previous user's onboarding progress.
         */

        console.log(
          "Different user detected. Clearing previous onboarding progress."
        );

        localStorage.removeItem("onboarding_progress");

        /*
         * Store the new user's mobile number.
         */

        localStorage.setItem(
          "onboarding_mobile",
          normalizedCurrentMobile
        );

        /*
         * Start fresh onboarding.
         */

        onboardingProgress = {
          ...DEFAULT_PROGRESS,
        };

        localStorage.setItem(
          "onboarding_progress",
          JSON.stringify(onboardingProgress)
        );
      } else {
        /*
         * =======================================================
         * SAME USER
         * =======================================================
         *
         * Keep the existing onboarding progress.
         */

        if (normalizedCurrentMobile) {
          /*
           * First time setting onboarding mobile.
           */

          if (!normalizedSavedMobile) {
            localStorage.setItem(
              "onboarding_mobile",
              normalizedCurrentMobile
            );
          }
        }

        const savedProgress = localStorage.getItem(
          "onboarding_progress"
        );

        if (savedProgress) {
          try {
            onboardingProgress = JSON.parse(savedProgress);
          } catch (error) {
            console.error(
              "Invalid onboarding progress. Resetting."
            );

            onboardingProgress = {
              ...DEFAULT_PROGRESS,
            };

            localStorage.setItem(
              "onboarding_progress",
              JSON.stringify(onboardingProgress)
            );
          }
        } else {
          /*
           * No previous progress.
           * Start fresh.
           */

          onboardingProgress = {
            ...DEFAULT_PROGRESS,
          };

          localStorage.setItem(
            "onboarding_progress",
            JSON.stringify(onboardingProgress)
          );
        }
      }

      /*
       * =========================================================
       * 5. SAFETY CHECK
       * =========================================================
       */

      if (!onboardingProgress) {
        onboardingProgress = {
          ...DEFAULT_PROGRESS,
        };
      }

      /*
       * =========================================================
       * 6. IF KIT IS ALREADY ORDERED
       * =========================================================
       */

      if (!DEV_MODE && onboardingProgress.kit_ordered) {
        navigate("/verification-pending", {
          replace: true,
        });

        return;
      }

      /*
       * =========================================================
       * 7. SET PAGE STATE
       * =========================================================
       */

      setProgress(onboardingProgress);
    } catch (error) {
      console.error(
        "Failed to initialize onboarding:",
        error
      );

      const freshProgress = {
        ...DEFAULT_PROGRESS,
      };

      localStorage.setItem(
        "onboarding_progress",
        JSON.stringify(freshProgress)
      );

      setProgress(freshProgress);
    }
  };

  /*
   * ===========================================================
   * LOADING
   * ===========================================================
   */

  if (!progress) {
    return (
      <div
        className="min-h-screen flex items-center justify-center"
        style={{
          backgroundColor: "#FAF6F0",
        }}
      >
        <div className="flex items-center gap-2 text-sm font-bold text-[#FF6600]">
          <div className="w-5 h-5 border-2 border-[#FF6600] border-t-transparent rounded-full animate-spin" />

          Loading your onboarding...
        </div>
      </div>
    );
  }

  /*
   * ===========================================================
   * STEP STATUS
   * ===========================================================
   */

  const workDone =
    progress.work_details === "completed";

  const personalDone =
    progress.personal_details === "completed";

  const kitDone =
    progress.kit_ordered === true;

  const completedCount = [
    workDone,
    personalDone,
    kitDone,
  ].filter(Boolean).length;

  /*
   * ===========================================================
   * UI
   * ===========================================================
   */

  return (
    <div
      className="
        min-h-screen
        w-full
        flex
        flex-col
        justify-between
        items-center
        relative
        overflow-x-hidden
        p-3.5
        sm:p-5
        md:p-7
        select-none
      "
      style={{
        backgroundColor: "#FAF6F0",

        backgroundImage: `
          radial-gradient(
            circle at 10% 15%,
            rgba(255, 230, 205, 0.7) 0%,
            transparent 40%
          ),

          radial-gradient(
            circle at 92% 25%,
            rgba(255, 226, 195, 0.75) 0%,
            transparent 38%
          ),

          radial-gradient(
            circle at 85% 85%,
            rgba(255, 234, 212, 0.55) 0%,
            transparent 35%
          )
        `,
      }}
    >
      {/* =====================================================
          BACKGROUND FLOATING BADGES
      ===================================================== */}

      <div
        className="
          absolute
          top-10
          left-8
          w-11
          h-11
          rounded-2xl
          bg-white/90
          backdrop-blur-md
          border
          border-[#FFE7D3]
          shadow-sm
          flex
          items-center
          justify-center
          pointer-events-none
          hidden
          sm:flex
        "
      >
        <Store
          size={20}
          color="#FF6600"
        />
      </div>

      <div
        className="
          absolute
          top-14
          right-14
          w-10
          h-10
          rounded-2xl
          bg-white/90
          backdrop-blur-md
          border
          border-[#FFE7D3]
          shadow-sm
          flex
          items-center
          justify-center
          pointer-events-none
          hidden
          sm:flex
        "
      >
        <Sparkles
          size={18}
          color="#FFA800"
        />
      </div>

      {/* =====================================================
          MAIN CONTAINER
      ===================================================== */}

      <div className="w-full max-w-[760px] my-auto z-10">

        {/* ===================================================
            HERO BANNER
        =================================================== */}

        <div
          className="
            rounded-t-[26px]
            sm:rounded-t-[32px]
            p-6
            sm:p-8
            relative
            overflow-hidden
            text-white
          "
          style={{
            background:
              "linear-gradient(155deg, #FF6000 0%, #FF7A00 45%, #FFA600 100%)",
          }}
        >
          <div className="flex items-center justify-between">

            <div
              className="
                inline-flex
                items-center
                gap-2
                px-3.5
                py-1.5
                rounded-full
                bg-white/20
                backdrop-blur-md
                border
                border-white/25
              "
            >
              <span className="w-2 h-2 rounded-full bg-white animate-pulse" />

              <span
                className="
                  text-[10px]
                  sm:text-xs
                  font-black
                  tracking-[1.4px]
                  text-white
                  uppercase
                "
              >
                ZATPATT
              </span>
            </div>

    
          </div>

          <h1
            className="
              mt-4
              text-[22px]
              sm:text-[26px]
              md:text-[28px]
              font-black
              leading-tight
              tracking-tight
            "
          >
            Welcome to Zatpatt Delivery!
          </h1>

          <p
            className="
              mt-1
              text-xs
              sm:text-sm
              text-white/90
              leading-relaxed
              max-w-[480px]
            "
          >
            Complete your 3 simple setup steps to start
            getting delivery orders in your zone.
          </p>
        </div>

        {/* ===================================================
            STEPS CARD
        =================================================== */}

        <div
          className="
            bg-white
            rounded-b-[26px]
            sm:rounded-b-[32px]
            p-5
            sm:p-7
            md:p-8
            shadow-[0_20px_60px_rgba(100,50,15,0.08)]
            border
            border-[#F3E7DC]
            border-t-0
          "
        >

          <div
            className="
              flex
              items-center
              justify-between
              mb-4
              pb-2
              border-b
              border-[#F3E7DC]
            "
          >
            <h2
              className="
                text-xs
                font-black
                tracking-wider
                text-[#7C6657]
                uppercase
              "
            >
              SETUP CHECKLIST
            </h2>

            
          </div>

          {/* STEP 1 */}

          <StepItem
            step={1}
            title="Work Details"
            subtitle="Select your preferred City & Vehicle Type"
            icon={<Briefcase size={20} />}
            status={
              workDone
                ? "done"
                : "active"
            }
            onClick={() => {
              if (!workDone) {
                navigate("/work-details");
              }
            }}
          />

          {/* STEP 2 */}

          <StepItem
            step={2}
            title="Personal & KYC Details"
            subtitle="Aadhaar, PAN, Bank Details & Selfie"
            icon={<User size={20} />}
            status={
              !workDone
                ? "locked"
                : personalDone
                ? "done"
                : "active"
            }
            onClick={() => {
              if (
                workDone &&
                !personalDone
              ) {
                navigate("/personal-details");
              }
            }}
          />

          {/* STEP 3 */}

          <StepItem
            step={3}
            title="Order Zatpatt Partner Kit"
            subtitle="2 Free T-Shirts, Delivery Bag & Partner ID"
            icon={<FileText size={20} />}
            status={
              !workDone || !personalDone
                ? "locked"
                : kitDone
                ? "done"
                : "active"
            }
            onClick={() => {
              if (
                workDone &&
                personalDone &&
                !kitDone
              ) {
                navigate("/order-partner-kit");
              }
            }}
          />

          {/* HELP */}

          <div
            className="
              mt-6
              pt-4
              border-t
              border-[#F3E7DC]
              flex
              items-center
              justify-center
              gap-2
              text-xs
              font-bold
              text-[#FF6600]
              cursor-pointer
              hover:underline
            "
          >
            <HelpCircle size={16} />

            <span>
              Need assistance with onboarding?
              Contact Partner Support
            </span>
          </div>
        </div>
      </div>

      {/* =====================================================
          FOOTER
      ===================================================== */}

      <div className="relative z-10 shrink-0 mt-4">

        <div
          className="
            bg-[#FFEADA]/70
            backdrop-blur-md
            px-8
            py-2
            rounded-full
            border
            border-[#FED7AA]/60
            flex
            items-center
            gap-2
            text-[10px]
            sm:text-xs
            font-medium
            text-[#7C6657]
          "
        >
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

/*
 * =============================================================
 * STEP ITEM COMPONENT
 * =============================================================
 */

function StepItem({
  step,
  title,
  subtitle,
  icon,
  status,
  onClick,
}) {
  const isDone = status === "done";
  const isActive = status === "active";
  const isLocked = status === "locked";

  return (
    <div
      onClick={
        isActive
          ? onClick
          : undefined
      }
      className="
        group
        relative
        flex
        items-center
        gap-3.5
        sm:gap-4
        p-4
        sm:p-4.5
        rounded-2xl
        mb-3
        border
        transition-all
        duration-200
      "
      style={{
        backgroundColor: isActive
          ? "#FFF9F3"
          : isDone
          ? "#FDFDFD"
          : "#FAF8F5",

        borderColor: isActive
          ? "#FED7AA"
          : isDone
          ? "#D1FAE5"
          : "#E5E7EB",

        boxShadow: isActive
          ? "0 4px 18px rgba(255,102,0,0.08)"
          : "none",

        cursor: isActive
          ? "pointer"
          : "default",
      }}
    >
      {/* Active indicator */}

      {isActive && (
        <div
          className="
            absolute
            left-0
            top-0
            bottom-0
            w-1.5
            rounded-l-2xl
            bg-[#FF6600]
          "
        />
      )}

      {/* Step badge */}

      <div
        className="
          w-10
          h-10
          rounded-xl
          flex
          items-center
          justify-center
          shrink-0
          font-extrabold
          text-sm
          transition-all
        "
        style={{
          background: isDone
            ? "linear-gradient(135deg, #16A34A, #22C55E)"
            : isActive
            ? "linear-gradient(135deg, #FF6000, #FFA600)"
            : "#E5E7EB",

          color: isLocked
            ? "#9CA3AF"
            : "#FFFFFF",

          boxShadow: isActive
            ? "0 4px 12px rgba(255,102,0,0.22)"
            : "none",
        }}
      >
        {isDone ? (
          <CheckCircle2
            size={20}
            className="text-white"
          />
        ) : isLocked ? (
          <Lock size={16} />
        ) : (
          step
        )}
      </div>

      {/* Content */}

      <div className="flex-1 min-w-0">

        <div className="flex items-center gap-2">

          <h3
            className="
              text-xs
              sm:text-sm
              font-extrabold
              truncate
            "
            style={{
              color: isLocked
                ? "#9CA3AF"
                : "#2E1A0F",
            }}
          >
            {title}
          </h3>

          {isDone && (
            <span
              className="
                px-2
                py-0.5
                rounded-full
                text-[9px]
                font-bold
                uppercase
                bg-green-100
                text-green-700
              "
            >
              Completed
            </span>
          )}

          {isActive && (
            <span
              className="
                px-2
                py-0.5
                rounded-full
                text-[9px]
                font-bold
                uppercase
                bg-[#FFF0E0]
                text-[#FF6600]
              "
            >
              Pending
            </span>
          )}
        </div>

        <p
          className="
            text-[11px]
            sm:text-xs
            text-[#7C6657]
            mt-0.5
            truncate
          "
        >
          {subtitle}
        </p>
      </div>

      {/* Right icon */}

      <div className="shrink-0 text-[#7C6657]">

        {isActive ? (
          <div
            className="
              w-8
              h-8
              rounded-lg
              bg-white
              border
              border-[#FED7AA]
              flex
              items-center
              justify-center
              text-[#FF6600]
              group-hover:translate-x-0.5
              transition-transform
            "
          >
            <ChevronRight size={18} />
          </div>
        ) : (
          <div className="opacity-40">
            {icon}
          </div>
        )}
      </div>
    </div>
  );
}