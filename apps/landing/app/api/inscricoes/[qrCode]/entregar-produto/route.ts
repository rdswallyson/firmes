import { NextRequest, NextResponse } from "next/server";
import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();

export async function POST(
  request: NextRequest,
  { params }: { params: Promise<{ qrCode: string }> }
) {
  const { qrCode } = await params;
  try {
    const body = await request.json();
    const { pedidoItemId } = body;

    if (!pedidoItemId) return NextResponse.json({ error: "pedidoItemId obrigatorio" }, { status: 400 });

    const inscricao = await prisma.inscricao.findUnique({ where: { qrCode } });
    if (!inscricao) return NextResponse.json({ error: "QR Code invalido" }, { status: 404 });

    const item = await prisma.inscricaoPedidoItem.findUnique({ where: { id: pedidoItemId } });
    if (!item || item.inscricaoId !== inscricao.id) {
      return NextResponse.json({ error: "Item nao pertence a esta inscricao" }, { status: 400 });
    }

    if (item.entregue) {
      return NextResponse.json({ error: "Item ja entregue" }, { status: 409 });
    }

    const updated = await prisma.inscricaoPedidoItem.update({
      where: { id: pedidoItemId },
      data: { entregue: true, entregueEm: new Date() },
    });

    return NextResponse.json(updated);
  } catch (error) {
    console.error("[POST entregar-produto]", error);
    return NextResponse.json({ error: "Erro interno" }, { status: 500 });
  }
}
