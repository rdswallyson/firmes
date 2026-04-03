import { NextRequest, NextResponse } from "next/server";
import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();

// POST - mark aula as completed
export async function POST(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id: cursoId } = await params;
  try {
    const body = await request.json();
    const { aulaId, memberId } = body;
    if (!aulaId || !memberId) {
      return NextResponse.json({ error: "aulaId e memberId obrigatorios" }, { status: 400 });
    }

    const progresso = await prisma.cursoProgresso.upsert({
      where: { cursoId_aulaId_memberId: { cursoId, aulaId, memberId } },
      create: { cursoId, aulaId, memberId, concluido: true },
      update: { concluido: true, dataHora: new Date() },
    });

    // Calculate total progress
    const curso = await prisma.curso.findUnique({
      where: { id: cursoId },
      include: { modulos: { include: { aulas: true } } },
    });
    const totalAulas = curso?.modulos.reduce((acc, m) => acc + m.aulas.length, 0) ?? 0;
    const concluidas = await prisma.cursoProgresso.count({
      where: { cursoId, memberId, concluido: true },
    });
    const percentual = totalAulas > 0 ? Math.round((concluidas / totalAulas) * 100) : 0;

    return NextResponse.json({ progresso, percentual, concluidas, totalAulas });
  } catch (error) {
    console.error("[POST /api/ensino/id/progresso]", error);
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
