import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@firmes/db";

// Este endpoint será chamado pelo Vercel Cron Job (dia 1 de janeiro, 8h)
// Configurar no vercel.json: "crons": [{ "path": "/api/cron/relatorio-anual", "schedule": "0 8 1 1 *" }]

export async function GET(req: NextRequest) {
  try {
    // Verificar autorização (header secreto)
    const authHeader = req.headers.get("authorization");
    if (authHeader !== `Bearer ${process.env.CRON_SECRET}`) {
      return NextResponse.json({ error: "Não autorizado" }, { status: 401 });
    }

    const year = new Date().getFullYear() - 1; // Ano anterior
    const startOfYear = new Date(year, 0, 1);
    const endOfYear = new Date(year, 11, 31, 23, 59, 59);

    const tenants = await prisma.tenant.findMany({
      where: { isActive: true },
      include: {
        users: { take: 1 },
        members: true,
        finances: { where: { createdAt: { gte: startOfYear, lte: endOfYear } } },
        events: { where: { createdAt: { gte: startOfYear, lte: endOfYear } } },
        groups: { include: { _count: { select: { members: true } } } },
      },
    });

    const results = [];

    for (const tenant of tenants) {
      const totalMembers = tenant.members.length;
      const totalFinances = tenant.finances.reduce((sum, f) => sum + (f.amount || 0), 0);
      const totalEvents = tenant.events.length;
      const activeGroups = tenant.groups.length;

      // TODO: Gerar PDF com @react-pdf/renderer e enviar via Resend
      results.push({
        tenantId: tenant.id,
        tenantName: tenant.name,
        year,
        totalMembers,
        totalFinances,
        totalEvents,
        activeGroups,
      });
    }

    return NextResponse.json({
      success: true,
      generated: results.length,
      year,
      reports: results,
    });
  } catch (error) {
    console.error("[GET /api/cron/relatorio-anual]", error);
    return NextResponse.json({ error: "Erro ao gerar relatórios" }, { status: 500 });
  }
}
