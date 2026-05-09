import { NextResponse } from "next/server";
import { getSession } from "../../../../lib/auth";
import { prisma } from "@firmes/db";

export async function GET() {
  try {
    const session = await getSession();
    if (!session?.tenantId) return NextResponse.json({ error: "Não autorizado" }, { status: 401 });

    // Busca todos os cultos e todos os check-ins de membros
    const [cultos, checkins] = await Promise.all([
      prisma.culto.findMany({ where: { tenantId: session.tenantId }, select: { id: true, data: true } }),
      prisma.checkin.findMany({
        where: { tenantId: session.tenantId, tipo: "MEMBRO" },
        select: { nome: true, memberId: true, telefone: true, cultoId: true, createdAt: true,
          culto: { select: { titulo: true, data: true } } },
        orderBy: { createdAt: "desc" },
      }),
    ]);

    const totalCultos = cultos.length;

    // Agrupa presenças por membro
    const mapa = new Map<string, { nome: string; memberId: string; telefone?: string; presencas: Set<string>; ultimaPresenca: Date | null; cultos: any[] }>();
    for (const c of checkins) {
      const key = c.memberId || c.nome;
      if (!mapa.has(key)) {
        mapa.set(key, { nome: c.nome, memberId: c.memberId || "", telefone: c.telefone || undefined, presencas: new Set(), ultimaPresenca: null, cultos: [] });
      }
      const entry = mapa.get(key)!;
      entry.presencas.add(c.cultoId);
      entry.cultos.push(c.culto);
      if (!entry.ultimaPresenca || new Date(c.createdAt) > entry.ultimaPresenca) {
        entry.ultimaPresenca = new Date(c.createdAt);
      }
    }

    const membros = Array.from(mapa.values()).map(m => {
      const presencas = m.presencas.size;
      const faltas = Math.max(0, totalCultos - presencas);
      const pctFaltas = totalCultos > 0 ? Math.round((faltas / totalCultos) * 100) : 0;
      return { nome: m.nome, memberId: m.memberId, telefone: m.telefone, totalCultos, presencas, faltas, pctFaltas, ultimaPresenca: m.ultimaPresenca };
    });

    return NextResponse.json({ membros });
  } catch (error) {
    console.error("[GET /api/cultos/faltas]", error);
    return NextResponse.json({ error: "Erro interno" }, { status: 500 });
  }
}
