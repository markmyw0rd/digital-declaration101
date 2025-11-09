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

async function fetchJsonSafe(input: RequestInfo, init?: RequestInit) {
  const res = await fetch(input, init);
  const text = await res.text();
  let data: any;
  try {
    data = JSON.parse(text);
  } catch {
    data = { error: text || `HTTP ${res.status}` };
  }
  if (!res.ok) {
    const msg = data?.error || `HTTP ${res.status}`;
    throw new Error(msg);
  }
  return data;
}

export default function Envelope({ params }: { params: { token: string } }) {
  const token = params.token;
  const [env, setEnv] = useState<any>(null);
  const [role, setRole] = useState<string>("");
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    (async () => {
      try {
        // who am I?
        const who = await fetchJsonSafe("/api/whoami", {
          method: "POST",
          body: token,
        });
        setRole(who.role);

        // envelope view
        const view = await fetchJsonSafe(`/api/envelopes/${who.envId}`, {
          headers: { authorization: `Bearer ${token}` },
        });
        setEnv(view);
      } catch (e: any) {
        setError(e?.message || "Failed to load envelope");
      }
    })();
  }, [token]);

  if (error) {
    return (
      <main className="p-6">
        <div className="rounded-lg border border-red-200 bg-red-50 p-4 text-red-800">
          {error}
        </div>
      </main>
    );
  }

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
    try {
      const j = await fetchJsonSafe(`/api/envelopes/${env.envelope.id}/sign`, {
        method: "POST",
        headers: { "content-type": "application/json" },
        body: JSON.stringify({ token, signatureDataUrl, formPatch: { agreed: true }, nextEmail }),
      });
      if (j.next) window.location.href = j.next;
    } catch (e: any) {
      alert(e?.message || "Failed to sign");
    }
  }

  async function complete(outcome: "C" | "NYC") {
    try {
      const j = await fetchJsonSafe(`/api/envelopes/${env.envelope.id}/complete`, {
        method: "POST",
        headers: { "content-type": "application/json" },
        body: JSON.stringify({ token, outcome }),
      });
      if (j.finalUrl) window.location.href = j.finalUrl;
    } catch (e: any) {
      alert(e?.message || "Failed to complete");
    }
  }

  return (
    <main className="max-w-5xl mx-auto p-6 space-y-6">
      <div className="rounded-2xl border bg-white shadow-sm p-5">
        <div className="flex flex-wrap items-center justify-between gap-3">
          <div>
            <h2 className="text-lg font-semibold">AURTTE104 — Student Declaration</h2>
            <p className="text-sm text-slate-600">
              Unit: {env.envelope.unit_code} • Status: {status} • You are: <b>{role}</b>
            </p>
          </div>
          <div className="text-xs text-slate-500">Student → Supervisor → Assessor</div>
        </div>
      </div>

      <Section title="Student — Sign here" locked={!canStudent}>
        <StudentCard locked={!canStudent} onSigned={signCurrent} />
        <p className="text-xs text-slate-500 mt-2">
          After you sign, your supervisor will automatically receive a link.
        </p>
      </Section>

      <Section title="Supervisor" locked={!canSupervisor}>
        <SupervisorCard locked={!canSupervisor} onSign={signCurrent} />
      </Section>

      <AssessorDeclaration locked={!canAssessor} />
      <Checklist locked={!canAssessor} />
      <Outcome locked={!canAssessor} onComplete={complete} />
    </main>
  );
}
