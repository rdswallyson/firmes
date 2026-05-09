import { NextResponse } from "next/server";
import { getSession } from "../../../../lib/auth";
import { prisma } from "@firmes/db";

export async function GET() {
  try {
    const session = await getSession();
    if (!session?.tenantId) return NextResponse.json({ error: "Não autorizado" }, { status: 401 });

    const checkins = await prisma.checkin.findMany({
      where: { tenantId: session.tenantId },
      include: { culto: { select: { id: true, titulo: true, data: true } } },
      orderBy: { createdAt: "desc" },
    });

    return NextResponse.json({ checkins });
  } catch (error) {
    console.error("[GET /api/cultos/presenca]", error);
    return NextResponse.json({ error: "Erro interno" }, { status: 500 });
  }
}
