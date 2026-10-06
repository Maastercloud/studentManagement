import { useState } from "react";
import { useNavigate, Link } from "react-router-dom";
import { apiFetch } from "../api";

export default function Signup() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [schoolCode, setSchoolCode] = useState("");
  const [confirm, setConfirm] = useState("");
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();

  const [learnerId, setLearnerId] = useState(null);

async function handleSubmit(e) {
  e.preventDefault();
  setError("");

  if (password.length < 8) {
    setError("Password must be at least 8 characters");
    return;
  }
  if (password !== confirm) {
    setError("Passwords don't match");
    return;
  }

  setLoading(true);
  try {
    const res = await apiFetch("/api/signup", {
      method: "POST",
      body: JSON.stringify({ email, password, schoolCode: schoolCode.trim().toUpperCase() }),
    });
    const data = await res.json();

    if (!res.ok) {
      setError(data.message || "Something went wrong.");
      return;
    }

    setLearnerId(data.learnerId);
  } catch (err) {
    setError("Couldn't reach the server.");
  } finally {
    setLoading(false);
  }
}

  return (
    <div className="relative min-h-screen flex items-center justify-center overflow-hidden bg-slate-950 p-6">
      <div className="absolute top-0 -left-24 w-96 h-96 bg-white/[0.06] rounded-full filter blur-3xl animate-blob" />
      <div className="absolute bottom-0 -right-24 w-96 h-96 bg-white/[0.05] rounded-full filter blur-3xl animate-blob animation-delay-2000" />
      <div className="absolute top-1/3 left-1/2 w-72 h-72 bg-white/[0.04] rounded-full filter blur-3xl animate-blob animation-delay-4000" />
      <div className="absolute inset-0 bg-[linear-gradient(rgba(255,255,255,0.03)_1px,transparent_1px),linear-gradient(90deg,rgba(255,255,255,0.03)_1px,transparent_1px)] bg-[size:48px_48px]" />

      <div className="relative w-full max-w-md animate-fade-in-up">
        <div className="bg-white/[0.06] backdrop-blur-2xl border border-white/[0.12] rounded-3xl shadow-2xl shadow-black/40 p-8">
          <div className="text-center mb-8">
            <div className="inline-flex items-center justify-center w-14 h-14 rounded-2xl bg-white/[0.07] backdrop-blur-xl border border-white/15 mb-4">
              <svg className="w-6 h-6 text-white/90" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.6}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M18 9v3m0 0v3m0-3h3m-3 0h-3m-2-5a4 4 0 11-8 0 4 4 0 018 0zM3 20a6 6 0 0112 0v1H3v-1z" />
              </svg>
            </div>
            <h1 className="text-2xl font-bold text-white tracking-tight">Create your account</h1>
            <p className="text-white/50 text-sm mt-1">Join Coursework — it's free</p>
          </div>

          <form onSubmit={handleSubmit} className="space-y-5">
            <div>
  <label className="flex items-center gap-2 text-xs font-semibold text-white/60 mb-1.5 uppercase tracking-wide">
    <svg className="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
      <path strokeLinecap="round" strokeLinejoin="round" d="M12 14l9-5-9-5-9 5 9 5z" />
      <path strokeLinecap="round" strokeLinejoin="round" d="M12 14l6.16-3.42A12.083 12.083 0 0112 21a12.083 12.083 0 01-6.16-10.42L12 14z" />
    </svg>
    School Code
  </label>
  <input
    type="text"
    value={schoolCode}
    onChange={(e) => setSchoolCode(e.target.value)}
    required
    placeholder="SCHOOL-A1B2C3"
    className="w-full px-4 py-3 rounded-xl bg-white/[0.04] border border-white/[0.12] text-white placeholder-white/30 text-sm uppercase
               focus:outline-none focus:ring-2 focus:ring-white/20 focus:border-white/30 focus:bg-white/[0.07]
               transition-all duration-200"
  />
  <p className="text-xs text-white/35 mt-1.5">Get this from your school's admin.</p>
