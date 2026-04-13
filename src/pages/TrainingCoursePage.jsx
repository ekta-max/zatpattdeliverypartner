//src\pages\TrainingCoursePage.jsx

import React, { useEffect, useState } from "react";
import { Lock, PlayCircle, CheckCircle } from "lucide-react";
import { useNavigate } from "react-router-dom";

const LESSONS = [
  { id: 1, title: "Introduction to Zatpatt", duration: "1 min" },
  { id: 2, title: "How to deliver orders", duration: "3 min" },
  { id: 3, title: "Payments & Earnings", duration: "2 min" },
];

export default function TrainingCoursePage() {
  const navigate = useNavigate();

  const [progress, setProgress] = useState(0); // number of completed videos

  /* 🔐 HARD FLOW PROTECTION */
  useEffect(() => {
    const verification = localStorage.getItem("verification_status");
    const trainingCompleted = localStorage.getItem("training_completed");

   

    if (trainingCompleted === "true") {
      navigate("/dashboard", { replace: true });
      return;
    }

    const savedProgress = Number(
      localStorage.getItem("training_progress") || 0
    );

    setProgress(savedProgress);
  }, [navigate]);

  const completionPercent = Math.round(
    (progress / LESSONS.length) * 100
  );

  const handleLessonClick = (index) => {
    if (index !== progress) return; // 🚫 block skipping

    navigate(`/training/video/${LESSONS[index].id}`);
  };

  return (
    <div className="min-h-screen bg-white px-4 py-6">
      <h2 className="text-lg font-semibold mb-1">
        Training Modules
      </h2>

      <p className="text-sm text-gray-500 mb-4">
        {completionPercent}% completed
      </p>

      {/* PROGRESS BAR */}
      <div className="h-1 bg-gray-200 rounded mb-6">
        <div
          className="h-1 bg-orange-500 rounded transition-all"
          style={{ width: `${completionPercent}%` }}
        />
      </div>

      {/* LESSON LIST */}
      <div className="space-y-3">
        {LESSONS.map((lesson, index) => {
          const isCompleted = index < progress;
          const isActive = index === progress;
          const isLocked = index > progress;

          return (
            <div
              key={lesson.id}
              onClick={() => isActive && handleLessonClick(index)}
              className={`flex items-center gap-4 p-4 rounded-xl border transition ${
                isActive
                  ? "bg-orange-50 border-orange-400 cursor-pointer"
                  : "bg-gray-100"
              }`}
            >
              {isCompleted ? (
                <CheckCircle className="text-green-500" />
              ) : isActive ? (
                <PlayCircle className="text-orange-500" />
              ) : (
                <Lock className="text-gray-400" />
              )}

              <div className="flex-1">
                <p className="font-medium text-sm">
                  {lesson.title}
                </p>
                <p className="text-xs text-gray-500">
                  {lesson.duration}
                </p>
              </div>

              {isLocked && (
                <span className="text-xs text-gray-400">
                  Locked
                </span>
              )}
            </div>
          );
        })}
      </div>

      {/* CTA */}
      <button
        disabled={progress !== 0}
        className={`mt-8 w-full py-3 rounded-xl font-semibold ${
          progress === 0
            ? "bg-orange-500 text-white"
            : "bg-gray-200 text-gray-400"
        }`}
      >
        Start Course
      </button>
    </div>
  );
}
