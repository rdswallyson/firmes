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
      include: { inscricoes: { orderBy: { createdAt: "desc" } }, _count: { select: { inscricoes: true } } },
    });
    if (!evento) return NextResponse.json({ error: "Não encontrado" }, { status: 404 });
    return NextResponse.json(evento);
  } catch (error) {
    console.error("[GET /api/eventos/id]", error);
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
    const evento = await prisma.event.update({
      where: { id },
      data: {
        ...(body.title !== undefined && { title: body.title }),
        ...(body.description !== undefined && { description: body.description }),
        ...(body.date !== undefined && { date: new Date(body.date) }),
        ...(body.location !== undefined && { location: body.location }),
        ...(body.maxVagas !== undefined && { maxVagas: body.maxVagas }),
        ...(body.isGratuito !== undefined && { isGratuito: body.isGratuito }),
        ...(body.valor !== undefined && { valor: body.valor }),
        ...(body.status !== undefined && { status: body.status }),
      },
    });
    return NextResponse.json(evento);
  } catch (error) {
    console.error("[PUT /api/eventos/id]", error);
    return NextResponse.json({ error: "Erro interno" }, { status: 500 });
  }
}

export async function DELETE(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id } = await params;
  try {
    await prisma.inscricao.deleteMany({ where: { eventId: id } });
    await prisma.event.delete({ where: { id } });
    return NextResponse.json({ ok: true });
  } catch (error) {
    console.error("[DELETE /api/eventos/id]", error);
    return NextResponse.json({ error: "Erro interno" }, { status: 500 });
  }
}
