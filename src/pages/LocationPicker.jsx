// src/pages/LocationPicker.jsx

import { useEffect, useRef, useState } from "react";
import { useNavigate } from "react-router-dom";
import {
  MapContainer,
  TileLayer,
  Marker,
  useMapEvents,
} from "react-leaflet";
import L from "leaflet";
import "leaflet/dist/leaflet.css";
import { saveLocation } from "../Services/locationStorage";

// =========================================================
// MERCHANT APP THEME
// =========================================================

const PRIMARY_ORANGE = "#ff6b00";
const ORANGE_HOVER = "#ff7a00";
const ORANGE_ACTIVE = "#ff8a00";

const ORANGE_LIGHT = "#fff0e4";
const ORANGE_LIGHT_BG = "#fff8f1";
const ORANGE_BORDER = "#ffe0c7";

// =========================================================
// FIX LEAFLET MARKER ICONS
// =========================================================

delete L.Icon.Default.prototype._getIconUrl;

L.Icon.Default.mergeOptions({
  iconRetinaUrl:
    "https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon-2x.png",

  iconUrl:
    "https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon.png",

  shadowUrl:
    "https://unpkg.com/leaflet@1.9.4/dist/images/marker-shadow.png",
});

// =========================================================
// LOCATION MARKER
// =========================================================

function LocationMarker({ position, setPosition }) {
  useMapEvents({
    click(e) {
      setPosition(e.latlng);
    },
  });

  return position === null ? null : (
    <Marker position={position} />
  );
}

// =========================================================
// LOCATION PICKER
// =========================================================

