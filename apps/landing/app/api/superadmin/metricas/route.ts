import { NextResponse } from "next/server";
import { getSuperAdminSession } from "../../../../lib/auth";
import { prisma } from "@firmes/db";

export async function GET() {
  try {
    const session = await getSuperAdminSession();
    if (!session) return NextResponse.json({ error: "Não autorizado" }, { status: 401 });

    const tenants = await prisma.tenant.findMany({
      select: {
        id: true,
        name: true,
        plan: true,
        isActive: true,
        createdAt: true,
        _count: {
          select: { members: true, cultos: true, events: true, checkins: true, finances: true },
        },
      },
    });

    const thirtyDaysAgo = new Date(Date.now() - 30 * 24 * 60 * 60 * 1000);

    const metrics = await Promise.all(
      tenants.map(async (t) => {
        const recentCheckins = await prisma.checkin.count({
          where: { tenantId: t.id, createdAt: { gte: thirtyDaysAgo } },
        });
        const recentEvents = await prisma.event.count({
          where: { tenantId: t.id, date: { gte: thirtyDaysAgo } },
        });
        const recentCultos = await prisma.culto.count({
          where: { tenantId: t.id, data: { gte: thirtyDaysAgo } },
        });
        const recentFinances = await prisma.finance.count({
          where: { tenantId: t.id, createdAt: { gte: thirtyDaysAgo } },
        });

        // Score: 0-100
        // membros (max 30) + checkins recentes (max 25) + eventos (max 15) + cultos (max 15) + financas (max 15)
        const memberScore = Math.min(t._count.members * 0.5, 30);
        const checkinScore = Math.min(recentCheckins * 2, 25);
        const eventScore = Math.min(recentEvents * 5, 15);
        const cultoScore = Math.min(recentCultos * 5, 15);
        const financeScore = Math.min(recentFinances * 3, 15);
        const score = Math.round(memberScore + checkinScore + eventScore + cultoScore + financeScore);

        let status = "INATIVO";
        let statusColor = "#DC2626";
        if (score >= 80) { status = "MUITO ATIVO"; statusColor = "#16A34A"; }
        else if (score >= 50) { status = "MODERADO"; statusColor = "#CA8A04"; }
        else if (score >= 20) { status = "BAIXO"; statusColor = "#EA580C"; }

        return {
          id: t.id,
          name: t.name,
          plan: t.plan,
          isActive: t.isActive,
          score,
          status,
          statusColor,
          members: t._count.members,
          checkins: t._count.checkins,
          events: t._count.events,
          cultos: t._count.cultos,
          recentCheckins,
          recentEvents,
          recentCultos,
          recentFinances,
        };
      })
    );

    metrics.sort((a, b) => b.score - a.score);

    return NextResponse.json({ metrics });
  } catch (error) {
    console.error("[GET /api/superadmin/metricas]", error);
    return NextResponse.json({ error: "Erro interno" }, { status: 500 });
  }
}
