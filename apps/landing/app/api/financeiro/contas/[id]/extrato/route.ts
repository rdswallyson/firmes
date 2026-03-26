import { NextRequest, NextResponse } from "next/server";
import { getSession } from "../../../../../../lib/auth";
import { prisma } from "@firmes/db";

export async function GET(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const session = await getSession();
  if (!session) return NextResponse.json({ error: "Não autenticado" }, { status: 401 });
  const { id } = await params;

  const conta = await prisma.contaBancaria.findFirst({ where: { id, tenantId: session.tenantId } });
  if (!conta) return NextResponse.json({ error: "Conta não encontrada" }, { status: 404 });

  const { searchParams } = req.nextUrl;
  const page = Math.max(1, Number(searchParams.get("page")) || 1);
  const limit = 20;

  const where = { contaId: id, tenantId: session.tenantId, isActive: true };
  const total = await prisma.finance.count({ where });
  const extrato = await prisma.finance.findMany({
    where,
    skip: (page - 1) * limit,
    take: limit,
    orderBy: { date: "desc" },
  });

  return NextResponse.json({ conta, extrato, total, page, totalPages: Math.ceil(total / limit) });
}
