// components/FormCards.tsx
"use client";

import React, { useState, useCallback } from "react";
import { useRouter } from "next/navigation";

/* ------------------------------------------------------------------ */
/* Types                                                               */
/* ------------------------------------------------------------------ */
export type Role = "student" | "supervisor" | "assessor";

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
/* Named Cards (exports expected by /app/e/[token]/page.tsx)           */
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
