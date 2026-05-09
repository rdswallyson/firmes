import { NextResponse } from "next/server";
import { getSession } from "../../../../lib/auth";
import { prisma } from "@firmes/db";

export async function GET() {
  try {
    const session = await getSession();
    if (!session?.tenantId) return NextResponse.json({ error: "Não autorizado" }, { status: 401 });

    const [totalCultos, checkins] = await Promise.all([
      prisma.culto.count({ where: { tenantId: session.tenantId } }),
      prisma.checkin.findMany({
        where: { tenantId: session.tenantId, tipo: "MEMBRO" },
        select: { nome: true, memberId: true, cultoId: true,
          culto: { select: { titulo: true, data: true } } },
        orderBy: { createdAt: "desc" },
      }),
    ]);

    const mapa = new Map<string, { nome: string; memberId: string; cultos: { titulo: string; data: string }[]; cultoIds: Set<string> }>();
    for (const c of checkins) {
      const key = c.memberId || c.nome;
      if (!mapa.has(key)) mapa.set(key, { nome: c.nome, memberId: c.memberId || "", cultos: [], cultoIds: new Set() });
      const entry = mapa.get(key)!;
      if (!entry.cultoIds.has(c.cultoId)) {
        entry.cultoIds.add(c.cultoId);
        entry.cultos.push({ titulo: c.culto.titulo, data: c.culto.data.toISOString() });
      }
    }

    const membros = Array.from(mapa.values()).map(m => ({
      nome: m.nome,
      memberId: m.memberId,
      presencas: m.cultoIds.size,
      totalCultos,
      pctPresenca: totalCultos > 0 ? Math.round((m.cultoIds.size / totalCultos) * 100) : 0,
      cultos: m.cultos,
    }));

    return NextResponse.json({ membros });
  } catch (error) {
    console.error("[GET /api/cultos/frequencia]", error);
    return NextResponse.json({ error: "Erro interno" }, { status: 500 });
  }
}
