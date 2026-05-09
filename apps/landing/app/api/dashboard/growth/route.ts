import { NextResponse } from "next/server";
import { getSession } from "../../../../lib/auth";
import { prisma } from "@firmes/db";

export async function GET() {
  const session = await getSession();
  if (!session) return NextResponse.json({ error: "Não autenticado" }, { status: 401 });

  const { tenantId } = session;

  // Get member counts for last 6 months
  const now = new Date();
  const months: { mes: string; membros: number }[] = [];
  const monthNames = ["Jan", "Fev", "Mar", "Abr", "Mai", "Jun", "Jul", "Ago", "Set", "Out", "Nov", "Dez"];

  for (let i = 5; i >= 0; i--) {
    const d = new Date(now.getFullYear(), now.getMonth() - i, 1);
    const monthEnd = new Date(d.getFullYear(), d.getMonth() + 1, 0);

    const count = await prisma.member.count({
      where: {
        tenantId,
        createdAt: { lte: monthEnd },
      },
    });

    months.push({
      mes: monthNames[d.getMonth()] || "",
      membros: count,
    });
  }

  return NextResponse.json({ growth: months });
}
