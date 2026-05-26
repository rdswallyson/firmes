import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@firmes/db";
import bcrypt from "bcryptjs";
import jwt from "jsonwebtoken";

const JWT_SECRET = process.env.PORTAL_JWT_SECRET || process.env.JWT_SECRET || "firmes-portal-secret-key";

export async function POST(req: NextRequest) {
  try {
    const body = await req.json() as { email: string; password: string };
    const { email, password } = body;

    if (!email || !password) {
      return NextResponse.json({ error: "E-mail e senha são obrigatórios" }, { status: 400 });
    }

    // Buscar membro pelo portalEmail
    const member = await prisma.member.findFirst({
      where: {
        portalEmail: email,
        portalStatus: "ATIVO",
        isActive: true,
      },
      include: {
        tenant: {
          select: {
            id: true,
            slug: true,
            name: true,
          },
        },
      },
    });

    if (!member || !member.portalPassword) {
      return NextResponse.json({ error: "Credenciais inválidas" }, { status: 401 });
    }

    // Verificar senha
    const passwordMatch = await bcrypt.compare(password, member.portalPassword);
    if (!passwordMatch) {
      return NextResponse.json({ error: "Credenciais inválidas" }, { status: 401 });
    }

    // Gerar token JWT
    const token = jwt.sign(
      {
        memberId: member.id,
        tenantId: member.tenantId,
        tenantSlug: member.tenant.slug,
        name: member.name,
        email: member.portalEmail,
      },
      JWT_SECRET,
      { expiresIn: "7d" }
    );

    return NextResponse.json({
      token,
      tenantSlug: member.tenant.slug,
      member: {
        id: member.id,
        name: member.name,
        email: member.portalEmail,
      },
    });
  } catch (error) {
    console.error("[POST /api/portal/auth/login]", error);
    return NextResponse.json({ error: "Erro interno" }, { status: 500 });
  }
}
