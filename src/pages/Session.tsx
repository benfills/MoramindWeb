import { useState } from "react";
import Congrats from "../components/Congrats";
import Work from "../components/work";
import type { Settings } from "../types";


export default function Mainpage({
  settings,
  onBack,
}: {
  settings: Settings;
  onBack: () => void;
}) {
  type Phase = "work" | "shortBreak" | "longBreak"
  const [tick, setTick] = useState(settings.workMin * 60);
  const [running] = useState<Phase>("work")

  if (tick >= 0 && running === "work") {
    return <Work setter={setTick} curstate={tick} onBack={onBack} />;
  } else {
    return <Congrats />;
  }
}
