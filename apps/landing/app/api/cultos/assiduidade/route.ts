import { NextResponse } from "next/server";
import { getSession } from "../../../../lib/auth";
import { prisma } from "@firmes/db";

export async function GET() {
  try {
    const session = await getSession();
    if (!session?.tenantId) return NextResponse.json({ error: "Não autorizado" }, { status: 401 });

    const cultos = await prisma.culto.findMany({
      where: { tenantId: session.tenantId },
      include: { checkins: { select: { tipo: true, nome: true, memberId: true } }, _count: { select: { checkins: true } } },
      orderBy: { data: "asc" },
    });

    const totalCultos = cultos.length;
    if (totalCultos === 0) {
      return NextResponse.json({ totalCultos: 0, mediaPorCulto: 0, tendencia: "estavel", topMembro: null, chartData: [], distribuicao: [] });
    }

    // Chart data
    const chartData = cultos.map(c => ({
      culto: c.titulo.length > 15 ? c.titulo.slice(0, 13) + "…" : c.titulo,
      presentes: c._count.checkins,
    }));

    // Média
    const total = cultos.reduce((acc, c) => acc + c._count.checkins, 0);
    const mediaPorCulto = Math.round(total / totalCultos);

    // Tendência: comparar última metade com primeira metade
    const metade = Math.floor(totalCultos / 2);
    const mediaInicio = cultos.slice(0, metade).reduce((a, c) => a + c._count.checkins, 0) / (metade || 1);
    const mediaFim = cultos.slice(metade).reduce((a, c) => a + c._count.checkins, 0) / (cultos.slice(metade).length || 1);
    const tendencia = mediaFim > mediaInicio * 1.05 ? "subindo" : mediaFim < mediaInicio * 0.95 ? "descendo" : "estavel";

    // Top membro (mais presenças)
    const mapaPresencas = new Map<string, { nome: string; count: number }>();
    for (const c of cultos) {
      for (const ch of c.checkins) {
        if (ch.tipo !== "MEMBRO") continue;
        const key = ch.memberId || ch.nome;
        mapaPresencas.set(key, { nome: ch.nome, count: (mapaPresencas.get(key)?.count || 0) + 1 });
      }
    }
    let topMembro: { nome: string; pct: number } | null = null;
    let maxPres = 0;
    for (const [, v] of mapaPresencas) {
      if (v.count > maxPres) { maxPres = v.count; topMembro = { nome: v.nome, pct: Math.round((v.count / totalCultos) * 100) }; }
    }

    // Distribuição por faixa de frequência
    const valores = Array.from(mapaPresencas.values()).map(v => Math.round((v.count / totalCultos) * 100));
    const faixas = [
      { faixa: "75–100% (Assíduo)", min: 75, max: 100 },
      { faixa: "50–74% (Regular)", min: 50, max: 74 },
      { faixa: "25–49% (Irregular)", min: 25, max: 49 },
      { faixa: "0–24% (Raro)", min: 0, max: 24 },
    ];
    const distribuicao = faixas.map(f => {
      const count = valores.filter(v => v >= f.min && v <= f.max).length;
      return { faixa: f.faixa, count, pct: valores.length > 0 ? Math.round((count / valores.length) * 100) : 0 };
    });

    return NextResponse.json({ totalCultos, mediaPorCulto, tendencia, topMembro, chartData, distribuicao });
  } catch (error) {
    console.error("[GET /api/cultos/assiduidade]", error);
    return NextResponse.json({ error: "Erro interno" }, { status: 500 });
  }
}
