import { NextRequest, NextResponse } from "next/server";
import { cookies } from "next/headers";
import { compare } from "bcryptjs";
import { prisma } from "@firmes/db";
import { createSession } from "../../../../lib/auth";
import { isEsmeraldaPlan } from "../../../../lib/plans";
import { Plan } from "@firmes/db";

export async function POST(req: NextRequest) {
  try {
    const body = await req.json() as { email: string; password: string };

    if (!body.email || !body.password) {
      return NextResponse.json(
        { error: "Email e senha são obrigatórios" },
        { status: 400 }
      );
    }

    console.log("[LOGIN] Iniciando login para:", body.email);
    console.log("[LOGIN] JWT_SECRET definido:", !!process.env.JWT_SECRET);
    console.log("[LOGIN] NEXTAUTH_SECRET definido:", !!process.env.NEXTAUTH_SECRET);

    const user = await prisma.user.findUnique({
      where: { email: body.email },
      include: {
        member: {
          select: {
            id: true,
            tenant: {
              select: {
                id: true,
                slug: true,
              },
            },
          },
        },
        tenant: {
          select: {
            id: true,
            name: true,
            slug: true,
            plan: true,
            isWhiteLabel: true,
            isActive: true,
            onboardingCompleted: true,
          },
        },
      },
    });

    if (!user) {
      console.log("[LOGIN] Usuário não encontrado:", body.email);
      return NextResponse.json(
        { error: "Credenciais inválidas" },
        { status: 401 }
      );
    }

    if (!user.isActive) {
      console.log("[LOGIN] Usuário inativo:", body.email);
      return NextResponse.json(
        { error: "Credenciais inválidas" },
        { status: 401 }
      );
    }

    if (!user.tenant?.isActive) {
      console.log("[LOGIN] Tenant inativo:", user.tenantId);
      return NextResponse.json(
        { error: "Credenciais inválidas" },
        { status: 401 }
      );
    }

    console.log("[LOGIN] Usuário encontrado, verificando senha...");

    const passwordMatch = await compare(body.password, user.password);
    if (!passwordMatch) {
      console.log("[LOGIN] Senha incorreta:", body.email);
      return NextResponse.json(
        { error: "Credenciais inválidas" },
        { status: 401 }
      );
    }

    console.log("[LOGIN] Senha correta, criando sessão...");

    const token = await createSession({
      userId: user.id,
      tenantId: user.tenantId,
      role: user.role,
      plan: user.tenant.plan,
      isWhiteLabel: isEsmeraldaPlan(user.tenant.plan as Plan),
      memberId: user.member ? user.member.id : undefined,
    });

    console.log("[LOGIN] Sessão criada com sucesso");

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
        memberId: user.member ? user.member.id : undefined,
        tenant: user.tenant,
      },
    });
  } catch (error: any) {
    console.error("[LOGIN] Erro inesperado:", error.message);
    console.error("[LOGIN] Stack:", error.stack);
    return NextResponse.json(
      { error: "Erro interno no servidor: " + error.message },
      { status: 500 }
    );
  }
}
