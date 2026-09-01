// src/pages/TrainingVideoPage.jsx

import React, { useEffect, useRef, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { CheckCircle2, ArrowLeft } from "lucide-react";

import api from "../Services/api";

export default function TrainingVideoPage() {
  const { id } = useParams();
  const navigate = useNavigate();

  const videoRef = useRef(null);
  const maxTimeRef = useRef(0);

  const lessonId = Number(id);

  // =========================================================
  // STATES
  // =========================================================

  const [lessons, setLessons] = useState([]);
  const [loading, setLoading] = useState(true);
  const [videoEnded, setVideoEnded] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState("");

  // =========================================================
  // CURRENT LESSON
  // =========================================================

  const lessonIndex = lessons.findIndex(
    (lesson) => Number(lesson.id) === lessonId
  );

  const currentLesson =
    lessonIndex !== -1 ? lessons[lessonIndex] : null;

  // =========================================================
  // FETCH TRAINING CONTENT
  // =========================================================

  const fetchTrainingContent = async () => {
    try {
      setLoading(true);
      setError("");

      const response = await api.get(
        "/api/v1/common/delivery-partner/content-data/"
      );

      console.log("Training content response:", response.data);

      if (
        response.data?.status === true &&
        Array.isArray(response.data?.data)
      ) {
        const formattedLessons = response.data.data
          .sort((a, b) => Number(a.order) - Number(b.order))
          .map((item) => ({
            id: Number(item.id),
            title: item.title,
            videoUrl: item.video,
            order: Number(item.order),
          }));

        setLessons(formattedLessons);
      } else {
        setLessons([]);
        setError("Unable to load training videos.");
      }
    } catch (err) {
      console.error(
        "Failed to fetch training content:",
        err
      );

      console.error(
        "API response:",
        err?.response?.data
      );

      setLessons([]);
      setError(
        err?.response?.data?.message ||
          err?.response?.data?.detail ||
          "Unable to load training videos."
      );
    } finally {
      setLoading(false);
    }
  };

  // =========================================================
  // LOAD VIDEOS
  // =========================================================

  useEffect(() => {
    fetchTrainingContent();
  }, []);

  // =========================================================
  // CHECK LESSON ACCESS
  // =========================================================

  useEffect(() => {
    // Don't check until API has loaded
    if (loading) return;

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

    // No lessons
    if (lessons.length === 0) {
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
     * progress = 0 -> first video
     * progress = 1 -> second video
     * progress = 2 -> third video
     */

    if (lessonIndex !== progress) {
      navigate("/training", {
        replace: true,
      });
    }
  }, [
    loading,
    lessons,
    lessonIndex,
    navigate,
  ]);

  // =========================================================
  // RESET VIDEO PROGRESS WHEN LESSON CHANGES
  // =========================================================

  useEffect(() => {
    maxTimeRef.current = 0;
    setVideoEnded(false);

    if (videoRef.current) {
      videoRef.current.currentTime = 0;
    }
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

    if (!currentLesson) return;

    try {
      setSubmitting(true);

      const currentProgress = Number(
        localStorage.getItem(
          "training_progress"
        ) || 0
      );

      /*
       * Example:
       *
       * First video:
       * lessonIndex = 0
       * nextProgress = 1
       *
       * Second video:
       * lessonIndex = 1
       * nextProgress = 2
       *
       * Third video:
       * lessonIndex = 2
       * nextProgress = 3
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
      // MARK COURSE API
      // =====================================================

      const response = await api.post(
        "/api/v1/common/delivery-partner/mark-course/",
        payload
      );

      console.log(
        "Mark course response:",
        response.data
      );

      // =====================================================
      // UPDATE LOCAL PROGRESS
      // =====================================================

      if (nextProgress >= lessons.length) {
        // All videos completed

        localStorage.setItem(
          "training_completed",
          "true"
        );

        localStorage.setItem(
          "training_progress",
          String(lessons.length)
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
  // LOADING
  // =========================================================

  if (loading) {
    return (
      <div className="h-dvh w-full bg-black flex items-center justify-center">
        <div className="text-white text-center">
          <div
            className="
              w-8
              h-8
              mx-auto
              mb-3
              rounded-full
              border-4
              border-white/30
              border-t-white
              animate-spin
            "
          />

          <p className="text-sm">
            Loading training video...
          </p>
        </div>
      </div>
    );
  }

  // =========================================================
  // ERROR
  // =========================================================

  if (error) {
    return (
      <div className="h-dvh w-full bg-[#FAF6F0] flex items-center justify-center px-5">
        <div className="bg-white w-full max-w-md rounded-3xl p-6 text-center shadow-sm">
          <h2 className="text-lg font-black text-[#2E1A0F]">
            Unable to load training
          </h2>

          <p className="text-sm text-[#7C6657] mt-2">
            {error}
          </p>

          <button
            type="button"
            onClick={fetchTrainingContent}
            className="
              w-full
              mt-5
              py-3
              rounded-xl
              text-white
              font-black
            "
            style={{
              background:
                "linear-gradient(90deg, #FF6200 0%, #FFA800 100%)",
            }}
          >
            Try Again
          </button>
        </div>
      </div>
    );
  }

  // =========================================================
  // INVALID LESSON
  // =========================================================

  if (!currentLesson) {
    return null;
  }

  // =========================================================
  // PAGE
  // =========================================================

  return (
    <div className="h-dvh w-full bg-black flex flex-col overflow-hidden">
      {/* =====================================================
          VIDEO HEADER
      ===================================================== */}

      <div
        className="
          absolute
          top-0
          left-0
          right-0
          z-10
          p-3
          sm:p-4
        "
      >
        <button
          type="button"
          onClick={() => navigate("/training")}
          className="
            w-10
            h-10
            sm:w-11
            sm:h-11
            rounded-full
            bg-black/40
            backdrop-blur-sm
            text-white
            flex
            items-center
            justify-center
          "
        >
          <ArrowLeft size={20} />
        </button>
      </div>

      {/* =====================================================
          VIDEO
      ===================================================== */}

      <div
        className="
          flex-1
          min-h-0
          flex
          items-center
          justify-center
          bg-black
        "
      >
        <video
          ref={videoRef}
          key={currentLesson.videoUrl}
          autoPlay
          controls
          controlsList="nodownload noplaybackrate"
          disablePictureInPicture
          playsInline
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

          Your browser does not support video playback.
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
        {/* =================================================
            LESSON INFORMATION
        ================================================= */}

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
            VIDEO NUMBER
        ================================================= */}

        <p
          className="
            text-center
            text-[11px]
            sm:text-xs
            font-bold
            text-[#A56B3F]
            mb-3
          "
        >
          Video {lessonIndex + 1} of {lessons.length}
        </p>

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