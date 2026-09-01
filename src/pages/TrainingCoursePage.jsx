// src/pages/TrainingCoursePage.jsx

import React, { useEffect, useState } from "react";
import {
  Lock,
  PlayCircle,
  CheckCircle,
  ArrowRight,
} from "lucide-react";
import { useNavigate } from "react-router-dom";
import {
  fetchDpData,
  evaluateDpProgress,
} from "../Services/dpService";

const LESSONS = [
  {
    id: 1,
    key: "first",
    title: "Introduction to Zatpatt",
    duration: "1 min",
  },
  {
    id: 2,
    key: "second",
    title: "How to deliver orders",
    duration: "3 min",
  },
  {
    id: 3,
    key: "third",
    title: "Payments & Earnings",
    duration: "2 min",
  },
];

export default function TrainingCoursePage() {
  const navigate = useNavigate();

  const [progressCount, setProgressCount] = useState(0);
  const [loading, setLoading] = useState(true);

  // =========================================================
  // LOAD TRAINING PROGRESS
  // =========================================================

  useEffect(() => {
    const checkProgress = async () => {
      try {
        setLoading(true);

        const data = await fetchDpData();

        // =====================================================
        // NO DATA
        // =====================================================

        if (!data) {
          navigate("/onboarding-steps", {
            replace: true,
          });
          return;
        }

        const evaluated = evaluateDpProgress(data);

        // =====================================================
        // VERIFICATION CHECK
        // =====================================================

        if (!evaluated.isVerified) {
          navigate("/verification-pending", {
            replace: true,
          });
          return;
        }

        // =====================================================
        // CALCULATE COMPLETED LESSONS
        // =====================================================

        let apiProgress = 0;

        const trainingData = data?.training_data;

        if (trainingData) {
          /*
           * We check each lesson individually.
           *
           * first  -> lesson 1
           * second -> lesson 2
           * third  -> lesson 3
           */

          const firstCompleted =
            trainingData.first === true ||
            trainingData.first === "true" ||
            trainingData.first === "completed" ||
            trainingData.first === 1 ||
            trainingData.first === "1";

          const secondCompleted =
            trainingData.second === true ||
            trainingData.second === "true" ||
            trainingData.second === "completed" ||
            trainingData.second === 1 ||
            trainingData.second === "1";

          const thirdCompleted =
            trainingData.third === true ||
            trainingData.third === "true" ||
            trainingData.third === "completed" ||
            trainingData.third === 1 ||
            trainingData.third === "1";

          // ---------------------------------------------------
          // Sequential progress
          // ---------------------------------------------------

          if (firstCompleted) {
            apiProgress = 1;
          }

          if (secondCompleted) {
            apiProgress = 2;
          }

          if (thirdCompleted) {
            apiProgress = 3;
          }
        }

        // =====================================================
        // LOCAL STORAGE PROGRESS
        // =====================================================

        const localProgress = Number(
          localStorage.getItem("training_progress") || 0
        );

        /*
         * Use whichever progress is higher.
         *
         * This is useful if:
         * - video completion was saved locally
         * - API data hasn't refreshed yet
         */

        const finalProgress = Math.max(
          apiProgress,
          localProgress
        );

        // =====================================================
        // ALL TRAINING COMPLETED
        // =====================================================

        if (finalProgress >= LESSONS.length) {
          localStorage.setItem(
            "training_progress",
            String(LESSONS.length)
          );

          navigate("/training-completed", {
            replace: true,
          });

          return;
        }

        // =====================================================
        // SAVE CURRENT PROGRESS
        // =====================================================

        localStorage.setItem(
          "training_progress",
          String(finalProgress)
        );

        setProgressCount(finalProgress);
      } catch (error) {
        console.error(
          "Failed to load training progress:",
          error
        );
      } finally {
        setLoading(false);
      }
    };

    checkProgress();
  }, [navigate]);

  // =========================================================
  // COMPLETION %
  // =========================================================

  const completionPercent = Math.round(
    (progressCount / LESSONS.length) * 100
  );

  // =========================================================
  // LESSON CLICK
  // =========================================================

  const handleLessonClick = (index) => {
    /*
     * Only the next lesson is clickable.
     *
     * progressCount = 0
     * ----------------
     * Lesson 1 -> clickable
     * Lesson 2 -> locked
     * Lesson 3 -> locked
     *
     * progressCount = 1
     * ----------------
     * Lesson 1 -> completed
     * Lesson 2 -> clickable
     * Lesson 3 -> locked
     *
     * progressCount = 2
     * ----------------
     * Lesson 1 -> completed
     * Lesson 2 -> completed
     * Lesson 3 -> clickable
     */

    if (index !== progressCount) {
      return;
    }

    navigate(
      `/training/video/${LESSONS[index].id}`
    );
  };

  // =========================================================
  // LOADING
  // =========================================================

  if (loading) {
    return (
      <div
        className="
          h-dvh
          w-full
          overflow-hidden
          flex
          items-center
          justify-center
          bg-[#FAF6F0]
          px-4
        "
      >
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

          <span
            className="
              text-sm
              font-bold
              text-[#FF6600]
            "
          >
            Loading training modules...
          </span>
        </div>
      </div>
    );
  }

  // =========================================================
  // MAIN PAGE
  // =========================================================

  return (
    <div
      className="
        h-dvh
        w-full
        overflow-hidden
        bg-[#FAF6F0]
        px-3
        py-3
        sm:px-5
        sm:py-5
        md:px-8
        md:py-6
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
          PAGE CONTAINER
      ===================================================== */}

      <div
        className="
          h-full
          w-full
          max-w-[760px]
          mx-auto
          flex
          flex-col
        "
      >
        {/* ===================================================
            HEADER
        =================================================== */}

        <div
          className="
            shrink-0
            rounded-t-[24px]
            sm:rounded-t-[28px]
            md:rounded-t-[30px]
            px-5
            py-5
            sm:px-7
            sm:py-6
            md:px-8
            md:py-7
            text-white
            relative
            overflow-hidden
          "
          style={{
            background:
              "linear-gradient(155deg, #FF6000 0%, #FF7800 48%, #FFA800 100%)",
          }}
        >
          {/* Brand */}

          <div
            className="
              inline-flex
              items-center
              gap-2
              px-3
              py-1.5
              rounded-full
              bg-white/20
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
              "
            />

            <span
              className="
                text-[9px]
                sm:text-[10px]
                font-black
                tracking-[1.5px]
              "
            >
              ZATPATT
            </span>
          </div>

          {/* Title */}

          <h1
            className="
              mt-3
              text-[22px]
              sm:text-[27px]
              md:text-[30px]
              font-black
              leading-tight
            "
          >
            Training Modules
          </h1>

          {/* Subtitle */}

          <p
            className="
              mt-1
              text-xs
              sm:text-sm
              text-white/90
            "
          >
            Complete each lesson to start delivering.
          </p>
        </div>

        {/* ===================================================
            CONTENT CARD
        =================================================== */}

        <div
          className="
            flex-1
            min-h-0
            bg-white
            rounded-b-[24px]
            sm:rounded-b-[28px]
            md:rounded-b-[30px]
            border
            border-t-0
            border-[#F3E7DC]
            shadow-[0_20px_60px_rgba(100,50,15,0.08)]
            px-4
            py-5
            sm:px-7
            sm:py-6
            md:px-8
            md:py-7
            flex
            flex-col
          "
        >
          {/* =================================================
              PROGRESS HEADER
          ================================================= */}

          <div className="shrink-0">
            <div
              className="
                flex
                items-center
                justify-between
                mb-2
              "
            >
              <p
                className="
                  text-xs
                  sm:text-sm
                  font-bold
                  text-[#2E1A0F]
                "
              >
                Your Progress
              </p>

              <p
                className="
                  text-xs
                  sm:text-sm
                  font-black
                  text-[#FF6600]
                "
              >
                {completionPercent}%
              </p>
            </div>

            {/* Progress bar */}

            <div
              className="
                h-2
                bg-[#F1E8E1]
                rounded-full
                overflow-hidden
              "
            >
              <div
                className="
                  h-full
                  rounded-full
                  transition-all
                  duration-500
                "
                style={{
                  width: `${completionPercent}%`,
                  background:
                    "linear-gradient(90deg, #FF6200 0%, #FFA800 100%)",
                }}
              />
            </div>
          </div>

          {/* =================================================
              LESSON LIST
          ================================================= */}

          <div
            className="
              flex-1
              min-h-0
              flex
              flex-col
              justify-center
              gap-2.5
              sm:gap-3
              mt-5
            "
          >
            {LESSONS.map((lesson, index) => {
              const isCompleted =
                index < progressCount;

              const isActive =
                index === progressCount;

              const isLocked =
                index > progressCount;

              return (
                <button
                  key={lesson.id}
                  type="button"
                  disabled={!isActive}
                  onClick={() =>
                    handleLessonClick(index)
                  }
                  className={`
                    w-full
                    flex
                    items-center
                    gap-3
                    sm:gap-4
                    p-3
                    sm:p-4
                    rounded-2xl
                    border
                    text-left
                    transition-all
                    duration-200
                    ${
                      isActive
                        ? "bg-[#FFF9F3] border-[#FFB36B] shadow-sm"
                        : isCompleted
                        ? "bg-[#F2FFF7] border-[#C8F3DA]"
                        : "bg-[#FAF8F5] border-[#E5E7EB] opacity-60"
                    }
                  `}
                >
                  {/* =================================================
                      ICON
                  ================================================= */}

                  <div
                    className={`
                      w-10
                      h-10
                      sm:w-11
                      sm:h-11
                      rounded-xl
                      flex
                      items-center
                      justify-center
                      shrink-0
                      ${
                        isCompleted
                          ? "bg-[#DCFCE7]"
                          : isActive
                          ? "bg-[#FFF0DE]"
                          : "bg-[#EEEEEE]"
                      }
                    `}
                  >
                    {isCompleted ? (
                      <CheckCircle
                        size={21}
                        className="text-[#18B957]"
                        strokeWidth={2.5}
                      />
                    ) : isActive ? (
                      <PlayCircle
                        size={22}
                        className="text-[#FF6600]"
                        strokeWidth={2}
                      />
                    ) : (
                      <Lock
                        size={18}
                        className="text-[#9CA3AF]"
                      />
                    )}
                  </div>

                  {/* =================================================
                      LESSON INFO
                  ================================================= */}

                  <div className="flex-1 min-w-0">
                    <p
                      className="
                        text-[13px]
                        sm:text-sm
                        font-black
                        text-[#2E1A0F]
                      "
                    >
                      {lesson.title}
                    </p>

                    <p
                      className="
                        text-[10px]
                        sm:text-xs
                        text-[#7C6657]
                        mt-0.5
                      "
                    >
                      {lesson.duration}
                    </p>
                  </div>

                  {/* =================================================
                      STATUS
                  ================================================= */}

                  {isCompleted && (
                    <span
                      className="
                        text-[9px]
                        sm:text-[10px]
                        font-black
                        text-[#18B957]
                        uppercase
                      "
                    >
                      Done
                    </span>
                  )}

                  {isActive && (
                    <ArrowRight
                      size={18}
                      className="
                        text-[#FF6600]
                        shrink-0
                      "
                    />
                  )}

                  {isLocked && (
                    <span
                      className="
                        text-[9px]
                        sm:text-[10px]
                        font-bold
                        text-[#9CA3AF]
                      "
                    >
                      Locked
                    </span>
                  )}
                </button>
              );
            })}
          </div>

          {/* =================================================
              BOTTOM BUTTON
          ================================================= */}

          <div
            className="
              shrink-0
              mt-4
              sm:mt-5
            "
          >
            <button
              type="button"
              onClick={() =>
                handleLessonClick(
                  progressCount
                )
              }
              className="
                w-full
                py-3
                sm:py-3.5
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
                active:scale-[0.99]
                transition-transform
              "
              style={{
                background:
                  "linear-gradient(90deg, #FF6200 0%, #FFA800 100%)",

                boxShadow:
                  "0 8px 20px rgba(255,98,0,0.20)",
              }}
            >
              <span>
                {progressCount === 0
                  ? "Start Course"
                  : `Continue Lesson ${
                      progressCount + 1
                    }`}
              </span>

              <ArrowRight
                size={18}
                strokeWidth={2.7}
              />
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}