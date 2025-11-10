// app/supervisor/[token]/page.tsx
import { notFound } from "next/navigation";
import { verifyToken } from "@/lib/jwt";
import { db } from "@/lib/db";
import { Section, SupervisorCard } from "@/components/FormCards";

type Params = { params: { token: string } };

export default async function SupervisorPage({ params }: Params) {
  const payload = await verifyToken(params.token);
  if (!payload || payload.role !== "supervisor") return notFound();

  const env = await db.getEnvelope(payload.id);
  if (!env) return notFound();

  const locked = false;

  return (
    <main className="max-w-5xl mx-auto p-6 space-y-6">
      <h2 className="text-lg font-semibold">
        {env.unitCode} — Supervisor Verification
      </h2>
      <div className="text-sm text-slate-600">
        Unit: <b>{env.unitCode}</b> • Status: <b>{env.status}</b>
      </div>

      <Section title="Supervisor — Sign here" locked={locked}>
        <SupervisorCard locked={locked} />
        <p className="text-xs text-slate-500 mt-2">
          After you sign, the assessor will automatically receive a link.
        </p>
      </Section>
    </main>
  );
}
