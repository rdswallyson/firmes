import { SignJWT, jwtVerify } from "jose";
import { cookies } from "next/headers";

let _secret: Uint8Array | null = null;

function getSecret(): Uint8Array {
  if (!_secret) {
    const jwt = process.env.JWT_SECRET || process.env.NEXTAUTH_SECRET;
    if (!jwt) {
      throw new Error("JWT_SECRET ou NEXTAUTH_SECRET nao esta definida nas variaveis de ambiente");
    }
    _secret = new TextEncoder().encode(jwt);
  }
  return _secret;
}

export interface SessionPayload {
  userId: string;
  tenantId: string;
  role: string;
  plan: string;
  isWhiteLabel: boolean;
  memberId?: string;
}

export async function createSession(payload: SessionPayload): Promise<string> {
  return new SignJWT({ ...payload })
    .setProtectedHeader({ alg: "HS256" })
    .setIssuedAt()
    .setExpirationTime("7d")
    .sign(getSecret());
}

export async function verifySession(
  token: string
): Promise<SessionPayload | null> {
  try {
    const { payload } = await jwtVerify(token, getSecret());
    return payload as unknown as SessionPayload;
  } catch {
    return null;
  }
}

export async function getSession(): Promise<SessionPayload | null> {
  const cookieStore = await cookies();
  const token = cookieStore.get("session")?.value;
  if (!token) return null;
  return verifySession(token);
}

// ── Super Admin ──────────────────────────────────────────

export interface SuperAdminPayload {
  isSuperAdmin: true;
  email: string;
}

export async function createSuperAdminSession(email: string): Promise<string> {
  return new SignJWT({ isSuperAdmin: true, email })
    .setProtectedHeader({ alg: "HS256" })
    .setIssuedAt()
    .setExpirationTime("1d")
    .sign(getSecret());
}

export async function verifySuperAdminSession(token: string): Promise<SuperAdminPayload | null> {
  try {
    const { payload } = await jwtVerify(token, getSecret());
    if (payload.isSuperAdmin === true) {
      return { isSuperAdmin: true, email: payload.email as string };
    }
    return null;
  } catch {
    return null;
  }
}

export async function getSuperAdminSession(): Promise<SuperAdminPayload | null> {
  const cookieStore = await cookies();
  const token = cookieStore.get("superadmin_session")?.value;
  if (!token) return null;
  return verifySuperAdminSession(token);
}
