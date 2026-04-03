import { NextRequest, NextResponse } from "next/server";
import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();

export async function GET(
  _req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id } = await params;
  try {
    const curso = await prisma.curso.findUnique({
      where: { id },
      include: {
        modulos: {
          orderBy: { ordem: "asc" },
          include: { aulas: { orderBy: { ordem: "asc" } } },
        },
        progressos: true,
      },
    });
    if (!curso) return NextResponse.json({ error: "Curso nao encontrado" }, { status: 404 });
    return NextResponse.json(curso);
  } catch (error) {
    console.error("[GET /api/ensino/id]", error);
    return NextResponse.json({ error: "Erro interno" }, { status: 500 });
  }
}

export async function PUT(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id } = await params;
  try {
    const body = await request.json();
    const curso = await prisma.curso.update({
      where: { id },
      data: {
        ...(body.titulo !== undefined && { titulo: body.titulo }),
        ...(body.descricao !== undefined && { descricao: body.descricao }),
        ...(body.banner !== undefined && { banner: body.banner }),
        ...(body.categoria !== undefined && { categoria: body.categoria }),
        ...(body.nivel !== undefined && { nivel: body.nivel }),
        ...(body.cargaHoraria !== undefined && { cargaHoraria: body.cargaHoraria ? Number(body.cargaHoraria) : null }),
        ...(body.instrutor !== undefined && { instrutor: body.instrutor }),
        ...(body.publicado !== undefined && { publicado: body.publicado }),
      },
    });
    return NextResponse.json(curso);
  } catch (error) {
    console.error("[PUT /api/ensino/id]", error);
    return NextResponse.json({ error: "Erro interno" }, { status: 500 });
  }
}

export async function DELETE(
  _req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id } = await params;
  try {
    await prisma.cursoProgresso.deleteMany({ where: { cursoId: id } });
    const modulos = await prisma.cursoModulo.findMany({ where: { cursoId: id } });
    for (const m of modulos) {
      await prisma.cursoAula.deleteMany({ where: { moduloId: m.id } });
    }
    await prisma.cursoModulo.deleteMany({ where: { cursoId: id } });
    await prisma.curso.delete({ where: { id } });
    return NextResponse.json({ ok: true });
  } catch (error) {
    console.error("[DELETE /api/ensino/id]", error);
    return NextResponse.json({ error: "Erro interno" }, { status: 500 });
  }
}
