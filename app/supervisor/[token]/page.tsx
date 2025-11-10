// app/supervisor/[token]/page.tsx
import { notFound } from "next/navigation";
import { verifyToken } from "@/lib/jwt";
import { db } from "@/lib/db";
import { Section, SupervisorCard } from "@/components/FormCards";

type Params = { params: { token: string } };

export default async function SupervisorPage({ params }: Params) {
  const payload = await verifyToken(params.token);
  if (!payload || (payload as any).role !== "supervisor") return notFound();

  const env = await db.getEnvelope((payload as any).id);
  if (!env) return notFound();

  const locked = false;
  const unitCode: string =
    (env as any).unitCode ?? (env as any).unit_code ?? "AURTTE104";

  return (
    <main className="max-w-5xl mx-auto p-6 space-y-6">
      <h2 className="text-lg font-semibold">
        {unitCode} — Supervisor Verification
      </h2>
      <div className="text-sm text-slate-600">
        Unit: <b>{unitCode}</b> • Status: <b>{env.status}</b>
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
