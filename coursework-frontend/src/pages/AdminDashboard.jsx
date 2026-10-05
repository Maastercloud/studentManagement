import { useState, useEffect, useRef } from "react";
import { apiFetch } from "../api";
import { useAuth } from "../context/AuthContext";

const NAV_ITEMS = [
  { id: "overview", label: "Overview", icon: (
    <path strokeLinecap="round" strokeLinejoin="round" d="M3 3h7v9H3V3zm11 0h7v5h-7V3zm0 9h7v9h-7v-9zM3 16h7v5H3v-5z" />
  )},
  { id: "upload", label: "Upload Results", icon: (
    <path strokeLinecap="round" strokeLinejoin="round" d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1M7 10l5-5m0 0l5 5m-5-5v12" />
  )},
  { id: "students", label: "Manage Students", icon: (
    <path strokeLinecap="round" strokeLinejoin="round" d="M17 20h5v-2a4 4 0 00-3-3.87M9 20H4v-2a4 4 0 013-3.87m6-1.13a4 4 0 10-4-4 4 4 0 004 4zm6-3a4 4 0 10-4-4" />
  )},
  { id: "broadsheet", label: "Results Broadsheet", icon: (
    <path strokeLinecap="round" strokeLinejoin="round" d="M9 17V7m6 10V7M5 21h14a2 2 0 002-2V5a2 2 0 00-2-2H5a2 2 0 00-2 2v14a2 2 0 002 2z" />
  )},
  { id: "exams", label: "Create Exam", icon: (
    <path strokeLinecap="round" strokeLinejoin="round" d="M12 4v16m8-8H4" />
  )},
];

