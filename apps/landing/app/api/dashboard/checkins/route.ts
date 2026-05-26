import { NextResponse } from "next/server";
import { getSession } from "../../../../lib/auth";
import { prisma } from "@firmes/db";

export async function GET() {
  try {
    const session = await getSession();
    if (!session) {
      return NextResponse.json({ error: "Não autenticado" }, { status: 401 });
    }

    const { tenantId } = session;

    // Data de hoje (início e fim do dia)
    const hoje = new Date();
    const inicioDoDia = new Date(hoje.getFullYear(), hoje.getMonth(), hoje.getDate());
    const fimDoDia = new Date(hoje.getFullYear(), hoje.getMonth(), hoje.getDate() + 1);

    // Buscar cultos de hoje
    const cultosHoje = await prisma.culto.findMany({
      where: {
        tenantId,
        data: {
          gte: inicioDoDia,
          lt: fimDoDia,
        },
      },
      select: {
        id: true,
        titulo: true,
      },
    });

    // Buscar check-ins do dia
    const checkinsHoje = await prisma.checkin.count({
      where: {
        tenantId,
        createdAt: {
          gte: inicioDoDia,
          lt: fimDoDia,
        },
      },
    });

    // Buscar check-ins dos últimos 7 dias para comparativo
    const seteDiasAtras = new Date(inicioDoDia);
    seteDiasAtras.setDate(seteDiasAtras.getDate() - 7);

    const checkinsSemanaPassada = await prisma.checkin.count({
      where: {
        tenantId,
        createdAt: {
          gte: seteDiasAtras,
          lt: inicioDoDia,
        },
      },
    });

    // Calcular variação percentual
    const variacao =
      checkinsSemanaPassada > 0
        ? Math.round(((checkinsHoje - checkinsSemanaPassada) / checkinsSemanaPassada) * 100)
        : 0;

    return NextResponse.json({
      checkinsHoje,
      cultosHoje: cultosHoje.length,
      variacao,
      cultos: cultosHoje,
    });
  } catch (error) {
    console.error("[GET /api/dashboard/checkins]", error);
    return NextResponse.json(
      { error: "Erro ao buscar check-ins" },
      { status: 500 }
    );
  }
}
