// lib/jwt.ts
import { SignJWT, jwtVerify, JWTPayload } from "jose";
import crypto from "crypto";

const secret = new TextEncoder().encode(
  process.env.NEXTAUTH_SECRET ||
    "development-secret-key-minimum-32-characters-long"
);

interface TokenPayload extends JWTPayload {
  id: string; 
  email: string;
  name: string;
  role: string;
  hasAccess?: boolean;
}

// Short-lived access token (15 minutes)
export async function signAccessToken(payload: TokenPayload): Promise<string> {
  return await new SignJWT(payload)
    .setProtectedHeader({ alg: "HS256" })
    .setIssuedAt()
    .setExpirationTime("15m")
    .sign(secret);
}

// Long-lived session token (for NextAuth - 30 days)
export async function signJWT(payload: TokenPayload): Promise<string> {
  return await new SignJWT(payload)
    .setProtectedHeader({ alg: "HS256" })
    .setIssuedAt()
    .setExpirationTime("30d")
    .sign(secret);
}

// Verify any JWT token
export async function verifyJWT(token: string): Promise<JWTPayload | null> {
  try {
    const verified = await jwtVerify(token, secret);
    return verified.payload;
  } catch (error) {
    if (error instanceof Error) {
      console.error("JWT verification failed:", error.message);
    }
    return null;
  }
}

// Check if token is expired
export async function isTokenExpired(token: string): Promise<boolean> {
  try {
    await jwtVerify(token, secret);
    return false;
  } catch (error) {
    if (error instanceof Error && "code" in error && error.code === "ERR_JWT_EXPIRED") {
      return true;
    }
    return true;
  }
}
