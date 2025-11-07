import jwt from "jsonwebtoken";

const secret = process.env.JWT_SECRET!;
export function signToken(payload: object, expiresIn = "7d") {
  return (jwt as any).sign(payload, secret, { expiresIn });
}
export function verifyToken<T = any>(token: string) {
  return (jwt as any).verify(token, secret) as T;
}
