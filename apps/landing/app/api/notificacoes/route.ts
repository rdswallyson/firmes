import { NextResponse } from "next/server";
import { getSession } from "../../../lib/auth";
import { prisma } from "@firmes/db";

export async function GET() {
  try {
    const session = await getSession();
    if (!session?.tenantId) return NextResponse.json({ error: "Não autenticado" }, { status: 401 });

    const notifications = await prisma.notification.findMany({
      where: { tenantId: session.tenantId },
      orderBy: { createdAt: "desc" },
      take: 30,
    });

    return NextResponse.json({ notifications });
  } catch (error) {
    console.error("[GET /api/notificacoes]", error);
    return NextResponse.json({ error: "Erro ao buscar notificações" }, { status: 500 });
  }
}

export async function PUT(req: Request) {
  try {
    const session = await getSession();
    if (!session?.tenantId) return NextResponse.json({ error: "Não autenticado" }, { status: 401 });

    const body = await req.json().catch(() => ({}));
    if (body.markAll) {
      await prisma.notification.updateMany({
        where: { tenantId: session.tenantId, read: false },
        data: { read: true },
      });
    }
    return NextResponse.json({ success: true });
  } catch (error) {
    console.error("[PUT /api/notificacoes]", error);
    return NextResponse.json({ error: "Erro interno" }, { status: 500 });
  }
}
