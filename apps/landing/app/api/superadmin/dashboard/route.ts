import { NextResponse } from "next/server";
import { getSuperAdminSession } from "../../../../lib/auth";
import { prisma } from "@firmes/db";

export async function GET() {
  try {
    const session = await getSuperAdminSession();
    if (!session) return NextResponse.json({ error: "Não autorizado" }, { status: 401 });

    const [totalTenants, activeTenants, totalMembers, totalCultos, totalCheckins, totalEventos] = await Promise.all([
      prisma.tenant.count(),
      prisma.tenant.count({ where: { isActive: true } }),
      prisma.member.count(),
      prisma.culto.count(),
      prisma.checkin.count(),
      prisma.event.count(),
    ]);

    // Tenants por plano
    const tenantsByPlan = await prisma.tenant.groupBy({
      by: ["plan"],
      _count: { plan: true },
    });

    // Tenants inadimplentes (past_due)
    const inadimplentes = await prisma.tenant.count({
      where: { subscriptionStatus: "past_due" },
    });

    // Trial vencendo em 7 dias
    const trialVencendo = await prisma.tenant.count({
      where: {
        trialEndsAt: { lte: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000), gte: new Date() },
      },
    });

    // Revendedores Esmeralda próximos do limite
    const emeraldResellers = await prisma.tenant.findMany({
      where: { plan: { in: ["ESMERALDA_STARTER", "ESMERALDA_PRO", "ESMERALDA_PLUS", "ESMERALDA_ULTRA"] } },
      include: { _count: { select: { churches: true } } },
    });

    const emeraldAlerts = emeraldResellers
      .filter(t => {
        const limit = t.maxChurches;
        const current = t._count.churches;
        return limit > 0 && current >= limit - 2; // alerta quando faltam 2 ou menos
      })
      .map(t => ({
        id: t.id,
        name: t.name,
        plan: t.plan,
        current: t._count.churches,
        limit: t.maxChurches,
      }));

    // Tenants inativos (sem checkin há 30 dias)
    const thirtyDaysAgo = new Date(Date.now() - 30 * 24 * 60 * 60 * 1000);
    const inactiveTenants = await prisma.tenant.findMany({
      where: {
        cultos: { none: { data: { gte: thirtyDaysAgo } } },
      },
      select: { id: true, name: true, plan: true, createdAt: true },
      take: 10,
    });

    return NextResponse.json({
      stats: {
        totalTenants,
        activeTenants,
        totalMembers,
        totalCultos,
        totalCheckins,
        totalEventos,
        inadimplentes,
        trialVencendo,
      },
      tenantsByPlan,
      emeraldAlerts,
      inactiveTenants,
    });
  } catch (error) {
    console.error("[GET /api/superadmin/dashboard]", error);
    return NextResponse.json({ error: "Erro interno" }, { status: 500 });
  }
}
