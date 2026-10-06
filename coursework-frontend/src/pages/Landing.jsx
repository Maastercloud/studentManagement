import { Link } from "react-router-dom";

const FEATURES = [
  {
    title: "Manage your courses",
    text: "Add what you're taking this term and keep a running list — no more losing track in a notes app.",
    icon: <path strokeLinecap="round" strokeLinejoin="round" d="M12 6.253v13m0-13C10.832 5.477 9.246 5 7.5 5S4.168 5.477 3 6.253v13C4.168 18.477 5.754 18 7.5 18s4.332.477 5.5 1.253m0-13C13.168 5.477 14.754 5 16.5 5c1.746 0 3.332.477 4.5 1.253v13C19.832 18.477 18.246 18 16.5 18c-1.746 0-3.332.477-4.5 1.253" />,
  },
  {
    title: "See your results",
    text: "Every assessment and grade laid out clearly, with your running average calculated for you.",
    icon: <path strokeLinecap="round" strokeLinejoin="round" d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />,
  },
  {
    title: "Pay fees & mark attendance",
    text: "Handle your termly fees and daily attendance right from the same place as everything else.",
    icon: <path strokeLinecap="round" strokeLinejoin="round" d="M3 10h18M7 15h1m4 0h1m-7 4h12a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />,
  },
];

function GlassIcon({ children, size = "w-11 h-11" }) {
  return (
    <div className={`inline-flex items-center justify-center rounded-xl bg-white/[0.07] backdrop-blur-xl border border-white/15 ${size}`}>
      <svg className="w-5 h-5 text-white/85" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.6}>
        {children}
      </svg>
    </div>
  );
}

