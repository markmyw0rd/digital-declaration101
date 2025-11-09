// components/FormCards.tsx
"use client";

import React from "react";

/** ---------- Small shared primitives ---------- */
export function Section({
  title,
  locked = false,
  children,
}: {
  title: string;
  /** When true, visually dim and make the section inert */
  locked?: boolean;
  children: React.ReactNode;
}) {
  return (
    <section
      aria-disabled={locked}
      className={[
        "relative rounded-xl border border-gray-200 bg-white p-4 md:p-6 shadow-sm",
        locked ? "opacity-60 pointer-events-none" : "",
      ].join(" ")}
    >
      <h3 className="mb-3 text-base md:text-lg font-semibold text-gray-800">
        {title}
      </h3>
      <div className="space-y-3">{children}</div>
      {locked && (
        <div className="absolute inset-0 rounded-xl" aria-hidden="true" />
      )}
    </section>
  );
}

export function Checklist({
  items,
  value = [],
  onChange,
}: {
  items: { id: string; label: string }[];
  value?: string[];
  onChange?: (next: string[]) => void;
}) {
  const selected = new Set(value);
  return (
    <div className="grid gap-2">
      {items.map((it) => {
        const checked = selected.has(it.id);
        return (
          <label
            key={it.id}
            className="flex items-center gap-3 rounded-lg border p-3"
          >
            <input
              type="checkbox"
              className="h-4 w-4"
              checked={checked}
              onChange={(e) => {
                const next = new Set(selected);
                if (e.target.checked) next.add(it.id);
                else next.delete(it.id);
                onChange?.(Array.from(next));
              }}
            />
            <span className="text-sm md:text-base">{it.label}</span>
          </label>
        );
      })}
    </div>
  );
}

export function Outcome({
  value = "NYC",
  onChange,
}: {
  value?: "Competent" | "NYC";
  onChange?: (v: "Competent" | "NYC") => void;
}) {
  return (
    <div className="flex gap-4">
      {(["Competent", "NYC"] as const).map((opt) => (
        <label
          key={opt}
          className="flex items-center gap-2 rounded-lg border px-3 py-2"
        >
          <input
            type="radio"
            name="outcome"
            value={opt}
            checked={value === opt}
            onChange={() => onChange?.(opt)}
          />
          <span className="text-sm md:text-base">{opt}</span>
        </label>
      ))}
    </div>
  );
}

/** ---------- Role cards ---------- */

type BaseCardProps = {
  /** Accept both names; locked wins if both present */
  locked?: boolean;
  disabled?: boolean;
  onSigned?: () => void;
  children?: React.ReactNode;
};

export function StudentCard({
  locked,
  disabled,
  onSigned,
  children,
}: BaseCardProps) {
  const isDisabled = locked ?? disabled ?? false;
  return (
    <Section title="Student — Sign here" locked={isDisabled}>
      <div className="h-40 rounded-lg border bg-gray-50" />
      <button
        disabled={isDisabled}
        onClick={onSigned}
        className="mt-3 w-full rounded-lg bg-black px-4 py-3 text-white disabled:opacity-40"
      >
        Sign & Notify Supervisor
      </button>
      {children}
    </Section>
  );
}

export function SupervisorCard({
  locked,
  disabled,
  onSigned,
  children,
}: BaseCardProps) {
  const isDisabled = locked ?? disabled ?? false;
  return (
    <Section title="Workplace Supervisor — Sign here" locked={isDisabled}>
      <div className="h-40 rounded-lg border bg-gray-50" />
      <button
        disabled={isDisabled}
        onClick={onSigned}
        className="mt-3 w-full rounded-lg bg-black px-4 py-3 text-white disabled:opacity-40"
      >
        Sign & Notify Assessor
      </button>
      {children}
    </Section>
  );
}

export function AssessorDeclaration({
  children,
}: {
  children?: React.ReactNode;
}) {
  return (
    <Section title="Assessor — Declaration">
      {children ?? (
        <p className="text-sm text-gray-600">
          Confirm pre-assessment checks, knowledge assessment, and practical
          observation have been completed.
        </p>
      )}
    </Section>
  );
}
