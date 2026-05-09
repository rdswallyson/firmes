import { NextRequest, NextResponse } from "next/server";
import { getSession } from "../../../../../lib/auth";
import { prisma } from "@firmes/db";

export async function GET(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const session = await getSession();
  if (!session) return NextResponse.json({ error: "Não autenticado" }, { status: 401 });

  const { id } = await params;
  const { tenantId } = session;

  const grupo = await prisma.group.findFirst({
    where: { id, tenantId },
    include: {
      members: { include: { member: { select: { id: true, name: true, photo: true } } } },
    },
  });
  if (!grupo) return NextResponse.json({ error: "Grupo não encontrado" }, { status: 404 });

  const tresMesesAtras = new Date();
  tresMesesAtras.setMonth(tresMesesAtras.getMonth() - 3);

  const frequencias = await prisma.groupFrequencia.findMany({
    where: { groupId: id, date: { gte: tresMesesAtras } },
    orderBy: { date: "asc" },
  });

  // Stats gerais
  const totalReunioes = frequencias.length;
  const totalPresentes = frequencias.reduce((s, f) => s + f.presentes, 0);
  const totalPossivel = frequencias.reduce((s, f) => s + f.presentes + f.ausentes, 0);
  const mediaPresenca = totalPossivel > 0 ? Math.round((totalPresentes / totalPossivel) * 100) : 0;
  const mediaVisitantes = totalReunioes > 0 ? Math.round(frequencias.reduce((s, f) => s + f.visitantes, 0) / totalReunioes) : 0;

  // Dados para gráfico por mês
  const porMes: Record<string, { mes: string; presentes: number; ausentes: number; visitantes: number; reunioes: number }> = {};
  for (const f of frequencias) {
    const key = new Date(f.date).toLocaleDateString("pt-BR", { month: "short", year: "2-digit" });
    if (!porMes[key]) porMes[key] = { mes: key, presentes: 0, ausentes: 0, visitantes: 0, reunioes: 0 };
    porMes[key].presentes += f.presentes;
    porMes[key].ausentes += f.ausentes;
    porMes[key].visitantes += f.visitantes;
    porMes[key].reunioes += 1;
  }
  const grafico = Object.values(porMes);

  // Membros com baixa presença (estimado proporcional)
  const totalMembros = grupo.members.length;
  const membrosRelatorio = grupo.members.map((gm) => {
    // Estimativa: distribui ausentes proporcionalmente entre membros
    const presencaEstimada = totalReunioes > 0 && totalMembros > 0
      ? Math.round((totalPresentes / (totalReunioes * Math.max(totalMembros, 1))) * 100)
      : 0;
    return {
      id: gm.member.id,
      name: gm.member.name,
      photo: gm.member.photo,
      presencaPercent: presencaEstimada,
    };
  });

  const membrosAtencao = membrosRelatorio.filter((m) => m.presencaPercent < 50);

  return NextResponse.json({
    stats: { totalReunioes, mediaPresenca, mediaVisitantes, totalMembros },
    grafico,
    membrosAtencao,
    frequencias,
  });
}
