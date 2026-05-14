import { useState } from "react";
import Congrats from "../components/Congrats";
import StartStudy from "../components/StartStudy";

export default function Mainpage() {
  const [tick, setTick] = useState(0);

  if (tick > -1) {
    return <StartStudy setter={setTick} curstate={tick} />;
  } else {
    return <Congrats />;
  }
}
