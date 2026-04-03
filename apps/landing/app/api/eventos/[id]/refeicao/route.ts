import { NextRequest, NextResponse } from "next/server";
import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();

export async function POST(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  try {
    const body = await req.json();
    const { inscricaoId, refeicaoId, dia } = body;

    if (!inscricaoId || !refeicaoId || !dia) {
      return NextResponse.json({ error: "inscricaoId, refeicaoId e dia obrigatórios" }, { status: 400 });
    }

    const existing = await prisma.inscricaoRefeicao.findUnique({
      where: { inscricaoId_refeicaoId_dia: { inscricaoId, refeicaoId, dia } },
    });
    if (existing) {
      return NextResponse.json({ error: "Refeição já utilizada neste dia" }, { status: 409 });
    }

    const registro = await prisma.inscricaoRefeicao.create({
      data: { inscricaoId, refeicaoId, dia },
    });

    return NextResponse.json(registro, { status: 201 });
  } catch (error) {
    console.error("[POST /api/eventos/id/refeicao]", error);
    return NextResponse.json({ error: "Erro interno" }, { status: 500 });
  }
}