export default function LocationPicker() {
  const navigate = useNavigate();

  const [position, setPosition] = useState(null);
  const [loading, setLoading] = useState(false);

  const mapRef = useRef(null);

  // =========================================================
  // FIX MAP SIZE AFTER INITIAL RENDER
  // =========================================================

  useEffect(() => {
    const timer = setTimeout(() => {
      if (mapRef.current) {
        mapRef.current.invalidateSize();
      }
    }, 200);

    return () => clearTimeout(timer);
  }, []);

  // =========================================================
  // FIX MAP SIZE ON RESIZE
  // =========================================================

  useEffect(() => {
    const handleResize = () => {
      if (mapRef.current) {
        setTimeout(() => {
          mapRef.current.invalidateSize();
        }, 100);
      }
    };

    window.addEventListener("resize", handleResize);

    return () => {
      window.removeEventListener(
        "resize",
        handleResize
      );
    };
  }, []);

  // =========================================================
  // CONFIRM LOCATION
  // =========================================================

  const handleConfirm = async () => {
    if (!position || loading) {
      if (!position) {
        alert(
          "Please select a location on the map first."
        );
      }

      return;
    }

    setLoading(true);

    try {
      const res = await fetch(
        `https://nominatim.openstreetmap.org/reverse?lat=${position.lat}&lon=${position.lng}&format=json`
      );

      const data = await res.json();

      const city =
        data.address?.city ||
        data.address?.town ||
        data.address?.village ||
        "";

      const state =
        data.address?.state || "";

      saveLocation({
        city,
        state,
        latitude: position.lat,
        longitude: position.lng,
      });
    } catch (err) {
      console.error(
        "Reverse geocoding failed:",
        err
      );

      saveLocation({
        latitude: position.lat,
        longitude: position.lng,
      });
    } finally {
      setLoading(false);

      navigate("/info");
    }
  };

  // =========================================================
  // UI
  // =========================================================

  return (
    <div
      className="
        fixed
        inset-0
        w-full
        h-[100dvh]

        flex
        flex-col

        bg-white

        overflow-hidden
      "
    >
      {/* =====================================================
          MAP
      ===================================================== */}

      <div
        className="
          relative
          flex-1
          min-h-0
          w-full
        "
      >
        <MapContainer
          center={[19.076, 72.8777]}
          zoom={12}
          className="h-full w-full"
          whenCreated={(map) => {
            mapRef.current = map;

            setTimeout(() => {
              map.invalidateSize();
            }, 200);
          }}
        >
          <TileLayer
            url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
            attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
          />

          <LocationMarker
            position={position}
            setPosition={setPosition}
          />
        </MapContainer>

        {/* ===================================================
            MAP HINT
        =================================================== */}

        {!position && (
          <div
            className="
              absolute

              top-4
              left-1/2

              -translate-x-1/2

              z-[1000]

              flex
              items-center
              justify-center

              px-4
              py-2

              rounded-full

              bg-white

              border

              shadow-[0_6px_18px_rgba(80,48,20,0.12)]

              whitespace-nowrap

              text-xs
              sm:text-sm
            "
            style={{
              borderColor: ORANGE_BORDER,
            }}
          >
            <span
              className="font-medium"
              style={{
                color: "#344054",
              }}
            >
              Tap on the map to select your location
            </span>
          </div>
        )}

        {/* ===================================================
            SELECTED LOCATION BADGE
        =================================================== */}

        {position && (
          <div
            className="
              absolute

              top-4
              left-1/2

              -translate-x-1/2

              z-[1000]

              flex
              items-center
              gap-2

              px-4
              py-2

              rounded-full

              bg-white

              border

              shadow-[0_6px_18px_rgba(80,48,20,0.12)]

              whitespace-nowrap

              text-xs
              sm:text-sm

              font-semibold
            "
            style={{
              borderColor: ORANGE_BORDER,
              color: PRIMARY_ORANGE,
            }}
          >
            Location selected
          </div>
        )}
      </div>

      {/* =====================================================
          BOTTOM CTA
      ===================================================== */}

      <div
        className="
          w-full

          flex-shrink-0

          bg-white

          border-t

          px-4
          sm:px-6
          md:px-8

          pt-3
          sm:pt-4

          pb-[max(12px,env(safe-area-inset-bottom))]
          sm:pb-5
        "
        style={{
          borderColor: "#eaecf0",
        }}
      >
        <div
          className="
            w-full
            max-w-xl
            mx-auto
          "
        >
          <button
            type="button"
            onClick={handleConfirm}
            disabled={loading}
            style={{
              background: loading
                ? "#ffb380"
                : `linear-gradient(
                    135deg,
                    ${PRIMARY_ORANGE},
                    ${ORANGE_ACTIVE}
                  )`,

              boxShadow: loading
                ? "none"
                : "0 10px 22px rgba(255, 107, 0, 0.22)",
            }}
            className="
              w-full

              min-h-[48px]
              sm:min-h-[52px]
              md:min-h-[56px]

              px-4

              rounded-xl
              sm:rounded-2xl

              text-sm
              sm:text-base
              md:text-lg

              font-extrabold

              text-white

              transition-all
              duration-200

              focus:outline-none

              focus:ring-2
              focus:ring-[#ff7a00]/30

              focus:ring-offset-2

              hover:-translate-y-[1px]

              active:translate-y-0

              disabled:cursor-not-allowed
              disabled:translate-y-0
            "
            onMouseEnter={(e) => {
              if (!loading) {
                e.currentTarget.style.background =
                  `linear-gradient(
                    135deg,
                    ${ORANGE_HOVER},
                    ${ORANGE_ACTIVE}
                  )`;

                e.currentTarget.style.boxShadow =
                  "0 14px 28px rgba(255, 107, 0, 0.28)";
              }
            }}
            onMouseLeave={(e) => {
              if (!loading) {
                e.currentTarget.style.background =
                  `linear-gradient(
                    135deg,
                    ${PRIMARY_ORANGE},
                    ${ORANGE_ACTIVE}
                  )`;

                e.currentTarget.style.boxShadow =
                  "0 10px 22px rgba(255, 107, 0, 0.22)";
              }
            }}
          >
            {loading ? "Saving..." : "Confirm Location"}
          </button>
        </div>
      </div>
    </div>
  );
}