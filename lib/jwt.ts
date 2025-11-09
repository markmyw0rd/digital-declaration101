// lib/jwt.ts
import { SignJWT, jwtVerify } from "jose";

/**
 * Keep this secret safe. Set it in Vercel → Project → Settings → Environment Variables.
 * Example (generate once): openssl rand -hex 32
 */
const secret = new TextEncoder().encode(process.env.JWT_SECRET!);

export type LinkPayload = {
  id: string; // envelope id
  role: "student" | "supervisor" | "assessor";
};

/** Create a compact URL-safe token for /e/[token] links */
export async function signLinkToken(
  payload: LinkPayload,
  ttl: string = "7d"
): Promise<string> {
  return await new SignJWT(payload)
    .setProtectedHeader({ alg: "HS256", typ: "JWT" })
    .setIssuedAt()
    .setExpirationTime(ttl)
    .sign(secret);
}

/** Verify a /e/[token] link. Returns {id, role} or null */
export async function verifyToken(token: string): Promise<LinkPayload | null> {
  try {
    const { payload } = await jwtVerify(token, secret);
    const id = payload.id as string | undefined;
    const role = payload.role as LinkPayload["role"] | undefined;
    if (!id || !role) return null;
    return { id, role };
  } catch {
    return null;
  }
}
