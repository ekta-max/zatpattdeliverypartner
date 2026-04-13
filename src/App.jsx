// src/App.jsx
import React from "react";
import { Routes, Route, Navigate } from "react-router-dom";
import { LanguageProvider } from "./context/LanguageContext";


/* AUTH & INTRO */
 
import PermissionsPage from "./pages/PermissionsPage";
import LocationPicker from "./pages/LocationPicker";
import LanguageSelectPage from "./pages/LanguageSelectPage";
import InfoPage from "./pages/InfoPage";
import LoginPage from "./pages/LoginPage";
import OtpPage from "./pages/OtpPage";

/* ONBOARDING */

import OnboardingStepsPage from "./pages/OnboardingStepsPage";
import WorkDetailsPage from "./pages/WorkDetailsPage";
import PersonalDetailsPage from "./pages/PersonalDetailsPage";
import PartnerKitOrderPage from "./pages/PartnerKitOrderPage";

/* PAYMENT & VERIFICATION */

import PaymentSuccessPage from "./pages/PaymentSuccessPage";
import VerificationPendingPage from "./pages/VerificationPendingPage";

/* TRAINING */

import TrainingIntroPage from "./pages/TrainingIntroPage";
import TrainingLoadingPage from "./pages/TrainingLoadingPage";
import TrainingCoursePage from "./pages/TrainingCoursePage";
import TrainingVideoPage from "./pages/TrainingVideoPage";
import TrainingCompletedPage from "./pages/TrainingCompletedPage";

/* MAIN APP */

import SevaShiftSelectionPage from "./pages/SevaShiftSelectionPage";
import DashboardPage from "./pages/DashboardPage";
import OrdersPage from "./pages/OrdersPage";
import OrderDetailsPage from "./pages/OrderDetailsPage";
import EarningsPage from "./pages/EarningsPage";
import ProfilePage from "./pages/ProfilePage";
import LeaderboardPage from "./pages/LeaderboardPage";

export default function App() {
  return (
    <LanguageProvider>
      <Routes>

        {/* ================= INITIAL FLOW ================= */}

        <Route path="/" element={<PermissionsPage />} />
        <Route path="/location-picker" element={<LocationPicker />} />
        <Route path="/language" element={<LanguageSelectPage />} />
        <Route path="/info" element={<InfoPage />} />
        <Route path="/login" element={< LoginPage />} />
        <Route path="/otp" element={<OtpPage />} />
        
        {/* ================= ONBOARDING ================= */}

        <Route path="/onboarding-steps" element={<OnboardingStepsPage />} />
        <Route path="/work-details" element={<WorkDetailsPage />} />
        <Route path="/personal-details" element={<PersonalDetailsPage />} />
        <Route path="/order-partner-kit" element={<PartnerKitOrderPage />} />

        {/* ================= PAYMENT ================= */}

        <Route path="/payment-success" element={<PaymentSuccessPage />} />
        <Route path="/verification-pending" element={<VerificationPendingPage />} />
      
        {/* ================= TRAINING ================= */}

        <Route path="/training-intro" element={<TrainingIntroPage />} />
        <Route path="/training-loading" element={<TrainingLoadingPage />} />
        <Route path="/training" element={<TrainingCoursePage />} />
        <Route path="/training/video/:id" element={<TrainingVideoPage />} />
        <Route path="/training-completed" element={<TrainingCompletedPage />} />
        

        {/* ================= MAIN APP ================= */}
        
        <Route path="/seva-shifts" element={<SevaShiftSelectionPage />} />
        <Route path="/dashboard" element={<DashboardPage />} />
        <Route path="/orders" element={<OrdersPage />} />
        <Route path="/order/:id" element={<OrderDetailsPage />} />
        <Route path="/earnings" element={<EarningsPage />} />
        <Route path="/profile" element={<ProfilePage />} />
        <Route path="/leaderboard" element={<LeaderboardPage />} />

        {/* Redirect unknown routes */}
        <Route path="*" element={<Navigate to="/" replace />} />
      </Routes>
    </LanguageProvider>
  );
}
