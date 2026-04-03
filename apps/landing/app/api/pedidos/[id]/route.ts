import { NextRequest, NextResponse } from "next/server";
import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();

export async function GET(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  try {
    const pedido = await prisma.pedido.findUnique({ where: { id }, include: { itens: { include: { produto: true } } } });
    if (!pedido) return NextResponse.json({ error: "Não encontrado" }, { status: 404 });
    return NextResponse.json(pedido);
  } catch (error) {
    return NextResponse.json({ error: "Erro interno" }, { status: 500 });
  }
}

export async function PUT(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  try {
    const body = await req.json();
    const pedido = await prisma.pedido.update({
      where: { id },
      data: {
        ...(body.status !== undefined && { status: body.status }),
        ...(body.formaPagamento !== undefined && { formaPagamento: body.formaPagamento }),
      },
    });
    return NextResponse.json(pedido);
  } catch (error) {
    return NextResponse.json({ error: "Erro interno" }, { status: 500 });
  }
}

export async function DELETE(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  try {
    await prisma.pedidoItem.deleteMany({ where: { pedidoId: id } });
    await prisma.pedido.delete({ where: { id } });
    return NextResponse.json({ ok: true });
  } catch (error) {
    return NextResponse.json({ error: "Erro interno" }, { status: 500 });
  }
}
