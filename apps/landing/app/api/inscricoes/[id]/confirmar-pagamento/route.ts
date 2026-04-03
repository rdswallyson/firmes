import { NextRequest, NextResponse } from "next/server";
import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();

// POST /api/inscricoes/[id]/confirmar-pagamento
export async function POST(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id } = await params;
  try {
    const inscricao = await prisma.inscricao.findUnique({
      where: { id },
      include: { event: true },
    });
    if (!inscricao) return NextResponse.json({ error: "Inscricao nao encontrada" }, { status: 404 });

    if (inscricao.pagamentoStatus === "CONFIRMADO") {
      return NextResponse.json({ error: "Pagamento ja confirmado" }, { status: 400 });
    }

    const body = await request.json().catch(() => ({}));
    const formaPagamento = body.formaPagamento || inscricao.formaPagamento || "DINHEIRO";

    // If there's already a lancamento, just update its status
    if (inscricao.lancamentoId) {
      await prisma.finance.update({
        where: { id: inscricao.lancamentoId },
        data: { status: "CONFIRMADO", paymentMethod: formaPagamento },
      });
    } else {
      // Create new lancamento
      const valor = inscricao.event.valor || 0;
      if (valor > 0) {
        const lancamento = await prisma.finance.create({
          data: {
            tenantId: inscricao.tenantId,
            amount: valor,
            type: "INCOME",
            category: "Eventos",
            description: `Inscricao: ${inscricao.event.title}`,
            date: new Date(),
            status: "CONFIRMADO",
            paymentMethod: formaPagamento,
          },
        });
        await prisma.inscricao.update({
          where: { id },
          data: { lancamentoId: lancamento.id },
        });
      }
    }

    // Update inscricao payment status
    const updated = await prisma.inscricao.update({
      where: { id },
      data: {
        pagamentoStatus: "CONFIRMADO",
        formaPagamento,
      },
    });

    return NextResponse.json(updated);
  } catch (error) {
    console.error("[POST /api/inscricoes/[id]/confirmar-pagamento]", error);
    return NextResponse.json({ error: "Erro interno" }, { status: 500 });
  }
}
