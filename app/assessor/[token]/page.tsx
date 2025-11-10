// app/assessor/[token]/page.tsx
import { notFound } from "next/navigation";
import { verifyToken } from "@/lib/jwt";
import { db } from "@/lib/db";
import {
  AssessorDeclaration,
  Checklist,
  Outcome,
} from "@/components/FormCards";

type Params = { params: { token: string } };

export default async function AssessorPage({ params }: Params) {
  const payload = await verifyToken(params.token);
  if (!payload || payload.role !== "assessor") return notFound();

  const env = await db.getEnvelope(payload.id);
  if (!env) return notFound();

  return (
    <main className="max-w-5xl mx-auto p-6 space-y-6">
      <h2 className="text-lg font-semibold">
        {env.unitCode} — Assessor Finalisation
      </h2>
      <div className="text-sm text-slate-600">
        Unit: <b>{env.unitCode}</b> • Status: <b>{env.status}</b>
      </div>

      <AssessorDeclaration />
      <Checklist />
      <Outcome />
    </main>
  );
}
