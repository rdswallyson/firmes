import { NextRequest, NextResponse } from "next/server";
import { jwtVerify } from "jose";

let _secret: Uint8Array | null = null;

function getSecret(): Uint8Array {
  if (!_secret) {
    const jwt = process.env.JWT_SECRET || process.env.NEXTAUTH_SECRET;
    if (!jwt) {
      throw new Error("JWT_SECRET nao esta definida nas variaveis de ambiente");
    }
    _secret = new TextEncoder().encode(jwt);
  }
  return _secret;
}

const PUBLIC_PATHS = [
  "/",
  "/api",
  "/login",
  "/portal",
  "/portal/login",
  "/api/portal/auth/login",
  "/api/portal/me",
  "/superadmin",
  "/api/superadmin/login",
  "/api/auth/login",
  "/api/auth/register",
  "/api/checkin",
  "/api/cultos",
  "/api/webhooks/stripe",
  "/cadastro",
  "/checkin",
  "/inscricao",
  "/loja",
  "/em-breve",
  "/plano-expirado",
];

async function verifySuperAdmin(token: string): Promise<boolean> {
  try {
    const { payload } = await jwtVerify(token, getSecret());
    return payload.isSuperAdmin === true;
  } catch {
    return false;
  }
}

export async function proxy(req: NextRequest) {
  const { pathname } = req.nextUrl;

  // ── Super Admin routes ─────────────────────────────────
  if (pathname.startsWith("/superadmin/") || pathname.startsWith("/api/superadmin/")) {
    if (pathname === "/api/superadmin/login" || pathname === "/superadmin") return NextResponse.next();
    const token = req.cookies.get("superadmin_session")?.value;
    if (!token || !(await verifySuperAdmin(token))) {
      if (pathname.startsWith("/api/")) {
        return NextResponse.json({ error: "Não autorizado" }, { status: 401 });
      }
      return NextResponse.redirect(new URL("/superadmin", req.url));
    }
    return NextResponse.next();
  }

  // ── Public routes ──────────────────────────────────────
  if (PUBLIC_PATHS.some((p) => pathname === p || pathname.startsWith(p + "/"))) {
    return NextResponse.next();
  }

  // ── Tenant routes (protected by session cookie) ────────
  const token = req.cookies.get("session")?.value;

  if (!token) {
    return NextResponse.redirect(new URL("/login", req.url));
  }

  let payload: {
    userId: string;
    tenantId: string;
    role: string;
    plan: string;
    isWhiteLabel: boolean;
  };

  try {
    const result = await jwtVerify(token, getSecret());
    payload = result.payload as typeof payload;
  } catch {
    return NextResponse.redirect(new URL("/login", req.url));
  }

  const requestedTenantId = req.headers.get("x-tenant-id");
  if (requestedTenantId && requestedTenantId !== payload.tenantId) {
    return new NextResponse(
      JSON.stringify({ error: "Acesso negado entre tenants" }),
      { status: 403, headers: { "Content-Type": "application/json" } }
    );
  }

  if (pathname.startsWith("/white-label")) {
    if (!payload.isWhiteLabel) {
      return new NextResponse(
        JSON.stringify({ error: "Plano Esmeralda necessário para acessar esta área" }),
        { status: 403, headers: { "Content-Type": "application/json" } }
      );
    }
  }

  // ── MEMBRO: pode acessar /portal*, mas não /dashboard ──
  if (payload.role === "MEMBRO" && pathname.startsWith("/dashboard")) {
    return NextResponse.redirect(new URL("/portal", req.url));
  }

  const requestHeaders = new Headers(req.headers);
  requestHeaders.set("x-tenant-id", payload.tenantId);
  requestHeaders.set("x-user-id", payload.userId);
  requestHeaders.set("x-user-role", payload.role);

  return NextResponse.next({
    request: { headers: requestHeaders },
  });
}

export const config = {
  matcher: [
    "/((?!_next/static|_next/image|favicon.ico|.*\\.png|.*\\.svg).*)",
  ],
};
