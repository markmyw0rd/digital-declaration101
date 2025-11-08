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

  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  async function onStart(e: React.FormEvent) {
    e.preventDefault();
    setError(null);

    if (!studentName.trim() || !studentEmail.trim() || !supervisorEmail.trim()) {
      setError("Student name, Student email, and Supervisor email are required.");
      return;
    }

    setLoading(true);
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
      if (!res.ok) throw new Error(await res.text());
      const j = await res.json();
      // 👇 go straight to the Student signing screen
      window.location.href = j.next; // /e/:token (role=student)
    } catch (err: any) {
      setError(err?.message || "Could not create envelope");
      setLoading(false);
    }
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 to-slate-100">
      {/* Header */}
      <header className="border-b bg-white">
        <div className="mx-auto max-w-5xl px-6 py-5">
          <h1 className="text-2xl font-bold">AURTTE104 Digital Declaration</h1>
          <p className="text-sm text-slate-600">Student → Supervisor → Assessor</p>
        </div>
      </header>

      {/* Content */}
      <main className="mx-auto max-w-5xl px-6 py-10">
        <div className="rounded-2xl border bg-white shadow-sm">
          <div className="border-b p-5">
            <h2 className="text-base font-semibold">Start</h2>
            <p className="text-sm text-slate-600">
              Enter the student’s details. On the next screen the student will sign their declaration.
              After the student signs, the supervisor is automatically notified. Then the assessor.
            </p>
          </div>

          <form onSubmit={onStart} className="p-6 grid gap-5">
            {/* Unit (locked) */}
            <div className="grid gap-3 md:grid-cols-2">
              <div>
                <label className="block text-sm font-medium mb-1">Unit Code</label>
                <input
                  className="w-full rounded-lg border px-3 py-2 bg-slate-50"
                  value={unitCode}
                  disabled
                />
              </div>
              <div>
                <label className="block text-sm font-medium mb-1">Unit Name</label>
                <input
                  className="w-full rounded-lg border px-3 py-2 bg-slate-50"
                  value={unitName}
                  disabled
                />
              </div>
            </div>

            {/* Student */}
            <div className="grid gap-3 md:grid-cols-2">
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

            {/* Supervisor & Assessor */}
            <div className="grid gap-3 md:grid-cols-2">
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

            {error && (
              <div className="rounded-lg border border-red-200 bg-red-50 px-4 py-2 text-sm text-red-800">
                {error}
              </div>
            )}

            <div className="flex items-center gap-3">
              <button
                type="submit"
                disabled={loading}
                className="rounded-xl bg-black px-5 py-2.5 text-white font-medium disabled:opacity-60"
              >
                {loading ? "Starting…" : "Start → Student Sign"}
              </button>

              <p className="text-sm text-slate-600">
                This will create the envelope and move to the Student declaration screen.
              </p>
            </div>
          </form>
        </div>

        <p className="mt-8 text-xs text-slate-500">
          © Allora College — Workplace Training and Assessment | AURTTE104 Declaration
        </p>
      </main>
    </div>
  );
}
