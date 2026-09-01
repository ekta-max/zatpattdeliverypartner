// src/pages/TrainingCoursePage.jsx

import React, {
  useEffect,
  useRef,
  useState,
} from "react";

import { useNavigate } from "react-router-dom";

import {
  ArrowLeft,
  Play,
  CheckCircle,
  ChevronLeft,
  ChevronRight,
  Loader2,
  AlertCircle,
} from "lucide-react";

import api from "../Services/api";

export default function TrainingCoursePage() {
  const navigate = useNavigate();

  // --------------------------------------------------
  // STATES
  // --------------------------------------------------

  const [videos, setVideos] = useState([]);
  const [currentVideo, setCurrentVideo] = useState(0);

  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  const [completedVideos, setCompletedVideos] = useState([]);

  // Prevent React StrictMode duplicate API call
  const hasFetched = useRef(false);

  // --------------------------------------------------
  // API
  // --------------------------------------------------

  const CONTENT_API =
    "/api/v1/common/delivery-partner/content-data/";

  // --------------------------------------------------
  // FETCH TRAINING CONTENT
  // --------------------------------------------------

  const fetchVideos = async () => {
    try {
      setLoading(true);
      setError("");

      console.log("Fetching training content...");

      const response = await api.get(CONTENT_API);

      console.log(
        "Training content response:",
        response.data
      );

      if (
        response.data?.status !== true ||
        !Array.isArray(response.data?.data)
      ) {
        throw new Error(
          response.data?.message ||
            "Training videos could not be loaded."
        );
      }

      // --------------------------------------------------
      // SORT BY ORDER
      // --------------------------------------------------

      const sortedVideos = [
        ...response.data.data,
      ]
        .sort(
          (a, b) =>
            Number(a.order) - Number(b.order)
        )
        .map((video) => ({
          id: Number(video.id),
          title:
            video.title ||
            `Video ${video.order}`,
          video: video.video,
          order: Number(video.order),
        }));

      console.log(
        "Training videos:",
        sortedVideos
      );

      setVideos(sortedVideos);

      // First video
      setCurrentVideo(0);

      // --------------------------------------------------
      // LOAD LOCAL PROGRESS
      // --------------------------------------------------

      try {
        const saved =
          localStorage.getItem(
            "completed_training_videos"
          );

        if (saved) {
          const parsed = JSON.parse(saved);

          if (Array.isArray(parsed)) {
            setCompletedVideos(parsed);
          }
        }
      } catch (storageError) {
        console.warn(
          "Unable to load training progress:",
          storageError
        );
      }
    } catch (err) {
      console.error(
        "Training content API error:",
        err
      );

      console.error(
        "API response:",
        err?.response?.data
      );

      setError(
        err?.response?.data?.message ||
          err?.response?.data?.detail ||
          err?.message ||
          "Unable to load training videos."
      );
    } finally {
      setLoading(false);
    }
  };

  // --------------------------------------------------
  // INITIAL LOAD
  // --------------------------------------------------

  useEffect(() => {
    if (hasFetched.current) {
      return;
    }

    hasFetched.current = true;

    fetchVideos();
  }, []);

  // --------------------------------------------------
  // MARK VIDEO COMPLETED
  // --------------------------------------------------

  const markVideoCompleted = (videoId) => {
    if (!videoId) return;

    setCompletedVideos((previous) => {
      // Already completed
      if (previous.includes(videoId)) {
        return previous;
      }

      const updated = [
        ...previous,
        videoId,
      ];

      localStorage.setItem(
        "completed_training_videos",
        JSON.stringify(updated)
      );

      return updated;
    });
  };

  // --------------------------------------------------
  // VIDEO ENDED
  // --------------------------------------------------

  const handleVideoEnded = () => {
    const video = videos[currentVideo];

    if (!video) return;

    console.log(
      "Video reached end:",
      video.title
    );

    // Do NOT automatically mark completed.
    // User must click "Mark as Completed".
  };

  // --------------------------------------------------
  // MANUAL MARK COMPLETED
  // --------------------------------------------------

  const handleMarkCompleted = () => {
    const video = videos[currentVideo];

    if (!video) return;

    console.log(
      "Marking video completed:",
      video.title
    );

    markVideoCompleted(video.id);
  };

  // --------------------------------------------------
  // VIDEO ERROR
  // --------------------------------------------------

  const handleVideoError = (event) => {
    const video = videos[currentVideo];

    console.error(
      "Video failed to load ❌"
    );

    console.error(
      "Video URL:",
      video?.video
    );

    console.error(
      "Video element:",
      event.currentTarget
    );
  };

  // --------------------------------------------------
  // PREVIOUS VIDEO
  // --------------------------------------------------

  const handlePrevious = () => {
    if (currentVideo > 0) {
      setCurrentVideo(
        (previous) => previous - 1
      );
    }
  };

  // --------------------------------------------------
  // NEXT VIDEO
  // --------------------------------------------------

  const handleNext = () => {
    if (
      currentVideo <
      videos.length - 1
    ) {
      setCurrentVideo(
        (previous) => previous + 1
      );
    }
  };

  // --------------------------------------------------
  // COMPLETE TRAINING
  // --------------------------------------------------

  const handleCompleteTraining = () => {
    localStorage.setItem(
      "training_completed",
      "true"
    );

    navigate("/training-completed");
  };

  // --------------------------------------------------
  // RETRY
  // --------------------------------------------------

  const handleRetry = () => {
    hasFetched.current = false;
    fetchVideos();
  };

  // --------------------------------------------------
  // LOADING
  // --------------------------------------------------

  if (loading) {
    return (
      <div
        className="min-h-screen flex items-center justify-center px-4"
        style={{
          backgroundColor: "#FAF6F0",
        }}
      >
        <div className="bg-white rounded-3xl border border-[#F3E7DC] shadow-[0_20px_60px_rgba(100,50,15,0.08)] px-8 py-8 text-center">

          <Loader2
            size={34}
            className="mx-auto mb-4 text-[#FF6600] animate-spin"
          />

          <p className="font-bold text-[#2E1A0F]">
            Loading training videos...
          </p>

          <p className="text-xs text-[#7C6657] mt-1">
            Please wait
          </p>

        </div>
      </div>
    );
  }

  // --------------------------------------------------
  // ERROR / NO VIDEOS
  // --------------------------------------------------

  if (
    error ||
    videos.length === 0
  ) {
    return (
      <div
        className="min-h-screen flex items-center justify-center px-4"
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
            )
          `,
        }}
      >

        <div className="bg-white w-full max-w-md rounded-3xl border border-[#F3E7DC] shadow-[0_20px_60px_rgba(100,50,15,0.08)] p-7 sm:p-8 text-center">

          <div className="w-16 h-16 mx-auto rounded-full bg-[#FFF5EC] border border-[#FED7AA] flex items-center justify-center mb-5">

            <AlertCircle
              size={30}
              className="text-[#FF6600]"
            />

          </div>

          <h2 className="text-xl font-black text-[#2E1A0F]">
            Training Videos Unavailable
          </h2>

          <p className="text-sm text-[#7C6657] mt-2">
            {error ||
              "No training videos were found."}
          </p>

          <button
            type="button"
            onClick={handleRetry}
            className="w-full mt-6 py-3 rounded-xl text-white font-bold shadow-md"
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

  // --------------------------------------------------
  // CURRENT VIDEO
  // --------------------------------------------------

  const currentVideoData =
    videos[currentVideo];

  const isCurrentVideoCompleted =
    completedVideos.includes(
      currentVideoData.id
    );

  // --------------------------------------------------
  // COMPLETED COUNT
  // --------------------------------------------------

  const completedCount =
    videos.filter((video) =>
      completedVideos.includes(video.id)
    ).length;

  const allVideosCompleted =
    videos.length > 0 &&
    completedCount === videos.length;

  const progressPercentage =
    videos.length > 0
      ? (completedCount / videos.length) *
        100
      : 0;

  // --------------------------------------------------
  // MAIN
  // --------------------------------------------------

  return (
    <div
      className="min-h-screen w-full pb-8"
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
          )
        `,
      }}
    >

      {/* ==================================================
          HEADER
      ================================================== */}

      <header className="bg-white border-b border-[#F3E7DC] shadow-sm sticky top-0 z-30">

        <div className="max-w-5xl mx-auto px-4 sm:px-6 py-4">

          <div className="flex items-center">

            <button
              type="button"
              onClick={() =>
                navigate(-1)
              }
              className="w-10 h-10 rounded-xl border border-[#E5E7EB] flex items-center justify-center text-[#2E1A0F] hover:bg-[#FAF6F0] transition"
            >
              <ArrowLeft size={20} />
            </button>

            <div className="ml-3 min-w-0">

              <h1 className="text-lg sm:text-xl font-black text-[#2E1A0F] truncate">
                Training Course
              </h1>

              <p className="text-xs sm:text-sm text-[#7C6657]">
                Complete all training videos
              </p>

            </div>

          </div>

        </div>

      </header>

      {/* ==================================================
          MAIN CONTENT
      ================================================== */}

      <main className="max-w-5xl mx-auto px-4 sm:px-6 py-5 sm:py-8">

        {/* ==================================================
            PROGRESS
        ================================================== */}

        <div className="bg-white rounded-3xl border border-[#F3E7DC] shadow-[0_12px_40px_rgba(100,50,15,0.06)] p-4 sm:p-5 mb-5">

          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">

            <div>

              <p className="text-xs sm:text-sm text-[#7C6657]">
                Training Progress
              </p>

              <h2 className="text-lg sm:text-xl font-black text-[#2E1A0F]">
                Video{" "}
                {currentVideo + 1}{" "}
                of {videos.length}
              </h2>

            </div>

            <div className="text-left sm:text-right">

              <p className="text-sm font-bold text-[#FF6600]">
                {completedCount} /{" "}
                {videos.length} completed
              </p>

            </div>

          </div>

          <div className="mt-4 h-2 bg-[#FFF0E4] rounded-full overflow-hidden">

            <div
              className="h-full rounded-full transition-all duration-500"
              style={{
                width: `${progressPercentage}%`,
                background:
                  "linear-gradient(90deg, #FF6200 0%, #FFA800 100%)",
              }}
            />

          </div>

        </div>

        {/* ==================================================
            VIDEO CARD
        ================================================== */}

        <div className="bg-white rounded-3xl border border-[#F3E7DC] shadow-[0_12px_40px_rgba(100,50,15,0.06)] overflow-hidden">

          {/* VIDEO */}

          <div className="bg-black w-full aspect-video">

            <video
              key={currentVideoData.id}
              src={currentVideoData.video}
              controls
              playsInline
              preload="none"
              onEnded={handleVideoEnded}
              onError={handleVideoError}
              className="w-full h-full object-contain"
            >
              Your browser does not support
              the video tag.
            </video>

          </div>

          {/* VIDEO DETAILS */}

          <div className="p-4 sm:p-6">

            <div className="flex flex-col sm:flex-row sm:items-start sm:justify-between gap-4">

              <div className="min-w-0">

                <div className="flex items-center gap-2 mb-2">

                  <span className="w-8 h-8 rounded-full bg-[#FFF0E4] text-[#FF6600] flex items-center justify-center text-sm font-bold flex-shrink-0">
                    {currentVideoData.order}
                  </span>

                  <span className="text-xs sm:text-sm text-[#7C6657]">
                    Training Video
                  </span>

                </div>

                <h2 className="text-xl sm:text-2xl font-black text-[#2E1A0F] break-words">
                  {currentVideoData.title}
                </h2>

              </div>

              {/* COMPLETED BADGE */}

              {isCurrentVideoCompleted && (
                <div className="flex items-center gap-2 text-green-700 bg-green-50 border border-green-200 px-3 py-2 rounded-xl text-sm font-bold self-start">

                  <CheckCircle
                    size={17}
                  />

                  Completed

                </div>
              )}

            </div>

            {/* ==================================================
                MARK AS COMPLETED BUTTON
            ================================================== */}

            <div className="mt-6">

              {!isCurrentVideoCompleted ? (

                <button
                  type="button"
                  onClick={
                    handleMarkCompleted
                  }
                  className="w-full py-3.5 rounded-xl text-white font-black flex items-center justify-center gap-2 shadow-md hover:shadow-lg active:scale-[0.99] transition"
                  style={{
                    background:
                      "linear-gradient(90deg, #FF6200 0%, #FFA800 100%)",
                  }}
                >

                  <CheckCircle
                    size={20}
                  />

                  Mark as Completed

                </button>

              ) : (

                <div className="w-full py-3.5 rounded-xl bg-green-50 border border-green-200 text-green-700 font-black flex items-center justify-center gap-2">

                  <CheckCircle
                    size={20}
                  />

                  Video Completed

                </div>

              )}

            </div>

            {/* ==================================================
                PREVIOUS / NEXT
            ================================================== */}

            <div className="grid grid-cols-2 gap-3 mt-4">

              <button
                type="button"
                onClick={
                  handlePrevious
                }
                disabled={
                  currentVideo === 0
                }
                className="border border-[#F3D7C2] bg-white hover:bg-[#FFF8F2] py-3 rounded-xl font-bold text-[#2E1A0F] disabled:opacity-40 disabled:cursor-not-allowed flex items-center justify-center gap-2 transition"
              >

                <ChevronLeft
                  size={18}
                />

                Previous

              </button>

              <button
                type="button"
                onClick={
                  handleNext
                }
                disabled={
                  currentVideo ===
                  videos.length - 1
                }
                className="py-3 rounded-xl font-bold text-white disabled:opacity-40 disabled:cursor-not-allowed flex items-center justify-center gap-2 transition shadow-sm"
                style={{
                  background:
                    "linear-gradient(90deg, #FF6200 0%, #FFA800 100%)",
                }}
              >

                Next

                <ChevronRight
                  size={18}
                />

              </button>

            </div>

          </div>

        </div>

        {/* ==================================================
            COURSE VIDEOS
        ================================================== */}

        <div className="mt-5 bg-white rounded-3xl border border-[#F3E7DC] shadow-[0_12px_40px_rgba(100,50,15,0.06)] p-4 sm:p-6">

          <h2 className="text-lg sm:text-xl font-black text-[#2E1A0F] mb-4">
            Course Videos
          </h2>

          <div className="space-y-3">

            {videos.map(
              (video, index) => {

                const completed =
                  completedVideos.includes(
                    video.id
                  );

                const active =
                  index === currentVideo;

                return (
                  <button
                    key={video.id}
                    type="button"
                    onClick={() =>
                      setCurrentVideo(index)
                    }
                    className={`w-full text-left rounded-2xl border p-3 sm:p-4 transition ${
                      active
                        ? "border-[#FDBA74] bg-[#FFF8F2]"
                        : "border-[#F3E7DC] bg-white hover:bg-[#FFF8F2]"
                    }`}
                  >

                    <div className="flex items-center gap-3">

                      {/* NUMBER / CHECK */}

                      <div
                        className="w-10 h-10 rounded-xl flex items-center justify-center font-bold flex-shrink-0"
                        style={{
                          backgroundColor:
                            completed
                              ? "#DCFCE7"
                              : active
                              ? "#FF6600"
                              : "#FFF0E4",

                          color:
                            completed
                              ? "#16A34A"
                              : active
                              ? "#FFFFFF"
                              : "#FF6600",
                        }}
                      >

                        {completed ? (
                          <CheckCircle
                            size={20}
                          />
                        ) : (
                          video.order
                        )}

                      </div>

                      {/* TITLE */}

                      <div className="flex-1 min-w-0">

                        <p
                          className={`font-bold text-sm sm:text-base truncate ${
                            active
                              ? "text-[#FF6600]"
                              : "text-[#2E1A0F]"
                          }`}
                        >
                          {video.title}
                        </p>

                        <p className="text-xs text-[#7C6657] mt-1">
                          Video{" "}
                          {video.order}
                        </p>

                      </div>

                      {/* PLAY ICON */}

                      {active &&
                        !completed && (
                          <Play
                            size={18}
                            className="text-[#FF6600] flex-shrink-0"
                          />
                        )}

                    </div>

                  </button>
                );
              }
            )}

          </div>

        </div>

        {/* ==================================================
            COMPLETE TRAINING
        ================================================== */}

        {currentVideo ===
          videos.length - 1 && (

          <div className="mt-5">

            {allVideosCompleted ? (

              <button
                type="button"
                onClick={
                  handleCompleteTraining
                }
                className="w-full py-4 rounded-2xl text-white font-black text-base sm:text-lg flex items-center justify-center gap-2 shadow-md"
                style={{
                  background:
                    "linear-gradient(90deg, #FF6200 0%, #FFA800 100%)",
                }}
              >

                <CheckCircle
                  size={21}
                />

                Complete Training

              </button>

            ) : (

              <div className="bg-[#FFF8F2] border border-[#FED7AA] rounded-2xl p-4 text-center">

                <p className="text-sm text-[#C2410C] font-bold">
                  Please mark all training
                  videos as completed to
                  complete the training.
                </p>

              </div>

            )}

          </div>

        )}

      </main>

    </div>
  );
}