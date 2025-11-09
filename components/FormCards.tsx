// components/FormCards.tsx
import React from "react";

/** Common props every “card” accepts */
export type BaseCardProps = {
  /** When true, the card is visually disabled & non-interactive */
  locked?: boolean;
  className?: string;
  children?: React.ReactNode;
};

/** Signature handler used by Student & Supervisor cards */
export type SignatureHandler = (
  signatureDataUrl: string,
  nextEmail: string
) => Promise<void>;

/** Generic section wrapper used on the e/[token] page */
export function Section({
  title,
  locked = false,
  children,
  className = "",
}: {
  title: string;
  locked?: boolean;
  className?: string;
  children: React.ReactNode;
}) {
  return (
    <section
      className={
        "mb-8 rounded-2xl border bg-white p-5 shadow-sm " +
        (locked ? "opacity-60 pointer-events-none select-none " : "") +
        className
      }
      aria-disabled={locked ? true : undefined}
    >
      <h3 className="mb-3 text-base font-semibold text-slate-800">{title}</h3>
      {children}
    </section>
  );
}

/** ---------- Student & Supervisor Cards (signing) ---------- */

type SignCardProps = BaseCardProps & {
  /** Fired after the signer submits; provide data URL + next email */
  onSigned?: SignatureHandler;
};

export function StudentCard({ locked = false, onSigned }: SignCardProps) {
  // Keep UI super simple so it always compiles; wire to your existing pad later
  const [nextEmail, setNextEmail] = React.useState("");
  const handleClick = async () => {
    if (!onSigned) return;
    // You’ll call your real signature pad here and pass its data URL
    await onSigned("data:image/png;base64,stub", nextEmail.trim());
  };

  return (
    <div className="space-y-3">
      <div className="h-32 rounded-lg border bg-slate-50" aria-hidden />
      <input
        disabled={locked}
        type="email"
        placeholder="Supervisor email (next)"
        className="w-full rounded-md border px-3 py-2 text-sm"
        value={nextEmail}
        onChange={(e) => setNextEmail(e.target.value)}
      />
      <button
        disabled={locked}
        onClick={handleClick}
        className="rounded-md bg-black px-4 py-2 text-sm font-medium text-white disabled:opacity-50"
      >
        Sign & Notify Supervisor
      </button>
    </div>
  );
}

export function SupervisorCard({ locked = false, onSigned }: SignCardProps) {
  const [nextEmail, setNextEmail] = React.useState("");
  const handleClick = async () => {
    if (!onSigned) return;
    await onSigned("data:image/png;base64,stub", nextEmail.trim());
  };

  return (
    <div className="space-y-3">
      <div className="h-32 rounded-lg border bg-slate-50" aria-hidden />
      <input
        disabled={locked}
        type="email"
        placeholder="Assessor email (next)"
        className="w-full rounded-md border px-3 py-2 text-sm"
        value={nextEmail}
        onChange={(e) => setNextEmail(e.target.value)}
      />
      <button
        disabled={locked}
        onClick={handleClick}
        className="rounded-md bg-black px-4 py-2 text-sm font-medium text-white disabled:opacity-50"
      >
        Sign & Notify Assessor
      </button>
    </div>
  );
}

/** ---------- Assessor bits (placeholders so the page compiles) ---------- */

export function AssessorDeclaration({ locked = false }: BaseCardProps) {
  return (
    <div
      className={
        "rounded-lg border bg-white p-4 " +
        (locked ? "opacity-60 pointer-events-none" : "")
      }
    >
      <p className="text-sm text-slate-700">
        Assessor declaration area (tick boxes / notes).
      </p>
    </div>
  );
}

export function Checklist({ locked = false }: BaseCardProps) {
  return (
    <div
      className={
        "rounded-lg border bg-white p-4 " +
        (locked ? "opacity-60 pointer-events-none" : "")
      }
    >
      <p className="text-sm text-slate-700">Quick Assessor Checklist …</p>
    </div>
  );
}

export function Outcome({
  locked = false,
  onComplete,
}: BaseCardProps & { onComplete?: () => void }) {
  return (
    <div
      className={
        "rounded-lg border bg-white p-4 " +
        (locked ? "opacity-60 pointer-events-none" : "")
      }
    >
      <div className="flex gap-2">
        <button
          disabled={locked}
          onClick={onComplete}
          className="rounded-md bg-emerald-600 px-4 py-2 text-sm font-medium text-white disabled:opacity-50"
        >
          Mark Competent & Generate PDF
        </button>
        <button
          disabled={locked}
          onClick={onComplete}
          className="rounded-md bg-amber-600 px-4 py-2 text-sm font-medium text-white disabled:opacity-50"
        >
          Mark NYC & Send Feedback
        </button>
      </div>
    </div>
  );
}
