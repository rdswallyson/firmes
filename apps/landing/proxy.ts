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

const PUBLIC_PATHS = ["/", "/api", "/login"];

export async function proxy(req: NextRequest) {
  const { pathname } = req.nextUrl;

  if (PUBLIC_PATHS.some((p) => pathname === p || pathname.startsWith(p + "/"))) {
    return NextResponse.next();
  }

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
