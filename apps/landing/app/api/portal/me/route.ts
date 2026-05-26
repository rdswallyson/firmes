import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@firmes/db";
import jwt from "jsonwebtoken";

const JWT_SECRET = process.env.PORTAL_JWT_SECRET || process.env.JWT_SECRET || "firmes-portal-secret-key";

export async function GET(req: NextRequest) {
  try {
    const authHeader = req.headers.get("Authorization");
    const token = authHeader?.replace("Bearer ", "");

    if (!token) {
      return NextResponse.json({ error: "Não autenticado" }, { status: 401 });
    }

    const decoded = jwt.verify(token, JWT_SECRET) as {
      memberId: string;
      tenantId: string;
      name: string;
      email: string;
    };

    const member = await prisma.member.findFirst({
      where: {
        id: decoded.memberId,
        tenantId: decoded.tenantId,
        isActive: true,
        portalStatus: "ATIVO",
      },
      select: {
        id: true,
        name: true,
        email: true,
        portalEmail: true,
        photo: true,
        phone: true,
        birthDate: true,
        role: true,
        status: true,
        ministerios: true,
        disponibilidadeDias: true,
        disponibilidadeTurnos: true,
        tags: true,
      },
    });

    if (!member) {
      return NextResponse.json({ error: "Membro não encontrado" }, { status: 404 });
    }

    return NextResponse.json({
      member: {
        id: member.id,
        name: member.name,
        email: member.portalEmail || member.email,
        photo: member.photo,
        phone: member.phone,
        birthDate: member.birthDate,
        role: member.role,
        status: member.status,
        ministerios: member.ministerios,
        disponibilidadeDias: member.disponibilidadeDias,
        disponibilidadeTurnos: member.disponibilidadeTurnos,
        tags: member.tags,
      },
    });
  } catch {
    return NextResponse.json({ error: "Token inválido" }, { status: 401 });
  }
}
