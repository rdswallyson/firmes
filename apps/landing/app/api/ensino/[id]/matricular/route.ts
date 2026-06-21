import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@firmes/db";
import { getSession } from "../../../../../lib/auth";

export async function POST(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id: cursoId } = await params;
  try {
    const session = await getSession();
    if (!session?.tenantId) return NextResponse.json({ error: "Não autorizado" }, { status: 401 });

    const body = await request.json();
    const { memberId } = body;
    if (!memberId) return NextResponse.json({ error: "memberId obrigatorio" }, { status: 400 });

    // Buscar a primeira aula do curso para criar o progresso de matricula
    const curso = await prisma.curso.findUnique({
      where: { id: cursoId },
      include: { modulos: { include: { aulas: { orderBy: { ordem: "asc" } } } } },
    });
    if (!curso) return NextResponse.json({ error: "Curso nao encontrado" }, { status: 404 });

    const primeiraAula = curso.modulos.flatMap(m => m.aulas)[0];
    if (!primeiraAula) {
      return NextResponse.json({ error: "Curso nao possui aulas para matricula" }, { status: 400 });
    }

    const progresso = await prisma.cursoProgresso.create({
      data: {
        cursoId,
        memberId,
        aulaId: primeiraAula.id,
        concluido: false,
      },
    });

    return NextResponse.json({ progresso }, { status: 201 });
  } catch (error: any) {
    console.error("[POST /api/ensino/id/matricular] ERROR DETAIL:", error);
    return NextResponse.json(
      { error: error?.message || "Erro interno" },
      { status: 500 }
    );
  }
}
