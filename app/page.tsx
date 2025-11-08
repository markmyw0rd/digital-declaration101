// app/page.tsx
"use client";

import { useState } from "react";

export default function StartPage() {
  const [unitCode] = useState("AURTTE104");
  const [unitName] = useState("Inspect and Service Engines");

  const [studentName, setStudentName] = useState("");
  const [studentEmail, setStudentEmail] = useState("");
  const [supervisorEmail, setSupervisorEmail] = useState("");
  const [assessorEmail, setAssessorEmail] = useState("");

  const [busy, setBusy] = useState(false);
  const [err, setErr] = useState<string | null>(null);

  async function onStart(e: React.FormEvent) {
    e.preventDefault();
    setErr(null);
    if (!studentName.trim() || !studentEmail.trim() || !supervisorEmail.trim()) {
      setErr("Student name, student email and supervisor email are required.");
      return;
    }
    setBusy(true);
    try {
      const res = await fetch("/api/envelopes", {
        method: "POST",
        headers: { "content-type": "application/json" },
        body: JSON.stringify({
          unitCode,
          unitName,
          studentEmail,
          studentName,
          supervisorEmail,
          assessorEmail,
        }),
      });
      // Ensure we handle non-JSON error bodies
      const text = await res.text();
      const payload = (() => { try { return JSON.parse(text); } catch { return { error: text }; } })();

      if (!res.ok) throw new Error(payload?.error || "Failed to create envelope");
      // Go straight to student sign screen
      window.location.href = payload.next; // /e/:token for Student
    } catch (e: any) {
      setErr(e?.message || "Could not create envelope");
      setBusy(false);
    }
  }

  return (
    <div className="grid place-items-center">
      <div className="w-full max-w-2xl rounded-2xl border bg-white shadow-sm overflow-hidden">
        <div className="p-6 border-b">
          <h2 className="text-xl font-semibold">Start</h2>
          <p className="text-sm text-slate-600 mt-1">
            Enter the student details. On the next screen the student signs. After that, the supervisor is
            automatically invited, then the assessor.
          </p>
        </div>

        <form onSubmit={onStart} className="p-6 space-y-5">
          <div className="grid gap-4 md:grid-cols-2">
            <div>
              <label className="block text-sm font-medium mb-1">Unit Code</label>
              <input className="w-full rounded-lg border px-3 py-2 bg-slate-50" value={unitCode} disabled />
            </div>
            <div>
              <label className="block text-sm font-medium mb-1">Unit Name</label>
              <input className="w-full rounded-lg border px-3 py-2 bg-slate-50" value={unitName} disabled />
            </div>
          </div>

          <div className="grid gap-4 md:grid-cols-2">
            <div>
              <label className="block text-sm font-medium mb-1">Student Name *</label>
              <input
                className="w-full rounded-lg border px-3 py-2 focus:ring-2 focus:ring-black outline-none"
                placeholder="First Last"
                value={studentName}
                onChange={(e) => setStudentName(e.target.value)}
                required
              />
            </div>
            <div>
              <label className="block text-sm font-medium mb-1">Student Email *</label>
              <input
                type="email"
                className="w-full rounded-lg border px-3 py-2 focus:ring-2 focus:ring-black outline-none"
                placeholder="student@example.com"
                value={studentEmail}
                onChange={(e) => setStudentEmail(e.target.value)}
                required
              />
            </div>
          </div>

          <div className="grid gap-4 md:grid-cols-2">
            <div>
              <label className="block text-sm font-medium mb-1">Supervisor Email *</label>
              <input
                type="email"
                className="w-full rounded-lg border px-3 py-2 focus:ring-2 focus:ring-black outline-none"
                placeholder="supervisor@example.com"
                value={supervisorEmail}
                onChange={(e) => setSupervisorEmail(e.target.value)}
                required
              />
            </div>
            <div>
              <label className="block text-sm font-medium mb-1">Assessor Email (optional)</label>
              <input
                type="email"
                className="w-full rounded-lg border px-3 py-2 focus:ring-2 focus:ring-black outline-none"
                placeholder="assessor@example.com"
                value={assessorEmail}
                onChange={(e) => setAssessorEmail(e.target.value)}
              />
            </div>
          </div>

          {err && (
            <div className="rounded-lg border border-red-200 bg-red-50 px-4 py-2 text-sm text-red-800">{err}</div>
          )}

          <div className="flex items-center gap-3">
            <button
              type="submit"
              disabled={busy}
              className="rounded-xl bg-black px-5 py-2.5 text-white font-medium disabled:opacity-60"
            >
              {busy ? "Starting…" : "Start → Student Sign"}
            </button>
            <p className="text-sm text-slate-600">Creates the envelope and moves to the Student declaration.</p>
          </div>
        </form>
      </div>
    </div>
  );
}
