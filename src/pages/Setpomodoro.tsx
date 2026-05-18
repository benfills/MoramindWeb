import { useState } from "react";
import type { Settings } from "../types";

export default function SetPomodoro({
  onStart,
}: {
  onStart: (s: Settings) => void;
}) {
  const [workMin, setWorkMin] = useState(25);
  const [shortBreakMin, setShortBreakMin] = useState(5);
  const [longBreakMin, setLongBreakMin] = useState(15);

  return (
    <div className="flex flex-1 min-h-screen flex-col items-center justify-center bg-[#0e0f14] px-5 py-12">
      {/* Hero */}
      <div className="mb-10 flex flex-col items-center">
        <span className="mb-4 inline-block rounded-full bg-[#aa3bff]/15 px-4 py-1.5 text-xs font-semibold uppercase tracking-widest text-[#aa3bff]">
          Focus. Rest. Repeat.
        </span>
        <h1 className="text-5xl font-black tracking-tight text-white">
          Moramind
        </h1>
      </div>

      {/* Settings card */}
      <div className="w-full max-w-sm rounded-2xl border border-white/10 bg-white/5 px-6 py-7 shadow-[0_0_40px_rgba(170,59,255,0.15)] backdrop-blur">
        <p className="mb-5 text-xs font-bold uppercase tracking-widest text-gray-500">
          Configure your session
        </p>

        <div className="flex flex-col gap-5">
          <SliderField
            label="Work duration"
            value={workMin}
            min={1}
            max={60}
            step={1}
            onChange={setWorkMin}
          />
          <SliderField
            label="Short break"
            value={shortBreakMin}
            min={1}
            max={15}
            step={1}
            onChange={setShortBreakMin}
          />
          <SliderField
            label="Long break"
            value={longBreakMin}
            min={1}
            max={120}
            step={1}
            onChange={setLongBreakMin}
          />
        </div>

        <button
          className="mt-7 h-12 w-full rounded-xl bg-[#aa3bff] text-sm font-bold text-white
                    shadow-[0_0_20px_rgba(170,59,255,0.45)]
                    hover:bg-[#9b2df0] hover:shadow-[0_0_30px_rgba(170,59,255,0.7)]
                    transition-all duration-200 cursor-pointer"
          onClick={() => {onStart({ workMin, shortBreakMin, longBreakMin })}}>
          Start Session →
        </button>
      </div>
    </div>
  );
}

function SliderField({
  label,
  value,
  min,
  max,
  step,
  onChange,
}: {
  label: string;
  value: number;
  min: number;
  max: number;
  step: number;
  onChange: (v: number) => void;
}) {
  return (
    <label className="flex flex-col gap-1.5">
      <span className="text-sm font-medium text-gray-300">{label}</span>
      <div className="flex items-center gap-3">
        <input
          type="range"
          min={min}
          max={max}
          step={step}
          value={value}
          onChange={(e) => onChange(Number(e.target.value))}
          className="flex-1 accent-[#aa3bff] cursor-pointer"
        />
        <span className="w-12 rounded-lg bg-[#aa3bff]/10 py-1 text-center text-sm font-bold text-[#aa3bff]">
          {value}
        </span>
      </div>
    </label>
  );
}
