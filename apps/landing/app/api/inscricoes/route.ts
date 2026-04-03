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
    const { eventId, nome, email, telefone, tipo, formaPagamento, itens, refeicoesSelecionadas, cupomId, totalFinal } = body;

    if (!eventId || !nome || !email) {
      return NextResponse.json({ error: "Campos obrigatorios: eventId, nome, email" }, { status: 400 });
    }

    const evento = await prisma.event.findUnique({ where: { id: eventId } });
    if (!evento) return NextResponse.json({ error: "Evento nao encontrado" }, { status: 404 });

    const confirmedCount = await prisma.inscricao.count({ where: { eventId, status: "CONFIRMADO" } });

    let status = "CONFIRMADO";
    if (evento.status === "LOTADO" || (evento.maxVagas && confirmedCount >= evento.maxVagas)) {
      status = "LISTA_ESPERA";
    }

    const qrCode = crypto.randomUUID();

    // Create inscription
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
        formaPagamento: formaPagamento ?? null,
        pagamentoStatus: (totalFinal && totalFinal > 0) ? "PENDENTE" : "CONFIRMADO",
      },
    });

    // Create InscricaoPedidoItem for products
    if (itens && Array.isArray(itens) && itens.length > 0) {
      await prisma.inscricaoPedidoItem.createMany({
        data: itens.map((item: { produtoId: string; variacaoId?: string; quantidade: number; preco: number }) => ({
          inscricaoId: inscricao.id,
          produtoId: item.produtoId,
          variacaoId: item.variacaoId ?? null,
          quantidade: item.quantidade,
          preco: item.preco,
        })),
      });
    }

    // Create InscricaoRefeicao for selected meals
    if (refeicoesSelecionadas && Array.isArray(refeicoesSelecionadas) && refeicoesSelecionadas.length > 0) {
      await prisma.inscricaoRefeicao.createMany({
        data: refeicoesSelecionadas.map((r: { refeicaoId: string; dia: string }) => ({
          inscricaoId: inscricao.id,
          refeicaoId: r.refeicaoId,
          dia: r.dia,
        })),
      });
    }

    // Create Finance record if total > 0
    if (totalFinal && totalFinal > 0) {
      await prisma.finance.create({
        data: {
          tenantId: evento.tenantId,
          amount: totalFinal,
          type: "INCOME",
          category: "Eventos",
          description: `Inscricao: ${evento.title}`,
          date: new Date(),
          status: "PENDENTE",
        },
      });
    }

    // Increment cupom usage
    if (cupomId) {
      await prisma.cupom.update({
        where: { id: cupomId },
        data: { usosAtual: { increment: 1 } },
      });
    }

    // Update event status if full
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
