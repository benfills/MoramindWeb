import { useState } from "react";
import Homepage from "./pages/Homepage";
import Mainpage from "./pages/Mainpage";
import type { Settings } from "./types";

export default function App() {
  const [page, setPage] = useState<"home" | "timer">("home");
  const [settings, setSettings] = useState<Settings>({
    workMin: 25,
    shortBreakMin: 5,
    longBreakMin: 15,
  });

  if (page === "home") {
    return (
      <Homepage
        onStart={(s) => {
          setSettings(s);
          setPage("timer");
        }}
      />
    );
  }

  return <Mainpage settings={settings} onBack={() => setPage("home")} />;
}
