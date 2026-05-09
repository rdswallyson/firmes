import { NextResponse } from "next/server";
import { getSession } from "../../../../lib/auth";
import { prisma } from "@firmes/db";

export async function GET() {
  try {
    const session = await getSession();
    if (!session?.tenantId) return NextResponse.json({ error: "Não autorizado" }, { status: 401 });

    const cultos = await prisma.culto.findMany({
      where: { tenantId: session.tenantId },
      include: {
        checkins: { select: { tipo: true, nome: true } },
        _count: { select: { checkins: true } },
      },
      orderBy: { data: "desc" },
    });

    return NextResponse.json({ cultos });
  } catch (error) {
    console.error("[GET /api/cultos/stats]", error);
    return NextResponse.json({ error: "Erro interno" }, { status: 500 });
  }
}
