// client/src/pages/Register.tsx
import React, { useState } from "react";
import { useNavigate } from "react-router-dom";


export default function Register(): JSX.Element {
  const nav = useNavigate();
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [pw, setPw] = useState("");
  const [confirmPw, setConfirmPw] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  const validate = () => {
    if (!name.trim() || !email.trim() || !pw) {
      setError("Please fill in all required fields.");
      return false;
    }
    if (pw.length < 6) {
      setError("Password should be at least 6 characters.");
      return false;
    }
    if (pw !== confirmPw) {
      setError("Passwords do not match.");
      return false;
    }
    setError(null);
    return true;
  };

  const onSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!validate()) return;

    setLoading(true);
    try {
      await new Promise((r) => setTimeout(r, 800));
      nav("/dashboard");
    } catch (err: any) {
      setError(err?.message || "Registration failed. Try again.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="relative min-h-screen flex items-center justify-center text-white overflow-hidden">

      {/* Background video */}
      <video
        src="/register-bg.mp4"
        autoPlay
        muted
        loop
        playsInline
        className="absolute inset-0 w-full h-full object-cover -z-10"
      />

      {/* Dark overlay */}
      <div className="absolute inset-0 bg-black/60 -z-5"></div>

      {/* ✨ Particle Layer */}
      <div className="pointer-events-none absolute inset-0 -z-5" id="particles"></div>

      {/* Form card */}
      <div className="relative bg-white/10 backdrop-blur-lg border border-white/20 rounded-xl p-8 w-[90%] max-w-md shadow-2xl">
        <h2 className="text-3xl font-extrabold text-white text-center mb-4">
          Create your account
        </h2>

        <p className="text-sm text-gray-200 text-center mb-6 opacity-90">
          Join InvestMate and start your investing journey.
        </p>

        {error && (
          <div className="text-sm text-red-400 bg-red-900/20 p-2 rounded mb-3">
            {error}
          </div>
        )}

        <form onSubmit={onSubmit} className="flex flex-col gap-4">

          <label className="flex flex-col text-sm">
            <span className="text-gray-300 text-xs mb-1">Full Name</span>
            <input
              value={name}
              onChange={(e) => setName(e.target.value)}
              className="px-3 py-2 rounded bg-white/20 text-white placeholder-gray-300 border border-white/20 focus:outline-none focus:ring-2 focus:ring-cyan-400"
              placeholder="Jane Doe"
            />
          </label>

          <label className="flex flex-col text-sm">
            <span className="text-gray-300 text-xs mb-1">Email</span>
            <input
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              className="px-3 py-2 rounded bg-white/20 text-white placeholder-gray-300 border border-white/20 focus:outline-none focus:ring-2 focus:ring-cyan-400"
              placeholder="you@domain.com"
            />
          </label>

          <label className="flex flex-col text-sm">
            <span className="text-gray-300 text-xs mb-1">Password</span>
            <input
              type="password"
              value={pw}
              onChange={(e) => setPw(e.target.value)}
              className="px-3 py-2 rounded bg-white/20 text-white placeholder-gray-300 border border-white/20 focus:outline-none focus:ring-2 focus:ring-cyan-400"
              placeholder="Choose a secure password"
            />
          </label>

          <label className="flex flex-col text-sm mb-2">
            <span className="text-gray-300 text-xs mb-1">Confirm Password</span>
            <input
              type="password"
              value={confirmPw}
              onChange={(e) => setConfirmPw(e.target.value)}
              className="px-3 py-2 rounded bg-white/20 text-white placeholder-gray-300 border border-white/20 focus:outline-none focus:ring-2 focus:ring-cyan-400"
              placeholder="Confirm password"
            />
          </label>

          <button
            type="submit"
            disabled={loading}
            className="mt-4 w-full py-3 rounded-full font-medium bg-gradient-to-r from-cyan-400 to-teal-400 text-slate-900 hover:scale-105 transition"
          >
            {loading ? "Creating account..." : "Create Account"}
          </button>

          <p className="text-xs text-gray-200 text-center mt-4">
            Already registered?{" "}
            <span
              onClick={() => nav("/login")}
              className="text-cyan-300 underline cursor-pointer"
            >
              Login
            </span>
          </p>
        </form>
      </div>
    </div>
  );
}



