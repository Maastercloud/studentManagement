import { useState, useEffect } from "react";
import { apiFetch } from "../api";
import { useAuth } from "../context/AuthContext";

const NAV_ITEMS = [
  { id: "overview", label: "Overview", icon: (
    <path strokeLinecap="round" strokeLinejoin="round" d="M3 3h7v9H3V3zm11 0h7v5h-7V3zm0 9h7v9h-7v-9zM3 16h7v5H3v-5z" />
  )},
  { id: "courses", label: "My Courses", icon: (
    <path strokeLinecap="round" strokeLinejoin="round" d="M12 6.253v13m0-13C10.832 5.477 9.246 5 7.5 5S4.168 5.477 3 6.253v13C4.168 18.477 5.754 18 7.5 18s4.332.477 5.5 1.253m0-13C13.168 5.477 14.754 5 16.5 5c1.746 0 3.332.477 4.5 1.253v13C19.832 18.477 18.246 18 16.5 18c-1.746 0-3.332.477-4.5 1.253" />
  )},
  { id: "results", label: "Results", icon: (
    <path strokeLinecap="round" strokeLinejoin="round" d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
  )},
  { id: "profile", label: "Profile", icon: (
    <path strokeLinecap="round" strokeLinejoin="round" d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
  )},
  { id: "attendance", label: "Attendance", icon: (
  <path strokeLinecap="round" strokeLinejoin="round" d="M9 12l2 2 4-4M7.835 4.697a3.42 3.42 0 001.946-.806 3.42 3.42 0 014.438 0 3.42 3.42 0 001.946.806 3.42 3.42 0 013.138 3.138 3.42 3.42 0 00.806 1.946 3.42 3.42 0 010 4.438 3.42 3.42 0 00-.806 1.946 3.42 3.42 0 01-3.138 3.138 3.42 3.42 0 00-1.946.806 3.42 3.42 0 01-4.438 0 3.42 3.42 0 00-1.946-.806 3.42 3.42 0 01-3.138-3.138 3.42 3.42 0 00-.806-1.946 3.42 3.42 0 010-4.438 3.42 3.42 0 00.806-1.946 3.42 3.42 0 013.138-3.138z" />
)},
{ id: "fees", label: "Fees", icon: (
  <path strokeLinecap="round" strokeLinejoin="round" d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V6m0 12v-2m9-4a9 9 0 11-18 0 9 9 0 0118 0z" />
)},
];

