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
  ArrowRight,
} from "lucide-react";
import {
  fetchDpData,
  evaluateDpProgress,
} from "../Services/dpService";

export default function OnboardingStepsPage() {
  const navigate = useNavigate();

  const [loading, setLoading] = useState(true);
  const [dpData, setDpData] = useState(null);
  const [progress, setProgress] = useState(null);

  useEffect(() => {
    loadPartnerData();
  }, []);

  const loadPartnerData = async () => {
    setLoading(true);

    try {
      const data = await fetchDpData();

      setDpData(data);

      const evaluated = evaluateDpProgress(data);

      setProgress(evaluated);
    } catch (error) {
      console.error(
        "Failed to load partner onboarding data:",
        error
      );
    } finally {
      setLoading(false);
    }
  };

  /* =========================================================
     LOADING
  ========================================================= */

  if (loading || !progress) {
    return (
      <div
        className="
          min-h-dvh
          w-full
          flex
          items-center
          justify-center
          px-4
        "
        style={{
          backgroundColor: "#FAF6F0",
        }}
      >
        <div
          className="
            flex
            items-center
            gap-2
            text-sm
            font-bold
            text-[#FF6600]
          "
        >
          <div
            className="
              w-5
              h-5
              border-2
              border-[#FF6600]
              border-t-transparent
              rounded-full
              animate-spin
            "
          />

          <span>Loading your onboarding...</span>
        </div>
      </div>
    );
  }

  const {
    step1Done,
    step2Done,
    step3Done,
    isVerified,
  } = progress;

  const allOnboardingDone =
    step1Done &&
    step2Done &&
    step3Done;

  return (
    <div
      className="
        min-h-dvh
        w-full
        flex
        flex-col
        items-center
        relative
        overflow-x-hidden
        px-3
        py-3
        sm:px-5
        sm:py-5
        md:px-7
        md:py-7
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
          DECORATIVE ICONS
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
          items-center
          justify-center
          pointer-events-none
          hidden
          md:flex
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

      <div
        className="
          w-full
          max-w-[760px]
          my-auto
          z-10
        "
      >
        {/* =================================================
            HERO
        ================================================= */}

        <div
          className="
            rounded-t-[24px]
            sm:rounded-t-[28px]
            md:rounded-t-[32px]
            px-5
            py-5
            sm:px-7
            sm:py-7
            md:p-8
            relative
            overflow-hidden
            text-white
          "
          style={{
            background:
              "linear-gradient(155deg, #FF6000 0%, #FF7A00 45%, #FFA600 100%)",
          }}
        >
          {/* LOGO PILL */}

          <div
            className="
              inline-flex
              items-center
              gap-2
              px-3
              sm:px-3.5
              py-1.5
              rounded-full
              bg-white/20
              backdrop-blur-md
              border
              border-white/25
            "
          >
            <span
              className="
                w-2
                h-2
                rounded-full
                bg-white
                animate-pulse
              "
            />

            <span
              className="
                text-[9px]
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

          {/* TITLE */}

          <h1
            className="
              mt-3
              sm:mt-4
              text-[22px]
              sm:text-[26px]
              md:text-[30px]
              font-black
              leading-tight
              tracking-tight
            "
          >
            Welcome to Zatpatt Delivery!
          </h1>

          {/* DESCRIPTION */}

          <p
            className="
              mt-2
              text-xs
              sm:text-sm
              md:text-[15px]
              text-white/90
              leading-relaxed
              max-w-[520px]
            "
          >
            Complete your 3 simple setup steps to start
            getting delivery orders in your zone.
          </p>
        </div>

        {/* =================================================
            STEPS CARD
        ================================================= */}

        <div
          className="
            bg-white
            rounded-b-[24px]
            sm:rounded-b-[28px]
            md:rounded-b-[32px]
            px-4
            py-5
            sm:p-7
            md:p-8
            shadow-[0_20px_60px_rgba(100,50,15,0.08)]
            border
            border-[#F3E7DC]
            border-t-0
          "
        >
          {/* =================================================
              CHECKLIST HEADER
          ================================================= */}

          <div
            className="
              flex
              items-center
              justify-between
              gap-2
              mb-4
              pb-2.5
              border-b
              border-[#F3E7DC]
            "
          >
            <h2
              className="
                text-[11px]
                sm:text-xs
                font-black
                tracking-wider
                text-[#7C6657]
                uppercase
              "
            >
              Setup Checklist
            </h2>

            <span
              className="
                text-[10px]
                sm:text-xs
                font-bold
                text-[#FF6600]
                whitespace-nowrap
              "
            >
              {
                [
                  step1Done,
                  step2Done,
                  step3Done,
                ].filter(Boolean).length
              }{" "}
              of 3 completed
            </span>
          </div>

          {/* =================================================
              STEP 1
          ================================================= */}

          <StepItem
            step={1}
            title="Work Details"
            subtitle={
              step1Done && dpData?.city
                ? `City: ${dpData.city} • Vehicle: ${
                    dpData.vehicle_type || "Selected"
                  }`
                : "Select your preferred City & Vehicle Type"
            }
            icon={<Briefcase size={19} />}
            status={
              step1Done
                ? "done"
                : "active"
            }
            onClick={() =>
              navigate("/work-details")
            }
          />

          {/* =================================================
              STEP 2
          ================================================= */}

          <StepItem
            step={2}
            title="Personal & KYC Details"
            subtitle={
              step2Done
                ? "Aadhaar, PAN & Bank verification completed"
                : "Aadhaar, PAN, Bank Details & Selfie"
            }
            icon={<User size={19} />}
            status={
              !step1Done
                ? "locked"
                : step2Done
                ? "done"
                : "active"
            }
            onClick={() => {
              if (step1Done) {
                navigate(
                  "/personal-details"
                );
              }
            }}
          />

          {/* =================================================
              STEP 3
          ================================================= */}

          <StepItem
            step={3}
            title="Order Zatpatt Partner Kit"
            subtitle={
              step3Done
                ? `Size selected: ${String(
                    dpData?.tshirt_size
                  ).toUpperCase()}`
                : "T-Shirts, Delivery Bag"
            }
            icon={<FileText size={19} />}
            status={
              !step1Done || !step2Done
                ? "locked"
                : step3Done
                ? "done"
                : "active"
            }
            onClick={() => {
              if (
                step1Done &&
                step2Done
              ) {
                navigate(
                  "/order-partner-kit"
                );
              }
            }}
          />

          {/* =================================================
              ONBOARDING COMPLETE
          ================================================= */}

          {allOnboardingDone && (
            <div
              className="
                mt-5
                pt-4
                border-t
                border-[#F3E7DC]
              "
            >
              <button
                type="button"
                onClick={() => {
                  if (isVerified) {
                    navigate(
                      "/training-intro"
                    );
                  } else {
                    navigate(
                      "/verification-pending"
                    );
                  }
                }}
                className="
                  w-full
                  py-3.5
                  sm:py-4
                  px-4
                  rounded-xl
                  sm:rounded-2xl
                  font-black
                  text-sm
                  sm:text-base
                  text-white
                  flex
                  items-center
                  justify-center
                  gap-2
                  transition-all
                  active:scale-[0.99]
                "
                style={{
                  background:
                    "linear-gradient(90deg, #FF6200 0%, #FFA800 100%)",

                  boxShadow:
                    "0 10px 25px rgba(255,98,0,0.25)",
                }}
              >
                <span className="truncate">
                  {isVerified
                    ? "Proceed to Partner Training"
                    : "Check Verification Status"}
                </span>

                <ArrowRight
                  size={18}
                  className="shrink-0"
                />
              </button>
            </div>
          )}

          {/* =================================================
              HELP
          ================================================= */}

          <div
            className="
              mt-5
              pt-4
              border-t
              border-[#F3E7DC]
              flex
              items-start
              justify-center
              gap-1.5
              text-[11px]
              sm:text-xs
              font-bold
              text-[#FF6600]
              text-center
              leading-4
              cursor-pointer
              hover:underline
            "
          >
            <HelpCircle
              size={15}
              className="shrink-0 mt-0.5"
            />

            <span>
              Need assistance with onboarding?
              <br className="sm:hidden" />{" "}
              Contact Partner Support
            </span>
          </div>
        </div>
      </div>

      {/* =====================================================
          FOOTER
      ===================================================== */}

      <div
        className="
          relative
          z-10
          shrink-0
          mt-3
          sm:mt-4
        "
      >
        <div
          className="
            bg-[#FFEADA]/70
            backdrop-blur-md
            px-5
            sm:px-8
            py-1.5
            sm:py-2
            rounded-full
            border
            border-[#FED7AA]/60
            flex
            items-center
            gap-2
            text-[9px]
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
 * STEP ITEM
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
        !isLocked
          ? onClick
          : undefined
      }
      className="
        group
        relative
        flex
        items-center
        gap-2.5
        sm:gap-4
        px-3
        py-3
        sm:p-4
        rounded-2xl
        mb-3
        border
        transition-all
        duration-200
        overflow-hidden
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

        cursor: !isLocked
          ? "pointer"
          : "not-allowed",
      }}
    >
      {/* ACTIVE INDICATOR */}

      {isActive && (
        <div
          className="
            absolute
            left-0
            top-0
            bottom-0
            w-1
            sm:w-1.5
            rounded-l-2xl
            bg-[#FF6600]
          "
        />
      )}

      {/* =====================================================
          STEP ICON
      ===================================================== */}

      <div
        className="
          w-10
          h-10
          sm:w-11
          sm:h-11
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
          />
        ) : isLocked ? (
          <Lock size={16} />
        ) : (
          step
        )}
      </div>

      {/* =====================================================
          TEXT
      ===================================================== */}

      <div className="flex-1 min-w-0">
        <div
          className="
            flex
            items-center
            gap-1.5
            sm:gap-2
            min-w-0
          "
        >
          <h3
            className="
              text-[13px]
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

          {/* COMPLETED */}

          {isDone && (
            <span
              className="
                px-1.5
                sm:px-2
                py-0.5
                rounded-full
                text-[8px]
                sm:text-[9px]
                font-bold
                uppercase
                bg-green-100
                text-green-700
                shrink-0
              "
            >
              Completed
            </span>
          )}

          {/* PENDING */}

          {isActive && (
            <span
              className="
                px-1.5
                sm:px-2
                py-0.5
                rounded-full
                text-[8px]
                sm:text-[9px]
                font-bold
                uppercase
                bg-[#FFF0E0]
                text-[#FF6600]
                shrink-0
              "
            >
              Pending
            </span>
          )}
        </div>

        <p
          className="
            text-[10px]
            sm:text-xs
            text-[#7C6657]
            mt-0.5
            truncate
          "
        >
          {subtitle}
        </p>
      </div>

      {/* =====================================================
          RIGHT ICON
      ===================================================== */}

      <div
        className="
          shrink-0
          text-[#7C6657]
        "
      >
        {isActive ? (
          <div
            className="
              w-7
              h-7
              sm:w-8
              sm:h-8
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
            <ChevronRight
              size={17}
            />
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