import { NextRequest, NextResponse } from "next/server";
import { getSession } from "../../../../lib/auth";
import { prisma } from "@firmes/db";

export async function GET(request: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  try {
    const session = await getSession();
    if (!session?.tenantId) return NextResponse.json({ error: "Não autorizado" }, { status: 401 });

    const { id } = await params;
    const escala = await prisma.escala.findFirst({
      where: { id, tenantId: session.tenantId },
      include: {
        membros: {
          include: { member: { select: { id: true, name: true, photo: true, phone: true, email: true } } },
          orderBy: { createdAt: "asc" },
        },
        _count: { select: { membros: true } },
      },
    });

    if (!escala) return NextResponse.json({ error: "Escala não encontrada" }, { status: 404 });
    return NextResponse.json({ escala });
  } catch (error) {
    console.error("[GET /api/escalas/[id]]", error);
    return NextResponse.json({ error: "Erro interno" }, { status: 500 });
  }
}

export async function PUT(request: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  try {
    const session = await getSession();
    if (!session?.tenantId) return NextResponse.json({ error: "Não autorizado" }, { status: 401 });

    const { id } = await params;
    const body = await request.json();
    const { titulo, data, ministerio, observacoes, status, membros } = body;

    const exists = await prisma.escala.findFirst({ where: { id, tenantId: session.tenantId } });
    if (!exists) return NextResponse.json({ error: "Escala não encontrada" }, { status: 404 });

    // Atualiza dados básicos
    const updated = await prisma.escala.update({
      where: { id },
      data: {
        titulo,
        data: data ? new Date(data) : undefined,
        ministerio,
        observacoes: observacoes ?? undefined,
        status: status ?? undefined,
      },
    });

    // Se enviou membros, recria a lista
    if (Array.isArray(membros)) {
      await prisma.escalaMembro.deleteMany({ where: { escalaId: id } });
      if (membros.length > 0) {
        await prisma.escalaMembro.createMany({
          data: membros.map((m: any) => ({
            escalaId: id,
            memberId: m.memberId,
            funcao: m.funcao || "Participante",
            status: m.status || "PENDENTE",
          })),
        });
      }
    }

    return NextResponse.json({ escala: updated });
  } catch (error) {
    console.error("[PUT /api/escalas/[id]]", error);
    return NextResponse.json({ error: "Erro interno" }, { status: 500 });
  }
}

export async function DELETE(request: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  try {
    const session = await getSession();
    if (!session?.tenantId) return NextResponse.json({ error: "Não autorizado" }, { status: 401 });

    const { id } = await params;
    const exists = await prisma.escala.findFirst({ where: { id, tenantId: session.tenantId } });
    if (!exists) return NextResponse.json({ error: "Escala não encontrada" }, { status: 404 });

    await prisma.escala.delete({ where: { id } });
    return NextResponse.json({ success: true });
  } catch (error) {
    console.error("[DELETE /api/escalas/[id]]", error);
    return NextResponse.json({ error: "Erro interno" }, { status: 500 });
  }
}
