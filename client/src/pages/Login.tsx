// client/src/pages/Login.tsx
import React, { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";

export default function Login(): JSX.Element {
  const nav = useNavigate();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [err, setErr] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const [showPw, setShowPw] = useState(false);

  useEffect(() => {
    // helpful to debug if needed
    // console.log("Login mounted");
  }, []);

  function validateEmail(v: string) {
    return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(v);
  }

  async function onSubmit(e: React.FormEvent) {
    e.preventDefault();
    setErr(null);

    if (!validateEmail(email.trim())) return setErr("Enter a valid email");
    if (password.length < 8) return setErr("Password must be at least 8 characters");

    setLoading(true);
    try {
      const res = await fetch("/api/auth/login", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        credentials: "include",
        body: JSON.stringify({ email: email.trim(), password, remember: true }),
      });

      if (res.ok) {
        nav("/");
      } else {
        const text = await res.text();
        setErr(text || "Invalid credentials");
      }
    } catch (e) {
      setErr("Network error — try again");
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="min-h-screen bg-gradient-to-b from-[#071032] to-[#071A2A] flex items-center justify-center p-6">
      <div className="max-w-4xl w-full grid grid-cols-1 md:grid-cols-2 gap-8">
        {/* left: form */}
        <div className="relative overflow-hidden rounded-2xl bg-white/5 border border-white/6 p-8 backdrop-blur-md text-white shadow-2xl">
          <div className="flex items-center gap-4 mb-6">
            <div className="w-14 h-14 rounded-xl bg-gradient-to-br from-teal-400 to-sky-400 grid place-items-center text-[#00121a] font-bold text-lg shadow">
              IM
            </div>
            <div>
              <h1 className="text-2xl font-semibold">InvestMate</h1>
              <p className="text-sm text-white/70">Secure sign in to manage portfolios & track investments</p>
            </div>
          </div>

          <form id="loginForm" onSubmit={onSubmit} className="mt-2 space-y-5" noValidate>
            <div>
              <label htmlFor="email" className="text-sm text-white/70 block mb-2">Email</label>
              <input
                id="email"
                name="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                type="email"
                placeholder="you@company.com"
                autoComplete="email"
                required
                className="w-full px-4 py-3 rounded-lg bg-white/6 border border-white/8 outline-none text-[#00121a] placeholder:text-gray-400 focus:ring-2 focus:ring-sky-400 transition"
              />
            </div>

            <div>
              <label htmlFor="password" className="text-sm text-white/70 block mb-2">Password</label>
              <div className="relative">
                <input
                  id="password"
                  name="password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  type={showPw ? "text" : "password"}
                  placeholder="Enter your password"
                  autoComplete="current-password"
                  required
                  className="w-full px-4 py-3 rounded-lg bg-white/6 border border-white/8 outline-none text-[#00121a] placeholder:text-gray-400 focus:ring-2 focus:ring-sky-400 transition"
                />
                <button
                  type="button"
                  onClick={() => setShowPw((s) => !s)}
                  className="absolute right-2 top-2 text-sm text-white/70 hover:text-white/90"
                  aria-label={showPw ? "Hide password" : "Show password"}
                >
                  {showPw ? "Hide" : "Show"}
                </button>
              </div>
            </div>

            {err && <div className="text-sm text-red-400">{err}</div>}

            <div className="flex items-center justify-between">
              <label className="flex items-center gap-2 text-sm text-white/80">
                <input type="checkbox" className="accent-teal-400" /> Remember me
              </label>
              <a className="text-sm text-white/70 hover:underline" href="#">Forgot password?</a>
            </div>

            <div className="flex gap-3 items-center">
              <button
                disabled={loading}
                className="flex-1 py-3 rounded-lg font-semibold bg-gradient-to-r from-teal-400 to-sky-400 text-[#00121a] shadow hover:scale-[1.01] transition transform"
              >
                {loading ? "Signing in..." : "Sign in"}
              </button>
            </div>

            <div className="flex gap-2 mt-2">
              <button type="button" className="flex-1 py-2 rounded-md border border-white/8 text-sm bg-white/3 hover:bg-white/6">Google</button>
              <button type="button" className="flex-1 py-2 rounded-md border border-white/8 text-sm bg-white/3 hover:bg-white/6">Apple</button>
              <button type="button" className="flex-1 py-2 rounded-md border border-white/8 text-sm bg-white/3 hover:bg-white/6">GitHub</button>
            </div>
          </form>

          <div className="mt-6 text-sm text-white/70 flex justify-between items-center">
            <div>New here? <a className="font-semibold text-teal-300" href="#">Create an account</a></div>
            <div className="text-xs">v1.0</div>
          </div>

          {/* subtle decorative SVG in corner */}
          <svg className="absolute -right-10 -bottom-10 opacity-20" width="220" height="220" viewBox="0 0 220 220" fill="none" xmlns="http://www.w3.org/2000/svg" aria-hidden>
            <circle cx="110" cy="110" r="110" fill="url(#g1)"/>
            <defs>
              <radialGradient id="g1" cx="0" cy="0" r="1" gradientUnits="userSpaceOnUse" gradientTransform="translate(110 110) rotate(90) scale(110)">
                <stop offset="0" stopColor="#06b6d4"/>
                <stop offset="1" stopColor="#3b82f6"/>
              </radialGradient>
            </defs>
          </svg>
        </div>

        {/* right: features / marketing */}
        <aside className="rounded-2xl p-6 bg-white/4 border border-white/6 backdrop-blur-md text-white shadow-md">
          <h2 className="text-xl font-semibold">Why InvestMate?</h2>
          <p className="text-sm text-white/70 mt-2">Fast, secure, and built for modern traders and long-term investors.</p>

          <div className="grid gap-3 mt-4">
            <div className="p-3 rounded-lg bg-white/5 flex items-start gap-3">
              <div className="w-10 h-10 rounded-md grid place-items-center bg-gradient-to-br from-sky-400 to-teal-400 text-[#00121a] font-semibold">A</div>
              <div>
                <h3 className="font-semibold">Bank-level security</h3>
                <p className="text-sm text-white/70">Encrypted storage, 2FA-ready and continuous monitoring.</p>
              </div>
            </div>

            <div className="p-3 rounded-lg bg-white/5 flex items-start gap-3">
              <div className="w-10 h-10 rounded-md grid place-items-center bg-gradient-to-br from-purple-400 to-pink-400 text-[#00121a] font-semibold">S</div>
              <div>
                <h3 className="font-semibold">Smart insights</h3>
                <p className="text-sm text-white/70">AI-driven suggestions & personalized dashboards.</p>
              </div>
            </div>

            <div className="p-3 rounded-lg bg-white/5 flex items-start gap-3">
              <div className="w-10 h-10 rounded-md grid place-items-center bg-gradient-to-br from-yellow-300 to-orange-300 text-[#00121a] font-semibold">L</div>
              <div>
                <h3 className="font-semibold">Low fees</h3>
                <p className="text-sm text-white/70">Competitive pricing to help you keep more of your returns.</p>
              </div>
            </div>
          </div>

          <div className="mt-6 text-xs text-white/60">By signing in you agree to our terms and privacy policy.</div>
        </aside>
      </div>
    </div>
  );
}

