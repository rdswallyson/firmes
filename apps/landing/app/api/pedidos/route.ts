import { NextRequest, NextResponse } from "next/server";
import { getSession } from "../../../lib/auth";
import { prisma } from "@firmes/db";

export async function POST(request: NextRequest) {
  const session = await getSession();
  if (!session) return NextResponse.json({ error: "Nao autenticado" }, { status: 401 });

  try {
    const body = await request.json();
    const { itens, formaPagamento, total } = body;

    if (!itens || !Array.isArray(itens) || itens.length === 0) {
      return NextResponse.json({ error: "Carrinho vazio" }, { status: 400 });
    }

    // Create Pedido
    const pedido = await prisma.pedido.create({
      data: {
        tenantId: session.tenantId,
        nomeComprador: "Cliente PDV",
        status: "PAGO",
        formaPagamento,
        total,
        itens: {
          create: itens.map((item: { produtoId: string; variacaoId?: string; quantidade: number; preco: number }) => ({
            produtoId: item.produtoId,
            variacaoId: item.variacaoId || null,
            quantidade: item.quantidade,
            preco: item.preco,
            entregue: true,
            entregueEm: new Date(),
          })),
        },
      },
      include: { itens: true },
    });

    // Create Finance record
    await prisma.finance.create({
      data: {
        tenantId: session.tenantId,
        amount: total,
        type: "INCOME",
        category: "Vendas",
        description: `Venda PDV #${pedido.id.slice(-6)}`,
        paymentMethod: formaPagamento,
        status: "CONFIRMADO",
        date: new Date(),
      },
    });

    return NextResponse.json({ id: pedido.id, total }, { status: 201 });
  } catch (error) {
    console.error("[POST /api/pedidos]", error);
    return NextResponse.json({ error: "Erro interno" }, { status: 500 });
  }
}
