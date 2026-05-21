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
  const [tick, setTick] = useState(settings.workMin * 60);

  if (tick > -1) {
    return <Work setter={setTick} curstate={tick} onBack={onBack} />;
  } else {
    return <Congrats />;
  }
}
