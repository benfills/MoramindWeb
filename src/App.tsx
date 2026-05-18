import { useState } from "react";
import { Routes, Route, useNavigate } from "react-router-dom";
import SetPomodoro from "./pages/Setpomodoro";
import Mainpage from "./pages/Mainpage";
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
      <Route
        path="/"
        element={
          <SetPomodoro
            onStart={(s) => {
              setSettings(s);
              navigate("/timer");
            }}
          />
        }
      />
      <Route
        path="/timer"
        element={<Mainpage settings={settings} onBack={() => navigate("/")} />}
      />
    </Routes>
  );
}
