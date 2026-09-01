// src/pages/TrainingIntroPage.jsx

import React, { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import {
  CheckCircle,
  Target,
  ArrowRight,
  IndianRupee,
  Zap,
  Gift,
} from "lucide-react";
import {
  fetchDpData,
  evaluateDpProgress,
} from "../Services/dpService";

export default function TrainingIntroPage() {
  const navigate = useNavigate();

  const [partnerName, setPartnerName] = useState("Partner");
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const verifyAccess = async () => {
      setLoading(true);

      try {
        const data = await fetchDpData();

        if (!data) {
          navigate("/onboarding-steps", {
            replace: true,
          });
          return;
        }

        const progress = evaluateDpProgress(data);

        // =====================================================
        // ONBOARDING STEP GATES
        // =====================================================

        if (!progress.step1Done) {
          navigate("/work-details", {
            replace: true,
          });
          return;
        }

        if (!progress.step2Done) {
          navigate("/personal-details", {
            replace: true,
          });
          return;
        }

        if (!progress.step3Done) {
          navigate("/order-partner-kit", {
            replace: true,
          });
          return;
        }

        // =====================================================
        // VERIFICATION GATE
        // =====================================================

        if (!progress.isVerified) {
          navigate("/verification-pending", {
            replace: true,
          });
          return;
        }

        // =====================================================
        // TRAINING ALREADY COMPLETED
        // =====================================================

        if (progress.trainingDone) {
          navigate("/seva-shifts", {
            replace: true,
          });
          return;
        }

        // =====================================================
        // PARTNER NAME
        // =====================================================

        if (data.first_name) {
          setPartnerName(
            `${data.first_name} ${data.last_name || ""}`.trim()
          );
        }

        setLoading(false);
      } catch (error) {
        console.error(
          "Failed to verify training access:",
          error
        );

        navigate("/onboarding-steps", {
          replace: true,
        });
      }
    };

    verifyAccess();
  }, [navigate]);

  // ===========================================================
  // LOADING SCREEN
  // ===========================================================

  if (loading) {
    return (
      <div className="h-dvh w-full flex items-center justify-center bg-[#FAF6F0] overflow-hidden">
        <div className="flex items-center gap-2">
          <div
            className="
              w-5
              h-5
              rounded-full
              border-2
              border-[#FF6600]
              border-t-transparent
              animate-spin
            "
          />

          <span className="text-sm font-bold text-[#FF6600]">
            Verifying credentials...
          </span>
        </div>
      </div>
    );
  }

  // ===========================================================
  // MAIN PAGE
  // ===========================================================

  return (
    <div
      className="
        h-dvh
        w-full
        flex
        flex-col
        overflow-hidden
        bg-[#FAF6F0]
        px-3
        py-3
        sm:px-5
        sm:py-4
        md:px-8
        md:py-5
      "
      style={{
        backgroundImage: `
          radial-gradient(
            circle at 8% 10%,
            rgba(255, 230, 205, 0.7) 0%,
            transparent 38%
          ),
          radial-gradient(
            circle at 95% 20%,
            rgba(255, 226, 195, 0.75) 0%,
            transparent 38%
          )
        `,
      }}
    >
      {/* =====================================================
          MAIN WRAPPER
      ===================================================== */}

      <div
        className="
          flex-1
          min-h-0
          w-full
          max-w-[900px]
          mx-auto
          flex
          flex-col
        "
      >
        
    

        {/* ===================================================
            CONTENT
        =================================================== */}

        <div
          className="
            flex-1
            min-h-0
            bg-white
            rounded-b-[22px]
            sm:rounded-b-[26px]
            md:rounded-b-[30px]
            border
            border-t-0
            border-[#F3E7DC]
            shadow-[0_15px_40px_rgba(100,50,15,0.07)]
            px-4
            py-3
            sm:px-6
            sm:py-4
            md:px-8
            md:py-5
            flex
            flex-col
          "
        >
          {/* =================================================
              VERIFIED
          ================================================= */}

          <div
            className="
              shrink-0
              bg-[#E9FFF2]
              border
              border-[#C8F3DA]
              rounded-xl
              px-3
              py-2
              sm:px-4
              sm:py-2.5
              flex
              items-center
              gap-2.5
            "
          >
            <div
              className="
                w-8
                h-8
                sm:w-9
                sm:h-9
                rounded-lg
                bg-[#18B957]
                flex
                items-center
                justify-center
                shrink-0
              "
            >
              <CheckCircle
                size={19}
                className="text-white"
                strokeWidth={2.5}
              />
            </div>

            <p
              className="
                text-[11px]
                sm:text-xs
                md:text-sm
                leading-4
                text-[#138A47]
              "
            >
              <span className="font-black">
                {partnerName}
              </span>
              , your details have been verified successfully.
            </p>
          </div>

          {/* =================================================
              CENTER CONTENT
          ================================================= */}

          <div
            className="
              flex-1
              min-h-0
              flex
              flex-col
              justify-center
            "
          >
            {/* Target */}

            <div className="flex justify-center">
              <div
                className="
                  w-14
                  h-14
                  sm:w-16
                  sm:h-16
                  md:w-[72px]
                  md:h-[72px]
                  rounded-full
                  bg-[#FFF0DE]
                  border
                  border-[#FFE0C4]
                  flex
                  items-center
                  justify-center
                "
              >
                <Target
                  size={34}
                  className="
                    text-[#FF6600]
                    sm:w-9
                    sm:h-9
                    md:w-11
                    md:h-11
                  "
                  strokeWidth={1.8}
                />
              </div>
            </div>

            {/* Heading */}

            <div className="text-center mt-3 sm:mt-4">
              <h2
                className="
                  text-[18px]
                  leading-[23px]
                  sm:text-[21px]
                  sm:leading-[27px]
                  md:text-[25px]
                  md:leading-[30px]
                  font-black
                  text-[#2E1A0F]
                  tracking-tight
                "
              >
                You're almost ready to deliver!
              </h2>

              <p
                className="
                  mt-1
                  sm:mt-1.5
                  text-[11px]
                  leading-4
                  sm:text-xs
                  sm:leading-5
                  md:text-sm
                  text-[#7C6657]
                  max-w-[600px]
                  mx-auto
                "
              >
                Complete your training and learn the essentials
                you need to start delivering orders confidently.
              </p>
            </div>

            

            {/* =================================================
                INFO
            ================================================= */}

            <div
              className="
                mt-3
                sm:mt-4
                bg-[#FFF9F3]
                border
                border-[#FFE0C4]
                rounded-xl
                px-3
                py-2
                sm:px-4
                sm:py-2.5
                text-center
              "
            >
              <p
                className="
                  text-[10px]
                  sm:text-xs
                  md:text-sm
                  font-semibold
                  text-[#A45A1B]
                "
              >
                🎯 Your training won't take long. Let's get you
                ready!
              </p>
            </div>
          </div>

          {/* =================================================
              CTA
          ================================================= */}

          <div
            className="
              shrink-0
              mt-3
              sm:mt-4
            "
          >
            <button
              type="button"
              onClick={() =>
                navigate("/training-loading")
              }
              className="
                w-full
                py-3
                sm:py-3.5
                md:py-4
                px-4
                rounded-xl
                sm:rounded-2xl
                font-black
                text-sm
                sm:text-[15px]
                md:text-base
                text-white
                flex
                items-center
                justify-center
                gap-2
                active:scale-[0.99]
                transition-transform
              "
              style={{
                background:
                  "linear-gradient(90deg, #FF6200 0%, #FFA800 100%)",

                boxShadow:
                  "0 8px 20px rgba(255,98,0,0.22)",
              }}
            >
              <span>Start Training</span>

              <ArrowRight
                size={18}
                strokeWidth={2.7}
              />
            </button>

            <p
              className="
                text-center
                text-[9px]
                sm:text-[10px]
                md:text-xs
                text-[#9A8D84]
                mt-1
                sm:mt-1.5
              "
            >
              Complete the training to start delivering orders.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}

/*
=============================================================
BENEFIT CARD
=============================================================
*/

function BenefitCard({
  icon,
  title,
  description,
}) {
  return (
    <div
      className="
        bg-[#FFFCF9]
        border
        border-[#FFE0C4]
        rounded-xl
        sm:rounded-2xl
        px-2
        py-2.5
        sm:px-3
        sm:py-3
        md:p-4
        flex
        flex-col
        items-center
        text-center
      "
    >
      {/* ICON */}

      <div
        className="
          w-8
          h-8
          sm:w-9
          sm:h-9
          md:w-10
          md:h-10
          rounded-lg
          bg-[#FFF0DE]
          flex
          items-center
          justify-center
          shrink-0
        "
      >
        <span className="text-[#FF6600]">
          {icon}
        </span>
      </div>

      {/* TITLE */}

      <p
        className="
          mt-1.5
          text-[10px]
          sm:text-xs
          md:text-sm
          font-black
          text-[#2E1A0F]
          leading-4
        "
      >
        {title}
      </p>

      {/* DESCRIPTION */}

      <p
        className="
          mt-0.5
          text-[8px]
          sm:text-[10px]
          md:text-xs
          text-[#7C6657]
          leading-3.5
        "
      >
        {description}
      </p>
    </div>
  );
}