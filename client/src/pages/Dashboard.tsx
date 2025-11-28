// client/src/pages/Home.tsx
import React from "react";
import { useNavigate } from "react-router-dom";

export default function Home() {
  const nav = useNavigate();

  return (
    <div className="relative min-h-screen overflow-hidden flex items-center justify-center text-white">

      {/* BACKGROUND */}
      <div className="absolute inset-0 bg-gradient-to-br from-[#030712] via-[#0a1229] to-[#0f274a]"></div>

      {/* Blurred Glow Blobs */}
      <div className="absolute w-[600px] h-[600px] bg-teal-400/20 rounded-full blur-[120px] top-[-100px] left-[-150px]"></div>
      <div className="absolute w-[500px] h-[500px] bg-sky-500/20 rounded-full blur-[150px] bottom-[-100px] right-[-80px]"></div>

      <div className="relative z-10 max-w-3xl text-center space-y-6 animate-fadeIn">
        <h1 className="text-4xl md:text-6xl font-extrabold leading-tight">
          Welcome to{" "}
          <span className="text-transparent bg-clip-text bg-gradient-to-r from-teal-300 to-sky-400">
            InvestMate
          </span>
        </h1>

        <p className="text-lg md:text-xl text-white/80 max-w-2xl mx-auto">
          A modern real-time investment platform that helps you track stocks,
          analyze trends, and make smart financial decisions.
        </p>

        <div className="mt-8 flex justify-center gap-4">
          <button
            onClick={() => nav("/login")}
            className="px-8 py-3 text-lg font-semibold rounded-xl bg-gradient-to-r from-teal-400 to-sky-400 text-[#00121a] shadow-lg hover:scale-105 transition-transform"
          >
            Get Started
          </button>
          <button
            onClick={() => alert('Coming Soon!')}
            className="px-8 py-3 text-lg font-semibold rounded-xl border border-white/20 bg-white/10 backdrop-blur hover:bg-white/20 transition"
          >
            Learn More
          </button>
        </div>
      </div>
    </div>
  );
}
