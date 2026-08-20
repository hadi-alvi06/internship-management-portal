import { useEffect } from "react";
import { BrowserRouter, Routes, Route } from "react-router-dom";

import MainLayout from "./layouts/MainLayout";

import Dashboard from "./pages/Dashboard";
import Interns from "./pages/Interns";
import Attendance from "./pages/Attendance";
import AddIntern from "./pages/AddIntern";
import ManageInterns from "./pages/ManageInterns";
import Settings from "./pages/Settings";
import Login from "./pages/Login";

import { AuthProvider } from "./context/AuthContext";
import ProtectedRoute from "./components/ProtectedRoute";
import ManageAccounts from "./pages/ManageAccounts";
import Profile from "./pages/Profile";

function ThemeLoader() {
  useEffect(() => {
    const savedTheme = localStorage.getItem("theme");
    if (savedTheme === "Dark") {
      document.body.classList.add("dark");
    }
  }, []);
  return null;
}

export default function App() {
  return (
    <AuthProvider>
      <BrowserRouter>
        <ThemeLoader />
        <Routes>
          <Route path="/login" element={<Login />} />

          <Route
            path="/*"
            element={
              <ProtectedRoute>
                <MainLayout>
                  <Routes>
                    <Route path="/" element={<Dashboard />} />
                    <Route path="/interns" element={<Interns />} />
                    <Route path="/attendance" element={<Attendance />} />
                    <Route path="/add" element={<AddIntern />} />
                    <Route path="/manage" element={<ManageInterns />} />
                    <Route path="/settings" element={<Settings />} />
                    <Route path="/profile" element={<Profile />} />
                    <Route
                      path="/accounts"
                          element={
                          <ProtectedRoute adminOnly={true}>
                        <ManageAccounts />
                      </ProtectedRoute>
                      }
                  />
                  </Routes>
                </MainLayout>
              </ProtectedRoute>
            }
          />
        </Routes>
      </BrowserRouter>
    </AuthProvider>
  );
}