import { NextRequest, NextResponse } from "next/server";
import { cookies } from "next/headers";
import { compare } from "bcryptjs";
import { prisma } from "@firmes/db";
import { createSession } from "../../../../lib/auth";
import { isEsmeraldaPlan } from "../../../../lib/plans";
import { Plan } from "@firmes/db";

export async function POST(req: NextRequest) {
  const body = await req.json() as { email: string; password: string };

  if (!body.email || !body.password) {
    return NextResponse.json(
      { error: "Email e senha são obrigatórios" },
      { status: 400 }
    );
  }

  const user = await prisma.user.findUnique({
    where: { email: body.email },
    include: {
      tenant: {
        select: {
          id: true,
          name: true,
          plan: true,
          isWhiteLabel: true,
          isActive: true,
        },
      },
    },
  });

  if (!user || !user.isActive || !user.tenant.isActive) {
    return NextResponse.json(
      { error: "Credenciais inválidas" },
      { status: 401 }
    );
  }

  const passwordMatch = await compare(body.password, user.password);
  if (!passwordMatch) {
    return NextResponse.json(
      { error: "Credenciais inválidas" },
      { status: 401 }
    );
  }

  const token = await createSession({
    userId: user.id,
    tenantId: user.tenantId,
    role: user.role,
    plan: user.tenant.plan,
    isWhiteLabel: isEsmeraldaPlan(user.tenant.plan as Plan),
  });

  const cookieStore = await cookies();
  cookieStore.set("session", token, {
    httpOnly: true,
    secure: process.env.NODE_ENV === "production",
    sameSite: "lax",
    maxAge: 60 * 60 * 24 * 7,
    path: "/",
  });

  return NextResponse.json({
    user: {
      id: user.id,
      name: user.name,
      email: user.email,
      role: user.role,
      tenant: user.tenant,
    },
  });
}
