import { NextRequest, NextResponse } from "next/server";
import { PrismaClient } from "@prisma/client";
import crypto from "crypto";

const prisma = new PrismaClient();

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
      if (!body.nome || !body.modelo || !body.dias) {
        return NextResponse.json({ error: "Campos obrigatórios: nome, modelo, dias" }, { status: 400 });
      }
      const r = await prisma.eventoRefeicao.create({
        data: { 
          eventId: id, 
          nome: String(body.nome), 
          emoji: body.emoji ? String(body.emoji) : null, 
          modelo: String(body.modelo), 
          valor: body.valor ? Number(body.valor) : null, 
          dias: String(body.dias) 
        },
      });
      return NextResponse.json(r, { status: 201 });
    }
    
    if (action === "ponto") {
      if (!body.nome || !body.tipo) {
        return NextResponse.json({ error: "Campos obrigatórios: nome, tipo" }, { status: 400 });
      }
      const p = await prisma.eventoCheckinPonto.create({
        data: { 
          eventId: id, 
          nome: String(body.nome), 
          tipo: String(body.tipo), 
          qrToken: crypto.randomUUID() 
        },
      });
      return NextResponse.json(p, { status: 201 });
    }
    
    if (action === "fase") {
      if (!body.nome) {
        return NextResponse.json({ error: "Campo obrigatório: nome" }, { status: 400 });
      }
      const f = await prisma.eventoFase.create({
        data: { 
          eventId: id, 
          nome: String(body.nome), 
          ordem: body.ordem ? Number(body.ordem) : 0, 
          dataInicio: body.dataInicio ? new Date(body.dataInicio) : null, 
          dataFim: body.dataFim ? new Date(body.dataFim) : null 
        },
      });
      return NextResponse.json(f, { status: 201 });
    }
    
    if (action === "equipe") {
      if (!body.nome || !body.funcao) {
        return NextResponse.json({ error: "Campos obrigatórios: nome, funcao" }, { status: 400 });
      }
      const e = await prisma.eventoEquipe.create({
        data: { 
          eventId: id, 
          nome: String(body.nome), 
          funcao: String(body.funcao), 
          responsavelId: body.responsavelId ? String(body.responsavelId) : null 
        },
      });
      return NextResponse.json(e, { status: 201 });
    }
    
    if (action === "checklist") {
      if (!body.descricao) {
        return NextResponse.json({ error: "Campo obrigatório: descricao" }, { status: 400 });
      }
      const c = await prisma.eventoChecklist.create({
        data: { 
          eventId: id, 
          descricao: String(body.descricao), 
          faseId: body.faseId ? String(body.faseId) : null, 
          responsavelId: body.responsavelId ? String(body.responsavelId) : null, 
          prazo: body.prazo ? new Date(body.prazo) : null 
        },
      });
      return NextResponse.json(c, { status: 201 });
    }
    
    if (action === "marco") {
      if (!body.titulo || !body.data) {
        return NextResponse.json({ error: "Campos obrigatórios: titulo, data" }, { status: 400 });
      }
      const m = await prisma.eventoMarco.create({
        data: { 
          eventId: id, 
          titulo: String(body.titulo), 
          data: new Date(body.data), 
          obs: body.obs ? String(body.obs) : null 
        },
      });
      return NextResponse.json(m, { status: 201 });
    }
    
    if (action === "recurso") {
      if (!body.nome) {
        return NextResponse.json({ error: "Campo obrigatório: nome" }, { status: 400 });
      }
      const r = await prisma.eventoRecurso.create({
        data: { 
          eventId: id, 
          nome: String(body.nome), 
          quantidade: body.quantidade ? String(body.quantidade) : null 
        },
      });
      return NextResponse.json(r, { status: 201 });
    }

    return NextResponse.json({ error: "action inválida" }, { status: 400 });
  } catch (error) {
    console.error("[POST /api/eventos/id/avancado]", error);
    return NextResponse.json({ error: "Erro interno", details: String(error) }, { status: 500 });
  }
}
