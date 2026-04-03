import { NextRequest, NextResponse } from "next/server";
import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();

export async function GET() {
  try {
    const tenant = await prisma.tenant.findFirst();
    if (!tenant) return NextResponse.json({ error: "No tenant" }, { status: 400 });
    const cursos = await prisma.curso.findMany({
      where: { tenantId: tenant.id },
      include: {
        modulos: {
          orderBy: { ordem: "asc" },
          include: { aulas: { orderBy: { ordem: "asc" } } },
        },
        _count: { select: { progressos: true } },
      },
      orderBy: { createdAt: "desc" },
    });
    return NextResponse.json({ cursos });
  } catch (error) {
    console.error("[GET /api/ensino]", error);
    return NextResponse.json({ error: "Erro interno" }, { status: 500 });
  }
}

export async function POST(request: NextRequest) {
  try {
    const tenant = await prisma.tenant.findFirst();
    if (!tenant) return NextResponse.json({ error: "No tenant" }, { status: 400 });
    const body = await request.json();
    const { titulo, descricao, banner, categoria, nivel, cargaHoraria, instrutor, modulos } = body;
    if (!titulo) return NextResponse.json({ error: "Titulo obrigatorio" }, { status: 400 });

    const curso = await prisma.curso.create({
      data: {
        tenantId: tenant.id,
        titulo,
        descricao: descricao ?? null,
        banner: banner ?? null,
        categoria: categoria ?? "ESTUDO",
        nivel: nivel ?? "INICIANTE",
        cargaHoraria: cargaHoraria ? Number(cargaHoraria) : null,
        instrutor: instrutor ?? null,
        publicado: true,
        modulos: modulos?.length ? {
          create: modulos.map((m: any, mi: number) => ({
            titulo: m.titulo,
            ordem: mi,
            aulas: m.aulas?.length ? {
              create: m.aulas.map((a: any, ai: number) => ({
                titulo: a.titulo,
                tipo: a.tipo ?? "VIDEO",
                conteudo: a.conteudo ?? null,
                duracao: a.duracao ?? null,
                ordem: ai,
              })),
            } : undefined,
          })),
        } : undefined,
      },
      include: { modulos: { include: { aulas: true } } },
    });
    return NextResponse.json(curso, { status: 201 });
  } catch (error) {
    console.error("[POST /api/ensino]", error);
    return NextResponse.json({ error: "Erro interno" }, { status: 500 });
  }
}
