import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@firmes/db";
import bcrypt from "bcryptjs";

export async function POST(req: NextRequest) {
  try {
    const body = await req.json() as {
      name: string;
      email?: string;
      phone?: string;
      portalEmail?: string;
      portalPassword?: string;
      portalStatus?: string;
      status?: string;
    };

    if (!body.name) {
      return NextResponse.json({ error: "Nome é obrigatório" }, { status: 400 });
    }

    // Hash da senha se fornecida
    let hashedPassword: string | undefined;
    if (body.portalPassword) {
      hashedPassword = await bcrypt.hash(body.portalPassword, 10);
    }

    // Criar membro com status PENDENTE
    const member = await prisma.member.create({
      data: {
        tenantId: "default", // Será atualizado pelo admin ao aprovar
        name: body.name,
        email: body.email,
        phone: body.phone,
        status: body.status || "PENDING",
        portalEmail: body.portalEmail || body.email,
        portalPassword: hashedPassword,
        portalStatus: body.portalStatus || "PENDENTE",
      },
    });

    // TODO: Enviar notificação para admin
    // TODO: Incrementar contador de notificações

    return NextResponse.json({ member });
  } catch (error) {
    console.error("[POST /api/members/public-register]", error);
    return NextResponse.json({ error: "Erro ao cadastrar" }, { status: 500 });
  }
}
