import { NextRequest, NextResponse } from "next/server";
import { getSession } from "../../../../lib/auth";
import { prisma } from "@firmes/db";

export async function GET(request: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  try {
    const { id } = await params;
    const session = await getSession();
    if (!session?.tenantId) return NextResponse.json({ error: "Não autorizado" }, { status: 401 });

    const checkins = await prisma.checkin.findMany({
      where: { cultoId: id, tenantId: session.tenantId },
      orderBy: { createdAt: "desc" },
    });

    const membros = checkins.filter(c => c.tipo === "MEMBRO");
    const visitantes = checkins.filter(c => c.tipo === "VISITANTE");

    return NextResponse.json({ checkins, membros, visitantes, total: checkins.length });
  } catch (error) {
    return NextResponse.json({ error: "Erro interno" }, { status: 500 });
  }
}
