// app/api/envelopes/[id]/sign/route.ts
import { NextResponse } from "next/server";
import { cookies } from "next/headers";
import { db } from "@/lib/db";
import { sendNextLinkEmail } from "@/lib/email";
import { signLinkToken } from "@/lib/jwt";

type Params = { params: { id: string } };

// Keep this in one place so it matches your Vercel ENV var
const APP_URL = process.env.APP_URL || "http://localhost:3000";

/**
 * POST /api/envelopes/:id/sign
 * Body: { role: "student"|"supervisor"|"assessor", dataUrl?: string }
 */
export async function POST(_req: Request, { params }: Params) {
  const { id } = params;

  try {
    const body = await _req.json();
    const role = body?.role as "student" | "supervisor" | "assessor" | undefined;
    const dataUrl = (body?.dataUrl as string | undefined) ?? "";

    if (!role) {
      return NextResponse.json({ error: "bad_request" }, { status: 400 });
    }

    // 1) Load envelope
    const env = await db.getEnvelope(id);
    if (!env) {
      return NextResponse.json({ error: "not_found" }, { status: 404 });
    }

    // 2) Update signatures + status
    let nextRole: "supervisor" | "assessor" | null = null;

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
    } else if (role === "assessor") {
      await db.updateEnvelope(id, {
        assessorSignature: dataUrl,
        status: "completed",
      });
      nextRole = null; // workflow finished
    }

    // 3) If there’s a next signer, email their link
    if (nextRole) {
      const token = await signLinkToken({ id, role: nextRole });
      const nextUrl = `${APP_URL}/e/${token}`;

      // Unit code can be camelCase or snake_case depending on where it came from
      const unitCode: string =
        // @ts-expect-error tolerate both shapes at runtime
        (env as any).unitCode ??
        // @ts-expect-error tolerate both shapes at runtime
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

    // 4) Refresh the small cookie the /e/[token] page reads
    //    (id + *current* role for the viewer)
    const cookiePayload =
      nextRole === null
        ? { id, role: "assessor" } // done; last actor was assessor
        : { id, role: nextRole }; // who should act next

    cookies().set("ev", JSON.stringify(cookiePayload), {
      httpOnly: true,
      secure: true,
      sameSite: "lax",
      path: "/",
      maxAge: 60 * 60 * 24 * 7,
    });

    return NextResponse.json({ ok: true });
  } catch (err) {
    console.error("[sign-route] error", err);
    return NextResponse.json({ error: "server_error" }, { status: 500 });
  }
}
