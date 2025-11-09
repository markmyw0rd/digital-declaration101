// app/api/envelopes/[id]/sign/route.ts
import { NextResponse } from "next/server";
import { cookies } from "next/headers";
import { db } from "@/lib/db"; // ✅ named import
import { sendNextLinkEmail } from "@/lib/email";

type Role = "student" | "supervisor" | "assessor";

export async function POST(
  req: Request,
  { params }: { params: { id: string } }
) {
  try {
    const id = params.id;
    const body = await req.json();
    const { role, dataUrl } = body as { role: Role; dataUrl?: string };

    const env = await db.getEnvelope(id);
    if (!env) {
      return NextResponse.json({ error: "Not found" }, { status: 404 });
    }

    // Persist signature + move status forward
    let nextRole: "supervisor" | "assessor" | null = null;

    if (role === "student") {
      await db.updateEnvelope(id, {
        studentSignature: dataUrl || "",
        status: "awaiting_supervisor",
      });
      nextRole = "supervisor";
    } else if (role === "supervisor") {
      await db.updateEnvelope(id, {
        supervisorSignature: dataUrl || "",
        status: "awaiting_assessor",
      });
      nextRole = "assessor";
    } else {
      // assessor finalise
      await db.updateEnvelope(id, {
        assessorSignature: dataUrl || "",
        status: "completed",
      });
      nextRole = null;
    }

    // Email the next person when applicable
    if (nextRole && process.env.RESEND_API_KEY) {
      const to =
        nextRole === "supervisor" ? env.supervisorEmail : env.assessorEmail;
      if (to) {
        const base = process.env.APP_URL || "http://localhost:3000";
        const nextUrl = `${base}/e/${id}?role=${nextRole}`;
        await sendNextLinkEmail({
          to,
          role: nextRole,
          nextUrl,
          unitCode: env.unitCode || "AURTTE104",
        });
      }
    }

    return NextResponse.json({ ok: true });
  } catch (err: any) {
    console.error("[sign] error", err);
    return NextResponse.json(
      { error: err?.message || "Server error" },
      { status: 500 }
    );
  }
}
