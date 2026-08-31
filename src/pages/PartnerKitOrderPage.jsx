// src/pages/PartnerKitOrderPage.jsx

import React, { useState, useEffect } from "react";
import {
  ArrowLeft,
  HelpCircle,
  Shirt,
  Backpack,
  IdCard,
} from "lucide-react";
import { useNavigate } from "react-router-dom";

import TshirtModel from "../assets/tshirt-model.png";
import { DEV_MODE } from "../config/appConfig";
import { submitPartnerKit } from "../Services/partnerkit";
import { getMyProfileDp } from "../Services/profileDp";

const SIZES = ["S", "M", "L", "XL", "2XL"];

export default function PartnerKitOrderPage() {
  const navigate = useNavigate();

  const [size, setSize] = useState("");
  const [submitting, setSubmitting] = useState(false);

  /*
   * ===========================================================
   * CHECK ONBOARDING ACCESS
   * ===========================================================
   */

  useEffect(() => {
    const progress = JSON.parse(
      localStorage.getItem("onboarding_progress")
    );

    /*
     * Personal details must be completed
     * before coming to partner kit page.
     */

    if (
      !DEV_MODE &&
      progress?.personal_details !== "completed"
    ) {
      navigate("/personal-details", { replace: true });
      return;
    }

    /*
     * If kit is already ordered,
     * don't allow ordering again.
     */

    if (progress?.kit_ordered === true) {
      navigate("/verification-pending", {
        replace: true,
      });
    }
  }, [navigate]);

  /*
   * ===========================================================
   * SUBMIT PARTNER KIT
   * ===========================================================
   */

  const handleSubmitKit = async () => {
    if (!size || submitting) {
      return;
    }

    setSubmitting(true);

    try {
      /*
       * =======================================================
       * STEP 1
       * Submit T-shirt size
       * =======================================================
       */

      await submitPartnerKit({
        tshirt_size: size,
      });

      console.log(
        "Partner kit submitted successfully"
      );

      /*
       * =======================================================
       * SAVE KIT DATA LOCALLY
       * =======================================================
       */

      localStorage.setItem(
        "partner_kit",
        JSON.stringify({
          tshirt_size: size,
          delivery_type: "pickup",
        })
      );

      /*
       * =======================================================
       * UPDATE ONBOARDING PROGRESS
       * =======================================================
       */

      const existingProgress =
        JSON.parse(
          localStorage.getItem(
            "onboarding_progress"
          )
        ) || {};

      localStorage.setItem(
        "onboarding_progress",
        JSON.stringify({
          ...existingProgress,
          kit_ordered: true,
        })
      );

      /*
       * =======================================================
       * STEP 2
       * GET DELIVERY PARTNER PROFILE
       * =======================================================
       */

      const profileRes = await getMyProfileDp();

      console.log(
        "Profile check:",
        profileRes
      );

      const isVerified =
        profileRes?.data?.is_verified;

      /*
       * =======================================================
       * STEP 3
       * REDIRECT BASED ON VERIFICATION
       * =======================================================
       */

      if (isVerified) {
        navigate("/training-intro", {
          replace: true,
        });
      } else {
        navigate("/verification-pending", {
          replace: true,
        });
      }
    } catch (error) {
      console.error(
        "Partner kit submission/profile check failed:",
        error
      );

      alert(
        "Failed to submit partner kit. Please try again."
      );
    } finally {
      setSubmitting(false);
    }
  };

  /*
   * ===========================================================
   * PAGE
   * ===========================================================
   */

  return (
    <div className="min-h-screen bg-white flex flex-col">

      {/* =======================================================
          HEADER
      ======================================================= */}

      <div className="flex items-center px-4 py-3 border-b bg-white">

        {/* BACK BUTTON */}

        <button
          type="button"
          onClick={() => navigate(-1)}
          className="
            w-9
            h-9
            rounded-full
            flex
            items-center
            justify-center
            hover:bg-gray-100
            transition
          "
        >
          <ArrowLeft size={21} />
        </button>

        {/* TITLE */}

        <h1 className="flex-1 text-center font-semibold text-gray-900">
          Zatpatt Partner Kit
        </h1>

        {/* HELP */}

        <button
          type="button"
          className="
            w-9
            h-9
            rounded-full
            flex
            items-center
            justify-center
          "
        >
          <HelpCircle
            size={21}
            className="text-orange-500"
          />
        </button>
      </div>

      {/* =======================================================
          CONTENT
      ======================================================= */}

      <div className="flex-1 px-4 py-6">

        <div className="max-w-xl mx-auto">

          {/* =================================================
              T-SHIRT SIZE
          ================================================= */}

          <div>

            <h3 className="text-base font-semibold text-gray-900">
              Select T-shirt Size
            </h3>

            <p className="text-sm text-gray-500 mt-1">
              Choose the size you want for your partner kit.
            </p>

            {/* T-SHIRT IMAGE */}

            <div className="flex justify-center my-6">

              <div
                className="
                  w-full
                  max-w-[260px]
                  rounded-2xl
                  bg-orange-50
                  flex
                  items-center
                  justify-center
                  p-4
                "
              >
                <img
                  src={TshirtModel}
                  className="w-48 h-auto object-contain"
                  alt="T-shirt size guide"
                />
              </div>

            </div>

            {/* SIZE BUTTONS */}

            <div className="flex gap-2 justify-center flex-wrap">

              {SIZES.map((s) => {

                const selected = size === s;

                return (
                  <button
                    key={s}
                    type="button"
                    onClick={() => setSize(s)}
                    disabled={submitting}
                    className={`
                      w-10
                      h-10
                      rounded-full
                      border-2
                      text-sm
                      font-semibold
                      transition-all
                      ${
                        selected
                          ? "bg-orange-500 text-white border-orange-500 shadow-md scale-105"
                          : "bg-white text-gray-700 border-gray-300 hover:border-orange-400 hover:text-orange-500"
                      }
                      ${
                        submitting
                          ? "opacity-50 cursor-not-allowed"
                          : "cursor-pointer"
                      }
                    `}
                  >
                    {s}
                  </button>
                );

              })}

            </div>

            {/* SELECTED SIZE */}

            {size && (
              <div className="mt-4 text-center">

                <span
                  className="
                    inline-flex
                    items-center
                    px-4
                    py-2
                    rounded-full
                    bg-orange-50
                    text-orange-600
                    text-sm
                    font-semibold
                  "
                >
                  Selected Size: {size}
                </span>

              </div>
            )}

          </div>

          {/* =================================================
              CONTINUE BUTTON
          ================================================= */}

          <button
            type="button"
            disabled={!size || submitting}
            onClick={handleSubmitKit}
            className={`
              mt-8
              w-full
              py-3.5
              rounded-xl
              font-semibold
              transition-all
              ${
                size && !submitting
                  ? "bg-orange-500 text-white hover:bg-orange-600 shadow-md"
                  : "bg-gray-200 text-gray-400 cursor-not-allowed"
              }
            `}
          >
            {submitting
              ? "Submitting..."
              : "Continue"}
          </button>

          {/* =================================================
              INFO
          ================================================= */}

          <p className="text-center text-xs text-gray-400 mt-3">
            You can select your T-shirt size before submitting
            your partner kit order.
          </p>

        </div>
      </div>
    </div>
  );
}

/*
 * =============================================================
 * KIT ITEM COMPONENT
 * =============================================================
 */

function KitItem({
  icon,
  title,
  subtitle,
}) {
  return (
    <div
      className="
        flex
        items-center
        gap-4
        p-4
        rounded-xl
        bg-orange-50
        border
        border-orange-100
      "
    >

      {/* ICON */}

      <div
        className="
          w-11
          h-11
          rounded-full
          bg-white
          flex
          items-center
          justify-center
          shadow-sm
          shrink-0
        "
      >
        {icon}
      </div>

      {/* TEXT */}

      <div className="min-w-0">

        <p className="text-sm font-semibold text-gray-900">
          {title}
        </p>

        <p className="text-xs text-gray-500 mt-0.5">
          {subtitle}
        </p>

      </div>
    </div>
  );
}