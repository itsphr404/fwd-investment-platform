// client/src/pages/Home.tsx
import React, { useEffect, useRef, useState } from "react";
import { useNavigate } from "react-router-dom";

export default function Home() {
  const nav = useNavigate();
  const videoRef = useRef<HTMLVideoElement | null>(null);
  const [loadError, setLoadError] = useState<string | null>(null);

  // primary (public) path - this must exist: client/public/hero-bg.mp4
  const publicVideo = "/hero-bg.mp4";

  // fallback: uploaded session file path (from your environment)
  // developer note: we must include the provided upload path here as a fallback
  const uploadedFallback = "file:///mnt/data/204292-923909617_small.mp4";

  useEffect(() => {
    const vid = videoRef.current;
    if (!vid) return;

    const onLoaded = () => {
      console.log("Hero video loaded (readyState):", vid.readyState);
      setLoadError(null);
    };
    const onErr = () => {
      // log native media error details
      const mediaErr = vid.error;
      console.error("Video onError event — mediaError:", mediaErr);
      let msg = "Unknown media error";
      if (mediaErr) {
        // code 1..4 -> map to text
        const codes: any = {
          1: "MEDIA_ERR_ABORTED",
          2: "MEDIA_ERR_NETWORK",
          3: "MEDIA_ERR_DECODE",
          4: "MEDIA_ERR_SRC_NOT_SUPPORTED",
        };
        msg = `${codes[mediaErr.code] || "MEDIA_ERR_UNKNOWN"} (code ${mediaErr.code})`;
      }
      setLoadError(msg);
    };

    vid.addEventListener("loadeddata", onLoaded);
    vid.addEventListener("error", onErr);

    return () => {
      vid.removeEventListener("loadeddata", onLoaded);
      vid.removeEventListener("error", onErr);
    };
  }, []);

  // Helper: try to switch source to fallback if initial load fails
  const handleInitialError = () => {
    const vid = videoRef.current;
    if (!vid) return;

    // If the current src is publicVideo and we get an error, try the uploaded fallback
    if (vid.currentSrc.includes(publicVideo) && !vid.currentSrc.includes("mnt/data")) {
      console.log("Public video failed — trying uploaded fallback:", uploadedFallback);
      vid.src = uploadedFallback;
      vid.load();
      vid.play().catch((e) => console.warn("play() after fallback failed:", e));
    } else {
      console.warn("Both attempts failed or not using publicVideo fallback.");
    }
  };

  return (
    <div className="relative min-h-screen flex items-center justify-center text-white overflow-hidden">
      {/* video element with ref */}
      <video
        ref={videoRef}
        className="absolute inset-0 w-full h-full object-cover -z-10"
        autoPlay
        muted
        loop
        playsInline
        controls={false}
        // initial source is publicVideo
        src={publicVideo}
        onError={() => {
          console.warn("video tag onError fired (react). Will try fallback.");
          handleInitialError();
        }}
      />

      <div className="absolute inset-0 bg-black/60 backdrop-blur-sm -z-5" />

      <div className="relative z-10 text-center max-w-4xl mx-auto px-6 py-20">
        <h1 className="text-5xl md:text-6xl font-extrabold">
          Welcome to{" "}
          <span className="text-transparent bg-clip-text bg-gradient-to-r from-teal-300 to-cyan-400">
            InvestMate
          </span>
        </h1>

        <p className="mt-4 text-gray-200 text-lg max-w-2xl mx-auto">
          Track live markets, analyze trends, and build your portfolio.
        </p>

        <div className="mt-10 flex justify-center gap-4">
          <button
            onClick={() => nav("/register")}
            className="px-6 py-3 text-lg font-medium rounded-full bg-gradient-to-r from-cyan-400 to-teal-400 text-slate-900 shadow-lg hover:scale-105 transition"
          >
            Get Started
          </button>

          <button
            onClick={() => nav("/login")}
            className="px-6 py-3 text-lg font-medium rounded-full border border-white/20 bg-white/10 backdrop-blur hover:bg-white/20 transition"
          >
            Login
          </button>
        </div>

        {/* show media errors to help debugging */}
        {loadError && (
          <div className="mt-6 text-sm text-red-300 bg-red-900/20 p-3 rounded">
            Video load error: {loadError}
            <div className="text-xs text-gray-300 mt-1">
              Check (1) public file present at <code>/public/hero-bg.mp4</code>, (2) Network tab, or re-encode file.
            </div>
          </div>
        )}

        <div className="mt-16 grid grid-cols-1 sm:grid-cols-3 gap-4">
          <div className="p-4 rounded-xl bg-white/10 backdrop-blur border border-white/20 hover:bg-white/20 transition">
            <div className="text-sm text-gray-300">Realtime</div>
            <div className="text-xl font-semibold">Live Stocks</div>
            <div className="text-xs text-gray-400 mt-1">AAPL · MSFT · TSLA</div>
          </div>

          <div className="p-4 rounded-xl bg-white/10 backdrop-blur border border-white/20 hover:bg-white/20 transition">
            <div className="text-sm text-gray-300">Security</div>
            <div className="text-xl font-semibold">Safe & Secure</div>
            <div className="text-xs text-gray-400 mt-1">Encrypted JWT auth</div>
          </div>

          <div className="p-4 rounded-xl bg-white/10 backdrop-blur border border-white/20 hover:bg-white/20 transition">
            <div className="text-sm text-gray-300">Insights</div>
            <div className="text-xl font-semibold">Smart Charts</div>
            <div className="text-xs text-gray-400 mt-1">Realtime + historical</div>
          </div>
        </div>

        <div className="mt-12 text-sm text-gray-400">
          © {new Date().getFullYear()} InvestMate
        </div>
      </div>
    </div>
  );
}




