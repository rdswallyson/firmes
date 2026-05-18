import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@firmes/db";

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { code, pedidoItemId } = body;

    if (!code) return NextResponse.json({ error: "Código obrigatório" }, { status: 400 });
    if (!pedidoItemId) return NextResponse.json({ error: "pedidoItemId obrigatorio" }, { status: 400 });

    const inscricao = await prisma.inscricao.findUnique({ where: { qrCode: code } });
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
