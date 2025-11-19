// src/pages/Login.tsx
import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';

export default function Login(): JSX.Element {
  const nav = useNavigate();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [err, setErr] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const [showPw, setShowPw] = useState(false);

    // Debug: verify the component is mounting correctly
  React.useEffect(() => {
    console.log("Login component mounted");
  }, []);


  function validateEmail(v: string) {
    return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(v);
  }

  async function onSubmit(e: React.FormEvent) {
    e.preventDefault();
    setErr(null);

    if (!validateEmail(email.trim())) return setErr('Enter a valid email');
    if (password.length < 8) return setErr('Password must be at least 8 characters');

    setLoading(true);
    try {
      // dev: proxy will forward /api -> your backend
      const res = await fetch('/api/auth/login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        credentials: 'include', // important to receive httpOnly cookie
        body: JSON.stringify({ email: email.trim(), password, remember: true })
      });

      if (res.ok) {
        // on success redirect to dashboard or root
        nav('/');
      } else {
        const text = await res.text();
        setErr(text || 'Invalid credentials');
      }
    } catch (e) {
      setErr('Network error — try again');
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="min-h-screen bg-gradient-to-b from-[#071032] to-[#0f172a] flex items-center justify-center p-6">
      <div className="max-w-4xl w-full grid md:grid-cols-2 gap-8">
        <div className="bg-white/3 border border-white/6 rounded-2xl p-8 backdrop-blur-md text-white shadow-lg">
          <div className="flex items-center gap-4 mb-4">
            <div className="w-14 h-14 rounded-lg bg-gradient-to-br from-teal-400 to-sky-400 grid place-items-center font-bold text-[#00121a]">IM</div>
            <div>
              <h1 className="text-xl font-semibold">InvestMate</h1>
              <p className="text-sm text-white/75">Secure sign in to manage portfolios & track investments</p>
            </div>
          </div>

          <form id="loginForm" onSubmit={onSubmit} className="mt-4 space-y-4" noValidate>
  {/* EMAIL */}
  <div>
    <label className="text-sm text-white/70 block mb-2">Email</label>
    <input
  id="email"
  name="email"
  value={email}
  onChange={(e) => setEmail(e.target.value)}
  type="email"
  placeholder="you@company.com"
  className="w-full px-4 py-3 rounded-lg bg-white/6 border border-white/6 outline-none text-[#00121a] placeholder:text-gray-400"
  autoComplete="email"
  required
/>

  </div>

  {/* PASSWORD */}
  <div>
    <label className="text-sm text-white/70 block mb-2">Password</label>
    <div className="relative">
      <input
  id="password"
  name="password"
  value={password}
  onChange={(e) => setPassword(e.target.value)}
  type={showPw ? 'text' : 'password'}
  placeholder="Enter your password"
  className="w-full px-4 py-3 rounded-lg bg-white/6 border border-white/6 outline-none text-[#00121a] placeholder:text-gray-400"
  autoComplete="current-password"
  required
/>

      <button
        type="button"
        onClick={() => setShowPw((s) => !s)}
        className="absolute right-2 top-2 text-sm text-white/70"
      >
        {showPw ? 'Hide' : 'Show'}
      </button>
    </div>
  </div>

  {err && <div className="text-sm text-red-400">{err}</div>}

  <div className="flex items-center justify-between mt-2">
    <label className="flex items-center gap-2 text-sm text-white/80">
      <input type="checkbox" className="accent-teal-400" /> Remember me
    </label>
    <a className="text-sm text-white/70" href="#">Forgot password?</a>
  </div>

  <div className="flex gap-3 items-center">
    <button disabled={loading} className="flex-1 py-3 rounded-lg font-semibold bg-gradient-to-r from-teal-400 to-sky-400 text-[#00121a]">
      {loading ? 'Signing in...' : 'Sign in'}
    </button>
  </div>

  {/* Social buttons */}
  <div className="flex gap-2 mt-2">
    <button type="button" className="flex-1 py-2 rounded-md border border-white/6 text-sm">Google</button>
    <button type="button" className="flex-1 py-2 rounded-md border border-white/6 text-sm">Apple</button>
    <button type="button" className="flex-1 py-2 rounded-md border border-white/6 text-sm">GitHub</button>
  </div>
</form>


          <div className="mt-6 text-sm text-white/70 flex justify-between">
            <div>New here? <a className="font-semibold text-teal-300" href="#">Create an account</a></div>
            <div className="text-xs">v1.0</div>
          </div>
        </div>

        <aside className="bg-white/3 border border-white/6 rounded-2xl p-6 backdrop-blur-md text-white shadow-lg">
          <h2 className="text-lg font-semibold">Why InvestMate?</h2>
          <p className="text-sm text-white/70 mt-2">Fast, secure, and built for modern traders and long-term investors. A few highlights:</p>
          <div className="grid gap-3 mt-4">
            <div className="bg-white/4 p-3 rounded-lg">
              <h3 className="font-semibold">Bank-level security</h3>
              <p className="text-sm text-white/70">Encrypted storage, 2FA-ready and continuous monitoring.</p>
            </div>
            <div className="bg-white/4 p-3 rounded-lg">
              <h3 className="font-semibold">Smart insights</h3>
              <p className="text-sm text-white/70">AI-driven suggestions & personalized dashboards.</p>
            </div>
            <div className="bg-white/4 p-3 rounded-lg">
              <h3 className="font-semibold">Low fees</h3>
              <p className="text-sm text-white/70">Competitive pricing to help you keep more of your returns.</p>
            </div>
          </div>
        </aside>
      </div>
    </div>
  );
}
