// lib/jwt.ts
import { SignJWT, jwtVerify } from "jose";

const raw = process.env.JWT_SECRET;
if (!raw) {
  // Fail fast so we never sign with "dev-secret" locally by accident
  throw new Error("JWT_SECRET is not set. Add it in .env and Vercel settings.");
}
const secret = new TextEncoder().encode(raw);
const ALG = "HS256";

export type LinkPayload = {
  id: string;
  role: "student" | "supervisor" | "assessor";
};

export async function signLinkToken(payload: LinkPayload) {
  return new SignJWT(payload)
    .setProtectedHeader({ alg: ALG })
    .setExpirationTime("7d")
    .sign(secret);
}

export async function verifyToken(token: string): Promise<LinkPayload | null> {
  try {
    const { payload } = await jwtVerify(token, secret);
    // Basic shape check
    if (
      typeof payload?.id === "string" &&
      (payload as any).role &&
      ["student", "supervisor", "assessor"].includes(String((payload as any).role))
    ) {
      return payload as LinkPayload;
    }
    return null;
  } catch {
    return null;
  }
}
