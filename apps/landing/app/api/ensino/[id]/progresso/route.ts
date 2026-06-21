import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@firmes/db";
import { getSession } from "../../../../../lib/auth";

// POST - mark aula as completed
export async function POST(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id: cursoId } = await params;
  try {
    const session = await getSession();
    if (!session?.userId) {
      return NextResponse.json({ error: "Não autorizado" }, { status: 401 });
    }

    const body = await request.json();
    const { aulaId, memberId: requestedMemberId } = body;
    if (!aulaId) {
      return NextResponse.json({ error: "aulaId obrigatorio" }, { status: 400 });
    }

    // Resolver memberId: body > session.memberId > lookup por userId
    let memberId = requestedMemberId || session.memberId || null;
    if (!memberId) {
      const member = await prisma.member.findFirst({
        where: { user: { id: session.userId } },
        select: { id: true },
      });
      memberId = member?.id || null;
    }
    if (!memberId) {
      return NextResponse.json({ error: "memberId obrigatorio" }, { status: 400 });
    }

    const progresso = await prisma.cursoProgresso.upsert({
      where: { cursoId_aulaId_memberId: { cursoId, aulaId, memberId } },
      create: { cursoId, aulaId, memberId, concluido: true },
      update: { concluido: true, dataHora: new Date() },
    });

    const curso = await prisma.curso.findUnique({
      where: { id: cursoId },
      include: { modulos: { include: { aulas: true } } },
    });
    const totalAulas = curso?.modulos.reduce((acc, m) => acc + m.aulas.length, 0) ?? 0;
    const concluidas = await prisma.cursoProgresso.count({
      where: { cursoId, memberId, concluido: true },
    });
    const percentual = totalAulas > 0 ? Math.round((concluidas / totalAulas) * 100) : 0;

    // Se concluiu 100%, gerar certificado automaticamente (se ainda nao existir)
    let certificado = null;
    if (percentual === 100 && curso) {
      const existente = await prisma.certificado.findFirst({
        where: { cursoId, memberId, deletedAt: null },
      });
      if (!existente) {
        const codigo = `CERT-${Date.now()}-${Math.random().toString(36).substring(2, 7).toUpperCase()}`;
        certificado = await prisma.certificado.create({
          data: {
            tenantId: session.tenantId,
            cursoId,
            memberId,
            codigo,
          },
        });
      } else {
        certificado = existente;
      }
    }

    return NextResponse.json({ progresso, percentual, concluidas, totalAulas, certificado });
  } catch (error) {
    console.error("[POST /api/ensino/id/progresso] ERROR:", error);
    return NextResponse.json({ error: "Erro interno" }, { status: 500 });
  }
}

// GET - get progress for a member
export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id: cursoId } = await params;
  const { searchParams } = new URL(request.url);
  const memberId = searchParams.get("memberId");
  if (!memberId) return NextResponse.json({ error: "memberId obrigatorio" }, { status: 400 });

  try {
    const progressos = await prisma.cursoProgresso.findMany({
      where: { cursoId, memberId },
    });

    const curso = await prisma.curso.findUnique({
      where: { id: cursoId },
      include: { modulos: { include: { aulas: true } } },
    });
    const totalAulas = curso?.modulos.reduce((acc, m) => acc + m.aulas.length, 0) ?? 0;
    const concluidas = progressos.filter(p => p.concluido).length;
    const percentual = totalAulas > 0 ? Math.round((concluidas / totalAulas) * 100) : 0;

    return NextResponse.json({ progressos, percentual, concluidas, totalAulas });
  } catch (error) {
    console.error("[GET /api/ensino/id/progresso]", error);
    return NextResponse.json({ error: "Erro interno" }, { status: 500 });
  }
}
