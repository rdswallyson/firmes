import { NextRequest, NextResponse } from "next/server";
import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();

export async function GET(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  try {
    const midia = await prisma.midia.findUnique({ where: { id } });
    if (!midia) return NextResponse.json({ error: "Não encontrado" }, { status: 404 });
    return NextResponse.json(midia);
  } catch (error) {
    return NextResponse.json({ error: "Erro interno" }, { status: 500 });
  }
}

export async function PUT(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  try {
    const body = await req.json();
    const midia = await prisma.midia.update({
      where: { id },
      data: {
        ...(body.titulo !== undefined && { titulo: body.titulo }),
        ...(body.categoria !== undefined && { categoria: body.categoria }),
        ...(body.pregador !== undefined && { pregador: body.pregador }),
        ...(body.data !== undefined && { data: body.data ? new Date(body.data) : null }),
      },
    });
    return NextResponse.json(midia);
  } catch (error) {
    return NextResponse.json({ error: "Erro interno" }, { status: 500 });
  }
}

export async function DELETE(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  try {
    await prisma.midia.delete({ where: { id } });
    return NextResponse.json({ ok: true });
  } catch (error) {
    return NextResponse.json({ error: "Erro interno" }, { status: 500 });
  }
}

export async function PATCH(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  try {
    // Incrementar reproduções
    const midia = await prisma.midia.update({
      where: { id },
      data: { reproducoes: { increment: 1 } },
    });
    return NextResponse.json(midia);
  } catch (error) {
    return NextResponse.json({ error: "Erro interno" }, { status: 500 });
  }
}
