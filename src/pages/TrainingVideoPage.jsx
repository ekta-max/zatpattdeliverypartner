//src\pages\TrainingVideoPage.jsx

import React, { useEffect, useRef, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { CheckCircle2 } from "lucide-react";

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

export default function TrainingVideoPage() {
  const { id } = useParams();
  const navigate = useNavigate();
  const videoRef = useRef(null);

  // ✅ tracks the furthest point actually watched (not just "last time")
  const maxTimeRef = useRef(0);

  const lessonId = Number(id);
  const lessonIndex = LESSONS.findIndex((l) => l.id === lessonId);

  const [videoEnded, setVideoEnded] = useState(false);

  /* 🔐 HARD FLOW PROTECTION */
  useEffect(() => {
    const completed = localStorage.getItem("training_completed");
    const progress = Number(
      localStorage.getItem("training_progress") || 0
    );

    if (completed === "true") {
      navigate("/dashboard", { replace: true });
      return;
    }

    if (lessonIndex === -1) {
      navigate("/training", { replace: true });
      return;
    }

    if (lessonIndex !== progress) {
      navigate("/training", { replace: true });
    }
  }, [lessonIndex, navigate]);

  // ✅ reset the watched-progress tracker whenever the lesson changes
  useEffect(() => {
    maxTimeRef.current = 0;
    setVideoEnded(false);
  }, [lessonIndex]);

  /* ✅ Track furthest point reached during normal playback */
  const handleTimeUpdate = () => {
    if (!videoRef.current) return;
    const current = videoRef.current.currentTime;
    if (current > maxTimeRef.current) {
      maxTimeRef.current = current;
    }
  };

  /* ✅ Only correct AFTER the seek completes (not mid-drag) —
     this is what fixes the freeze. Allows rewinding freely,
     only snaps back if the user tried to skip ahead. */
  const handleSeeked = () => {
    if (!videoRef.current) return;

    if (videoRef.current.currentTime > maxTimeRef.current + 0.5) {
      // small buffer (0.5s) avoids fighting normal playback rounding
      videoRef.current.currentTime = maxTimeRef.current;
    }

    // ✅ ensure playback actually resumes after a corrected seek
    videoRef.current.play().catch(() => {
      // autoplay restrictions can reject this silently — ignore
    });
  };

  const handleEnded = () => {
    setVideoEnded(true);
  };

  const handleMarkCompleted = () => {
    const currentProgress = Number(
      localStorage.getItem("training_progress") || 0
    );

    const nextProgress = currentProgress + 1;

    if (nextProgress >= LESSONS.length) {
      localStorage.setItem("training_completed", "true");
      localStorage.removeItem("training_progress");
      navigate("/training-completed", { replace: true });
    } else {
      localStorage.setItem("training_progress", String(nextProgress));
      navigate("/training", { replace: true });
    }
  };

  return (
    <div className="min-h-screen bg-black flex flex-col">
      <video
        ref={videoRef}
        key={LESSONS[lessonIndex]?.videoUrl}
        autoPlay
        controls
        controlsList="nodownload noplaybackrate"
        disablePictureInPicture
        onTimeUpdate={handleTimeUpdate}
        onSeeked={handleSeeked}
        onEnded={handleEnded}
        className="w-full h-[70vh] object-contain"
      >
        <source src={LESSONS[lessonIndex]?.videoUrl} type="video/mp4" />
      </video>

      <div className="bg-white p-4 flex flex-col items-center gap-3">
        <div className="text-center">
          <p className="font-semibold text-gray-900">
            {LESSONS[lessonIndex]?.title}
          </p>
          <p className="text-xs text-gray-500 mt-1">
            {videoEnded
              ? "Great! Tap below to continue"
              : "Watch till the end to continue"}
          </p>
        </div>

        <button
          onClick={handleMarkCompleted}
          disabled={!videoEnded}
          className={`w-full max-w-md py-3 rounded-xl font-semibold flex items-center justify-center gap-2 transition ${
            videoEnded
              ? "bg-orange-500 text-white active:bg-orange-600"
              : "bg-gray-200 text-gray-400 cursor-not-allowed"
          }`}
        >
          <CheckCircle2 size={18} />
          Mark as Completed
        </button>
      </div>
    </div>
  );
}