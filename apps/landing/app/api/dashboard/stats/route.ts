import { NextResponse } from "next/server";
import { getSession } from "../../../../lib/auth";
import { prisma } from "@firmes/db";

export async function GET() {
  const session = await getSession();

  if (!session) {
    return NextResponse.json({ error: "Não autenticado" }, { status: 401 });
  }

  const { tenantId } = session;

  const members = await prisma.member.count({ where: { tenantId } });
  const groups = await prisma.group.count({ where: { tenantId, isActive: true } });
  const events = await prisma.event.count({
    where: { tenantId, date: { gte: new Date() } },
  });
  const finances = await prisma.finance.aggregate({
    where: { tenantId },
    _sum: { amount: true },
  });
  const receitasAgg = await prisma.finance.aggregate({
    where: { tenantId, type: "RECEITA" },
    _sum: { amount: true },
  });
  const despesasAgg = await prisma.finance.aggregate({
    where: { tenantId, type: "DESPESA" },
    _sum: { amount: true },
  });

  const recentMembers = await prisma.member.findMany({
    where: { tenantId },
    orderBy: { createdAt: "desc" },
    take: 5,
    select: {
      id: true,
      name: true,
      email: true,
      status: true,
      createdAt: true,
    },
  });

  return NextResponse.json({
    totalMembers: members,
    activeGroups: groups,
    upcomingEvents: events,
    totalFinances: finances._sum.amount ?? 0,
    receitas: receitasAgg._sum.amount ?? 0,
    despesas: despesasAgg._sum.amount ?? 0,
    recentMembers,
  });
}
