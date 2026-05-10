import { NextRequest, NextResponse } from "next/server";
import { getSession } from "../../../lib/auth";
import { prisma } from "@firmes/db";

export async function GET() {
  try {
    const session = await getSession();
    if (!session?.tenantId) return NextResponse.json({ error: "Não autorizado" }, { status: 401 });

    const escalas = await prisma.escala.findMany({
      where: { tenantId: session.tenantId },
      include: {
        membros: { include: { member: { select: { id: true, name: true, photo: true, phone: true } } } },
        _count: { select: { membros: true } },
      },
      orderBy: { data: "desc" },
    });
    return NextResponse.json({ escalas });
  } catch (error) {
    console.error("[GET /api/escalas]", error);
    return NextResponse.json({ error: "Erro interno" }, { status: 500 });
  }
}

export async function POST(request: NextRequest) {
  try {
    const session = await getSession();
    if (!session?.tenantId) return NextResponse.json({ error: "Não autorizado" }, { status: 401 });

    const body = await request.json();
    const { titulo, data, ministerio, observacoes, membros } = body;
    if (!titulo || !data || !ministerio) return NextResponse.json({ error: "Campos obrigatórios" }, { status: 400 });

    const escala = await prisma.escala.create({
      data: {
        tenantId: session.tenantId,
        titulo,
        data: new Date(data),
        ministerio,
        observacoes: observacoes || null,
        membros: {
          create: (membros || []).map((m: any) => ({
            memberId: m.memberId,
            funcao: m.funcao || "Participante",
          })),
        },
      },
      include: { membros: { include: { member: { select: { name: true } } } } },
    });

    return NextResponse.json({ escala }, { status: 201 });
  } catch (error) {
    console.error("[POST /api/escalas]", error);
    const msg = error instanceof Error ? error.message : "Erro interno";
    return NextResponse.json({ error: msg }, { status: 500 });
  }
}
