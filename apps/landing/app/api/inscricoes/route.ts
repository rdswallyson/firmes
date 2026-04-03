import { NextRequest, NextResponse } from "next/server";
import { PrismaClient } from "@prisma/client";
import crypto from "crypto";

const prisma = new PrismaClient();

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const eventId = searchParams.get("eventId");
    const where = eventId ? { eventId } : {};
    const inscricoes = await prisma.inscricao.findMany({
      where,
      orderBy: { createdAt: "desc" },
      include: { event: { select: { title: true } } },
    });
    return NextResponse.json(inscricoes);
  } catch (error) {
    console.error("[GET /api/inscricoes]", error);
    return NextResponse.json({ error: "Erro interno" }, { status: 500 });
  }
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { eventId, nome, email, telefone, tipo } = body;

    if (!eventId || !nome || !email) {
      return NextResponse.json({ error: "Campos obrigatórios: eventId, nome, email" }, { status: 400 });
    }

    const evento = await prisma.event.findUnique({ where: { id: eventId } });
    if (!evento) return NextResponse.json({ error: "Evento não encontrado" }, { status: 404 });

    const confirmedCount = await prisma.inscricao.count({ where: { eventId, status: "CONFIRMADO" } });

    let status = "CONFIRMADO";
    if (evento.status === "LOTADO" || (evento.maxVagas && confirmedCount >= evento.maxVagas)) {
      status = "LISTA_ESPERA";
    }

    const qrCode = crypto.randomUUID();

    const inscricao = await prisma.inscricao.create({
      data: {
        tenantId: evento.tenantId,
        eventId,
        nome,
        email,
        telefone: telefone ?? null,
        tipo: tipo ?? "MEMBRO",
        status,
        qrCode,
      },
    });

    if (status === "CONFIRMADO" && evento.maxVagas) {
      if (confirmedCount + 1 >= evento.maxVagas) {
        await prisma.event.update({ where: { id: eventId }, data: { status: "LOTADO" } });
      }
    }

    return NextResponse.json(inscricao, { status: 201 });
  } catch (error) {
    console.error("[POST /api/inscricoes]", error);
    return NextResponse.json({ error: "Erro interno" }, { status: 500 });
  }
}
