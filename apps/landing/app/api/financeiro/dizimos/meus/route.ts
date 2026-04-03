import { NextRequest, NextResponse } from "next/server";
import { getSession } from "../../../../../lib/auth";
import { prisma } from "@firmes/db";

export async function GET(req: NextRequest) {
  const session = await getSession();
  if (!session) return NextResponse.json({ error: "Nao autenticado" }, { status: 401 });

  const { searchParams } = new URL(req.url);
  const memberId = searchParams.get("memberId");

  const dizimos = await prisma.finance.findMany({
    where: {
      tenantId: session.tenantId,
      memberId: memberId || session.userId,
      type: "INCOME",
      category: { contains: "dizimo", mode: "insensitive" },
    },
    orderBy: { date: "desc" },
    take: 50,
  });

  return NextResponse.json({
    dizimos: dizimos.map(d => ({
      id: d.id,
      valor: d.amount,
      data: d.date,
      forma: d.paymentMethod || "PIX",
      status: d.status || "CONFIRMADO",
    })),
  });
}
