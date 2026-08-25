import React, { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import {
  ArrowLeft,
  HelpCircle,
  MapPin,
  Bike,
  CheckCircle2,
  ArrowRight,
} from "lucide-react";
import { DEV_MODE } from "../config/appConfig";
import { getCities, submitWorkDetails } from "../Services/workdetails";

/* =========================================================
   INLINE USER-SCOPED STORAGE HELPER
========================================================= */
const getUserKey = () => {
  try {
    const userStr = localStorage.getItem("user");
    if (userStr) {
      const u = JSON.parse(userStr);
      if (u?.id) return `user_${u.id}`;
      if (u?.mobile) return `mobile_${u.mobile}`;
      if (u?.phone) return `mobile_${u.phone}`;
    }
  } catch {}
  const m =
    localStorage.getItem("current_user_mobile") ||
    localStorage.getItem("login_mobile");
  return m ? `mobile_${m}` : "guest_partner";
};

const getOnboardingProgress = () => {
  const k = getUserKey();
  const raw = localStorage.getItem(`onboarding_progress_${k}`);
  if (raw) {
    try {
      return JSON.parse(raw);
    } catch {}
  }
  return {
    work_details: "pending",
    personal_details: "pending",
    kit_ordered: false,
  };
};

const saveOnboardingProgress = (updates) => {
  const k = getUserKey();
  const current = getOnboardingProgress();
  const updated = { ...current, ...updates };
  localStorage.setItem(`onboarding_progress_${k}`, JSON.stringify(updated));
  localStorage.setItem("onboarding_progress", JSON.stringify(updated));
  return updated;
};

const VEHICLES = [
  {
    label: "Motorcycle / Scooter (Bike)",
    value: "bike",
    desc: "Recommended for highest order frequency",
  },
  {
    label: "Electric Bike (EV)",
    value: "electric_bike",
    desc: "Zero fuel cost with high eco bonuses",
  },
  {
    label: "Bicycle",
    value: "bicycle",
    desc: "Short-distance neighborhood deliveries",
  },
];

export default function WorkDetailsPage() {
  const navigate = useNavigate();

  const [step, setStep] = useState(1);
  const [cities, setCities] = useState([]);
  const [loadingCities, setLoadingCities] = useState(true);

  const [city, setCity] = useState(null);
  const [vehicle, setVehicle] = useState(null);
  const [submitting, setSubmitting] = useState(false);

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

  useEffect(() => {
    if (DEV_MODE) return;
    const progress = getOnboardingProgress();
    if (progress?.work_details === "completed") {
      navigate("/onboarding-steps", { replace: true });
    }
  }, [navigate]);

  const handleSubmit = async () => {
    if (!city || !vehicle || submitting) return;

    try {
      setSubmitting(true);
      await submitWorkDetails({
        city: city.id || city,
        vehicle_type: vehicle,
      });

      console.log("Work details saved ✅");

      saveOnboardingProgress({
        work_details: "completed",
      });

      navigate("/onboarding-steps");
    } catch (err) {
      console.error("Work details API error ❌", err);
      alert("Failed to save work details. Please try again.");
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div
      className="min-h-screen w-full flex flex-col justify-between items-center relative overflow-x-hidden p-3.5 sm:p-5 md:p-7 select-none"
      style={{
        backgroundColor: "#FAF6F0",
        backgroundImage: `
          radial-gradient(circle at 10% 15%, rgba(255, 230, 205, 0.7) 0%, transparent 40%),
          radial-gradient(circle at 92% 25%, rgba(255, 226, 195, 0.75) 0%, transparent 38%)
        `,
      }}
    >
      <div className="w-full max-w-[720px] my-auto z-10 bg-white rounded-[26px] sm:rounded-[32px] shadow-[0_20px_60px_rgba(100,50,15,0.08)] border border-[#F3E7DC] overflow-hidden flex flex-col">
        
        {/* Header Bar */}
        <div className="px-5 py-4 border-b border-[#F3E7DC] flex items-center justify-between bg-white">
          <button
            type="button"
            onClick={() => (step > 1 ? setStep(step - 1) : navigate(-1))}
            className="w-9 h-9 rounded-xl border border-[#E5E7EB] flex items-center justify-center text-[#2E1A0F] hover:bg-[#FAF6F0]"
          >
            <ArrowLeft size={18} />
          </button>

          <div className="text-center">
            <span className="text-[10px] font-black uppercase tracking-[1.4px] text-[#FF6600]">
              Step {step} of 2
            </span>
            <h1 className="text-sm font-extrabold text-[#2E1A0F]">
              {step === 1 ? "Select Delivery City" : "Choose Vehicle Type"}
            </h1>
          </div>

          <div className="w-9 h-9 rounded-xl bg-[#FFF5EC] border border-[#FED7AA] flex items-center justify-center text-[#FF6600]">
            <HelpCircle size={18} />
          </div>
        </div>

        {/* Progress Line */}
        <div className="w-full h-1.5 bg-[#F3E7DC]">
          <div
            className="h-full transition-all duration-300 rounded-r-full"
            style={{
              width: step === 1 ? "50%" : "100%",
              background: "linear-gradient(90deg, #FF6000, #FFA600)",
            }}
          />
        </div>

        {/* Content */}
        <div className="p-6 sm:p-8 flex-1">
          {step === 1 && (
            <div>
              <h2 className="text-lg sm:text-xl font-black text-[#2E1A0F] mb-1">
                Where do you want to deliver?
              </h2>

              {loadingCities ? (
                <div className="py-12 flex flex-col items-center justify-center text-sm text-[#FF6600] font-bold">
                  <div className="w-6 h-6 border-2 border-[#FF6600] border-t-transparent rounded-full animate-spin mb-2" />
                  Loading available cities...
                </div>
              ) : Array.isArray(cities) && cities.length > 0 ? (
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  {cities.map((c) => {
                    const cityName = c.name || c;
                    const isSelected = city?.name === cityName || city === c;
                    return (
                      <div
                        key={c.id || cityName}
                        onClick={() => {
                          setCity(c);
                          setStep(2);
                        }}
                        className="p-4 rounded-2xl border transition-all flex items-center justify-between cursor-pointer"
                        style={{
                          backgroundColor: isSelected ? "#FFF9F3" : "#FFFFFF",
                          borderColor: isSelected ? "#FF6600" : "#E5E7EB",
                          boxShadow: isSelected ? "0 4px 16px rgba(255,102,0,0.1)" : "none",
                        }}
                      >
                        <div className="flex items-center gap-3">
                          <div className="w-9 h-9 rounded-xl bg-[#FFF5EC] border border-[#FED7AA] flex items-center justify-center text-[#FF6600]">
                            <MapPin size={18} />
                          </div>
                          <span className="text-sm font-bold text-[#2E1A0F]">
                            {cityName}
                          </span>
                        </div>
                        {isSelected && <CheckCircle2 size={18} color="#FF6600" />}
                      </div>
                    );
                  })}
                </div>
              ) : (
                <p className="text-sm text-gray-500 py-6 text-center">
                  No cities found.
                </p>
              )}
            </div>
          )}

          {step === 2 && (
            <div>
              <h2 className="text-lg sm:text-xl font-black text-[#2E1A0F] mb-1">
                Select your delivery vehicle
              </h2>
              <p className="text-xs sm:text-sm text-[#7C6657] mb-5">
                City: <strong className="text-[#FF6600]">{city?.name || city}</strong>
              </p>

              <div className="space-y-3">
                {VEHICLES.map((v) => {
                  const isSelected = vehicle === v.value;
                  return (
                    <div
                      key={v.value}
                      onClick={() => setVehicle(v.value)}
                      className="p-4 sm:p-5 rounded-2xl border transition-all flex items-center justify-between cursor-pointer"
                      style={{
                        backgroundColor: isSelected ? "#FFF9F3" : "#FFFFFF",
                        borderColor: isSelected ? "#FF6600" : "#E5E7EB",
                        boxShadow: isSelected ? "0 6px 20px rgba(255,102,0,0.12)" : "none",
                      }}
                    >
                      <div className="flex items-center gap-3.5">
                        <div
                          className="w-11 h-11 rounded-2xl flex items-center justify-center shrink-0 border"
                          style={{
                            backgroundColor: isSelected ? "#FF6600" : "#FFF5EC",
                            borderColor: isSelected ? "#FF6600" : "#FED7AA",
                            color: isSelected ? "#FFFFFF" : "#FF6600",
                          }}
                        >
                          <Bike size={22} />
                        </div>
                        <div>
                          <p className="text-sm font-black text-[#2E1A0F]">
                            {v.label}
                          </p>
                          <p className="text-xs text-[#7C6657] mt-0.5">
                            {v.desc}
                          </p>
                        </div>
                      </div>
                      <div
                        className="
                          w-6
                          h-6
                          rounded-full
                          border-2
                          flex
                          items-center
                          justify-center
                          shrink-0
                          transition-all
                          duration-200
                        "
                        style={{
                          borderColor: isSelected ? "#FF6600" : "#D1D5DB",
                          backgroundColor: "#FFFFFF",
                          boxShadow: isSelected
                            ? "0 0 0 3px rgba(255,102,0,0.10)"
                            : "none",
                        }}
                      >
                        {isSelected && (
                          <div
                            className="
                              w-3
                              h-3
                              rounded-full
                            "
                            style={{
                              background:
                                "linear-gradient(135deg, #FF6000, #FFA600)",
                            }}
                          />
                        )}
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
          )}
        </div>

        {/* Action Button */}
        <div className="p-5 sm:p-6 border-t border-[#F3E7DC] bg-[#FAF8F5]">
          <button
            type="button"
            disabled={(!city || !vehicle) && step === 2}
            onClick={step === 1 ? () => city && setStep(2) : handleSubmit}
            className="group w-full h-[50px] sm:h-[54px] rounded-xl sm:rounded-2xl font-extrabold text-sm sm:text-base flex items-center justify-center gap-2 text-white transition-all disabled:cursor-not-allowed"
            style={{
              background:
                (step === 1 && city) || (step === 2 && vehicle && !submitting)
                  ? "linear-gradient(90deg, #FF6200 0%, #FFA800 100%)"
                  : "#E5E7EB",
              color:
                (step === 1 && city) || (step === 2 && vehicle && !submitting)
                  ? "#FFFFFF"
                  : "#9CA3AF",
              boxShadow:
                (step === 1 && city) || (step === 2 && vehicle && !submitting)
                  ? "0 10px 25px rgba(255,98,0,0.25)"
                  : "none",
            }}
          >
            {submitting ? (
              <div className="w-5 h-5 border-2 border-white/40 border-t-white rounded-full animate-spin" />
            ) : (
              <>
                <span>{step === 1 ? "Proceed to Vehicle Selection" : "Save Work Details"}</span>
                <ArrowRight size={18} className="group-hover:translate-x-1 transition-transform" />
              </>
            )}
          </button>
        </div>
      </div>

      <div className="relative z-10 shrink-0 mt-4">
        <div className="bg-[#FFEADA]/70 backdrop-blur-md px-8 py-2 rounded-full border border-[#FED7AA]/60 flex items-center gap-2 text-[10px] sm:text-xs font-medium text-[#7C6657]">
          <span>© {new Date().getFullYear()} Zatpatt</span>
          <span>•</span>
          <span>Delivery Partner Portal</span>
        </div>
      </div>
    </div>
  );
}
