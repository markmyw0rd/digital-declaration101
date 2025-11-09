'use client';

import { useRef, useState } from 'react';

export type SignatureHandler = (signatureDataUrl: string, nextEmail: string) => Promise<void>;

export type BaseCardProps = {
  locked?: boolean;
  children?: React.ReactNode;
};

export function Section({
  title,
  locked,
  children,
}: { title: string } & BaseCardProps) {
  return (
    <section
      className={`rounded-2xl border bg-white shadow-sm p-5 ${locked ? 'opacity-50 pointer-events-none' : ''}`}
    >
      <h3 className="font-semibold mb-3">{title}</h3>
      {children}
    </section>
  );
}

/* ---------------- Student / Supervisor cards ---------------- */

function SignaturePad({
  disabled,
  onChange,
}: {
  disabled?: boolean;
  onChange: (dataUrl: string) => void;
}) {
  const canvasRef = useRef<HTMLCanvasElement | null>(null);

  // extremely light fake pad: clicking sets a “signature”
  function fakeSign() {
    const c = canvasRef.current!;
    const ctx = c.getContext('2d')!;
    ctx.clearRect(0, 0, c.width, c.height);
    ctx.fillStyle = '#0f172a';
    ctx.font = '20px sans-serif';
    ctx.fillText('Signed ✔', 10, 40);
    onChange(c.toDataURL('image/png'));
  }

  return (
    <div className="border rounded-md p-2 bg-slate-50">
      <canvas
        ref={canvasRef}
        width={360}
        height={80}
        className="bg-white border rounded"
        onClick={!disabled ? fakeSign : undefined}
      />
      <div className="text-[11px] text-slate-500 mt-1">
        (Click canvas to simulate signature)
      </div>
    </div>
  );
}

export function StudentCard({
  locked,
  onSigned,
}: BaseCardProps & { onSigned?: SignatureHandler }) {
  const [sig, setSig] = useState<string>('');
  const [supervisorEmail, setSupervisorEmail] = useState('');

  return (
    <div className="space-y-3">
      <p className="text-slate-700">
        I confirm I can perform the required workplace tasks to industry standard,
        independently and without additional supervision or training.
      </p>

      <SignaturePad disabled={!!locked} onChange={setSig} />

      <input
        type="email"
        placeholder="Supervisor Email (next)"
        className="border rounded-md px-3 py-2 w-full"
        disabled={!!locked}
        value={supervisorEmail}
        onChange={(e) => setSupervisorEmail(e.target.value)}
      />

      <button
        className="px-4 py-2 rounded-md bg-black text-white disabled:opacity-40"
        disabled={locked || !sig || !supervisorEmail}
        onClick={() => onSigned?.(sig, supervisorEmail)}
      >
        Sign & Notify Supervisor
      </button>
    </div>
  );
}

export function SupervisorCard({
  locked,
  onSigned,
}: BaseCardProps & { onSigned?: SignatureHandler }) {
  const [sig, setSig] = useState<string>('');
  const [assessorEmail, setAssessorEmail] = useState('');

  return (
    <div className="space-y-3">
      <p className="text-slate-700">
        I verify this student has completed the required workplace hours and tasks.
      </p>

      <SignaturePad disabled={!!locked} onChange={setSig} />

      <input
        type="email"
        placeholder="Assessor Email (next)"
        className="border rounded-md px-3 py-2 w-full"
        disabled={!!locked}
        value={assessorEmail}
        onChange={(e) => setAssessorEmail(e.target.value)}
      />

      <button
        className="px-4 py-2 rounded-md bg-black text-white disabled:opacity-40"
        disabled={locked || !sig || !assessorEmail}
        onClick={() => onSigned?.(sig, assessorEmail)}
      >
        Sign & Notify Assessor
      </button>
    </div>
  );
}

/* ---------------- Assessor section & outcome ---------------- */

export function AssessorDeclaration({ locked }: BaseCardProps) {
  return (
    <Section title="Section 3: Assessor Confirmation" locked={locked}>
      <p className="text-slate-700">
        I confirm the student has demonstrated competency for assessment tasks.
      </p>
    </Section>
  );
}

export function Checklist({ locked }: BaseCardProps) {
  return (
    <Section title="Quick Assessor Checklist" locked={locked}>
      <ul className="list-disc pl-6 text-sm space-y-1 text-slate-700">
        <li>Student has signed Section 1 and Section 4</li>
        <li>Workplace Supervisor has completed and signed Section 1</li>
        <li>Assessor has signed Section 3 and Section 4</li>
        <li>All parties have signed declarations</li>
        <li>Training Record Book completed</li>
        <li>Results entered in TEAMS</li>
        <li>RTA completed and signed by all 3 parties</li>
      </ul>
    </Section>
  );
}

export function Outcome({
  locked,
  onComplete,
}: BaseCardProps & { onComplete?: () => Promise<void> | void }) {
  const [result, setResult] = useState<'Competent' | 'Not Yet Competent' | ''>('');

  return (
    <Section title="Section 4: Practical Assessment Outcome" locked={locked}>
      <div className="space-y-3">
        <div className="flex items-center gap-3">
          <label className="text-sm">
            <input
              type="radio"
              name="outcome"
              className="mr-2"
              checked={result === 'Competent'}
              onChange={() => setResult('Competent')}
              disabled={!!locked}
            />
            Competent — provide feedback to Student after assessment.
          </label>
        </div>
        <div className="flex items-center gap-3">
          <label className="text-sm">
            <input
              type="radio"
              name="outcome"
              className="mr-2"
              checked={result === 'Not Yet Competent'}
              onChange={() => setResult('Not Yet Competent')}
              disabled={!!locked}
            />
            Not Yet Competent — advise requirements for next assessment.
          </label>
        </div>

        <div className="grid grid-cols-2 gap-3 max-w-lg">
          <div>
            <label className="text-xs text-slate-500">Assessor feedback for Competent</label>
            <textarea className="border rounded-md p-2 w-full h-20" disabled={!!locked} />
          </div>
          <div>
            <label className="text-xs text-slate-500">Assessor feedback for NYC</label>
            <textarea className="border rounded-md p-2 w-full h-20" disabled={!!locked} />
          </div>
        </div>

        <div className="flex items-end gap-3">
          <div>
            <label className="text-xs text-slate-500">Date</label>
            <input
              type="text"
              placeholder="dd/mm/yyyy"
              className="border rounded-md px-3 py-2 w-40"
              disabled={!!locked}
            />
          </div>

          <button
            className="px-4 py-2 rounded-md bg-black text-white disabled:opacity-40"
            disabled={!!locked || !result}
            onClick={() => onComplete?.()}
          >
            {result ? 'Mark & Generate PDF' : 'Select an outcome'}
          </button>
        </div>
      </div>
    </Section>
  );
}
