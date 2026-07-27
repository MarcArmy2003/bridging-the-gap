import jwt from "jsonwebtoken";
import { UserRole } from "@prisma/client";

export interface MobileAuthPayload {
  sub: string;
  role: UserRole;
}

const JWT_ISSUER = "btg-backend";

function getJwtSecret() {
  const secret = process.env.MOBILE_JWT_SECRET || process.env.NEXTAUTH_SECRET;
  if (!secret) {
    throw new Error("Missing MOBILE_JWT_SECRET or NEXTAUTH_SECRET");
  }
  return secret;
}

export function signMobileToken(payload: MobileAuthPayload) {
  const secret = getJwtSecret();
  return jwt.sign(payload, secret, {
    expiresIn: "7d",
    issuer: JWT_ISSUER,
  });
}

export function verifyMobileToken(token: string): MobileAuthPayload {
  const secret = getJwtSecret();
  const decoded = jwt.verify(token, secret, {
    issuer: JWT_ISSUER,
  });

  return decoded as MobileAuthPayload;
}

export function getBearerToken(authHeader: string | null) {
  if (!authHeader) return null;
  const [type, token] = authHeader.split(" ");
  if (type !== "Bearer" || !token) return null;
  return token;
}