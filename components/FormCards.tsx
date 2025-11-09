// components/FormCards.tsx  (append this; keep your existing exports as-is)
"use client";

import { useState, useCallback } from "react";
import { useRouter } from "next/navigation";

type Role = "student" | "supervisor" | "assessor";

/**
 * Reusable sign button that:
 *  - POSTs to /api/envelopes/[id]/sign with { role, dataUrl }
 *  - navigates to the nextUrl returned by the API (or refreshes)
 *  - prevents double submit and handles empty JSON bodies
 */
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
  dataUrl?: string;
  disabledReason?: string;
  className?: string;
  children: React.ReactNode;
}) {
  const router = useRouter();
  const [busy, setBusy] = useState(false);

  const onClick = useCallback(async () => {
    if (busy) return;

    // Require a signature image for student/supervisor roles
    if ((role === "student" || role === "supervisor") && !dataUrl) return;

    setBusy(true);
    try {
      const res = await fetch(`/api/envelopes/${envelopeId}/sign`, {
        method: "POST",
        headers: { "content-type": "application/json" },
        body: JSON.stringify({ role, dataUrl }),
      });

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
      type="button" // important: not a form submit
      onClick={onClick}
      disabled={isDisabled}
      aria-busy={busy}
      title={disabledReason}
      className={`w-full rounded-md px-4 py-3 text-white ${
        isDisabled ? "opacity-60 cursor-not-allowed" : "cursor-pointer"
      } ${className}`}
    >
      {busy ? "Processing…" : children}
    </button>
  );
}