export default function AdminDashboard() {
  const [activeTab, setActiveTab] = useState("overview");
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const { email, logout } = useAuth();

  // Overview
  const [stats, setStats] = useState(null);

  // Upload
  const fileInputRef = useRef(null);
  const [uploading, setUploading] = useState(false);
  const [uploadStatus, setUploadStatus] = useState(null);
  const [uploadErrors, setUploadErrors] = useState([]);

  // Students
  const [students, setStudents] = useState([]);
  const [studentsLoaded, setStudentsLoaded] = useState(false);
  const [search, setSearch] = useState("");
  const [promotingEmail, setPromotingEmail] = useState(null);

  // Broadsheet
  const [courses, setCourses] = useState([]);
  const [coursesLoaded, setCoursesLoaded] = useState(false);
  const [selectedCourse, setSelectedCourse] = useState("");
  const [broadsheetRows, setBroadsheetRows] = useState([]);
  const [broadsheetLoading, setBroadsheetLoading] = useState(false);

  // Exam
  const [examCourse, setExamCourse] = useState("");
  const [examTitle, setExamTitle] = useState("");
  const [examDuration, setExamDuration] = useState(30);
  const [examQuestions, setExamQuestions] = useState([
    { questionText: "", options: ["", "", "", ""], correctIndex: 0 },
  ]);
  const [creatingExam, setCreatingExam] = useState(false);
  const [examStatus, setExamStatus] = useState(null);
  const [existingExams, setExistingExams] = useState([]);
  const [existingExamsLoaded, setExistingExamsLoaded] = useState(false);

  useEffect(() => {
    apiFetch("/api/admin/stats")
      .then((res) => res.json())
      .then(setStats)
      .catch(() => setStats(null));
  }, []);

  useEffect(() => {
    if (activeTab === "students" && !studentsLoaded) loadStudents();
    if (activeTab === "broadsheet" && !coursesLoaded) loadCourses();
    if (activeTab === "exams" && !existingExamsLoaded) loadExams();
  }, [activeTab]);

  async function loadExams() {
    try {
      const res = await apiFetch("/api/admin/exams");
      setExistingExams(await res.json());
      setExistingExamsLoaded(true);
    } catch (err) {}
  }

  function addQuestion() {
    setExamQuestions([...examQuestions, { questionText: "", options: ["", "", "", ""], correctIndex: 0 }]);
  }

  function removeQuestion(index) {
    setExamQuestions(examQuestions.filter((_, i) => i !== index));
  }

  function updateQuestionText(index, text) {
    const updated = [...examQuestions];
    updated[index].questionText = text;
    setExamQuestions(updated);
  }

  function updateOption(qIndex, oIndex, text) {
    const updated = [...examQuestions];
    updated[qIndex].options[oIndex] = text;
    setExamQuestions(updated);
  }

  function setCorrect(qIndex, oIndex) {
    const updated = [...examQuestions];
    updated[qIndex].correctIndex = oIndex;
    setExamQuestions(updated);
  }

  async function submitExam(e) {
    e.preventDefault();
    setCreatingExam(true);
    setExamStatus(null);

    try {
      const res = await apiFetch("/api/admin/exams", {
        method: "POST",
        body: JSON.stringify({
          course: examCourse,
          title: examTitle,
          durationMinutes: Number(examDuration),
          questions: examQuestions,
        }),
      });
      const data = await res.json();

      if (!res.ok) {
        setExamStatus({ type: "error", text: data.message });
        return;
      }

      setExamStatus({ type: "success", text: "Exam created." });
      setExamCourse("");
      setExamTitle("");
      setExamDuration(30);
      setExamQuestions([{ questionText: "", options: ["", "", "", ""], correctIndex: 0 }]);
      setExistingExamsLoaded(false);
      loadExams();
    } catch (err) {
      setExamStatus({ type: "error", text: "Couldn't reach the server." });
    } finally {
      setCreatingExam(false);
    }
  }

  async function loadStudents() {
    try {
      const res = await apiFetch("/api/admin/students");
      const data = await res.json();
      setStudents(data);
      setStudentsLoaded(true);
    } catch (err) {}
  }

  async function loadCourses() {
    try {
      const res = await apiFetch("/api/admin/courses");
      const data = await res.json();
      setCourses(data);
      setCoursesLoaded(true);
    } catch (err) {}
  }

  async function handleUpload(e) {
    e.preventDefault();
    const file = fileInputRef.current?.files[0];
    if (!file) return;

    setUploading(true);
    setUploadStatus(null);
    setUploadErrors([]);

    const formData = new FormData();
    formData.append("sheet", file);

    try {
      const res = await apiFetch("/api/admin/upload-results", {
        method: "POST",
        body: formData,
      });
      const data = await res.json();

      if (!res.ok) {
        setUploadStatus({ type: "error", text: data.message || "Upload failed." });
        return;
      }

      setUploadStatus({ type: "success", text: `${data.inserted} result(s) imported. ${data.skipped} skipped.` });
      setUploadErrors(data.errors || []);
      e.target.reset();

      apiFetch("/api/admin/stats").then((r) => r.json()).then(setStats).catch(() => {});
      setCoursesLoaded(false);
    } catch (err) {
      setUploadStatus({ type: "error", text: "Couldn't reach the server." });
    } finally {
      setUploading(false);
    }
  }

  async function togglePromote(user) {
    setPromotingEmail(user.email);
    const newRole = user.role === "admin" ? "student" : "admin";
    try {
      const res = await apiFetch("/api/admin/promote", {
        method: "POST",
        body: JSON.stringify({ email: user.email, role: newRole }),
      });
      if (res.ok) await loadStudents();
    } finally {
      setPromotingEmail(null);
    }
  }

  async function handleCourseChange(course) {
    setSelectedCourse(course);
    if (!course) {
      setBroadsheetRows([]);
      return;
    }
    setBroadsheetLoading(true);
    try {
      const res = await apiFetch(`/api/admin/results?course=${encodeURIComponent(course)}`);
      const data = await res.json();
      setBroadsheetRows(data);
    } catch (err) {
      setBroadsheetRows([]);
    } finally {
      setBroadsheetLoading(false);
    }
  }

  function selectTab(id) {
    setActiveTab(id);
    setSidebarOpen(false);
  }

  const filteredStudents = students.filter((s) =>
    s.email.toLowerCase().includes(search.toLowerCase())
  );

  const titles = {
    overview: "A snapshot of the whole portal.",
    upload: "Import grades in bulk from a spreadsheet.",
    students: "Every account on the portal, newest first.",
    broadsheet: "Pick a course to see every student's score for it.",
    exams: "Build a timed, multiple-choice exam for a course.",
  };

  const sidebarContent = (
    <>
      <div className="flex items-center justify-between mb-1 px-1">
        <div>
          <div className="flex items-center gap-2">
            <span className="text-white font-bold text-lg tracking-tight">Coursework</span>
            <span className="text-[10px] font-bold uppercase tracking-wide bg-white text-black px-1.5 py-0.5">Admin</span>
          </div>
          <p className="text-white/40 text-xs mt-0.5">Admin Console</p>
        </div>
        <button onClick={() => setSidebarOpen(false)} className="md:hidden text-white/60 hover:text-white p-1" aria-label="Close menu">
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
            className={`w-full flex items-center gap-3 px-3 py-2.5 text-sm font-medium border transition-colors duration-150 text-left
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
      <aside className="hidden md:flex md:flex-col w-64 shrink-0 bg-black p-5">
        {sidebarContent}
      </aside>

      {sidebarOpen && (
        <div className="md:hidden fixed inset-0 z-40 bg-black/50 animate-fade-in" onClick={() => setSidebarOpen(false)} />
      )}
      <aside className={`md:hidden fixed top-0 left-0 z-50 h-full w-64 bg-black p-5 flex flex-col ${sidebarOpen ? "animate-slide-in" : "hidden"}`}>
        {sidebarContent}
      </aside>

      <div className="flex-1 min-w-0">
        <div className="md:hidden flex items-center justify-between border-b border-neutral-200 bg-white px-4 py-3 sticky top-0 z-30">
          <button onClick={() => setSidebarOpen(true)} className="p-1 text-black" aria-label="Open menu">
            <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M4 6h16M4 12h16M4 18h16" />
            </svg>
          </button>
          <span className="font-bold text-black text-sm">{NAV_ITEMS.find((n) => n.id === activeTab)?.label}</span>
          <div className="w-6" />
        </div>

        <main className="p-6 md:p-10 max-w-5xl">
          <div className="hidden md:flex items-baseline justify-between mb-1">
            <h1 className="text-2xl font-bold text-black">{NAV_ITEMS.find((n) => n.id === activeTab)?.label}</h1>
            <p className="text-sm text-neutral-500">Signed in as <span className="text-black">{email}</span></p>
          </div>
          <p className="text-neutral-500 text-sm mb-8 mt-4 md:mt-1">{titles[activeTab]}</p>

          {/* OVERVIEW */}
          {activeTab === "overview" && (
            <div className="space-y-5 animate-fade-in">
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                {[
                  { label: "Total students", value: stats?.totalStudents ?? "—" },
                  { label: "Results recorded", value: stats?.totalResults ?? "—" },
                  { label: "Portal-wide average", value: stats?.avgScore ?? "—" },
                ].map((stat) => (
                  <div key={stat.label} className="bg-white border border-neutral-200 p-5">
                    <div className="text-2xl font-bold text-black">{stat.value}</div>
                    <div className="text-xs text-neutral-500 mt-1">{stat.label}</div>
                  </div>
                ))}
              </div>
              <div className="bg-white border border-neutral-200 p-6">
                <h2 className="text-black font-semibold mb-1">Welcome</h2>
                <p className="text-neutral-500 text-sm">Welcome, {email}. You're signed in with admin access.</p>
              </div>
            </div>
          )}

          {/* UPLOAD */}
          {activeTab === "upload" && (
            <div className="bg-white border border-neutral-200 p-6 animate-fade-in">
              <h2 className="text-black font-semibold mb-1">Upload Results</h2>
              <p className="text-neutral-500 text-sm mb-5">Import grades in bulk from a spreadsheet.</p>

              <form onSubmit={handleUpload}>
                <div className="border border-dashed border-neutral-300 p-8 text-center">
                  <input ref={fileInputRef} type="file" accept=".xlsx,.csv" required className="mb-3 text-sm" />
                  <p className="text-xs text-neutral-400 mb-4">Accepts .xlsx or .csv</p>
                  <button
                    type="submit"
                    disabled={uploading}
                    className="px-5 py-2.5 bg-black hover:bg-neutral-800 disabled:opacity-50 text-white text-sm font-semibold transition-colors"
                  >
                    {uploading ? "Uploading…" : "Upload sheet"}
                  </button>
                </div>
              </form>

              <div className="bg-neutral-100 border border-neutral-200 p-4 text-xs text-neutral-600 mt-4">
                Your file needs columns named exactly: <code className="bg-neutral-200 px-1">email</code>, <code className="bg-neutral-200 px-1">course</code>, <code className="bg-neutral-200 px-1">assessment</code>, <code className="bg-neutral-200 px-1">score</code>.
              </div>

              {uploadStatus && (
                <p className={`text-sm mt-4 font-medium ${uploadStatus.type === "success" ? "text-black" : "text-neutral-600"}`}>
                  {uploadStatus.text}
                </p>
              )}

              {uploadErrors.length > 0 && (
                <div className="mt-3 border border-neutral-300 bg-neutral-50 p-3 text-xs text-neutral-600 max-h-40 overflow-y-auto space-y-1">
                  {uploadErrors.map((e, i) => (
                    <div key={i}>{e.reason}: {JSON.stringify(e.row)}</div>
                  ))}
                </div>
              )}
            </div>
          )}

          {/* STUDENTS */}
          {activeTab === "students" && (
            <div className="bg-white border border-neutral-200 p-6 animate-fade-in">
              <h2 className="text-black font-semibold mb-1">Manage Students</h2>
              <p className="text-neutral-500 text-sm mb-5">Every account on the portal, newest first.</p>

              <input
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                placeholder="Search by email..."
                className="w-full px-3.5 py-2.5 border border-neutral-300 text-black placeholder-neutral-400 text-sm mb-4
                           focus:outline-none focus:border-black transition-colors"
              />

              <div className="overflow-x-auto">
                <table className="w-full text-sm">
                  <thead>
                    <tr className="text-left text-xs text-neutral-500 border-b border-neutral-200">
                      <th className="pb-2 font-semibold">Learner ID</th>
                      <th className="pb-2 font-semibold">Email</th>
                      <th className="pb-2 font-semibold">Role</th>
                      <th className="pb-2 font-semibold">Joined</th>
                      <th className="pb-2"></th>
                    </tr>
                  </thead>
                  <tbody>
                    {filteredStudents.length === 0 ? (
                      <tr><td colSpan={5} className="py-6 text-center text-neutral-400">No accounts found.</td></tr>
                    ) : (
                      filteredStudents.map((u) => (
                        <tr key={u.email} className="border-b border-neutral-100">
                          <td className="py-3 text-black font-mono text-xs">{u.learner_id || "—"}</td>
                          <td className="py-3 text-black">{u.email}</td>
                          <td className="py-3">
                            <span className={`text-xs font-bold px-2 py-0.5 border capitalize ${u.role === "admin" ? "border-black text-black" : "border-neutral-300 text-neutral-500"}`}>
                              {u.role}
                            </span>
                          </td>
                          <td className="py-3 text-neutral-500">{new Date(u.created_at).toLocaleDateString()}</td>
                          <td className="py-3 text-right">
                            <button
                              onClick={() => togglePromote(u)}
                              disabled={promotingEmail === u.email}
                              className="text-xs font-semibold border border-neutral-300 hover:border-black px-2.5 py-1 disabled:opacity-50 transition-colors"
                            >
                              {promotingEmail === u.email ? "…" : u.role === "admin" ? "Demote to student" : "Promote to admin"}
                            </button>
                          </td>
                        </tr>
                      ))
                    )}
                  </tbody>
                </table>
              </div>
            </div>
          )}

          {/* BROADSHEET */}
          {activeTab === "broadsheet" && (
            <div className="bg-white border border-neutral-200 p-6 animate-fade-in">
              <h2 className="text-black font-semibold mb-1">Results Broadsheet</h2>
              <p className="text-neutral-500 text-sm mb-5">Pick a course to see every student's score for it.</p>

              <select
                value={selectedCourse}
                onChange={(e) => handleCourseChange(e.target.value)}
                className="w-full px-3.5 py-2.5 border border-neutral-300 text-black text-sm mb-4 bg-white focus:outline-none focus:border-black"
              >
                <option value="">Select a course…</option>
                {courses.map((c) => (
                  <option key={c} value={c}>{c}</option>
                ))}
              </select>

              <div className="overflow-x-auto">
                <table className="w-full text-sm">
                  <thead>
                    <tr className="text-left text-xs text-neutral-500 border-b border-neutral-200">
                      <th className="pb-2 font-semibold">Student</th>
                      <th className="pb-2 font-semibold">Assessment</th>
                      <th className="pb-2 font-semibold">Score</th>
                    </tr>
                  </thead>
                  <tbody>
                    {!selectedCourse ? (
                      <tr><td colSpan={3} className="py-6 text-center text-neutral-400">Choose a course above to load results.</td></tr>
                    ) : broadsheetLoading ? (
                      <tr><td colSpan={3} className="py-6 text-center text-neutral-400">Loading…</td></tr>
                    ) : broadsheetRows.length === 0 ? (
                      <tr><td colSpan={3} className="py-6 text-center text-neutral-400">No results recorded for this course yet.</td></tr>
                    ) : (
                      broadsheetRows.map((r, i) => (
                        <tr key={i} className="border-b border-neutral-100">
                          <td className="py-3 text-black">{r.email}</td>
                          <td className="py-3 text-neutral-600">{r.assessment}</td>
                          <td className="py-3 text-black font-medium">{r.score}</td>
                        </tr>
                      ))
                    )}
                  </tbody>
                </table>
              </div>
            </div>
          )}

          {/* EXAMS */}
          {activeTab === "exams" && (
            <div className="space-y-5 animate-fade-in">
              <div className="bg-white border border-neutral-200 p-6">
                <h2 className="text-black font-semibold mb-1">Create Exam</h2>
                <p className="text-neutral-500 text-sm mb-5">Build a timed, multiple-choice exam for a course.</p>

                <form onSubmit={submitExam} className="space-y-4">
                  <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                    <input
                      value={examCourse}
                      onChange={(e) => setExamCourse(e.target.value)}
                      placeholder="Course (e.g. CS201)"
                      required
                      className="px-3.5 py-2.5 border border-neutral-300 text-black placeholder-neutral-400 text-sm focus:outline-none focus:border-black"
                    />
                    <input
                      value={examTitle}
                      onChange={(e) => setExamTitle(e.target.value)}
                      placeholder="Exam title"
                      required
                      className="px-3.5 py-2.5 border border-neutral-300 text-black placeholder-neutral-400 text-sm focus:outline-none focus:border-black"
                    />
                    <input
                      type="number"
                      value={examDuration}
                      onChange={(e) => setExamDuration(e.target.value)}
                      placeholder="Duration (minutes)"
                      min={1}
                      required
                      className="px-3.5 py-2.5 border border-neutral-300 text-black placeholder-neutral-400 text-sm focus:outline-none focus:border-black"
                    />
                  </div>

                  <div className="space-y-4">
                    {examQuestions.map((q, qIndex) => (
                      <div key={qIndex} className="border border-neutral-200 p-4">
                        <div className="flex items-center justify-between mb-3">
                          <p className="text-xs font-semibold text-neutral-500 uppercase">Question {qIndex + 1}</p>
                          {examQuestions.length > 1 && (
                            <button
                              type="button"
                              onClick={() => removeQuestion(qIndex)}
                              className="text-xs text-neutral-500 hover:text-black underline"
                            >
                              Remove
                            </button>
                          )}
                        </div>

                        <input
                          value={q.questionText}
                          onChange={(e) => updateQuestionText(qIndex, e.target.value)}
                          placeholder="Question text"
                          required
                          className="w-full px-3.5 py-2.5 border border-neutral-300 text-black placeholder-neutral-400 text-sm mb-3 focus:outline-none focus:border-black"
                        />

                        <div className="space-y-2">
                          {q.options.map((opt, oIndex) => (
                            <div key={oIndex} className="flex items-center gap-2">
                              <input
                                type="radio"
                                name={`correct-${qIndex}`}
                                checked={q.correctIndex === oIndex}
                                onChange={() => setCorrect(qIndex, oIndex)}
                                className="accent-black shrink-0"
                              />
                              <input
                                value={opt}
                                onChange={(e) => updateOption(qIndex, oIndex, e.target.value)}
                                placeholder={`Option ${oIndex + 1}`}
                                required
                                className="flex-1 px-3 py-2 border border-neutral-300 text-black placeholder-neutral-400 text-sm focus:outline-none focus:border-black"
                              />
                            </div>
                          ))}
                        </div>
                        <p className="text-xs text-neutral-400 mt-2">Select the radio button next to the correct answer.</p>
                      </div>
                    ))}
                  </div>

                  <button
                    type="button"
                    onClick={addQuestion}
                    className="text-sm font-semibold border border-neutral-300 hover:border-black px-4 py-2 transition-colors"
                  >
                    + Add question
                  </button>

                  <div className="flex items-center gap-3 pt-2">
                    <button
                      type="submit"
                      disabled={creatingExam}
                      className="bg-black hover:bg-neutral-800 disabled:opacity-50 text-white text-sm font-semibold px-6 py-2.5 transition-colors"
                    >
                      {creatingExam ? "Creating…" : "Create exam"}
                    </button>
                    {examStatus && (
                      <p className={`text-sm ${examStatus.type === "error" ? "text-neutral-600" : "text-black font-medium"}`}>
                        {examStatus.text}
                      </p>
                    )}
                  </div>
                </form>
              </div>

              <div className="bg-white border border-neutral-200 p-6">
                <h2 className="text-black font-semibold mb-4">Existing Exams</h2>
                {existingExams.length === 0 ? (
                  <p className="text-neutral-400 text-sm">No exams created yet.</p>
                ) : (
                  <div className="space-y-2">
                    {existingExams.map((ex) => (
                      <div key={ex.id} className="flex items-center justify-between border border-neutral-200 px-4 py-3 text-sm">
                        <div>
                          <span className="text-black font-medium">{ex.title}</span>
                          <span className="text-neutral-500 ml-2">{ex.course} · {ex.duration_minutes} min</span>
                        </div>
                        <span className="text-neutral-500 text-xs">
                          {ex.question_count} question(s) · {ex.attempt_count} attempt(s)
                        </span>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            </div>
          )}
        </main>
      </div>
    </div>
  );
}