</div>
            <div>
              <label className="flex items-center gap-2 text-xs font-semibold text-white/60 mb-1.5 uppercase tracking-wide">
                <svg className="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                  <path strokeLinecap="round" strokeLinejoin="round" d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
                </svg>
                Email Address
              </label>
              <input
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                required
                placeholder="you@example.com"
                className="w-full px-4 py-3 rounded-xl bg-white/[0.04] border border-white/[0.12] text-white placeholder-white/30 text-sm
                           focus:outline-none focus:ring-2 focus:ring-white/20 focus:border-white/30 focus:bg-white/[0.07]
                           transition-all duration-200"
              />
            </div>

            <div>
              <label className="flex items-center gap-2 text-xs font-semibold text-white/60 mb-1.5 uppercase tracking-wide">
                <svg className="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                  <rect x="3" y="11" width="18" height="11" rx="2" />
                  <path d="M7 11V7a5 5 0 0110 0v4" />
                </svg>
                Password
              </label>
              <input
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                required
                placeholder="••••••••"
                className="w-full px-4 py-3 rounded-xl bg-white/[0.04] border border-white/[0.12] text-white placeholder-white/30 text-sm
                           focus:outline-none focus:ring-2 focus:ring-white/20 focus:border-white/30 focus:bg-white/[0.07]
                           transition-all duration-200"
              />
              <p className="text-xs text-white/35 mt-1.5">At least 8 characters</p>
            </div>

            <div>
              <label className="flex items-center gap-2 text-xs font-semibold text-white/60 mb-1.5 uppercase tracking-wide">
                <svg className="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                  <path strokeLinecap="round" strokeLinejoin="round" d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
                Confirm Password
              </label>
              <input
                type="password"
                value={confirm}
                onChange={(e) => setConfirm(e.target.value)}
                required
                placeholder="••••••••"
                className="w-full px-4 py-3 rounded-xl bg-white/[0.04] border border-white/[0.12] text-white placeholder-white/30 text-sm
                           focus:outline-none focus:ring-2 focus:ring-white/20 focus:border-white/30 focus:bg-white/[0.07]
                           transition-all duration-200"
              />
            </div>

            {error && (
              <p className="flex items-center justify-center gap-2 text-red-300 text-sm text-center bg-red-500/10 border border-red-500/20 rounded-xl py-2.5 animate-fade-in-up">
                <svg className="w-4 h-4 shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                  <path strokeLinecap="round" strokeLinejoin="round" d="M12 9v3.75m-9.303 3.376c-.866 1.5.217 3.374 1.948 3.374h14.71c1.73 0 2.813-1.874 1.948-3.374L13.949 3.378c-.866-1.5-3.032-1.5-3.898 0L2.697 16.126zM12 15.75h.007v.008H12v-.008z" />
                </svg>
                {error}
              </p>
            )}
            {success && (
              <p className="flex items-center justify-center gap-2 text-green-300 text-sm text-center bg-green-500/10 border border-green-500/20 rounded-xl py-2.5 animate-fade-in-up">
                <svg className="w-4 h-4 shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                  <path strokeLinecap="round" strokeLinejoin="round" d="M9 12.75L11.25 15 15 9.75M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
                {success}
              </p>
            )}

            <button
              type="submit"
              disabled={loading}
              className="w-full flex items-center justify-center gap-2 bg-white/[0.08] hover:bg-white/[0.14] backdrop-blur-xl
                         border border-white/20 text-white font-semibold py-3 rounded-xl
                         shadow-lg shadow-black/20 hover:scale-[1.02] active:scale-[0.98]
                         disabled:opacity-50 disabled:hover:scale-100 transition-all duration-200"
            >
              {loading ? (
                <>
                  <svg className="animate-spin h-4 w-4" fill="none" viewBox="0 0 24 24">
                    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8v4a4 4 0 00-4 4H4z" />
                  </svg>
                  Creating account…
                </>
              ) : (
                "Sign Up"
              )}
            </button>

            <p className="text-center text-sm text-white/50">
              Already have an account?{" "}
              <Link to="/login" className="text-white font-semibold hover:text-white/80 transition-colors">
                Log in
              </Link>
            </p>
          </form>
          {learnerId ? (
  <div className="text-center space-y-4">
    <div className="bg-white/[0.06] border border-white/20 rounded-xl p-5">
      <p className="text-white/60 text-xs uppercase tracking-wide mb-1">Your Learner ID</p>
      <p className="text-white text-2xl font-bold font-mono tracking-wider">{learnerId}</p>
      <p className="text-white/40 text-xs mt-2">Save this now — your email won't work to log in. Only this ID will.</p>
    </div>
    <Link
      to="/login"
      className="inline-block w-full bg-white/[0.08] hover:bg-white/[0.14] border border-white/20 text-white font-semibold py-3 rounded-xl transition-all"
    >
      Continue to login
    </Link>
  </div>
) : (
  <form onSubmit={handleSubmit} className="space-y-5">
    {/* your existing email / password / confirm fields stay exactly as they are */}
  </form>
)}
        </div>
      </div>
    </div>
  );
}