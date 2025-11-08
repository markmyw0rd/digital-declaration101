// app/page.tsx
"use client";

import { useState } from "react";

type State = "idle" | "submitting" | "created" | "error";

export default function CreateEnvelopePage() {
  const [unitCode, setUnitCode] = useState("AURTTE104");
  const [unitName, setUnitName] = useState("");
  const [studentEmail, setStudentEmail] = useState("");
  const [studentName, setStudentName] = useState("");
  const [supervisorEmail, setSupervisorEmail] = useState("");
  const [assessorEmail, setAssessorEmail] = useState("");
  const [state, setState] = useState<State>("idle");
  const [nextUrl, setNextUrl] = useState("");

  async function onSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!unitCode || !studentEmail) {
      alert("Unit Code and Student Email are required.");
      return;
    }
    setState("submitting");
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
      setNextUrl(j.next);
      setState("created");
    } catch (err) {
      console.error(err);
      setState("error");
    }
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 to-slate-100">
      {/* Header */}
      <header className="border-b bg-white/70 backdrop-blur sticky top-0 z-10">
        <div className="mx-auto max-w-6xl px-6 py-4 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="h-9 w-9 rounded-2xl bg-black text-white grid place-items-center font-bold">AC</div>
            <div>
              <h1 className="text-lg font-semibold">AURTTE104 Digital Declaration</h1>
              <p className="text-sm text-slate-600">Create Envelope • Student → Supervisor → Assessor</p>
            </div>
          </div>
        </div>
      </header>

      {/* Content */}
      <main className="mx-auto max-w-6xl px-6 py-10">
        {/* Stepper */}
        <ol className="mb-8 grid grid-cols-3 gap-3 text-sm">
          <li className={`rounded-xl border p-3 ${state === "idle" || state === "submitting" ? "border-black" : "border-slate-200"} bg-white`}>
            <div className="font-medium">1) Create Envelope</div>
            <div className="text-slate-600">Enter emails and unit details</div>
          </li>
          <li className={`rounded-xl border p-3 ${state === "created" ? "border-black" : "border-slate-200"} bg-white`}>
            <div className="font-medium">2) Student signs</div>
            <div className="text-slate-600">System emails or open link</div>
          </li>
          <li className="rounded-xl border p-3 border-slate-200 bg-white">
            <div className="font-medium">3) Supervisor → Assessor</div>
            <div className="text-slate-600">Locks each section in order</div>
          </li>
        </ol>

        {/* Card */}
        <div className="rounded-2xl border bg-white shadow-sm">
          <div className="border-b p-5">
            <h2 className="text-base font-semibold">Create Envelope (AURTTE104)</h2>
            <p className="text-sm text-slate-600">
              Provide contact details below. The system will generate a unique link for the Student and optionally email it.
            </p>
          </div>

          <form onSubmit={onSubmit} className="p-6 space-y-6">
            <div className="grid gap-4 md:grid-cols-6">
              <div className="md:col-span-2">
                <label className="block text-sm font-medium mb-1">Unit Code *</label>
                <input
                  className="w-full rounded-lg border px-3 py-2 outline-none focus:ring-2 focus:ring-black"
                  value={unitCode}
                  onChange={(e) => setUnitCode(e.target.value)}
                  placeholder="AURTTE104"
                  required
                />
              </div>
              <div className="md:col-span-4">
                <label className="block text-sm font-medium mb-1">Unit Name (optional)</label>
                <input
                  className="w-full rounded-lg border px-3 py-2 outline-none focus:ring-2 focus:ring-black"
                  value={unitName}
                  onChange={(e) => setUnitName(e.target.value)}
                  placeholder="Inspect and Service Engines"
                />
              </div>

              <div className="md:col-span-3">
                <label className="block text-sm font-medium mb-1">Student Email *</label>
                <input
                  type="email"
                  className="w-full rounded-lg border px-3 py-2 outline-none focus:ring-2 focus:ring-black"
                  value={studentEmail}
                  onChange={(e) => setStudentEmail(e.target.value)}
                  placeholder="student@example.com"
                  required
                />
              </div>
              <div className="md:col-span-3">
                <label className="block text-sm font-medium mb-1">Student Name</label>
                <input
                  className="w-full rounded-lg border px-3 py-2 outline-none focus:ring-2 focus:ring-black"
                  value={studentName}
                  onChange={(e) => setStudentName(e.target.value)}
                  placeholder="First Last"
                />
              </div>

              <div className="md:col-span-3">
                <label className="block text-sm font-medium mb-1">Supervisor Email</label>
                <input
                  type="email"
                  className="w-full rounded-lg border px-3 py-2 outline-none focus:ring-2 focus:ring-black"
                  value={supervisorEmail}
                  onChange={(e) => setSupervisorEmail(e.target.value)}
                  placeholder="supervisor@example.com"
                />
              </div>
              <div className="md:col-span-3">
                <label className="block text-sm font-medium mb-1">Assessor Email</label>
                <input
                  type="email"
                  className="w-full rounded-lg border px-3 py-2 outline-none focus:ring-2 focus:ring-black"
                  value={assessorEmail}
                  onChange={(e) => setAssessorEmail(e.target.value)}
                  placeholder="assessor@example.com"
                />
              </div>
            </div>

            <div className="flex items-center gap-3 pt-2">
              <button
                type="submit"
                disabled={state === "submitting"}
                className="rounded-xl bg-black px-5 py-2.5 text-white font-medium shadow-sm disabled:opacity-60"
              >
                {state === "submitting" ? "Creating…" : "Create & Email Student"}
              </button>

              <span className="text-sm text-slate-600">
                Or launch with querystring:&nbsp;
                <code className="rounded bg-slate-100 px-1 py-0.5">
                  /start?u=AURTTE104&student=…&name=…&sup=…&assess=…
                </code>
              </span>
            </div>
          </form>
        </div>

        {/* Success banner */}
        {state === "created" && (
          <div className="mt-6 rounded-xl border bg-green-50 p-4">
            <div className="font-medium text-green-900">Envelope created</div>
            <div className="mt-1 text-green-800">
              Student link:&nbsp;
              <a href={nextUrl} className="underline break-all" target="_blank" rel="noreferrer">
                {nextUrl}
              </a>
            </div>
            <div className="mt-3">
              <a
                href={nextUrl}
                className="inline-block rounded-xl bg-black px-4 py-2 text-white"
                target="_blank"
                rel="noreferrer"
              >
                Open Student View
              </a>
            </div>
          </div>
        )}

        {state === "error" && (
          <div className="mt-6 rounded-xl border border-red-200 bg-red-50 p-4 text-red-800">
            Something went wrong. Check console / API response and try again.
          </div>
        )}
      </main>

      {/* Footer */}
      <footer className="mx-auto max-w-6xl px-6 py-8 text-xs text-slate-500">
        © Allora College — Workplace Training and Assessment | AURTTE104 Declaration
      </footer>
    </div>
  );
}
