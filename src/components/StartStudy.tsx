import { useState, useEffect, useRef } from "react";

export default function StartStudy({
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
          setter((prev) => prev - 1);
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
          <div className="mb-8 flex flex-col items-center justify-center">
            <img
              src="https://media1.tenor.com/m/Jp441Dss2BgAAAAC/type-cat.gif"
              className="h-20 w-20 object-contain"
              alt="cat"
            />
            <span className="mx-4 text-7xl font-black leading-none text-black">
              {curstate}
            </span>
          </div>
        )}

        <button
          className="mb-3 h-13 w-full items-center justify-center rounded-lg bg-blue-600 text-base font-semibold text-white hover:bg-blue-700 transition-colors"
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
