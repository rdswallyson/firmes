import { NextRequest, NextResponse } from "next/server";
import { getSession } from "../../../../../lib/auth";
import { prisma } from "@firmes/db";

export async function GET(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const session = await getSession();
  if (!session) return NextResponse.json({ error: "Não autenticado" }, { status: 401 });
  const { id } = await params;

  const finance = await prisma.finance.findFirst({
    where: { id, tenantId: session.tenantId },
  });
  if (!finance || !finance.reciboNum) {
    return NextResponse.json({ error: "Recibo não encontrado" }, { status: 404 });
  }

  const tenant = await prisma.tenant.findUnique({
    where: { id: session.tenantId },
    select: { name: true, logo: true },
  });

  return NextResponse.json({
    recibo: {
      numero: finance.reciboNum,
      memberName: finance.memberName ?? "Anônimo",
      amount: finance.amount,
      category: finance.category,
      date: finance.date,
      description: finance.description,
      igreja: tenant?.name ?? "Igreja Firmes",
      logo: tenant?.logo,
    },
  });
}
