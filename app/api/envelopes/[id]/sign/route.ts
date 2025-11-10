// app/api/envelopes/[id]/sign/route.ts
import { NextResponse } from "next/server";
import { cookies } from "next/headers";
import { db } from "@/lib/db";
import { signLinkToken } from "@/lib/jwt";
import { sendNextLinkEmail } from "@/lib/email";

const APP_URL = process.env.APP_URL || "http://localhost:3000";

type Role = "student" | "supervisor" | "assessor";
type NextRole = Exclude<Role, "student"> | null;

export async function POST(req: Request, { params }: { params: { id: string } }) {
  const { id } = params;

  try {
    const body = await req.json();
    const role = body?.role as Role | undefined;
    const dataUrl = (body?.dataUrl as string | undefined) ?? "";

    if (!role) {
      return NextResponse.json({ error: "bad_request" }, { status: 400 });
    }

    const env = await db.getEnvelope(id);
    if (!env) {
      return NextResponse.json({ error: "not_found" }, { status: 404 });
    }

    // Persist signature + roll status forward
    let nextRole: NextRole = null;

    if (role === "student") {
      await db.updateEnvelope(id, {
        studentSignature: dataUrl,
        status: "awaiting_supervisor",
      });
      nextRole = "supervisor";
    } else if (role === "supervisor") {
      await db.updateEnvelope(id, {
        supervisorSignature: dataUrl,
        status: "awaiting_assessor",
      });
      nextRole = "assessor";
    } else {
      await db.updateEnvelope(id, {
        assessorSignature: dataUrl,
        status: "completed",
      });
      nextRole = null;
    }

    // Notify next signer (if any)
    if (nextRole) {
      const token = await signLinkToken({ id, role: nextRole });
      const nextUrl = `${APP_URL}/e/${token}`;

      // Unit code: accept either camelCase or snake_case from DB
      const unitCode: string =
        (env as any).unitCode ??
        (env as any).unit_code ??
        "AURTTE104";

      if (nextRole === "supervisor" && env.supervisorEmail) {
        await sendNextLinkEmail({
          to: env.supervisorEmail,
          role: "supervisor",
          nextUrl,
          unitCode,
        });
      }

      if (nextRole === "assessor" && env.assessorEmail) {
        await sendNextLinkEmail({
          to: env.assessorEmail,
          role: "assessor",
          nextUrl,
          unitCode,
        });
      }
    }

    // Refresh helper cookie for /e/[token]
    cookies().set(
      "ev",
      JSON.stringify(nextRole ? { id, role: nextRole } : { id, role: "assessor" }),
      {
        httpOnly: true,
        secure: true,
        sameSite: "lax",
        path: "/",
        maxAge: 60 * 60 * 24 * 7, // 7 days
      }
    );

    return NextResponse.json({ ok: true });
  } catch (err) {
    console.error("[sign-route] error", err);
    return NextResponse.json({ error: "server_error" }, { status: 500 });
  }
}
