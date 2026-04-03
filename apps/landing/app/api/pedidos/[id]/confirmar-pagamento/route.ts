import { NextRequest, NextResponse } from "next/server";
import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();

// POST /api/pedidos/[id]/confirmar-pagamento
export async function POST(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id } = await params;
  try {
    const pedido = await prisma.pedido.findUnique({
      where: { id },
      include: { itens: { include: { produto: true } } },
    });
    if (!pedido) return NextResponse.json({ error: "Pedido nao encontrado" }, { status: 404 });

    if (pedido.status === "PAGO") {
      return NextResponse.json({ error: "Pedido ja pago" }, { status: 400 });
    }

    const body = await request.json().catch(() => ({}));
    const formaPagamento = body.formaPagamento || pedido.formaPagamento || "DINHEIRO";

    // If there's already a lancamento, update status
    if (pedido.lancamentoId) {
      await prisma.finance.update({
        where: { id: pedido.lancamentoId },
        data: { status: "CONFIRMADO", paymentMethod: formaPagamento },
      });
    } else {
      // Create new lancamento
      const descItens = pedido.itens.map((i: any) => i.produto?.nome || "Produto").join(", ");
      const lancamento = await prisma.finance.create({
        data: {
          tenantId: pedido.tenantId,
          amount: pedido.total,
          type: "INCOME",
          category: "Vendas",
          description: `Venda: ${descItens}`,
          date: new Date(),
          status: "CONFIRMADO",
          paymentMethod: formaPagamento,
        },
      });
      await prisma.pedido.update({
        where: { id },
        data: { lancamentoId: lancamento.id },
      });
    }

    // Update pedido status
    const updated = await prisma.pedido.update({
      where: { id },
      data: {
        status: "PAGO",
        formaPagamento,
      },
    });

    return NextResponse.json(updated);
  } catch (error) {
    console.error("[POST /api/pedidos/[id]/confirmar-pagamento]", error);
    return NextResponse.json({ error: "Erro interno" }, { status: 500 });
  }
}
