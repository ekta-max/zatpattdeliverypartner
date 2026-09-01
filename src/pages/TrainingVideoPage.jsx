// src/pages/TrainingVideoPage.jsx

import React, { useEffect, useRef, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { CheckCircle2, ArrowLeft } from "lucide-react";
import axios from "axios";

const LESSONS = [
  {
    id: 1,
    title: "Introduction to Zatpatt",
    videoUrl: "/videos/lesson1.mp4",
  },
  {
    id: 2,
    title: "How to deliver orders",
    videoUrl: "/videos/lesson2.mp4",
  },
  {
    id: 3,
    title: "Payments & Earnings",
    videoUrl: "/videos/lesson3.mp4",
  },
];

const MARK_COURSE_API =
  "http://localhost:8002/api/v1/common/delivery-partner/mark-course/";

export default function TrainingVideoPage() {
  const { id } = useParams();
  const navigate = useNavigate();

  const videoRef = useRef(null);

  // =========================================================
  // VIDEO PROGRESS
  // =========================================================

  const maxTimeRef = useRef(0);

  const lessonId = Number(id);

  const lessonIndex = LESSONS.findIndex(
    (lesson) => lesson.id === lessonId
  );

  const currentLesson = LESSONS[lessonIndex];

  const [videoEnded, setVideoEnded] = useState(false);
  const [submitting, setSubmitting] = useState(false);

  // =========================================================
  // CHECK LESSON ACCESS
  // =========================================================

  useEffect(() => {
    const completed = localStorage.getItem(
      "training_completed"
    );

    const progress = Number(
      localStorage.getItem("training_progress") || 0
    );

    // Training already completed
    if (completed === "true") {
      navigate("/training-completed", {
        replace: true,
      });
      return;
    }

    // Invalid lesson
    if (lessonIndex === -1) {
      navigate("/training", {
        replace: true,
      });
      return;
    }

    /*
     * Only the current lesson can be opened.
     *
     * progress = 0 -> lesson 1
     * progress = 1 -> lesson 2
     * progress = 2 -> lesson 3
     */

    if (lessonIndex !== progress) {
      navigate("/training", {
        replace: true,
      });
    }
  }, [lessonIndex, navigate]);

  // =========================================================
  // RESET WATCH PROGRESS WHEN LESSON CHANGES
  // =========================================================

  useEffect(() => {
    maxTimeRef.current = 0;
    setVideoEnded(false);
  }, [lessonIndex]);

  // =========================================================
  // TRACK VIDEO TIME
  // =========================================================

  const handleTimeUpdate = () => {
    if (!videoRef.current) return;

    const current =
      videoRef.current.currentTime;

    if (current > maxTimeRef.current) {
      maxTimeRef.current = current;
    }
  };

  // =========================================================
  // PREVENT SKIPPING
  // =========================================================

  const handleSeeked = () => {
    if (!videoRef.current) return;

    if (
      videoRef.current.currentTime >
      maxTimeRef.current + 0.5
    ) {
      videoRef.current.currentTime =
        maxTimeRef.current;
    }

    videoRef.current.play().catch(() => {
      // Ignore autoplay restrictions
    });
  };

  // =========================================================
  // VIDEO ENDED
  // =========================================================

  const handleEnded = () => {
    setVideoEnded(true);
  };

  // =========================================================
  // MARK COURSE COMPLETED
  // =========================================================

  const handleMarkCompleted = async () => {
    if (!videoEnded) return;

    if (submitting) return;

    try {
      setSubmitting(true);

      const currentProgress = Number(
        localStorage.getItem(
          "training_progress"
        ) || 0
      );

      /*
       * Current lesson index:
       *
       * lesson 1 -> index 0
       * lesson 2 -> index 1
       * lesson 3 -> index 2
       */

      const nextProgress = Math.max(
        currentProgress,
        lessonIndex + 1
      );

      // =====================================================
      // BUILD API PAYLOAD
      // =====================================================

      const payload = {
        first_video: nextProgress >= 1,
        second_video: nextProgress >= 2,
        third_video: nextProgress >= 3,
      };

      console.log(
        "Mark course payload:",
        payload
      );

      // =====================================================
      // GET TOKEN
      // =====================================================

      const token =
        localStorage.getItem("access_token") ||
        localStorage.getItem("accessToken");

      // =====================================================
      // API REQUEST
      // =====================================================

      const response = await axios.post(
        MARK_COURSE_API,
        payload,
        {
          headers: {
            "Content-Type": "application/json",

            ...(token && {
              Authorization: `Bearer ${token}`,
            }),
          },
        }
      );

      console.log(
        "Mark course response:",
        response.data
      );

      // =====================================================
      // UPDATE LOCAL PROGRESS
      // =====================================================

      if (nextProgress >= LESSONS.length) {
        // All videos completed

        localStorage.setItem(
          "training_completed",
          "true"
        );

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
      // MOVE TO NEXT LESSON
      // =====================================================

      localStorage.setItem(
        "training_progress",
        String(nextProgress)
      );

      navigate("/training", {
        replace: true,
      });
    } catch (error) {
      console.error(
        "Failed to mark course completed:",
        error
      );

      console.error(
        "API response:",
        error?.response?.data
      );

      alert(
        error?.response?.data?.message ||
          error?.response?.data?.detail ||
          "Unable to mark lesson as completed. Please try again."
      );
    } finally {
      setSubmitting(false);
    }
  };

  // =========================================================
  // INVALID LESSON
  // =========================================================

  if (lessonIndex === -1) {
    return null;
  }

  // =========================================================
  // PAGE
  // =========================================================

  return (
    <div className="h-dvh w-full bg-black flex flex-col overflow-hidden">
      {/* =====================================================
          VIDEO
      ===================================================== */}

      <div className="flex-1 min-h-0 flex items-center justify-center bg-black">
        <video
          ref={videoRef}
          key={currentLesson.videoUrl}
          autoPlay
          controls
          controlsList="nodownload noplaybackrate"
          disablePictureInPicture
          onTimeUpdate={handleTimeUpdate}
          onSeeked={handleSeeked}
          onEnded={handleEnded}
          className="
            w-full
            h-full
            object-contain
          "
        >
          <source
            src={currentLesson.videoUrl}
            type="video/mp4"
          />
        </video>
      </div>

      {/* =====================================================
          BOTTOM PANEL
      ===================================================== */}

      <div
        className="
          shrink-0
          bg-[#FAF6F0]
          rounded-t-[24px]
          px-4
          py-4
          sm:px-6
          sm:py-5
        "
      >
        {/* Lesson information */}

        <div className="text-center mb-3">
          <p
            className="
              text-sm
              sm:text-base
              font-black
              text-[#2E1A0F]
            "
          >
            {currentLesson.title}
          </p>

          <p
            className="
              text-[11px]
              sm:text-xs
              text-[#7C6657]
              mt-1
            "
          >
            {videoEnded
              ? "Great! You have completed this video."
              : "Watch the video till the end to continue."}
          </p>
        </div>

        {/* =================================================
            BUTTON
        ================================================= */}

        <button
          type="button"
          onClick={handleMarkCompleted}
          disabled={!videoEnded || submitting}
          className={`
            w-full
            max-w-[560px]
            mx-auto
            py-3
            sm:py-3.5
            rounded-xl
            font-black
            text-sm
            sm:text-base
            flex
            items-center
            justify-center
            gap-2
            transition-all
            ${
              videoEnded && !submitting
                ? "text-white active:scale-[0.99]"
                : "bg-[#E8E4E0] text-[#A9A19A] cursor-not-allowed"
            }
          `}
          style={
            videoEnded && !submitting
              ? {
                  background:
                    "linear-gradient(90deg, #FF6200 0%, #FFA800 100%)",
                  boxShadow:
                    "0 8px 20px rgba(255,98,0,0.20)",
                }
              : undefined
          }
        >
          {submitting ? (
            <>
              <div
                className="
                  w-4
                  h-4
                  rounded-full
                  border-2
                  border-white
                  border-t-transparent
                  animate-spin
                "
              />

              <span>
                Saving...
              </span>
            </>
          ) : (
            <>
              <CheckCircle2 size={18} />

              <span>
                Mark as Completed
              </span>
            </>
          )}
        </button>
      </div>
    </div>
  );
}