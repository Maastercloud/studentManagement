import { useState, useEffect, useRef } from "react";
import { useParams, useNavigate, Link } from "react-router-dom";
import { apiFetch } from "../api";

export default function ExamTake() {
  const { id } = useParams();
  const navigate = useNavigate();

  const [exam, setExam] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [answers, setAnswers] = useState({}); // { questionId: selectedIndex }
  const [timeLeft, setTimeLeft] = useState(null);
  const [submitting, setSubmitting] = useState(false);
  const [result, setResult] = useState(null);
  const timerRef = useRef(null);

  useEffect(() => {
    apiFetch(`/api/exams/${id}/start`, { method: "POST" })
      .then(async (res) => {
        const data = await res.json();
        if (!res.ok) {
          setError(data.message);
          return;
        }
        setExam(data);
        const deadline = new Date(data.startedAt).getTime() + data.durationMinutes * 60000;
        setTimeLeft(Math.max(0, Math.floor((deadline - Date.now()) / 1000)));
      })
      .catch(() => setError("Couldn't reach the server."))
      .finally(() => setLoading(false));
  }, [id]);

  useEffect(() => {
    if (timeLeft === null || result) return;
    if (timeLeft <= 0) {
      handleSubmit();
      return;
    }
    timerRef.current = setTimeout(() => setTimeLeft((t) => t - 1), 1000);
    return () => clearTimeout(timerRef.current);
  }, [timeLeft, result]);

  function selectAnswer(questionId, index) {
    setAnswers((prev) => ({ ...prev, [questionId]: index }));
  }

  async function handleSubmit() {
    if (submitting || result) return;
    setSubmitting(true);
    clearTimeout(timerRef.current);

    const payload = {
      answers: Object.entries(answers).map(([questionId, selectedIndex]) => ({
        questionId: Number(questionId),
        selectedIndex,
      })),
    };

    try {
      const res = await apiFetch(`/api/exams/${id}/submit`, {
        method: "POST",
        body: JSON.stringify(payload),
      });
      const data = await res.json();
      if (!res.ok) {
        setError(data.message);
        return;
      }
      setResult(data);
    } catch (err) {
      setError("Couldn't reach the server.");
    } finally {
      setSubmitting(false);
    }
  }

  function formatTime(s) {
    const m = Math.floor(s / 60).toString().padStart(2, "0");
    const sec = (s % 60).toString().padStart(2, "0");
    return `${m}:${sec}`;
  }

  if (loading) {
    return <div className="min-h-screen flex items-center justify-center bg-neutral-50 text-neutral-500">Loading exam…</div>;
  }

  if (error) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-neutral-50 p-6">
        <div className="bg-white border border-neutral-200 p-8 max-w-sm text-center">
          <p className="text-black font-semibold mb-2">Can't open this exam</p>
          <p className="text-neutral-500 text-sm mb-5">{error}</p>
          <Link to="/dashboard" className="text-sm font-semibold underline text-black">Back to dashboard</Link>
        </div>
      </div>
    );
  }

  if (result) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-neutral-50 p-6">
        <div className="bg-white border border-neutral-200 p-8 max-w-sm text-center">
          <p className="text-neutral-500 text-sm mb-1">{exam.title}</p>
          <div className="text-4xl font-bold text-black mb-2">{result.score}%</div>
          <p className="text-neutral-500 text-sm mb-6">
            {result.correctCount} of {result.total} correct
          </p>
          <Link
            to="/dashboard"
            className="inline-block w-full bg-black hover:bg-neutral-800 text-white text-sm font-semibold py-3 transition-colors"
          >
            Back to dashboard
          </Link>
        </div>
      </div>
    );
  }

  const answeredCount = Object.keys(answers).length;

  return (
    <div className="min-h-screen bg-neutral-50">
      <div className="sticky top-0 z-10 bg-black text-white px-6 py-4 flex items-center justify-between">
        <div>
          <p className="font-semibold text-sm">{exam.title}</p>
          <p className="text-white/50 text-xs">{exam.course}</p>
        </div>
        <div className="text-right">
          <div className={`font-mono text-lg font-bold ${timeLeft < 60 ? "text-red-400" : "text-white"}`}>
            {formatTime(timeLeft)}
          </div>
          <p className="text-white/40 text-xs">{answeredCount}/{exam.questions.length} answered</p>
        </div>
      </div>

      <div className="max-w-2xl mx-auto p-6 space-y-5 pb-32">
        {exam.questions.map((q, i) => (
          <div key={q.id} className="bg-white border border-neutral-200 p-5">
            <p className="text-black font-medium mb-4">
              <span className="text-neutral-400 mr-2">{i + 1}.</span>
              {q.question_text}
            </p>
            <div className="space-y-2">
              {q.options.map((opt, idx) => (
                <label
                  key={idx}
                  className={`flex items-center gap-3 border px-4 py-2.5 text-sm cursor-pointer transition-colors
                    ${answers[q.id] === idx ? "border-black bg-neutral-50" : "border-neutral-200 hover:border-neutral-400"}`}
                >
                  <input
                    type="radio"
                    name={`q-${q.id}`}
                    checked={answers[q.id] === idx}
                    onChange={() => selectAnswer(q.id, idx)}
                    className="accent-black"
                  />
                  <span className="text-black">{opt}</span>
                </label>
              ))}
            </div>
          </div>
        ))}
      </div>

      <div className="fixed bottom-0 left-0 right-0 bg-white border-t border-neutral-200 p-4">
        <div className="max-w-2xl mx-auto flex items-center justify-between">
          <p className="text-xs text-neutral-500">
            {answeredCount < exam.questions.length
              ? `${exam.questions.length - answeredCount} question(s) left unanswered`
              : "All questions answered"}
          </p>
          <button
            onClick={handleSubmit}
            disabled={submitting}
            className="bg-black hover:bg-neutral-800 disabled:opacity-50 text-white text-sm font-semibold px-6 py-2.5 transition-colors"
          >
            {submitting ? "Submitting…" : "Submit exam"}
          </button>
        </div>
      </div>
    </div>
  );
}