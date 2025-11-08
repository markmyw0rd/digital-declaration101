// app/e/[token]/page.tsx
"use client";

import { useEffect, useState } from "react";
import {
  StudentCard,
  SupervisorCard,
  AssessorDeclaration,
  Checklist,
  Outcome,
  Section,
} from "../../../components/FormCards";

export default function Envelope({ params }: { params: { token: string } }) {
  const token = params.token;
  const [env, setEnv] = useState<any>(null);
  const [role, setRole] = useState<string>("");

  useEffect(() => {
    (async () => {
      // who am I?
      const r = await fetch("/api/whoami", { method: "POST", body: token });
      const j = await r.json();
      setRole(j.role);

      // envelope view for my role
      const g = await fetch(`/api/envelopes/${j.envId}`, {
        headers: { authorization: `Bearer ${token}` },
      });
      setEnv(await g.json());
    })();
  }, [token]);

  if (!env) return <main className="p-6">Loading…</main>;

  const status = env.envelope?.status as
    | "awaiting_student"
    | "awaiting_supervisor"
    | "awaiting_assessor"
    | "completed";

  const canStudent = status === "awaiting_student" && role === "student";
  const canSupervisor = status === "awaiting_supervisor" && role === "supervisor";
  const canAssessor = status === "awaiting_assessor" && role === "assessor";

  async function signCurrent(signatureDataUrl: string, nextEmail: string) {
    const res = await fetch(`/api/envelopes/${env.envelope.id}/sign`, {
      method: "POST",
      headers: { "content-type": "application/json" },
      body: JSON.stringify({ token, signatureDataUrl, formPatch: { agreed: true }, nextEmail }),
    });
    const j = await res.json();
    if (j.next) window.location.href = j.next; // send next role to their link
  }

  async function complete(outcome: "C" | "NYC") {
    const res = await fetch(`/api/envelopes/${env.envelope.id}/complete`, {
      method: "POST",
      headers: { "content-type": "application/json" },
      body: JSON.stringify({ token, outcome }),
    });
    const j = await res.json();
    if (j.finalUrl) window.location.href = j.finalUrl;
  }

  return (
    <main className="max-w-5xl mx-auto p-6 space-y-6">
      <header className="space-y-1">
        <h1 className="text-xl font-semibold">Student Declaration</h1>
        <p className="text-sm text-slate-600">
          Unit: {env.envelope.unit_code} • Status: {status} • You are: <b>{role}</b>
        </p>
      </header>

      {/* Student first */}
      <Section title="Student — Sign here" locked={!canStudent}>
        <StudentCard locked={!canStudent} onSign={signCurrent} />
        <p className="text-xs text-slate-500 mt-2">
          After signing, your supervisor will receive a link to complete their declaration.
        </p>
      </Section>

      {/* Supervisor next (read-only until it's their turn) */}
      <Section title="Supervisor" locked={!canSupervisor}>
        <SupervisorCard locked={!canSupervisor} onSign={signCurrent} />
      </Section>

      {/* Assessor last */}
      <AssessorDeclaration locked={!canAssessor} />
      <Checklist locked={!canAssessor} />
      <Outcome locked={!canAssessor} onComplete={complete} />

      <footer className="text-xs text-slate-500 pt-4">
        © Allora College — Workplace Training and Assessment | AURTTE104 Declaration
      </footer>
    </main>
  );
}
