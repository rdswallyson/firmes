import { NextRequest, NextResponse } from "next/server";
import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id } = await params;
  try {
    const evento = await prisma.event.findUnique({
      where: { id },
      include: { inscricoes: true },
    });
    if (!evento) return NextResponse.json({ error: "Não encontrado" }, { status: 404 });

    const presentes = evento.inscricoes.filter((i) => i.checkinAt !== null);
    const confirmados = evento.inscricoes.filter((i) => i.status === "CONFIRMADO");
    const visitantes = evento.inscricoes.filter((i) => i.tipo === "VISITANTE");
    const membros = evento.inscricoes.filter((i) => i.tipo === "MEMBRO");

    return NextResponse.json({
      evento: {
        id: evento.id,
        titulo: evento.title,
        data: evento.date,
        local: evento.location,
        maxVagas: evento.maxVagas,
        status: evento.status,
        valor: evento.valor,
        isGratuito: evento.isGratuito,
      },
      stats: {
        totalInscritos: evento.inscricoes.length,
        totalPresentes: presentes.length,
        percentual: evento.inscricoes.length > 0 ? Math.round((presentes.length / evento.inscricoes.length) * 100) : 0,
        receita: !evento.isGratuito && evento.valor ? confirmados.length * evento.valor : null,
      },
      visitantes: visitantes.map((v) => ({ nome: v.nome, email: v.email, telefone: v.telefone, checkinAt: v.checkinAt })),
      membrosPresentes: membros.filter((m) => m.checkinAt).map((m) => ({ nome: m.nome, checkinAt: m.checkinAt })),
    });
  } catch (error) {
    console.error("[GET /api/eventos/id/relatorio]", error);
    return NextResponse.json({ error: "Erro interno" }, { status: 500 });
  }
}
