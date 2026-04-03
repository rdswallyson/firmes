import { NextRequest, NextResponse } from "next/server";
import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();

export async function GET() {
  try {
    const tenant = await prisma.tenant.findFirst();
    if (!tenant) return NextResponse.json({ error: "No tenant" }, { status: 400 });
    const pedidos = await prisma.pedido.findMany({
      where: { tenantId: tenant.id },
      include: { itens: { include: { produto: true } } },
      orderBy: { createdAt: "desc" },
    });
    return NextResponse.json({ pedidos });
  } catch (error) {
    return NextResponse.json({ error: "Erro interno" }, { status: 500 });
  }
}

export async function POST(request: NextRequest) {
  try {
    const tenant = await prisma.tenant.findFirst();
    if (!tenant) return NextResponse.json({ error: "No tenant" }, { status: 400 });
    const body = await request.json();
    const { nomeComprador, telefone, email, formaPagamento, eventId, itens } = body;
    if (!nomeComprador || !itens?.length) {
      return NextResponse.json({ error: "Campos obrigatórios: nomeComprador, itens" }, { status: 400 });
    }
    let total = 0;
    const itensData = [];
    for (const item of itens) {
      const produto = await prisma.produto.findUnique({ where: { id: item.produtoId } });
      if (!produto) return NextResponse.json({ error: `Produto ${item.produtoId} não encontrado` }, { status: 404 });
      const preco = produto.preco;
      const qty = item.quantidade ?? 1;
      total += preco * qty;
      itensData.push({ produtoId: item.produtoId, variacaoId: item.variacaoId ?? null, quantidade: qty, preco });
    }
    const pedido = await prisma.pedido.create({
      data: {
        tenantId: tenant.id,
        nomeComprador,
        telefone: telefone ?? null,
        email: email ?? null,
        formaPagamento: formaPagamento ?? null,
        eventId: eventId ?? null,
        total,
        itens: { create: itensData },
      },
      include: { itens: { include: { produto: true } } },
    });
    return NextResponse.json(pedido, { status: 201 });
  } catch (error) {
    console.error("[POST /api/pedidos]", error);
    return NextResponse.json({ error: "Erro interno" }, { status: 500 });
  }
}
