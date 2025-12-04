// App.jsx
import React from "react";
import { BrowserRouter as Router, Routes, Route, Navigate } from "react-router-dom";
import { ToastContainer } from "react-toastify";

import RegisterPage from "@/pages/auth/RegisterPage";
import LoginPage from "@/pages/auth/LoginPage";

import DashboardPage from "@/pages/dashboard/DashboardPage";
import DonationsPage from "@/pages/member/donations/DonationsPage";
import NewDonationPage from "@/pages/member/newDonation/NewDonationPage";
import UploadPage from "@/pages/upload/UploadPage";

import PrivateRoute from "@/components/PrivateRoute";
import PublicRoute from "@/components/PublicRoute";

function App() {
  return (
    <>
      <Router>
        <Routes>
          {/* When the app starts, go to /dashboard */}
          {/* <Route path="/" element={<Navigate to="/dashboard" replace />} /> */}

          {/* ✅ Public Dashboard */}
          <Route path="/" element={<DashboardPage />} />

          {/* ✅ Auth-only member routes */}
          <Route
            path="/member/donation/new"
            element={
              <PrivateRoute>
                <NewDonationPage />
              </PrivateRoute>
            }
          />
          <Route
            path="/member/donations"
            element={
              <PrivateRoute>
                <DonationsPage />
              </PrivateRoute>
            }
          />
          <Route
            path="/member/upload"
            element={
              <PrivateRoute>
                <UploadPage />
              </PrivateRoute>
            }
          />

          {/* ✅ Public auth routes (but your PublicRoute can redirect logged-in users away) */}
          <Route
            path="/register"
            element={
              <PublicRoute>
                <RegisterPage />
              </PublicRoute>
            }
          />
          <Route
            path="/login"
            element={
              <PublicRoute>
                <LoginPage />
              </PublicRoute>
            }
          />
        </Routes>
      </Router>

      <ToastContainer
        position="top-right"
        autoClose={100}
        hideProgressBar={true}
        closeOnClick={true}
        draggable={false}
        pauseOnHover={true}
      />
    </>
  );
}

export default App;
