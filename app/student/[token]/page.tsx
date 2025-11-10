// app/student/[token]/page.tsx
import { notFound } from "next/navigation";
import { verifyToken } from "@/lib/jwt";
import { db } from "@/lib/db";
import { Section, StudentCard } from "@/components/FormCards";

type Params = { params: { token: string } };

export default async function StudentPage({ params }: Params) {
  const payload = await verifyToken(params.token);
  if (!payload || (payload as any).role !== "student") return notFound();

  const env = await db.getEnvelope((payload as any).id);
  if (!env) return notFound();

  const locked = false;
  const unitCode: string =
    (env as any).unitCode ?? (env as any).unit_code ?? "AURTTE104";

  return (
    <main className="max-w-5xl mx-auto p-6 space-y-6">
      <h2 className="text-lg font-semibold">
        {unitCode} — Student Declaration
      </h2>
      <div className="text-sm text-slate-600">
        Unit: <b>{unitCode}</b> • Status: <b>{env.status}</b>
      </div>

      <Section title="Student — Sign here" locked={locked}>
        <StudentCard locked={locked} />
        <p className="text-xs text-slate-500 mt-2">
          After you sign, your supervisor will automatically receive a link.
        </p>
      </Section>
    </main>
  );
}