export default function Dashboard() {
  const [activeTab, setActiveTab] = useState("overview");
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [message, setMessage] = useState("Loading your details…");
  const [attendance, setAttendance] = useState([]);
const [attendanceLoading, setAttendanceLoading] = useState(true);
const [markingAttendance, setMarkingAttendance] = useState(false);
const [attendanceMsg, setAttendanceMsg] = useState(null);

const [fees, setFees] = useState(null);
const [feesLoading, setFeesLoading] = useState(true);
const [payingFees, setPayingFees] = useState(false);
  const [courses, setCourses] = useState(() => {
    const saved = localStorage.getItem("demo_courses");
    return saved ? JSON.parse(saved) : [];
  });
  const [courseName, setCourseName] = useState("");
  const [courseCode, setCourseCode] = useState("");
  const [results, setResults] = useState([]);
  const [resultsLoading, setResultsLoading] = useState(true);
  const { email, role,learnerId, logout } = useAuth();

  useEffect(() => {
    apiFetch("/api/dashboard")
      .then((res) => res.json())
      .then((data) => setMessage(data.message))
      .catch(() => setMessage("Couldn't reach the server."));
  }, []);

  useEffect(() => {
    if (activeTab !== "results") return;
    setResultsLoading(true);
    apiFetch("/api/results")
      .then((res) => res.json())
      .then((data) => setResults(data))
      .catch(() => setResults([]))
      .finally(() => setResultsLoading(false));
  }, [activeTab]);

  useEffect(() => {
  if (activeTab !== "attendance") return;
  setAttendanceLoading(true);
  apiFetch("/api/attendance")
    .then((res) => res.json())
    .then(setAttendance)
    .catch(() => setAttendance([]))
    .finally(() => setAttendanceLoading(false));
}, [activeTab]);

useEffect(() => {
  if (activeTab !== "fees") return;
  loadFees();
}, [activeTab]);

function loadFees() {
  setFeesLoading(true);
  apiFetch("/api/fees")
    .then((res) => res.json())
    .then(setFees)
    .catch(() => setFees(null))
    .finally(() => setFeesLoading(false));
}

  function addCourse(e) {
    e.preventDefault();
    if (!courseName.trim() || !courseCode.trim()) return;
    const updated = [...courses, { name: courseName.trim(), code: courseCode.trim() }];
    setCourses(updated);
    localStorage.setItem("demo_courses", JSON.stringify(updated));
    setCourseName("");
    setCourseCode("");
  }

  function removeCourse(index) {
    const updated = courses.filter((_, i) => i !== index);
    setCourses(updated);
    localStorage.setItem("demo_courses", JSON.stringify(updated));
  }

  function selectTab(id) {
    setActiveTab(id);
    setSidebarOpen(false); // auto-close drawer on mobile after picking a tab
  }

  const average = results.length
    ? Math.round(results.reduce((sum, r) => sum + Number(r.score), 0) / results.length)
    : null;

  function gradeStyle(score) {
    if (score >= 80) return "text-black border-black";
    if (score >= 65) return "text-neutral-600 border-neutral-400";
    return "text-neutral-500 border-neutral-300 bg-neutral-100";
  }

  const todayStr = new Date().toISOString().slice(0, 10);
const markedToday = attendance.some((a) => a.date.slice(0, 10) === todayStr);

async function markAttendance() {
  setMarkingAttendance(true);
  setAttendanceMsg(null);
  try {
    const res = await apiFetch("/api/attendance/mark", { method: "POST" });
    const data = await res.json();
    if (!res.ok) {
      setAttendanceMsg({ type: "error", text: data.message });
      return;
    }
    setAttendanceMsg({ type: "success", text: data.message });
    const refreshed = await apiFetch("/api/attendance").then((r) => r.json());
    setAttendance(refreshed);
  } catch (err) {
    setAttendanceMsg({ type: "error", text: "Couldn't reach the server." });
  } finally {
    setMarkingAttendance(false);
  }
}

function payFees() {
  if (!fees || fees.balance <= 0) return;
  setPayingFees(true);

  const reference = `FEE-${Date.now()}-${Math.floor(Math.random() * 100000)}`;

  const handler = window.PaystackPop.setup({
    key: import.meta.env.VITE_PAYSTACK_PUBLIC_KEY,
    email: email,
    amount: Math.round(fees.balance * 100),
    ref: reference,
    currency: "NGN",
    callback: function (response) {
      apiFetch("/api/fees/verify", {
        method: "POST",
        body: JSON.stringify({ reference: response.reference }),
      })
        .then((res) => res.json())
        .then(() => loadFees())
        .finally(() => setPayingFees(false));
    },
    onClose: function () {
      setPayingFees(false);
    },
  });

  handler.openIframe();
}
  const sidebarContent = (
    <>
      <div className="flex items-center justify-between mb-1 px-1">
        <div>
          <div className="text-white font-bold text-lg tracking-tight">Coursework</div>
          <p className="text-white/40 text-xs mt-0.5">Student Portal</p>
        </div>
        <button
          onClick={() => setSidebarOpen(false)}
          className="md:hidden text-white/60 hover:text-white p-1"
          aria-label="Close menu"
        >
          <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
            <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
          </svg>
        </button>
      </div>

      <nav className="flex-1 space-y-1 mt-8">
        {NAV_ITEMS.map((item) => (
          <button
            key={item.id}
            onClick={() => selectTab(item.id)}
            className={`w-full flex items-center gap-3 px-3 py-2.5 text-sm font-medium border transition-colors duration-150
              ${activeTab === item.id
                ? "bg-white text-black border-white"
                : "text-white/60 border-transparent hover:text-white hover:border-white/20"}`}
          >
            <svg className="w-4 h-4 shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.8}>
              {item.icon}
            </svg>
            {item.label}
          </button>
          
        ))}
      </nav>

      <button
        onClick={logout}
        className="flex items-center gap-3 px-3 py-2.5 text-sm font-medium text-white/50 hover:text-white border-t border-white/15 pt-5 mt-4 transition-colors"
      >
        <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.8}>
          <path strokeLinecap="round" strokeLinejoin="round" d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1" />
        </svg>
        Log out
      </button>
    </>
  );

  return (
    <div className="min-h-screen bg-neutral-50 flex">
      {/* Desktop sidebar */}
      <aside className="hidden md:flex md:flex-col w-60 shrink-0 bg-black p-5">
        {sidebarContent}
      </aside>

      {/* Mobile drawer + overlay */}
      {sidebarOpen && (
        <div className="md:hidden fixed inset-0 z-40 bg-black/50 animate-fade-in" onClick={() => setSidebarOpen(false)} />
      )}
      <aside className={`md:hidden fixed top-0 left-0 z-50 h-full w-64 bg-black p-5 flex flex-col
        ${sidebarOpen ? "animate-slide-in" : "hidden"}`}>
        {sidebarContent}
      </aside>

      {/* Main content */}
      <div className="flex-1 min-w-0">
        {/* Mobile topbar with hamburger */}
        <div className="md:hidden flex items-center justify-between border-b border-neutral-200 bg-white px-4 py-3 sticky top-0 z-30">
          <button onClick={() => setSidebarOpen(true)} className="p-1 text-black" aria-label="Open menu">
            <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M4 6h16M4 12h16M4 18h16" />
            </svg>
          </button>
          <span className="font-bold text-black capitalize">{activeTab}</span>
          <div className="w-6" />
        </div>

        <main className="p-6 md:p-10 max-w-5xl">
          <div className="hidden md:flex items-baseline justify-between mb-1">
            <h1 className="text-2xl font-bold text-black capitalize">{activeTab}</h1>
            <p className="text-sm text-neutral-500">
              Signed in as <span className="text-black">{email}</span>
            </p>
          </div>
          <p className="text-neutral-500 text-sm mb-8 md:mb-8 mt-4 md:mt-1">
            {activeTab === "overview" && "A quick look at where things stand."}
            {activeTab === "courses" && "Manage the courses you're enrolled in."}
            {activeTab === "results" && "Your grades for completed coursework."}
            {activeTab === "profile" && "Your account details."}
          </p>

          {/* OVERVIEW */}
          {activeTab === "overview" && (
            <div className="space-y-5 animate-fade-in">
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                {[
                  { label: "Courses enrolled", value: courses.length },
                  { label: "Average grade", value: average ?? "—" },
                  { label: "Account type", value: role },
                ].map((stat) => (
                  <div key={stat.label} className="bg-white border border-neutral-200 p-5">
                    <div className="text-2xl font-bold text-black capitalize">{stat.value}</div>
                    <div className="text-xs text-neutral-500 mt-1">{stat.label}</div>
                  </div>
                ))}
              </div>

              <div className="bg-white border border-neutral-200 p-6">
                <h2 className="text-black font-semibold mb-1">Welcome</h2>
                <p className="text-neutral-500 text-sm">{message}</p>
              </div>
            </div>
          )}

          {/* COURSES */}
          {activeTab === "courses" && (
            <div className="bg-white border border-neutral-200 p-6 animate-fade-in">
              <h2 className="text-black font-semibold mb-1">My Courses</h2>
              <p className="text-neutral-500 text-sm mb-5">Courses you're currently enrolled in.</p>

              <div className="space-y-2 mb-5">
                {courses.length === 0 ? (
                  <div className="text-center py-8 border border-dashed border-neutral-300 text-neutral-400 text-sm">
                    You haven't added any courses yet.
                  </div>
                ) : (
                  courses.map((c, i) => (
                    <div key={i} className="flex items-center justify-between border border-neutral-200 px-4 py-3">
                      <div>
                        <div className="text-black text-sm font-medium">{c.name}</div>
                        <div className="text-neutral-500 text-xs mt-0.5">{c.code}</div>
                      </div>
                      <button
                        onClick={() => removeCourse(i)}
                        className="text-neutral-500 hover:text-black text-xs font-semibold underline"
                      >
                        Remove
                      </button>
                    </div>
                  ))
                )}
              </div>

              <form onSubmit={addCourse} className="flex flex-col sm:flex-row gap-2.5">
                <input
                  value={courseName}
                  onChange={(e) => setCourseName(e.target.value)}
                  placeholder="Course name"
                  className="flex-1 px-3.5 py-2.5 border border-neutral-300 text-black placeholder-neutral-400 text-sm
                             focus:outline-none focus:border-black transition-colors"
                />
                <input
                  value={courseCode}
                  onChange={(e) => setCourseCode(e.target.value)}
                  placeholder="Code"
                  className="sm:w-28 px-3.5 py-2.5 border border-neutral-300 text-black placeholder-neutral-400 text-sm
                             focus:outline-none focus:border-black transition-colors"
                />
                <button
                  type="submit"
                  className="px-5 py-2.5 bg-black hover:bg-neutral-800 text-white text-sm font-semibold transition-colors"
                >
                  Add
                </button>
              </form>
            </div>
          )}

          {/* RESULTS */}
          {activeTab === "results" && (
            <div className="bg-white border border-neutral-200 p-6 animate-fade-in">
              <h2 className="text-black font-semibold mb-1">Results</h2>
              <p className="text-neutral-500 text-sm mb-5">Your grades for completed coursework.</p>

              {resultsLoading ? (
                <div className="text-neutral-400 text-sm py-6 text-center">Loading…</div>
              ) : results.length === 0 ? (
                <div className="text-center py-8 border border-dashed border-neutral-300 text-neutral-400 text-sm">
                  No results yet.
                </div>
              ) : (
                <div className="space-y-2">
                  {results.map((r, i) => (
                    <div key={i} className="flex items-center justify-between border border-neutral-200 px-4 py-3">
                      <div>
                        <div className="text-black text-sm font-medium">{r.course}</div>
                        <div className="text-neutral-500 text-xs mt-0.5">{r.assessment}</div>
                      </div>
                      <span className={`text-xs font-bold px-2.5 py-1 border ${gradeStyle(r.score)}`}>
                        {r.score}
                      </span>
                    </div>
                  ))}
                </div>
              )}
            </div>
          )}

          {/* PROFILE */}
          {activeTab === "profile" && (
            <div className="bg-white border border-neutral-200 p-6 animate-fade-in max-w-md">
              <h2 className="text-black font-semibold mb-5">Profile</h2>
              <dl className="space-y-4 text-sm">
                <div className="flex justify-between border-b border-neutral-200 pb-3">
                  <dt className="text-neutral-500">Email</dt>
                  <dd className="text-black font-medium">{email}</dd>
                </div>
                <div className="flex justify-between">
                  <dt className="text-neutral-500">Account type</dt>
                  <dd>
                    <span className="text-xs font-bold px-2.5 py-1 border border-black text-black capitalize">
                      {role}
                    </span>
                  </dd>
                  <div className="flex justify-between border-b border-neutral-200 pb-3">
  <dt className="text-neutral-500">Learner ID</dt>
  <dd className="text-black font-mono font-medium">{learnerId}</dd>
</div>
                </div>
              </dl>
            </div>

            
          )}
          {/* ATTENDANCE */}
{activeTab === "attendance" && (
  <div className="bg-white border border-neutral-200 p-6 animate-fade-in">
    <h2 className="text-black font-semibold mb-1">Attendance</h2>
    <p className="text-neutral-500 text-sm mb-5">Mark yourself present for today.</p>

    <button
      onClick={markAttendance}
      disabled={markingAttendance || markedToday}
      className="px-5 py-2.5 bg-black hover:bg-neutral-800 disabled:opacity-40 text-white text-sm font-semibold transition-colors mb-2"
    >
      {markedToday ? "Marked present today" : markingAttendance ? "Marking…" : "Mark today's attendance"}
    </button>

    {attendanceMsg && (
      <p className={`text-sm mt-2 ${attendanceMsg.type === "error" ? "text-neutral-600" : "text-black"}`}>
        {attendanceMsg.text}
      </p>
    )}

    <div className="mt-6">
      <h3 className="text-xs font-semibold text-neutral-500 uppercase tracking-wide mb-3">History</h3>
      {attendanceLoading ? (
        <p className="text-neutral-400 text-sm">Loading…</p>
      ) : attendance.length === 0 ? (
        <p className="text-neutral-400 text-sm">No attendance recorded yet.</p>
      ) : (
        <div className="space-y-1.5">
          {attendance.map((a, i) => (
            <div key={i} className="text-sm text-black border-b border-neutral-100 py-2">
              {new Date(a.date).toLocaleDateString(undefined, { weekday: "long", year: "numeric", month: "long", day: "numeric" })}
            </div>
          ))}
        </div>
      )}
    </div>
  </div>
)}

{/* FEES */}
{activeTab === "fees" && (
  <div className="bg-white border border-neutral-200 p-6 animate-fade-in">
    <h2 className="text-black font-semibold mb-1">Fees</h2>
    <p className="text-neutral-500 text-sm mb-5">Your termly balance and payment history.</p>

    {feesLoading ? (
      <p className="text-neutral-400 text-sm">Loading…</p>
    ) : (
      <>
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 sm:gap-4 mb-6">
          <div className="border border-neutral-200 p-4">
            <div className="text-lg font-bold text-black">₦{fees.totalDue.toLocaleString()}</div>
            <div className="text-xs text-neutral-500 mt-1">Total due</div>
          </div>
          <div className="border border-neutral-200 p-4">
            <div className="text-lg font-bold text-black">₦{fees.totalPaid.toLocaleString()}</div>
            <div className="text-xs text-neutral-500 mt-1">Paid so far</div>
          </div>
          <div className="border border-neutral-200 p-4">
            <div className="text-lg font-bold text-black">₦{fees.balance.toLocaleString()}</div>
            <div className="text-xs text-neutral-500 mt-1">Balance</div>
          </div>
        </div>

        {fees.balance > 0 ? (
          <button
            onClick={payFees}
            disabled={payingFees}
            className="px-5 py-2.5 bg-black hover:bg-neutral-800 disabled:opacity-50 text-white text-sm font-semibold transition-colors"
          >
            {payingFees ? "Processing…" : `Pay ₦${fees.balance.toLocaleString()}`}
          </button>
        ) : (
          <p className="text-sm text-black font-medium">Fully paid — thank you.</p>
        )}

        <div className="mt-6">
          <h3 className="text-xs font-semibold text-neutral-500 uppercase tracking-wide mb-3">Payment history</h3>
          {fees.payments.length === 0 ? (
            <p className="text-neutral-400 text-sm">No payments yet.</p>
          ) : (
            <div className="space-y-1.5">
              {fees.payments.map((p, i) => (
                <div key={i} className="flex justify-between text-sm border-b border-neutral-100 py-2">
                  <span className="text-black">₦{Number(p.amount).toLocaleString()}</span>
                  <span className="text-neutral-500">{new Date(p.paid_at).toLocaleDateString()}</span>
                </div>
              ))}
            </div>
          )}
        </div>
      </>
    )}
  </div>
)}
        </main>
      </div>
    </div>
  );
}