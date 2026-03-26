import { NextRequest, NextResponse } from "next/server";
import { getSession } from "../../../../lib/auth";
import { prisma } from "@firmes/db";

export async function GET(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const session = await getSession();
  if (!session) return NextResponse.json({ error: "Não autenticado" }, { status: 401 });
  const { id } = await params;
  const finance = await prisma.finance.findFirst({ where: { id, tenantId: session.tenantId } });
  if (!finance) return NextResponse.json({ error: "Não encontrado" }, { status: 404 });
  return NextResponse.json({ finance });
}

export async function PUT(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const session = await getSession();
  if (!session) return NextResponse.json({ error: "Não autenticado" }, { status: 401 });
  const { id } = await params;
  const body = await req.json() as Record<string, unknown>;
  const existing = await prisma.finance.findFirst({ where: { id, tenantId: session.tenantId } });
  if (!existing) return NextResponse.json({ error: "Não encontrado" }, { status: 404 });

  const finance = await prisma.finance.update({
    where: { id },
    data: {
      type: (body.type as string) || undefined,
      category: (body.category as string) || undefined,
      amount: body.amount ? Number(body.amount) : undefined,
      description: body.description as string | undefined,
      date: body.date ? new Date(body.date as string) : undefined,
      memberId: body.memberId as string | undefined,
      memberName: body.memberName as string | undefined,
      contaId: body.contaId as string | undefined,
      metaId: body.metaId as string | undefined,
    },
  });
  return NextResponse.json({ finance });
}

export async function DELETE(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const session = await getSession();
  if (!session) return NextResponse.json({ error: "Não autenticado" }, { status: 401 });
  const { id } = await params;
  const existing = await prisma.finance.findFirst({ where: { id, tenantId: session.tenantId } });
  if (!existing) return NextResponse.json({ error: "Não encontrado" }, { status: 404 });

  await prisma.finance.update({ where: { id }, data: { isActive: false } });

  if (existing.contaId) {
    const delta = existing.type === "RECEITA" ? -existing.amount : existing.amount;
    await prisma.contaBancaria.update({ where: { id: existing.contaId }, data: { saldo: { increment: delta } } });
  }
  if (existing.metaId && existing.type === "RECEITA") {
    await prisma.meta.update({ where: { id: existing.metaId }, data: { valorAtual: { decrement: existing.amount } } });
  }

  return NextResponse.json({ success: true });
}
