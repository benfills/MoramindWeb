// src/App.tsx
import { useState } from "react";
import { Routes, Route, useNavigate } from "react-router-dom";
import SetPomodoro from "./pages/Setpomodoro";
import Session from "./pages/Session";
import Login from "./pages/Login";
import Signup from "./pages/Signup";
import ProtectedRoute from "./components/ProtectedRoute";
import type { Settings } from "./types";

export default function App() {
  const navigate = useNavigate();
  const [settings, setSettings] = useState<Settings>({
    workMin: 25,
    shortBreakMin: 5,
    longBreakMin: 15,
  });

  return (
    <Routes>
      {/* Public routes */}
      <Route path="/login" element={<Login />} />
      <Route path="/signup" element={<Signup />} />

      {/* Protected routes */}
      <Route
        path="/"
        element={
          <ProtectedRoute>
            <SetPomodoro
              onStart={(s) => {
                setSettings(s);
                navigate("/timer");
              }}
            />
          </ProtectedRoute>
        }
      />
      <Route
        path="/timer"
        element={
          <ProtectedRoute>
            <Session settings={settings} onBack={() => navigate("/")} />
          </ProtectedRoute>
        }
      />
    </Routes>
  );
}
