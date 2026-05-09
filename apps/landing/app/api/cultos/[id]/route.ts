import { NextRequest, NextResponse } from "next/server";
import { getSession } from "../../../../lib/auth";
import { prisma } from "@firmes/db";

export async function GET(request: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  try {
    const { id } = await params;
    const session = await getSession();
    if (!session?.tenantId) return NextResponse.json({ error: "Não autorizado" }, { status: 401 });

    const culto = await prisma.culto.findFirst({
      where: { id, tenantId: session.tenantId },
      include: {
        checkins: { orderBy: { createdAt: "desc" } },
        _count: { select: { checkins: true } },
      },
    });

    if (!culto) return NextResponse.json({ error: "Culto não encontrado" }, { status: 404 });

    const membros = culto.checkins.filter(c => c.tipo === "MEMBRO");
    const visitantes = culto.checkins.filter(c => c.tipo === "VISITANTE");

    return NextResponse.json({ culto, membros, visitantes });
  } catch (error) {
    console.error("[GET /api/cultos/[id]]", error);
    return NextResponse.json({ error: "Erro interno" }, { status: 500 });
  }
}

export async function DELETE(request: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  try {
    const { id } = await params;
    const session = await getSession();
    if (!session?.tenantId) return NextResponse.json({ error: "Não autorizado" }, { status: 401 });

    await prisma.culto.delete({ where: { id } });
    return NextResponse.json({ ok: true });
  } catch (error) {
    return NextResponse.json({ error: "Erro interno" }, { status: 500 });
  }
}
