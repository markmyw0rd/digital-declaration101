'use client';

import { useEffect, useMemo, useState } from 'react';
import {
  Section,
  StudentCard,
  SupervisorCard,
  AssessorDeclaration,
  Checklist,
  Outcome,
} from '../../../components/FormCards';

type PageParams = { params: { token: string } };

type Envelope = {
  id: string;
  unit_code: string;
  status:
    | 'awaiting_student'
    | 'awaiting_supervisor'
    | 'awaiting_assessor'
    | 'completed';
  studentSignature?: string | null;
  supervisorSignature?: string | null;
  assessorSignature?: string | null;
};

type Role = 'student' | 'supervisor' | 'assessor';

export default function EnvelopePage({ params }: PageParams) {
  const { token } = params;

  const [env, setEnv] = useState<Envelope | null>(null);
  const [role, setRole] = useState<Role>('student');
  const [loading, setLoading] = useState(true);

  /** ---------------- helpers ---------------- */
  const status = env?.status ?? 'awaiting_student';

  const canStudent = useMemo(
    () => role === 'student' && status === 'awaiting_student',
    [role, status],
  );
  const canSupervisor = useMemo(
    () => role === 'supervisor' && status === 'awaiting_supervisor',
    [role, status],
  );
  const canAssessor = useMemo(
    () => role === 'assessor' && status === 'awaiting_assessor',
    [role, status],
  );

  /** ---------------- data load ---------------- */
  useEffect(() => {
    (async () => {
      setLoading(true);
      const res = await fetch(`/api/e/${token}`);
      if (!res.ok) {
        setLoading(false);
        return;
      }
      const data: {
        envelope: Envelope;
        role: Role;
      } = await res.json();
      setEnv(data.envelope);
      setRole(data.role);
      setLoading(false);
    })();
  }, [token]);

  /** ---------------- actions ---------------- */
  async function signCurrent(signatureDataUrl: string, nextEmail: string) {
    if (!env) return;
    const res = await fetch(`/api/envelopes/${env.id}/sign`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        role,
        dataUrl: signatureDataUrl,
        nextEmail,
      }),
    });

    if (res.ok) {
      const updated: Envelope = await res.json();
      setEnv(updated);
    }
  }

  async function complete() {
    if (!env) return;
    const res = await fetch(`/api/envelopes/${env.id}/complete`, {
      method: 'POST',
    });
    if (res.ok) {
      const updated: Envelope = await res.json();
      setEnv(updated);
    }
  }

  /** ---------------- render ---------------- */
  if (loading || !env) {
    return (
      <main className="max-w-5xl mx-auto p-6">
        <div className="animate-pulse text-slate-400">Loading…</div>
      </main>
    );
  }

  return (
    <main className="max-w-5xl mx-auto p-6 space-y-6">
      <div className="rounded-2xl border bg-white shadow-sm p-5">
        <div className="flex flex-wrap items-center justify-between gap-3">
          <div className="text-lg font-semibold">AURTTE104 — Student Declaration</div>
          <div className="text-sm text-slate-600">
            Unit: <b>{env.unit_code}</b> • Status: <b>{status}</b> • You are: <b>{role}</b>
          </div>
        </div>
        <div className="text-xs text-slate-500">
          Student → Supervisor → Assessor
        </div>
      </div>

      {/* Student */}
      <Section title="Student — Sign here" locked={!canStudent}>
        <StudentCard locked={!canStudent} onSigned={signCurrent} />
        <p className="text-xs text-slate-500 mt-2">
          After you sign, your supervisor will automatically receive a link.
        </p>
      </Section>

      {/* Supervisor */}
      <Section title="Supervisor" locked={!canSupervisor}>
        <SupervisorCard locked={!canSupervisor} onSigned={signCurrent} />
      </Section>

      {/* Assessor */}
      <AssessorDeclaration locked={!canAssessor} />
      <Checklist locked={!canAssessor} />
      <Outcome locked={!canAssessor} onComplete={complete} />
    </main>
  );
}
