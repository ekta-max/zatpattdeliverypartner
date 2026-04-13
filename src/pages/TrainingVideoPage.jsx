//src\pages\TrainingVideoPage.jsx

import React, { useEffect, useRef } from "react";
import { useParams, useNavigate } from "react-router-dom";

const LESSONS = [
  { id: 1, title: "Introduction to Zatpatt" },
  { id: 2, title: "How to deliver orders" },
  { id: 3, title: "Payments & Earnings" },
];

export default function TrainingVideoPage() {
  const { id } = useParams();
  const navigate = useNavigate();
  const videoRef = useRef(null);

  const lessonId = Number(id);
  const lessonIndex = LESSONS.findIndex(
    (l) => l.id === lessonId
  );

  /* 🔐 HARD FLOW PROTECTION */
  useEffect(() => {
    const verified = localStorage.getItem("verification_status");
    const completed = localStorage.getItem("training_completed");
    const progress = Number(
      localStorage.getItem("training_progress") || 0
    );

    

    // ❌ Training already completed
    if (completed === "true") {
      navigate("/dashboard", { replace: true });
      return;
    }

    // ❌ Invalid lesson
    if (lessonIndex === -1) {
      navigate("/training", { replace: true });
      return;
    }

    // ❌ Prevent skipping lessons
    if (lessonIndex !== progress) {
      navigate("/training", { replace: true });
    }
  }, [lessonIndex, navigate]);

  /* 🔒 BLOCK SEEKING */
  const handleSeeking = () => {
    if (!videoRef.current) return;
    videoRef.current.currentTime =
      videoRef.current.dataset.lastTime || 0;
  };

  const handleTimeUpdate = () => {
    if (!videoRef.current) return;
    videoRef.current.dataset.lastTime =
      videoRef.current.currentTime;
  };

  /* ✅ VIDEO COMPLETED */
  const handleEnded = () => {
    const currentProgress = Number(
      localStorage.getItem("training_progress") || 0
    );

    const nextProgress = currentProgress + 1;

    if (nextProgress >= LESSONS.length) {
      // 🎉 TRAINING COMPLETED
      localStorage.setItem("training_completed", "true");
      localStorage.removeItem("training_progress");
      navigate("/training-completed", { replace: true });
    } else {
      // 🔓 UNLOCK NEXT LESSON
      localStorage.setItem(
        "training_progress",
        String(nextProgress)
      );
      navigate("/training", { replace: true });
    }
  };

  return (
    <div className="min-h-screen bg-black flex flex-col">
      <video
        ref={videoRef}
        autoPlay
        controls
        controlsList="nodownload noplaybackrate"
        disablePictureInPicture
        onSeeking={handleSeeking}
        onTimeUpdate={handleTimeUpdate}
        onEnded={handleEnded}
        className="w-full h-[70vh] object-contain"
      >
        {/* 🔁 Replace later with backend video URLs */}
        <source
          src="/dummy-training-video.mp4"
          type="video/mp4"
        />
      </video>

      <div className="bg-white p-4 text-center">
        <p className="font-semibold text-gray-900">
          {LESSONS[lessonIndex]?.title}
        </p>
        <p className="text-xs text-gray-500 mt-1">
          Watch till the end to continue
        </p>
      </div>
    </div>
  );
}
