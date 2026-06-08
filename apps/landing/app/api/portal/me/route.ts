import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@firmes/db";
import { getSession } from "../../../../lib/auth";

export async function GET(req: NextRequest) {
  try {
    const session = await getSession();

    if (!session) {
      return NextResponse.json({ error: "Não autenticado" }, { status: 401 });
    }

    // MEMBRO loga via cookie 'session' → buscar dados pelo linked member
    if (session.role === "MEMBRO" && session.memberId) {
      const member = await prisma.member.findFirst({
        where: {
          id: session.memberId,
          tenantId: session.tenantId,
          isActive: true,
        },
        select: {
          id: true,
          name: true,
          email: true,
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
          email: member.email,
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
    }

    // ADMIN ou qualquer outro — retornar user atual com linked member
    const user = await prisma.user.findUnique({
      where: { id: session.userId },
      include: {
        member: {
          select: {
            id: true,
            name: true,
            email: true,
            photo: true,
            phone: true,
            birthDate: true,
            role: true,
            status: true,
          },
        },
      },
    });

    if (!user) {
      return NextResponse.json({ error: "Usuário não encontrado" }, { status: 404 });
    }

    return NextResponse.json({
      user: {
        id: user.id,
        name: user.name,
        email: user.email,
        role: user.role,
        member: user.member,
      },
    });
  } catch {
    return NextResponse.json({ error: "Erro interno" }, { status: 500 });
  }
}

export const revalidate = 0;
