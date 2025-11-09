// components/FormCards.tsx
"use client";

import React, { useState, useCallback } from "react";
import { useRouter } from "next/navigation";

/* ------------------------------------------------------------------ */
/* Types                                                               */
/* ------------------------------------------------------------------ */
export type Role = "student" | "supervisor" | "assessor";
export type OutcomeValue = "competent" | "nyc";

type BaseCardProps = {
  title?: string;
  className?: string;
  children?: React.ReactNode;
};

/* ------------------------------------------------------------------ */
/* Reusable Card Shell                                                 */
/* ------------------------------------------------------------------ */
function CardShell({ title, className = "", children }: BaseCardProps) {
  return (
    <section
      className={`rounded-xl border border-zinc-200 bg-white p-4 md:p-6 shadow-sm ${className}`}
    >
      {title ? (
        <h3 className="mb-3 text-lg font-semibold text-zinc-900">{title}</h3>
      ) : null}
      {children}
    </section>
  );
}

/* ------------------------------------------------------------------ */
/* Named Cards (expected imports in /app/e/[token]/page.tsx)           */
/* ------------------------------------------------------------------ */
export function StudentCard(props: BaseCardProps) {
  return <CardShell title={props.title ?? "Student — Sign here"} {...props} />;
}

export function SupervisorCard(props: BaseCardProps) {
  return (
    <CardShell
      title={props.title ?? "Supervisor — Review & Sign"}
      {...props}
    />
  );
}

export function AssessorDeclaration(props: BaseCardProps) {
  return (
    <CardShell
      title={props.title ?? "Assessor — Declaration"}
      {...props}
    />
  );
}

export function Checklist(props: BaseCardProps) {
  return (
    <CardShell title={props.title ?? "Quick Assessor Checklist"} {...props} />
  );
}

/* ------------------------------------------------------------------ */
/* Section (simple titled wrapper)                                     */
/* ------------------------------------------------------------------ */
export function Section({
  title,
  className = "",
  children,
}: BaseCardProps) {
  return (
    <div className={`mb-5 ${className}`}>
      {title ? (
        <h4 className="mb-2 text-base font-medium text-zinc-800">{title}</h4>
      ) : null}
      <div className="rounded-lg border border-zinc-200 bg-white p-4">
        {children}
      </div>
    </div>
  );
}

/* ------------------------------------------------------------------ */
/* Outcome selector (Competent / NYC)                                  */
/* ------------------------------------------------------------------ */
export function Outcome({
  value,
  onChange,
  disabled = false,
  className = "",
}: {
  value: OutcomeValue | null;
  onChange: (v: OutcomeValue) => void;
  disabled?: boolean;
  className?: string;
}) {
  return (
    <div className={`flex gap-3 ${className}`}>
      <button
        type="button"
        disabled={disabled}
        onClick={() => onChange("competent")}
        className={`flex-1 rounded-md border px-4 py-2 text-sm font-medium transition
          ${
            value === "competent"
              ? "border-green-600 bg-green-600 text-white"
              : "border-zinc-300 bg-white text-zinc-800 hover:bg-zinc-50"
          }
          ${disabled ? "opacity-60 cursor-not-allowed" : ""}`}
      >
        Mark Competent
      </button>
      <button
        type="button"
        disabled={disabled}
        onClick={() => onChange("nyc")}
        className={`flex-1 rounded-md border px-4 py-2 text-sm font-medium transition
          ${
            value === "nyc"
              ? "border-amber-600 bg-amber-600 text-white"
              : "border-zinc-300 bg-white text-zinc-800 hover:bg-zinc-50"
          }
          ${disabled ? "opacity-60 cursor-not-allowed" : ""}`}
      >
        Not Yet Competent
      </button>
    </div>
  );
}

/* ------------------------------------------------------------------ */
/* Reusable Sign Button                                                */
/* ------------------------------------------------------------------ */
export function SignButton({
  envelopeId,
  role,
  dataUrl,
  disabledReason,
  className = "",
  children,
}: {
  envelopeId: string;
  role: Role;
  /** signature dataURL (required for student/supervisor) */
  dataUrl?: string;
  disabledReason?: string;
  className?: string;
  children: React.ReactNode;
}) {
  const router = useRouter();
  const [busy, setBusy] = useState(false);

  const onClick = useCallback(async () => {
    if (busy) return;

    // student/supervisor must have a signature image
    if ((role === "student" || role === "supervisor") && !dataUrl) return;

    setBusy(true);
    try {
      const res = await fetch(`/api/envelopes/${envelopeId}/sign`, {
        method: "POST",
        headers: { "content-type": "application/json" },
        body: JSON.stringify({ role, dataUrl }),
      });

      // avoid JSON parse crash on empty body
      const json: any = await res.json().catch(() => ({}));

      if (!res.ok) {
        const msg = json?.error || `HTTP ${res.status}`;
        alert(msg);
        return;
      }

      if (json?.nextUrl) {
        router.replace(json.nextUrl);
      } else {
        router.refresh();
      }
    } catch (err: any) {
      alert(err?.message || "Failed to submit signature");
    } finally {
      setBusy(false);
    }
  }, [busy, envelopeId, role, dataUrl, router]);

  const isDisabled =
    busy ||
    (!!disabledReason && disabledReason.length > 0) ||
    ((role === "student" || role === "supervisor") && !dataUrl);

  return (
    <button
      type="button"
      onClick={onClick}
      disabled={isDisabled}
      aria-busy={busy}
      title={disabledReason}
      className={`w-full rounded-md bg-black px-4 py-3 text-white transition-opacity ${
        isDisabled ? "opacity-60 cursor-not-allowed" : "hover:opacity-90"
      } ${className}`}
    >
      {busy ? "Processing…" : children}
    </button>
  );
}
