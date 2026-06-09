import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@firmes/db";
import { getSession } from "../../../lib/auth";

export async function GET() {
  try {
    const session = await getSession();
    if (!session?.tenantId) return NextResponse.json({ error: "Não autorizado" }, { status: 401 });

    const cursos = await prisma.curso.findMany({
      where: { tenantId: session.tenantId },
      orderBy: { createdAt: "desc" },
      include: {
        instrutorMembro: {
          select: { id: true, name: true, photo: true },
        },
        modulos: {
          orderBy: { ordem: "asc" },
          include: { aulas: { orderBy: { ordem: "asc" } } },
        },
        _count: { select: { progressos: true } },
      },
    });
    return NextResponse.json({ cursos });
  } catch (error) {
    console.error("[GET /api/ensino]", error);
    return NextResponse.json({ error: "Erro interno" }, { status: 500 });
  }
}

export async function POST(request: NextRequest) {
  try {
    const session = await getSession();
    if (!session?.tenantId) return NextResponse.json({ error: "Não autorizado" }, { status: 401 });

    const body = await request.json();
    const { titulo, descricao, banner, categoria, nivel, cargaHoraria, instrutor, instrutorId, modulos } = body;
    if (!titulo) return NextResponse.json({ error: "Titulo obrigatorio" }, { status: 400 });

    // Se instrutorId foi enviado, buscar nome para manter compatibilidade legada
    let nomeInstrutor = instrutor || "";
    let idInstrutor = instrutorId || null;
    if (idInstrutor && !nomeInstrutor) {
      try {
        const membro = await prisma.member.findUnique({
          where: { id: idInstrutor },
          select: { name: true },
        });
        if (membro) nomeInstrutor = membro.name;
      } catch { /* ignora erro */ }
    }

    const curso = await prisma.curso.create({
      data: {
        tenantId: session.tenantId,
        titulo,
        descricao: descricao ?? null,
        banner: banner ?? null,
        categoria: categoria ?? "ESTUDO",
        nivel: nivel ?? "INICIANTE",
        cargaHoraria: cargaHoraria ?? null,
        instrutor: nomeInstrutor || null,
        instrutorId: idInstrutor,
        modulos: modulos?.length ? {
          create: modulos.map((m: { titulo: string; ordem?: number; aulas?: any[] }, i: number) => ({
            titulo: m.titulo,
            ordem: m.ordem ?? i,
            aulas: m.aulas?.length ? {
              create: m.aulas.map((a: { titulo: string; ordem?: number; videoUrl?: string; materialUrl?: string }, j: number) => ({
                titulo: a.titulo,
                ordem: a.ordem ?? j,
                videoUrl: a.videoUrl ?? null,
                materialUrl: a.materialUrl ?? null,
              })),
            } : undefined,
          })),
        } : undefined,
      },
      include: {
        instrutorMembro: { select: { id: true, name: true, photo: true } },
        modulos: {
          orderBy: { ordem: "asc" },
          include: { aulas: { orderBy: { ordem: "asc" } } },
        },
      },
    });
    return NextResponse.json({ curso }, { status: 201 });
  } catch (error) {
    console.error("[POST /api/ensino]", error);
    return NextResponse.json({ error: "Erro interno" }, { status: 500 });
  }
}
