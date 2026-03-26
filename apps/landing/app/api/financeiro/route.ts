import { NextRequest, NextResponse } from "next/server";
import { getSession } from "../../../lib/auth";
import { prisma } from "@firmes/db";

export async function GET(req: NextRequest) {
  const session = await getSession();
  if (!session) return NextResponse.json({ error: "Não autenticado" }, { status: 401 });

  const { searchParams } = req.nextUrl;
  const page = Math.max(1, Number(searchParams.get("page")) || 1);
  const limit = Math.min(100, Math.max(1, Number(searchParams.get("limit")) || 20));
  const type = searchParams.get("type") || undefined;
  const category = searchParams.get("category") || undefined;
  const contaId = searchParams.get("contaId") || undefined;
  const metaId = searchParams.get("metaId") || undefined;
  const memberId = searchParams.get("memberId") || undefined;

  const where = {
    tenantId: session.tenantId,
    isActive: true,
    ...(type ? { type } : {}),
    ...(category ? { category } : {}),
    ...(contaId ? { contaId } : {}),
    ...(metaId ? { metaId } : {}),
    ...(memberId ? { memberId } : {}),
  };

  const total = await prisma.finance.count({ where });
  const finances = await prisma.finance.findMany({
    where,
    skip: (page - 1) * limit,
    take: limit,
    orderBy: { date: "desc" },
    include: { conta: { select: { nome: true } }, meta: { select: { titulo: true } } },
  });

  const agg = await prisma.finance.aggregate({
    where: { tenantId: session.tenantId, isActive: true },
    _sum: { amount: true },
  });

  const receitas = await prisma.finance.aggregate({
    where: { tenantId: session.tenantId, isActive: true, type: "RECEITA" },
    _sum: { amount: true },
  });

  const despesas = await prisma.finance.aggregate({
    where: { tenantId: session.tenantId, isActive: true, type: "DESPESA" },
    _sum: { amount: true },
  });

  return NextResponse.json({
    finances,
    total,
    page,
    totalPages: Math.ceil(total / limit),
    saldo: (receitas._sum.amount ?? 0) - (despesas._sum.amount ?? 0),
    totalReceitas: receitas._sum.amount ?? 0,
    totalDespesas: despesas._sum.amount ?? 0,
  });
}

export async function POST(req: NextRequest) {
  const session = await getSession();
  if (!session) return NextResponse.json({ error: "Não autenticado" }, { status: 401 });

  const body = await req.json() as Record<string, unknown>;
  if (!body.type || !body.category || !body.amount) {
    return NextResponse.json({ error: "Campos obrigatórios: type, category, amount" }, { status: 400 });
  }

  const reciboNum = body.category === "DIZIMO" || body.category === "OFERTA"
    ? `REC-${Date.now().toString(36).toUpperCase()}`
    : undefined;

  const finance = await prisma.finance.create({
    data: {
      tenantId: session.tenantId,
      type: body.type as string,
      category: body.category as string,
      amount: Number(body.amount),
      description: (body.description as string) || undefined,
      date: body.date ? new Date(body.date as string) : new Date(),
      memberId: (body.memberId as string) || undefined,
      memberName: (body.memberName as string) || undefined,
      contaId: (body.contaId as string) || undefined,
      metaId: (body.metaId as string) || undefined,
      reciboNum,
    },
  });

  if (body.contaId) {
    const delta = body.type === "RECEITA" ? Number(body.amount) : -Number(body.amount);
    await prisma.contaBancaria.update({
      where: { id: body.contaId as string },
      data: { saldo: { increment: delta } },
    });
  }

  if (body.metaId && body.type === "RECEITA") {
    await prisma.meta.update({
      where: { id: body.metaId as string },
      data: { valorAtual: { increment: Number(body.amount) } },
    });
  }

  return NextResponse.json({ finance }, { status: 201 });
}
