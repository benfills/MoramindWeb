import { useState, useEffect, useRef } from "react";

export default function Mainpage() {
  const [tick, setTick] = useState(0);

  if (tick > -1) {
    return <StartStudy setter={setTick} curstate={tick} />;
  } else {
    return <Congrats />;
  }
}

function StartStudy({
  setter,
  curstate,
}: {
  curstate: number;
  setter: (fn: (prev: number) => number) => void;
}) {
  const [status, setStatus] = useState(0);
  const curref = useRef(0);

  useEffect(() => {
    curref.current = curstate;
  }, [curstate]);

  useEffect(() => {
    const intervalID = setInterval(() => {
      if (status === 1) {
        if (curref.current > 0) {
          setter((prev) => prev - 1);
        } else {
          clearInterval(intervalID);
          setter(() => -1);
          setStatus(0);
        }
      }
    }, 1000);
    return () => clearInterval(intervalID);
  }, [status, setter]);

  return (
    <div
      className="flex flex-1 min-h-screen items-center justify-center bg-cover bg-center px-5 py-6"
      style={{
        backgroundImage:
          "url('https://images.unsplash.com/photo-1456513080510-7bf3a84b82f8?w=1200')",
      }}
    >
      <div className="flex flex-col items-center w-full max-w-sm rounded-2xl bg-white/90 px-6 py-8 shadow-xl backdrop-blur">
        <p className="mb-3 text-xs font-bold uppercase tracking-widest text-gray-500">
          Study Time
        </p>

        {status === 0 ? (
          <div className="mb-8 flex flex-row items-center justify-center">
            <span className="mx-4 text-7xl font-black leading-none text-black">
              {curstate}
            </span>
          </div>
        ) : (
          <div className="mb-8 flex flex-row items-center justify-center">
            <img
              src="https://media.tenor.com/images/13b0a35571e4a7c0e85aa91d1001b6ce/tenor.gif"
              className="h-20 w-20 object-contain"
              alt="cat"
            />
            <span className="mx-4 text-7xl font-black leading-none text-black">
              {curstate}
            </span>
            <img
              src="https://media.tenor.com/images/13b0a35571e4a7c0e85aa91d1001b6ce/tenor.gif"
              className="h-20 w-20 object-contain"
              alt="cat"
            />
          </div>
        )}

        <button
          className="mb-3 h-[52px] w-full items-center justify-center rounded-lg bg-blue-600 text-base font-semibold text-white hover:bg-blue-700 transition-colors"
          onClick={() => {
            if (status === 0 && curstate > 0) {
              setStatus((prev) => prev + 1);
            } else if (status === 0 && curstate === 0) {
              alert("Please Set Your Timer First");
            } else {
              setStatus((prev) => prev - 1);
            }
          }}
        >
          {status === 0 ? "Start Study" : "Stop Study"}
        </button>

        <button
          className="mb-2 h-12 w-full rounded-lg border border-blue-600 bg-transparent text-sm font-medium text-blue-600 hover:bg-blue-50 transition-colors"
          onClick={() => setter((prev) => prev + 60)}
        >
          Increase Study Time by 60s
        </button>

        <button
          className="mb-2 h-12 w-full rounded-lg border border-blue-600 bg-transparent text-sm font-medium text-blue-600 hover:bg-blue-50 transition-colors"
          onClick={() => setter((prev) => prev + 120)}
        >
          Increase Study Time by 120s
        </button>
      </div>
    </div>
  );
}

function Congrats() {
  return (
    <div
      className="flex min-h-screen items-center justify-center bg-cover bg-center px-5 py-6"
      style={{
        backgroundImage:
          "url('https://images.unsplash.com/photo-1456513080510-7bf3a84b82f8?w=1200')",
      }}
    >
      <div className="rounded-2xl bg-white/90 px-8 py-10 text-center shadow-xl backdrop-blur">
        <p className="text-2xl font-bold text-gray-800">
          🎉 Hurray, you made it!
        </p>
      </div>
    </div>
  );
}

function StartBreak() {
  return (
    <div className="flex min-h-screen w-full items-center justify-center">
      <p className="text-lg font-medium text-gray-700">Start Break Time</p>
    </div>
  );
}
