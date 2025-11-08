import { NextRequest, NextResponse } from "next/server";
import { sendNextLinkEmail } from "@/lib/email";

export const dynamic = "force-dynamic";

function decodeToken(t: string) {
  const norm = t.replace(/-/g, "+").replace(/_/g, "/");
  return JSON.parse(Buffer.from(norm, "base64").toString("utf8"));
}

export async function POST(req: NextRequest, { params }: { params: { id: string } }) {
  try {
    const raw = await req.text();
    const body = raw ? JSON.parse(raw) : {};
    const { token, supervisorEmail, assessorEmail } = body;
    if (!token) return NextResponse.json({ error: "Missing token" }, { status: 400 });

    const { envId, role } = decodeToken(token);
    const appUrl = process.env.APP_URL || req.nextUrl.origin;

    // Simulate status transitions (mock mode)
    let nextRole = "";
    if (role === "student") nextRole = "supervisor";
    else if (role === "supervisor") nextRole = "assessor";
    else nextRole = "done";

    // Generate next token + URL
    const nextToken = Buffer.from(
      JSON.stringify({ envId, role: nextRole })
    )
      .toString("base64")
      .replace(/\+/g, "-")
      .replace(/\//g, "_");

    const nextUrl =
      nextRole === "done"
        ? `${appUrl}/complete/${envId}`
        : `${appUrl}/e/${nextToken}`;

    // --- Email notifications ---
    if (process.env.RESEND_API_KEY) {
      if (role === "student" && supervisorEmail) {
        await sendNextLinkEmail(supervisorEmail, "supervisor", nextUrl, "AURTTE104");
      }
      if (role === "supervisor" && assessorEmail) {
        await sendNextLinkEmail(assessorEmail, "assessor", nextUrl, "AURTTE104");
      }
    } else {
      console.log("⚠️ RESEND_API_KEY missing — skipping email send.");
    }

    // Mock response
    return NextResponse.json({
      ok: true,
      nextUrl,
      message:
        nextRole === "done"
          ? "All signatures completed."
          : `Next step: ${nextRole}`,
    });
  } catch (e) {
    console.error(e);
    return NextResponse.json(
      { error: "Internal Server Error" },
      { status: 500 }
    );
  }
}
