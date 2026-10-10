import React, { useEffect, useRef, useState } from "react";
import { useNavigate } from "react-router-dom";
import { GoogleMap, Marker, useJsApiLoader } from "@react-google-maps/api";
import {
  ArrowRight,
  MapPin,
  Navigation,
  Search,
  X,
  Loader2,
} from "lucide-react";
import { saveLocation } from "../Services/locationStorage";

const DEFAULT_CENTER = { lat: 19.076, lng: 72.8777 };
const MAP_CONTAINER_STYLE = { width: "100%", height: "100%" };
const LIBRARIES = [];

export default function LocationPicker() {
  const navigate = useNavigate();
  const [position, setPosition] = useState(null);
  const [loading, setLoading] = useState(false);
  const mapRef = useRef(null);
  const searchBoxRef = useRef(null);

  // Search state (keeps the existing Nominatim search behavior).
  const [query, setQuery] = useState("");
  const [results, setResults] = useState([]);
  const [searching, setSearching] = useState(false);
  const [showDropdown, setShowDropdown] = useState(false);

  const apiKey = import.meta.env.VITE_GOOGLE_MAPS_API_KEY;
  const { isLoaded, loadError } = useJsApiLoader({
    id: "zatpatt-google-maps-script",
    googleMapsApiKey: apiKey || "",
  });

  useEffect(() => {
    const handleClickOutside = (event) => {
      if (searchBoxRef.current && !searchBoxRef.current.contains(event.target)) {
        setShowDropdown(false);
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  const handleSearch = async (event) => {
    event?.preventDefault();
    const trimmed = query.trim();
    if (!trimmed) return;

    setSearching(true);
    try {
      const response = await fetch(
        `https://nominatim.openstreetmap.org/search?q=${encodeURIComponent(
          trimmed
        )}&format=json&limit=5&addressdetails=1`,
        { headers: { Accept: "application/json" } }
      );
      if (!response.ok) throw new Error(`Place search failed (${response.status})`);
      const data = await response.json();
      setResults(Array.isArray(data) ? data : []);
      setShowDropdown(true);
    } catch (error) {
      console.error("Place search error:", error);
      setResults([]);
      setShowDropdown(true);
    } finally {
      setSearching(false);
    }
  };

  const handleSelectResult = (result) => {
    const lat = Number.parseFloat(result.lat);
    const lng = Number.parseFloat(result.lon);
    if (!Number.isFinite(lat) || !Number.isFinite(lng)) return;

    const newPosition = { lat, lng };
    setPosition(newPosition);
    mapRef.current?.panTo(newPosition);
    mapRef.current?.setZoom(14);
    setQuery(result.display_name || "");
    setResults([]);
    setShowDropdown(false);
  };

  const clearSearch = () => {
    setQuery("");
    setResults([]);
    setShowDropdown(false);
  };

  const handleConfirm = async () => {
    if (!position || loading) {
      if (!position) alert("Please select a location on the map first.");
      return;
    }

    setLoading(true);
    try {
      // Keep existing reverse-geocoding behavior and stored fields.
      const response = await fetch(
        `https://nominatim.openstreetmap.org/reverse?lat=${position.lat}&lon=${position.lng}&format=json`,
        { headers: { Accept: "application/json" } }
      );
      if (!response.ok) throw new Error(`Reverse geocoding failed (${response.status})`);
      const data = await response.json();
      const city =
        data.address?.city ||
        data.address?.town ||
        data.address?.village ||
        data.address?.municipality ||
        "";
      const state = data.address?.state || "";

      saveLocation({
        city,
        state,
        latitude: position.lat,
        longitude: position.lng,
      });
    } catch (error) {
      console.error("Reverse geocoding error:", error);
      saveLocation({ latitude: position.lat, longitude: position.lng });
    } finally {
      setLoading(false);
      navigate("/info");
    }
  };

  if (!apiKey) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-[#FAF6F0] p-6">
        <div className="max-w-lg rounded-xl bg-white p-5 shadow">
          <h2 className="font-bold text-[#2E1A0F]">Google Maps API key missing</h2>
          <p className="mt-2 text-sm text-gray-600">
            Add VITE_GOOGLE_MAPS_API_KEY=your_key to the project-root .env file, then restart the Vite server.
          </p>
        </div>
      </div>
    );
  }

  if (loadError) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-[#FAF6F0] p-6">
        <div className="max-w-lg rounded-xl bg-white p-5 shadow">
          <h2 className="font-bold text-[#2E1A0F]">Google Maps could not load</h2>
          <p className="mt-2 text-sm text-gray-600">
            Check that Maps JavaScript API is enabled, billing is configured, and the API key's application/API restrictions allow this app.
          </p>
        </div>
      </div>
    );
  }

  if (!isLoaded) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-[#FAF6F0] text-sm text-[#7C6657]">
        <Loader2 size={18} className="mr-2 animate-spin" /> Loading Google Maps...
      </div>
    );
  }

  return (
    <div
      className="fixed inset-0 w-full h-[100dvh] flex flex-col justify-between overflow-hidden"
      style={{ backgroundColor: "#FAF6F0" }}
    >
      {/* Map Header Bar */}
      <div className="relative z-20 bg-white/95 backdrop-blur-md px-5 py-3.5 border-b border-[#F3E7DC] flex items-center justify-between shadow-sm">
        <div className="flex items-center gap-2.5">
          <div
            className="w-9 h-9 rounded-xl flex items-center justify-center shadow-sm"
            style={{ background: "linear-gradient(135deg, #FF6000, #FFA600)" }}
          >
            <Navigation size={18} color="white" />
          </div>
          <div>
            <span className="text-[9px] font-extrabold uppercase tracking-[1.4px] text-[#FF6600]">
              ZATPATT
            </span>
            <h2 className="text-xs sm:text-sm font-bold text-[#2E1A0F]">
              Select Service Hub
            </h2>
          </div>
        </div>
        {position ? (
          <div className="px-3 py-1 rounded-full bg-[#FFF5EC] border border-[#FED7AA] text-[11px] font-bold text-[#FF6600]">
            Point Selected
          </div>
        ) : (
          <div className="px-3 py-1 rounded-full bg-gray-100 text-[11px] font-medium text-gray-500">
            Tap map to pin
          </div>
        )}
      </div>

      {/* Map Body */}
      <div className="relative flex-1 min-h-0 w-full">
        {/* Search Box Overlay */}
        <div
          ref={searchBoxRef}
          className="absolute top-3 left-1/2 -translate-x-1/2 z-[1000] w-[92%] max-w-md"
        >
          <form
            onSubmit={handleSearch}
            className="flex items-center gap-2 bg-white rounded-xl shadow-[0_8px_24px_rgba(0,0,0,0.12)] border border-[#F3E7DC] px-3 py-2.5"
          >
            <Search size={16} color="#7C6657" className="shrink-0" />
            <input
              type="text"
              value={query}
              onChange={(event) => setQuery(event.target.value)}
              onFocus={() => results.length > 0 && setShowDropdown(true)}
              placeholder="Search for a city or place..."
              className="flex-1 min-w-0 text-sm text-[#2E1A0F] placeholder:text-[#9CA3AF] outline-none bg-transparent"
            />
            {query && (
              <button
                type="button"
                onClick={clearSearch}
                className="shrink-0 w-5 h-5 rounded-full bg-gray-100 flex items-center justify-center"
                aria-label="Clear search"
              >
                <X size={12} color="#7C6657" />
              </button>
            )}
            <button
              type="submit"
              disabled={searching || !query.trim()}
              className="shrink-0 h-8 px-3 rounded-lg font-bold text-xs flex items-center justify-center gap-1 disabled:opacity-50"
              style={{ background: "linear-gradient(90deg, #FF6200 0%, #FFA800 100%)", color: "#FFFFFF" }}
            >
              {searching ? <Loader2 size={14} className="animate-spin" /> : "Search"}
            </button>
          </form>

          {showDropdown && (
            <div className="mt-2 bg-white rounded-xl shadow-[0_8px_24px_rgba(0,0,0,0.12)] border border-[#F3E7DC] overflow-hidden max-h-64 overflow-y-auto">
              {results.length === 0 ? (
                <div className="px-4 py-3 text-xs text-[#7C6657]">No matching places found.</div>
              ) : (
                results.map((result, index) => (
                  <button
                    key={`${result.place_id}-${index}`}
                    type="button"
                    onClick={() => handleSelectResult(result)}
                    className="w-full text-left px-4 py-2.5 flex items-start gap-2.5 hover:bg-[#FFF9F3] transition-colors border-b border-[#F3E7DC] last:border-b-0"
                  >
                    <MapPin size={14} color="#FF6600" className="shrink-0 mt-0.5" />
                    <span className="text-xs text-[#2E1A0F] leading-snug">{result.display_name}</span>
                  </button>
                ))
              )}
            </div>
          )}
        </div>

        <GoogleMap
          mapContainerStyle={MAP_CONTAINER_STYLE}
          center={position || DEFAULT_CENTER}
          zoom={12}
          onLoad={(map) => {
            mapRef.current = map;
          }}
          onUnmount={() => {
            mapRef.current = null;
          }}
          onClick={(event) => {
            if (event.latLng) {
              setPosition({ lat: event.latLng.lat(), lng: event.latLng.lng() });
            }
          }}
          options={{
            streetViewControl: false,
            mapTypeControl: false,
            fullscreenControl: false,
            clickableIcons: false,
          }}
        >
          {position && <Marker position={position} />}
        </GoogleMap>
      </div>

      {/* Bottom CTA Card */}
      <div className="relative z-20 bg-white border-t border-[#F3E7DC] p-5 sm:p-6 shadow-[0_-10px_30px_rgba(0,0,0,0.06)]">
        <div className="max-w-xl mx-auto flex flex-col gap-3.5">
          <div className="flex items-center gap-3 p-3 rounded-xl bg-[#FFF9F3] border border-[#FFE8D6]">
            <div className="w-8 h-8 rounded-lg bg-[#FFEADB] flex items-center justify-center shrink-0">
              <MapPin size={16} color="#FF6600" />
            </div>
            <div className="min-w-0 flex-1">
              <p className="text-[10px] text-[#7C6657] font-medium">Pinned Coordinates</p>
              <p className="text-xs sm:text-sm font-bold text-[#2E1A0F] truncate">
                {position
                  ? `${position.lat.toFixed(5)}, ${position.lng.toFixed(5)}`
                  : "Tap on the map to pin your location"}
              </p>
            </div>
          </div>

          <button
            type="button"
            onClick={handleConfirm}
            disabled={!position || loading}
            className="group relative w-full h-[50px] rounded-xl font-bold text-sm flex items-center justify-center gap-2 transition-all duration-200 disabled:cursor-not-allowed"
            style={{
              background: position ? "linear-gradient(90deg, #FF6200 0%, #FFA800 100%)" : "#E5E7EB",
              color: position ? "#FFFFFF" : "#9CA3AF",
              boxShadow: position ? "0 10px 24px rgba(255,98,0,0.24)" : "none",
            }}
          >
            <span>{loading ? "Saving Location..." : "Confirm & Proceed"}</span>
            <ArrowRight size={16} className="transition-transform duration-200 group-hover:translate-x-1" />
          </button>
        </div>
      </div>
    </div>
  );
}
