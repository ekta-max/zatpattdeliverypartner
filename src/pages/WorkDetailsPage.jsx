//src/pages/WorkDetailsPage.jsx

import React, { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { ArrowLeft, HelpCircle } from "lucide-react";
import { DEV_MODE } from "../config/appConfig";
import {
  getCities,
  submitWorkDetails,
} from "../Services/workdetails"; // ✅ FIXED PATH

export default function WorkDetailsPage() {
  const navigate = useNavigate();

  const [step, setStep] = useState(1);

  const [cities, setCities] = useState([]);
  const [loadingCities, setLoadingCities] = useState(true);

  const [city, setCity] = useState(null);
  const [vehicle, setVehicle] = useState(null);

  const VEHICLES = [
  { label: "Bike", value: "bike" },
  { label: "Electric Bike", value: "electric_bike" },
  { label: "Bicycle", value: "bicycle" },
];
  /* ---------------- FETCH CITIES ---------------- */
  useEffect(() => {
    const fetchCities = async () => {
      try {
        const data = await getCities();
        setCities(data || []);
      } catch (err) {
        console.error("City API error ❌", err);
      } finally {
        setLoadingCities(false);
      }
    };

    fetchCities();
  }, []);

  /* ---------------- LOCK (DISABLED IN DEV) ---------------- */
  useEffect(() => {
    if (DEV_MODE) return;

    const progress = JSON.parse(
      localStorage.getItem("onboarding_progress")
    );

    if (progress?.work_details === "completed") {
      navigate("/onboarding-steps", { replace: true });
    }
  }, [navigate]);

  const TOTAL_STEPS = 2;

  /* ---------------- SUBMIT ---------------- */
  const handleSubmit = async () => {
    if (!city || !vehicle) return;

    try {
      await submitWorkDetails({
        city: city.id || city,
        vehicle_type: vehicle,
      });

      console.log("Work details saved ✅");

      // ✅ Mark work_details as completed so PersonalDetailsPage doesn't bounce you back
      const existing =
        JSON.parse(localStorage.getItem("onboarding_progress")) || {};

      localStorage.setItem(
        "onboarding_progress",
        JSON.stringify({
          ...existing,
          work_details: "completed",
        })
      );

      navigate("/onboarding-steps");
    } catch (err) {
      console.error("Work details API error ❌", err);
      alert("Failed to save work details");
    }
  };

  return (
    <div className="min-h-screen bg-white flex flex-col">
      {/* TOP BAR */}
      <div className="flex items-center justify-between px-4 py-3 border-b">
        <button onClick={() => (step > 1 ? setStep(step - 1) : navigate(-1))}>
          <ArrowLeft />
        </button>
        <HelpCircle className="text-orange-500" />
      </div>

      {/* PROGRESS */}
      <div className="px-4 mt-3">
        <div className="h-1 bg-gray-200 rounded">
          <div
            className="h-1 bg-orange-500 rounded transition-all"
            style={{ width: `${(step / TOTAL_STEPS) * 100}%` }}
          />
        </div>
      </div>

      {/* CONTENT */}
      <div className="flex-1 px-4 pt-6">
        
        {/* STEP 1 → CITY */}
        {step === 1 && (
          <>
            <h2 className="text-lg font-semibold mb-4">
              Select City
            </h2>

            {loadingCities ? (
              <p>Loading cities...</p>
            ) : (
              Array.isArray(cities) ? (
              cities.map((c) => (
                <div
                  key={c.id || c.name}
                  onClick={() => {
                    setCity(c); // store full object
                    setStep(2);
                  }}
                  className="border rounded-xl p-4 mb-3 cursor-pointer hover:bg-orange-50"
                >
                  {c.name || c}
                </div>
              ))
            ) : (
              <p>No cities found</p>
            )
            )}
          </>
        )}

        {/* STEP 2 → VEHICLE */}
        {step === 2 && (
          <>
            <h2 className="text-lg font-semibold mb-4">
              Select Vehicle Type
            </h2>

            {VEHICLES.map((v) => (
              <div
                key={v.value}
                onClick={() => setVehicle(v.value)} // ✅ send correct value
                className={`border rounded-xl p-4 mb-3 cursor-pointer ${
                  vehicle === v.value
                    ? "border-orange-500 bg-orange-50"
                    : ""
                }`}
              >
                {v.label} {/* 👈 user-friendly text */}
              </div>
            ))}
          </>
        )}
      </div>

      {/* CTA */}
      <div className="p-4">
        <button
          disabled={!city || !vehicle}
          onClick={handleSubmit}
          className={`w-full py-3 rounded-xl font-semibold text-white ${
            city && vehicle
              ? "bg-orange-500"
              : "bg-gray-300"
          }`}
        >
          Continue
        </button>
      </div>
    </div>
  );
}