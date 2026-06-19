import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@firmes/db";
import { getSession } from "../../../lib/auth";

export async function GET() {
  try {
    const session = await getSession();
    if (!session?.tenantId) return NextResponse.json({ error: "Não autorizado" }, { status: 401 });

    const certificados = await prisma.certificado.findMany({
      where: { tenantId: session.tenantId, deletedAt: null },
      orderBy: { emitidoEm: "desc" },
      include: {
        member: { select: { id: true, name: true, photo: true } },
        curso: { select: { id: true, titulo: true, cargaHoraria: true } },
      },
    });
    return NextResponse.json({ certificados });
  } catch (error) {
    console.error("[GET /api/certificados]", error);
    return NextResponse.json({ error: "Erro interno" }, { status: 500 });
  }
}

export async function POST(request: NextRequest) {
  try {
    const session = await getSession();
    if (!session?.tenantId) return NextResponse.json({ error: "Não autorizado" }, { status: 401 });

    const body = await request.json();
    const { cursoId, memberId } = body;
    if (!cursoId || !memberId) return NextResponse.json({ error: "cursoId e memberId obrigatorios" }, { status: 400 });

    // Verificar se o membro concluiu 100% do curso
    const curso = await prisma.curso.findUnique({
      where: { id: cursoId },
      include: { modulos: { include: { aulas: true } } },
    });
    if (!curso) return NextResponse.json({ error: "Curso nao encontrado" }, { status: 404 });

    const totalAulas = curso.modulos.reduce((a, m) => a + m.aulas.length, 0);
    const concluidas = await prisma.cursoProgresso.count({
      where: { cursoId, memberId, concluido: true },
    });
    if (totalAulas === 0 || concluidas < totalAulas) {
      return NextResponse.json({ error: "Curso nao concluido" }, { status: 400 });
    }

    // Verificar se ja existe certificado
    const existente = await prisma.certificado.findFirst({
      where: { cursoId, memberId, deletedAt: null },
    });
    if (existente) return NextResponse.json({ certificado: existente }, { status: 200 });

    const codigo = `CERT-${Date.now()}-${Math.random().toString(36).substring(2, 7).toUpperCase()}`;
    const certificado = await prisma.certificado.create({
      data: {
        tenantId: session.tenantId,
        cursoId,
        memberId,
        codigo,
      },
    });
    return NextResponse.json({ certificado }, { status: 201 });
  } catch (error) {
    console.error("[POST /api/certificados]", error);
    return NextResponse.json({ error: "Erro interno" }, { status: 500 });
  }
}
