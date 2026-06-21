import { NextRequest, NextResponse } from "next/server";
import { prisma, Prisma } from "@firmes/db";
import { getSession } from "../../../lib/auth";

export async function GET() {
  try {
    const session = await getSession();
    if (!session?.tenantId) return NextResponse.json({ error: "Não autorizado" }, { status: 401 });

    const escolas = await prisma.escola.findMany({
      where: { tenantId: session.tenantId, deletedAt: null },
      orderBy: { createdAt: "desc" },
      include: {
        coordenador: { select: { id: true, name: true, photo: true } },
        alunos: { include: { member: { select: { id: true, name: true, photo: true } } } },
        cursos: { select: { id: true, titulo: true, banner: true, nivel: true, publicado: true }, orderBy: { createdAt: "desc" } },
        _count: { select: { alunos: true } },
      },
    });

    // Agregar alunos matriculados nos cursos (CursoProgresso distintos)
    const escolaIds = escolas.map(e => e.id);
    const alunosPorEscolaRaw = await prisma.$queryRaw<{ escolaId: string; alunos: bigint }[]>`
      SELECT e.id as "escolaId", COUNT(DISTINCT cp."memberId") as alunos
      FROM "Escola" e
      LEFT JOIN "Curso" c ON c."escolaId" = e.id
      LEFT JOIN "CursoProgresso" cp ON cp."cursoId" = c.id
      WHERE e.id IN (${Prisma.join(escolaIds)})
      GROUP BY e.id
    `;
    const alunosPorEscola = Object.fromEntries(alunosPorEscolaRaw.map(r => [r.escolaId, Number(r.alunos)]));
    return NextResponse.json({ escolas });
  } catch (error) {
    console.error("[GET /api/escolas]", error);
    return NextResponse.json({ error: "Erro interno" }, { status: 500 });
  }
}

export async function POST(request: NextRequest) {
  try {
    const session = await getSession();
    if (!session?.tenantId) return NextResponse.json({ error: "Não autorizado" }, { status: 401 });

    const body = await request.json();
    const { nome, descricao, coordenadorId, status } = body;
    if (!nome) return NextResponse.json({ error: "Nome obrigatorio" }, { status: 400 });

    const escola = await prisma.escola.create({
      data: {
        tenantId: session.tenantId,
        nome,
        descricao: descricao ?? null,
        coordenadorId: coordenadorId ?? null,
        status: status ?? "ATIVA",
      },
    });
    return NextResponse.json({ escola }, { status: 201 });
  } catch (error) {
    console.error("[POST /api/escolas]", error);
    return NextResponse.json({ error: "Erro interno" }, { status: 500 });
  }
}