export default function Landing() {
  return (
    <div className="relative min-h-screen bg-slate-950 overflow-hidden">
      <div className="absolute top-0 -left-24 w-96 h-96 bg-white/[0.05] rounded-full filter blur-3xl animate-blob" />
      <div className="absolute top-40 -right-10 w-96 h-96 bg-white/[0.04] rounded-full filter blur-3xl animate-blob animation-delay-2000" />
      <div className="absolute bottom-0 left-1/3 w-72 h-72 bg-white/[0.03] rounded-full filter blur-3xl animate-blob animation-delay-4000" />
      <div className="absolute inset-0 bg-[linear-gradient(rgba(255,255,255,0.025)_1px,transparent_1px),linear-gradient(90deg,rgba(255,255,255,0.025)_1px,transparent_1px)] bg-[size:48px_48px]" />

      {/* Nav */}
      <header className="relative z-10">
        <nav className="max-w-6xl mx-auto flex items-center justify-between px-6 py-6">
          <div className="flex items-center gap-2.5">
            <GlassIcon size="w-9 h-9">
              <path strokeLinecap="round" strokeLinejoin="round" d="M12 14l9-5-9-5-9 5 9 5z" />
              <path strokeLinecap="round" strokeLinejoin="round" d="M12 14l6.16-3.42A12.083 12.083 0 0112 21a12.083 12.083 0 01-6.16-10.42L12 14z" />
            </GlassIcon>
            <span className="text-white font-bold text-lg">Coursework</span>
          </div>
          <div className="flex items-center gap-3">
            <Link to="/login" className="text-white/60 hover:text-white text-sm font-medium transition-colors hidden sm:block">
              Log in
            </Link>
            <Link
              to="/signup"
              className="bg-white/[0.08] hover:bg-white/[0.14] backdrop-blur-xl border border-white/20 text-white text-sm font-semibold px-5 py-2.5 rounded-xl transition-all duration-200"
            >
              Get started
            </Link>
          </div>
        </nav>
      </header>

      {/* Hero */}
      <section className="relative z-10 max-w-6xl mx-auto px-6 pt-16 pb-24 text-center">
        <div className="animate-fade-in-up">
          <p className="text-white/50 text-sm font-medium mb-4">Built for students, not spreadsheets</p>
          <h1 className="text-4xl sm:text-5xl font-bold text-white tracking-tight max-w-2xl mx-auto leading-tight">
            Your courses, results, and fees — in one place
          </h1>
          <p className="text-white/50 text-base sm:text-lg mt-5 max-w-lg mx-auto">
            Track everything about your term without digging through emails or asking around campus.
          </p>

          <div className="flex flex-col sm:flex-row items-center justify-center gap-3 mt-9">
            <Link
              to="/signup"
              className="w-full sm:w-auto bg-white/[0.08] hover:bg-white/[0.14] backdrop-blur-xl border border-white/20 text-white font-semibold px-7 py-3.5 rounded-xl
                         shadow-lg shadow-black/20 hover:scale-[1.02] active:scale-[0.98] transition-all duration-200"
            >
              Create your account
            </Link>
            <Link
              to="/login"
              className="w-full sm:w-auto text-white/70 hover:text-white font-medium px-7 py-3.5 rounded-xl border border-white/10 hover:border-white/25 transition-all duration-200"
            >
              I already have one
            </Link>
          </div>
          <p className="text-white/30 text-xs mt-5">
  Students: you'll need a school code from your admin to sign up.
</p>
        </div>
      </section>

      {/* Features */}
      <section className="relative z-10 max-w-6xl mx-auto px-6 pb-24">
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-5">
          {FEATURES.map((f, i) => (
            <div
              key={f.title}
              className="bg-white/[0.04] backdrop-blur-xl border border-white/[0.1] rounded-2xl p-6 animate-fade-in-up"
              style={{ animationDelay: `${i * 100}ms` }}
            >
              <GlassIcon>{f.icon}</GlassIcon>
              <h3 className="text-white font-semibold mt-5 mb-2">{f.title}</h3>
              <p className="text-white/45 text-sm">{f.text}</p>
            </div>
          ))}
        </div>
      </section>

      {/* Roles */}
      <section className="relative z-10 max-w-6xl mx-auto px-6 pb-24">
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
          <div className="bg-white/[0.04] backdrop-blur-xl border border-white/[0.1] rounded-2xl p-7">
            <span className="inline-block text-xs font-bold px-3 py-1 rounded-full bg-white/[0.08] border border-white/15 text-white/80 mb-4">
              Student
            </span>
            <h3 className="text-white font-semibold text-lg mb-3">Everything about your term, at a glance</h3>
            <ul className="text-white/50 text-sm space-y-2">
              <li>• Enroll in and track your own courses</li>
              <li>• Check grades as soon as they're posted</li>
              <li>• Mark attendance and pay fees, all in one place</li>
            </ul>
          </div>
          <div className="bg-white/[0.04] backdrop-blur-xl border border-white/[0.1] rounded-2xl p-7">
            <span className="inline-block text-xs font-bold px-3 py-1 rounded-full bg-white/[0.08] border border-white/15 text-white/80 mb-4">
              Admin
            </span>
            <h3 className="text-white font-semibold text-lg mb-3">Oversight without the busywork</h3>
            <ul className="text-white/50 text-sm space-y-2">
              <li>• Import results in bulk from a spreadsheet</li>
              <li>• Manage student accounts and roles</li>
              <li>• Nothing a student account can reach on its own</li>
            </ul>
          </div>
        </div>
      </section>

      {/* CTA band */}
      <section className="relative z-10 max-w-6xl mx-auto px-6 pb-16">
        <div className="bg-white/[0.05] backdrop-blur-xl border border-white/[0.12] rounded-2xl p-8 sm:p-10 flex flex-col sm:flex-row items-center justify-between gap-6 text-center sm:text-left">
          <div>
            <h2 className="text-white font-bold text-xl mb-1">Set up your account in under a minute</h2>
            <p className="text-white/45 text-sm">Free to join — just a password and a moment of your time.</p>
          </div>
          <Link
            to="/signup"
            className="shrink-0 bg-white/[0.08] hover:bg-white/[0.14] backdrop-blur-xl border border-white/20 text-white font-semibold px-7 py-3 rounded-xl transition-all duration-200"
          >
            Create your account
          </Link>
        </div>
      </section>

      {/* Footer */}
      <footer className="relative z-10 max-w-6xl mx-auto px-6 py-8 border-t border-white/[0.08] flex items-center justify-between text-sm">
        <span className="text-white font-semibold">Coursework</span>
        <span className="text-white/30">© 2026 · A student project</span>
      </footer>
    </div>
  );
}