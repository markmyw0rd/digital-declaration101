// components/FormCards.tsx
"use client";

import { useState, useCallback } from "react";
import { useRouter } from "next/navigation";

type Role = "student" | "supervisor" | "assessor";

export function SignButton({
  envelopeId,
  role,                 // "student" | "supervisor" | "assessor"
  dataUrl,              // signature image data URL (string) or undefined
  disabledReason,       // optional string to show why disabled
  className = "",
  children,
}: {
  envelopeId: string;
  role: Role;
  dataUrl?: string;
  disabledReason?: string;
  className?: string;
  children: React.ReactNode;
}) {
  const router = useRouter();
  const [busy, setBusy] = useState(false);

  const onClick = useCallback(async () => {
    if (busy) return;
    // Basic guard: require a signature for roles that sign
    if ((role === "student" || role === "supervisor") && !dataUrl) return;

    setBusy(true);
    try {
      const res = await fetch(`/api/envelopes/${envelopeId}/sign`, {
        method: "POST",
        headers: { "content-type": "application/json" },
        body: JSON.stringify({ role, dataUrl }),
      });

      // try to parse json; if empty body, keep {} to avoid "Unexpected end of JSON"
      const json: any = await res
        .json()
        .catch(() => ({} as { nextUrl?: string; error?: string }));

      if (!res.ok) {
        const msg = json?.error || `HTTP ${res.status}`;
        alert(msg);
        return;
      }

      // The API returns { nextUrl }
      if (json?.nextUrl) {
        router.replace(json.nextUrl); // go to Supervisor or Assessor link
      } else {
        // fallback – refresh current page (server will render next role by status)
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
      type="button"                 // important: NOT a form submit
      onClick={onClick}
      disabled={isDisabled}
      aria-busy={busy}
      title={disabledReason}
      className={`w-full rounded-md px-4 py-3 text-white ${isDisabled ? "opacity-60 cursor-not-allowed" : "cursor-pointer"} ${className}`}
    >
      {busy ? "Processing…" : children}
    </button>
  );
}
