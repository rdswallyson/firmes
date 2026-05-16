import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@firmes/db";

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const { tenantId, nomeComprador, telefone, email, itens, formaPagamento, total } = body;

    if (!tenantId || !nomeComprador || !itens?.length || !formaPagamento) {
      return NextResponse.json({ error: "Dados incompletos" }, { status: 400 });
    }

    // Criar pedido
    const pedido = await prisma.pedido.create({
      data: {
        tenantId,
        nomeComprador,
        telefone,
        email,
        formaPagamento,
        total,
        status: formaPagamento === "PIX" ? "AGUARDANDO_PAGAMENTO" : "PAGO",
      },
    });

    // Criar itens do pedido
    for (const item of itens) {
      await prisma.pedidoItem.create({
        data: {
          pedidoId: pedido.id,
          produtoId: item.produtoId,
          variacaoId: item.variacaoId || null,
          quantidade: item.quantidade,
          preco: item.preco,
        },
      });

      // Atualizar estoque
      await prisma.produto.update({
        where: { id: item.produtoId },
        data: { estoque: { decrement: item.quantidade } },
      });
    }

    // Criar lançamento no financeiro se pago
    if (formaPagamento !== "PIX") {
      const lancamento = await prisma.finance.create({
        data: {
          tenantId,
          type: "ENTRADA",
          category: "Vendas",
          amount: total,
          description: `Venda: ${itens.map((i: any) => i.nome).join(", ")}`,
          paymentMethod: formaPagamento,
          status: "CONFIRMADO",
        },
      });

      await prisma.pedido.update({
        where: { id: pedido.id },
        data: { lancamentoId: lancamento.id },
      });
    }

    return NextResponse.json({ success: true, pedidoId: pedido.id });
  } catch (error) {
    console.error("[POST /api/pedidos]", error);
    return NextResponse.json({ error: "Erro ao criar pedido" }, { status: 500 });
  }
}
