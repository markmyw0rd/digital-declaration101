// lib/jwt.ts
import jwt from "jsonwebtoken";

const SECRET = process.env.JWT_SECRET || "development-secret";

export function signToken(payload: object) {
  return jwt.sign(payload, SECRET, { expiresIn: "7d" });
}

export async function verifyToken(token: string) {
  try {
    return jwt.verify(token, SECRET) as { id: string; role: string };
  } catch {
    return null;
  }
}

// (optional alias for backwards compatibility)
export const verifyLinkToken = verifyToken;
