import { useState } from "react";
import { useNavigate, Link } from "react-router-dom";
import { apiFetch } from "../api";
import { useAuth } from "../context/AuthContext";

export default function Login() {
  const [identifier, setIdentifier] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
  const { login } = useAuth();
  const navigate = useNavigate();

  async function handleSubmit(e) {
    e.preventDefault();
    setError("");
    setLoading(true);

    try {
      const res = await apiFetch("/api/login", {
        method: "POST",
        body: JSON.stringify({ identifier: identifier.trim(), password }),
      });
      const data = await res.json();

      if (!res.ok) {
        setError(data.message || "Invalid login details.");
        return;
      }

      login(data);
      navigate(data.role === "admin" ? "/admin" : "/dashboard");
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
                <path strokeLinecap="round" strokeLinejoin="round" d="M12 14l9-5-9-5-9 5 9 5z" />
                <path strokeLinecap="round" strokeLinejoin="round" d="M12 14l6.16-3.42A12.083 12.083 0 0112 21a12.083 12.083 0 01-6.16-10.42L12 14z" />
              </svg>
            </div>
            <h1 className="text-2xl font-bold text-white tracking-tight">Welcome back</h1>
            <p className="text-white/50 text-sm mt-1">Students: use your Learner ID. Admins: use your email.</p>
          </div>

          <form onSubmit={handleSubmit} className="space-y-5">
            <div>
              <label className="flex items-center gap-2 text-xs font-semibold text-white/60 mb-1.5 uppercase tracking-wide">
                <svg className="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                  <path strokeLinecap="round" strokeLinejoin="round" d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
                </svg>
                Learner ID or Admin Email
              </label>
              <input
                type="text"
                value={identifier}
                onChange={(e) => setIdentifier(e.target.value)}
                required
                placeholder="STU-000007"
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
            </div>

            {error && (
              <p className="flex items-center justify-center gap-2 text-red-300 text-sm text-center bg-red-500/10 border border-red-500/20 rounded-xl py-2.5 animate-fade-in-up">
                <svg className="w-4 h-4 shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                  <path strokeLinecap="round" strokeLinejoin="round" d="M12 9v3.75m-9.303 3.376c-.866 1.5.217 3.374 1.948 3.374h14.71c1.73 0 2.813-1.874 1.948-3.374L13.949 3.378c-.866-1.5-3.032-1.5-3.898 0L2.697 16.126zM12 15.75h.007v.008H12v-.008z" />
                </svg>
                {error}
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
              {loading ? "Logging in…" : "Log In"}
            </button>

            <p className="text-center text-sm text-white/50">
              Don't have an account?{" "}
              <Link to="/signup" className="text-white font-semibold hover:text-white/80 transition-colors">
                Register now
              </Link>
            </p>
          </form>
        </div>
      </div>
    </div>
  );
}