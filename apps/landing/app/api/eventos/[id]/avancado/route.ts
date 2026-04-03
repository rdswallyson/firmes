import { NextRequest, NextResponse } from "next/server";
import { PrismaClient } from "@prisma/client";
import crypto from "crypto";

const prisma = new PrismaClient();

// Refeições do evento
export async function GET(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  try {
    const [refeicoes, pontos, fases, equipes, checklist, marcos, recursos] = await Promise.all([
      prisma.eventoRefeicao.findMany({ where: { eventId: id } }),
      prisma.eventoCheckinPonto.findMany({ where: { eventId: id }, include: { _count: { select: { scans: true } } } }),
      prisma.eventoFase.findMany({ where: { eventId: id }, orderBy: { ordem: "asc" } }),
      prisma.eventoEquipe.findMany({ where: { eventId: id }, include: { membros: true } }),
      prisma.eventoChecklist.findMany({ where: { eventId: id } }),
      prisma.eventoMarco.findMany({ where: { eventId: id }, orderBy: { data: "asc" } }),
      prisma.eventoRecurso.findMany({ where: { eventId: id } }),
    ]);
    return NextResponse.json({ refeicoes, pontos, fases, equipes, checklist, marcos, recursos });
  } catch (error) {
    console.error("[GET /api/eventos/id/avancado] error:", error);
    return NextResponse.json({ error: "Erro interno", details: String(error) }, { status: 500 });
  }
}

export async function POST(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  try {
    const body = await req.json();
    const { action } = body;

    if (action === "refeicao") {
      const r = await prisma.eventoRefeicao.create({
        data: { eventId: id, nome: body.nome, emoji: body.emoji ?? null, modelo: body.modelo, valor: body.valor ?? null, dias: body.dias },
      });
      return NextResponse.json(r, { status: 201 });
    }
    if (action === "ponto") {
      const p = await prisma.eventoCheckinPonto.create({
        data: { eventId: id, nome: body.nome, tipo: body.tipo, qrToken: crypto.randomUUID() },
      });
      return NextResponse.json(p, { status: 201 });
    }
    if (action === "fase") {
      const f = await prisma.eventoFase.create({
        data: { eventId: id, nome: body.nome, ordem: body.ordem ?? 0, dataInicio: body.dataInicio ? new Date(body.dataInicio) : null, dataFim: body.dataFim ? new Date(body.dataFim) : null },
      });
      return NextResponse.json(f, { status: 201 });
    }
    if (action === "equipe") {
      const e = await prisma.eventoEquipe.create({
        data: { eventId: id, nome: body.nome, funcao: body.funcao, responsavelId: body.responsavelId ?? null },
      });
      return NextResponse.json(e, { status: 201 });
    }
    if (action === "checklist") {
      const c = await prisma.eventoChecklist.create({
        data: { eventId: id, descricao: body.descricao, faseId: body.faseId ?? null, responsavelId: body.responsavelId ?? null, prazo: body.prazo ? new Date(body.prazo) : null },
      });
      return NextResponse.json(c, { status: 201 });
    }
    if (action === "marco") {
      const m = await prisma.eventoMarco.create({
        data: { eventId: id, titulo: body.titulo, data: new Date(body.data), obs: body.obs ?? null },
      });
      return NextResponse.json(m, { status: 201 });
    }
    if (action === "recurso") {
      const r = await prisma.eventoRecurso.create({
        data: { eventId: id, nome: body.nome, quantidade: body.quantidade ?? null },
      });
      return NextResponse.json(r, { status: 201 });
    }

    return NextResponse.json({ error: "action inválida" }, { status: 400 });
  } catch (error) {
    console.error("[POST /api/eventos/id/avancado]", error);
    return NextResponse.json({ error: "Erro interno" }, { status: 500 });
  }
}
