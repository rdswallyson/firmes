import { NextResponse } from "next/server";
import { getSession } from "../../../../lib/auth";
import { prisma } from "@firmes/db";

export async function GET() {
  const session = await getSession();
  if (!session) return NextResponse.json({ error: "Não autenticado" }, { status: 401 });

  const { tenantId } = session;

  // Get recent activities from different sources
  const activities: { icon: string; desc: string; time: string; color: string }[] = [];

  // Recent members
  const recentMembers = await prisma.member.findMany({
    where: { tenantId },
    orderBy: { createdAt: "desc" },
    take: 3,
    select: { name: true, createdAt: true },
  });

  recentMembers.forEach((m) => {
    const diff = Date.now() - new Date(m.createdAt).getTime();
    const hours = Math.floor(diff / 3600000);
    const time = hours < 1 ? "Agora" : hours < 24 ? `${hours}h` : `${Math.floor(hours / 24)}d`;
    activities.push({
      icon: "Users",
      desc: `Novo membro: ${m.name}`,
      time,
      color: "#1A3C6E",
    });
  });

  // Recent finances
  const recentFinances = await prisma.finance.findMany({
    where: { tenantId, type: "INCOME" },
    orderBy: { date: "desc" },
    take: 2,
    select: { amount: true, date: true },
  });

  recentFinances.forEach((f) => {
    const diff = Date.now() - new Date(f.date).getTime();
    const hours = Math.floor(diff / 3600000);
    const time = hours < 1 ? "Agora" : hours < 24 ? `${hours}h` : `${Math.floor(hours / 24)}d`;
    activities.push({
      icon: "DollarSign",
      desc: `Entrada: R$ ${f.amount.toLocaleString("pt-BR")}`,
      time,
      color: "#16A34A",
    });
  });

  // Recent events
  const recentEvents = await prisma.event.findMany({
    where: { tenantId },
    orderBy: { createdAt: "desc" },
    take: 2,
    select: { title: true, createdAt: true },
  });

  recentEvents.forEach((e) => {
    const diff = Date.now() - new Date(e.createdAt).getTime();
    const hours = Math.floor(diff / 3600000);
    const time = hours < 1 ? "Agora" : hours < 24 ? `${hours}h` : `${Math.floor(hours / 24)}d`;
    activities.push({
      icon: "Calendar",
      desc: `Evento: ${e.title.slice(0, 25)}${e.title.length > 25 ? "..." : ""}`,
      time,
      color: "#7C3AED",
    });
  });

  // Sort by time (most recent first)
  activities.sort((a, b) => {
    const getMinutes = (t: string) => {
      if (t === "Agora") return 0;
      if (t.endsWith("h")) return parseInt(t) * 60;
      if (t.endsWith("d")) return parseInt(t) * 1440;
      return 9999;
    };
    return getMinutes(a.time) - getMinutes(b.time);
  });

  return NextResponse.json({ activities: activities.slice(0, 6) });
}
