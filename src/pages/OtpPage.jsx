// src/pages/OtpPage.jsx

import React, {
  useState,
  useRef,
  useEffect,
} from "react";

import {
  useNavigate,
  useLocation,
} from "react-router-dom";

import { motion } from "framer-motion";

import { requestOtp } from "../Services/auth";
import { verifyOtp } from "../Services/otp";
import { getPageRedirection } from "../Services/redirection";

// Maps backend "page" value -> app route
const PAGE_ROUTE_MAP = {
  "verification-pending": "/verification-pending",
  "onboarding": "/onboarding-steps",
  "select-slot": "/seva-shifts", // matches <Route path="/seva-shifts" element={<SevaShiftSelectionPage />} />
};

const DEFAULT_ROUTE = "/onboarding-steps";

export default function OtpPage() {
  const navigate = useNavigate();
  const location = useLocation();

  const phone =
    location.state?.phone ||
    location.state?.mobile ||
    localStorage.getItem(
      "login_mobile"
    );

  const [otp, setOtp] = useState([
    "",
    "",
    "",
    "",
    "",
    "",
  ]);

  const [error, setError] =
    useState("");

  const [shake, setShake] =
    useState(false);

  const [loading, setLoading] =
    useState(false);

  const [resendLoading, setResendLoading] =
    useState(false);

  const [resendTimer, setResendTimer] =
    useState(30);

  const inputsRef = useRef([]);

  // =======================================================
  // TIMER
  // =======================================================

  useEffect(() => {
    if (resendTimer <= 0) {
      return;
    }

    const timer = setInterval(() => {
      setResendTimer(
        (seconds) => seconds - 1
      );
    }, 1000);

    return () =>
      clearInterval(timer);
  }, [resendTimer]);

  // =======================================================
  // OTP CHANGE
  // =======================================================

  const handleChange = (
    value,
    index
  ) => {
    if (!/^\d?$/.test(value)) {
      return;
    }

    setError("");

    const nextOtp = [...otp];

    nextOtp[index] = value;

    setOtp(nextOtp);

    if (
      value &&
      index < 5
    ) {
      inputsRef.current[
        index + 1
      ]?.focus();
    }
  };

  // =======================================================
  // BACKSPACE
  // =======================================================

  const handleKeyDown = (
    e,
    index
  ) => {
    if (
      e.key === "Backspace" &&
      !otp[index] &&
      index > 0
    ) {
      inputsRef.current[
        index - 1
      ]?.focus();
    }
  };

  // =======================================================
  // PASTE OTP
  // =======================================================

  const handlePaste = (e) => {
    e.preventDefault();

    const data =
      e.clipboardData
        .getData("text")
        .replace(/\D/g, "")
        .slice(0, 6);

    if (data.length === 6) {
      setOtp(
        data.split("")
      );

      setError("");

      inputsRef.current[
        5
      ]?.focus();
    }
  };

  // =======================================================
  // SAVE PERMISSIONS AFTER OTP
  // =======================================================

  const savePermissionsAfterLogin =
    async () => {
      try {
        const permissions = {
          location_permission:
            localStorage.getItem(
              "location_permission"
            ),

          background_location_permission:
            localStorage.getItem(
              "background_location_permission"
            ),

          camera_permission:
            localStorage.getItem(
              "camera_permission"
            ),

          notification_permission:
            localStorage.getItem(
              "notification_permission"
            ),
        };

        console.log(
          "Permissions from localStorage:",
          permissions
        );

        const response =
          await saveDeliveryPartnerPermissions();

        console.log(
          "Delivery partner permissions saved ✅",
          response
        );

        return response;
      } catch (err) {
        console.error(
          "Permission API error ❌",
          err
        );

        console.error(
          "Permission API response:",
          err?.response?.data
        );

        /*
         * Do not block login if permission
         * syncing fails.
         *
         * User is already authenticated.
         */
        return null;
      }
    };

  // =======================================================
  // VERIFY OTP
  // =======================================================

  const handleVerifyOtp =
    async () => {
      const enteredOtp =
        otp.join("");

      if (
        enteredOtp.length !== 6
      ) {
        setError(
          "Enter 6 digit OTP"
        );
        return;
      }

      if (!phone) {
        setError(
          "Mobile number not found."
        );
        return;
      }

      if (loading) {
        return;
      }

      try {
        setLoading(true);
        setError("");

        // ===============================================
        // VERIFY OTP
        // ===============================================

        const res =
          await verifyOtp({
            mobile: phone,
            otp: enteredOtp,
          });

        console.log(
          "OTP Verify ✅",
          res
        );

        // ===============================================
        // SAVE AUTH DATA
        // ===============================================

        localStorage.setItem(
          "access_token",
          res.access
        );

        localStorage.setItem(
          "refresh_token",
          res.refresh
        );

        localStorage.setItem(
          "user",
          JSON.stringify(
            res.user
          )
        );

        localStorage.setItem(
          "delivery_auth",
          "true"
        );

        // ===============================================
        // SAVE PERMISSIONS
        // ===============================================

        await savePermissionsAfterLogin();

        // ===============================================
        // REMOVE LOGIN MOBILE
        // ===============================================

        localStorage.removeItem(
          "login_mobile"
        );

        // ===============================================
        // PAGE REDIRECTION
        // ===============================================

        try {
          const redirectRes =
            await getPageRedirection();

          console.log(
            "Page redirection ✅",
            redirectRes
          );

          const page =
            redirectRes?.data?.page;

          const targetRoute =
            PAGE_ROUTE_MAP[page] ||
            DEFAULT_ROUTE;

          navigate(
            targetRoute,
            {
              replace: true,
            }
          );
        } catch (
          redirectErr
        ) {
          console.error(
            "Page redirection error ❌",
            redirectErr
          );

          navigate(
            DEFAULT_ROUTE,
            {
              replace: true,
            }
          );
        }
      } catch (err) {
        console.error(
          "OTP error ❌",
          err
        );

        setError(
          err?.response?.data
            ?.message ||
            "Invalid OTP"
        );

        setShake(true);

        setOtp([
          "",
          "",
          "",
          "",
          "",
          "",
        ]);

        setTimeout(() => {
          inputsRef.current[
            0
          ]?.focus();

          setShake(false);
        }, 400);
      } finally {
        setLoading(false);
      }
    };

  // =======================================================
  // RESEND OTP
  // =======================================================

  const resendOtp =
    async () => {
      if (!phone) {
        setError(
          "Mobile number not found."
        );
        return;
      }

      if (
        resendTimer > 0
      ) {
        return;
      }

      if (resendLoading) {
        return;
      }

      try {
        setResendLoading(
          true
        );

        setError("");

        console.log(
          "Calling request-otp API:",
          phone
        );

        const response =
          await requestOtp(
            phone
          );

        console.log(
          "request-otp response:",
          response
        );

        setOtp([
          "",
          "",
          "",
          "",
          "",
          "",
        ]);

        setResendTimer(30);

        setTimeout(() => {
          inputsRef.current[
            0
          ]?.focus();
        }, 100);
      } catch (err) {
        console.error(
          "request-otp API failed ❌",
          err
        );

        setError(
          err?.response?.data
            ?.message ||
            err?.response?.data
              ?.detail ||
            "Failed to resend OTP. Please try again."
        );
      } finally {
        setResendLoading(
          false
        );
      }
    };

  // =======================================================
  // CHANGE MOBILE
  // =======================================================

  const changeMobile =
    () => {
      localStorage.removeItem(
        "login_mobile"
      );

      navigate("/login");
    };

  // =======================================================
  // INVALID ACCESS
  // =======================================================

  if (!phone) {
    return (
      <div
        className="
          fixed
          inset-0
          w-full
          h-[100dvh]

          flex
          items-center
          justify-center

          overflow-hidden

          text-sm
        "
        style={{
          background:
            COLORS.background,

          color:
            COLORS.primary,
        }}
      >
        Invalid Access
      </div>
    );
  }

  // =======================================================
  // UI
  // =======================================================

  return (
    <div
      className="
        fixed
        inset-0

        w-full
        h-[100dvh]

        flex
        items-center
        justify-center

        overflow-hidden

        px-3
        sm:px-5
        md:px-6
      "
      style={{
        background: `
          radial-gradient(
            circle at 10% 10%,
            rgba(255, 107, 0, 0.12),
            transparent 28%
          ),
          radial-gradient(
            circle at 90% 90%,
            rgba(255, 174, 0, 0.10),
            transparent 30%
          ),
          linear-gradient(
            135deg,
            #fffaf5 0%,
            #fff5ea 45%,
            #fffaf6 100%
          )
        `,
      }}
    >
      {/* =================================================
          ORANGE BORDER
      ================================================= */}

      <div
        className="
          w-full

          max-w-[350px]
          sm:max-w-[390px]
          md:max-w-[420px]

          rounded-[20px]

          p-[1px]
        "
        style={{
          background: `
            linear-gradient(
              145deg,
              #ff6b00 0%,
              #ff7a00 45%,
              #ffae00 100%
            )
          `,

          boxShadow:
            "0 18px 40px rgba(255, 107, 0, 0.14)",
        }}
      >
        {/* =================================================
            CARD
        ================================================= */}

        <motion.div
          initial={{
            opacity: 0,
            y: 8,
          }}
          animate={{
            opacity: 1,
            y: 0,
          }}
          transition={{
            duration: 0.2,
          }}
          className="
            w-full
            bg-white
            rounded-[19px]

            px-4
            py-5

            sm:px-6
            sm:py-6

            md:px-7
            md:py-7

            text-center
          "
        >
          {/* TITLE */}

          <h2
            className="
              text-lg
              sm:text-xl
              md:text-2xl

              font-extrabold
              tracking-tight
              mb-1
            "
            style={{
              color:
                COLORS.primary,
            }}
          >
            OTP Verification
          </h2>

          {/* SUBTITLE */}

          <p
            className="
              text-xs
              sm:text-sm
              mb-0.5
            "
            style={{
              color:
                COLORS.secondaryText,
            }}
          >
            OTP sent to
          </p>

          <p
            className="
              text-sm
              sm:text-base
              md:text-lg

              font-bold
              mb-4
            "
            style={{
              color:
                COLORS.text,
            }}
          >
            +91 {phone}
          </p>

          {/* OTP INPUTS */}

          <motion.div
            animate={
              shake
                ? {
                    x: [
                      -6,
                      6,
                      -4,
                      4,
                      0,
                    ],
                  }
                : {}
            }
            transition={{
              duration: 0.3,
            }}
            className="
              w-full

              flex
              items-center
              justify-center

              gap-1.5
              sm:gap-2
              md:gap-2.5

              mb-1
            "
          >
            {otp.map(
              (
                digit,
                index
              ) => (
                <input
                  key={index}
                  ref={(
                    element
                  ) => {
                    inputsRef.current[
                      index
                    ] =
                      element;
                  }}
                  type="tel"
                  inputMode="numeric"
                  pattern="[0-9]*"
                  autoComplete={
                    index === 0
                      ? "one-time-code"
                      : "off"
                  }
                  value={digit}
                  maxLength={1}
                  disabled={
                    loading ||
                    resendLoading
                  }
                  aria-label={`OTP digit ${
                    index + 1
                  }`}
                  onChange={(e) =>
                    handleChange(
                      e.target
                        .value,
                      index
                    )
                  }
                  onKeyDown={(e) =>
                    handleKeyDown(
                      e,
                      index
                    )
                  }
                  onPaste={
                    handlePaste
                  }
                  className="
                    flex-1
                    min-w-0

                    max-w-[42px]
                    sm:max-w-[46px]
                    md:max-w-[50px]

                    aspect-square

                    rounded-[10px]

                    text-center

                    text-base
                    sm:text-lg
                    md:text-xl

                    font-bold

                    outline-none

                    transition-all
                    duration-200

                    disabled:opacity-60
                  "
                  style={{
                    color:
                      COLORS.text,

                    backgroundColor:
                      "#ffffff",

                    border: `1.5px solid ${COLORS.borderLight}`,
                  }}
                  onFocus={(e) => {
                    e.currentTarget.style.borderColor =
                      COLORS.primary;

                    e.currentTarget.style.boxShadow =
                      "0 0 0 3px rgba(255, 107, 0, 0.10)";
                  }}
                  onBlur={(e) => {
                    e.currentTarget.style.borderColor =
                      COLORS.borderLight;

                    e.currentTarget.style.boxShadow =
                      "none";
                  }}
                />
              )
            )}
          </motion.div>

          {/* ERROR */}

          {error && (
            <p
              className="
                text-xs
                sm:text-sm

                font-medium

                mt-2
                mb-2
              "
              style={{
                color:
                  "#d92d20",
              }}
            >
              {error}
            </p>
          )}

          {/* VERIFY */}

          <button
            type="button"
            onClick={
              handleVerifyOtp
            }
            disabled={
              loading ||
              resendLoading
            }
            className="
              w-full

              h-[44px]
              sm:h-[48px]
              md:h-[50px]

              mt-3

              rounded-[12px]

              text-sm
              sm:text-base

              font-extrabold

              text-white

              transition-all
              duration-200

              focus:outline-none

              disabled:cursor-not-allowed
            "
            style={{
              background:
                loading ||
                resendLoading
                  ? COLORS.disabled
                  : `linear-gradient(
                      135deg,
                      ${COLORS.primary} 0%,
                      ${COLORS.primaryHover} 100%
                    )`,

              boxShadow:
                loading ||
                resendLoading
                  ? "none"
                  : "0 8px 20px rgba(255, 107, 0, 0.20)",
            }}
          >
            {loading
              ? "Verifying..."
              : "Verify OTP"}
          </button>

          {/* RESEND */}

          <div
            className="
              mt-4

              flex
              flex-col
              items-center
              justify-center

              gap-1
            "
          >
            <p
              className="
                text-xs
                sm:text-sm
              "
              style={{
                color:
                  COLORS.secondaryText,
              }}
            >
              Didn't receive
              the OTP?
            </p>

            {resendTimer >
            0 ? (
              <span
                className="
                  text-xs
                  sm:text-sm
                  font-medium
                "
                style={{
                  color:
                    COLORS.secondaryText,
                }}
              >
                Resend OTP in{" "}
                <strong
                  style={{
                    color:
                      COLORS.primary,
                  }}
                >
                  {
                    resendTimer
                  }
                  s
                </strong>
              </span>
            ) : (
              <button
                type="button"
                onClick={
                  resendOtp
                }
                disabled={
                  resendLoading
                }
                className="
                  min-w-[125px]
                  h-[38px]

                  px-4

                  rounded-[10px]

                  text-xs
                  sm:text-sm

                  font-extrabold

                  transition-all
                  duration-200

                  disabled:opacity-50
                  disabled:cursor-not-allowed
                "
                style={{
                  color:
                    COLORS.primary,

                  backgroundColor:
                    COLORS.softOrange,

                  border: `1.5px solid ${COLORS.primary}`,
                }}
                onMouseEnter={(
                  e
                ) => {
                  if (
                    !resendLoading
                  ) {
                    e.currentTarget.style.backgroundColor =
                      COLORS.primary;

                    e.currentTarget.style.color =
                      "#ffffff";
                  }
                }}
                onMouseLeave={(
                  e
                ) => {
                  if (
                    !resendLoading
                  ) {
                    e.currentTarget.style.backgroundColor =
                      COLORS.softOrange;

                    e.currentTarget.style.color =
                      COLORS.primary;
                  }
                }}
              >
                {resendLoading
                  ? "Sending..."
                  : "Resend OTP"}
              </button>
            )}
          </div>

          {/* CHANGE MOBILE */}

          <button
            type="button"
            onClick={
              changeMobile
            }
            disabled={
              loading ||
              resendLoading
            }
            className="
              mt-3

              text-xs
              sm:text-sm

              font-bold

              underline

              rounded

              transition-colors

              disabled:opacity-50
              disabled:cursor-not-allowed
            "
            style={{
              color:
                COLORS.primary,
            }}
            onMouseEnter={(
              e
            ) => {
              if (
                !loading &&
                !resendLoading
              ) {
                e.currentTarget.style.color =
                  COLORS.primaryHover;
              }
            }}
            onMouseLeave={(
              e
            ) => {
              if (
                !loading &&
                !resendLoading
              ) {
                e.currentTarget.style.color =
                  COLORS.primary;
              }
            }}
          >
            Change mobile
            number
          </button>
        </motion.div>
      </div>
    </div>
  );
}