import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@firmes/db";

export async function GET(req: NextRequest) {
  try {
    const session = req.cookies.get("session")?.value;
    if (!session) {
      return NextResponse.json({ error: "Não autenticado" }, { status: 401 });
    }

    const user = await prisma.user.findFirst({
      where: { id: session },
      select: { tenantId: true },
    });

    if (!user) {
      return NextResponse.json({ error: "Usuário não encontrado" }, { status: 404 });
    }

    const tenant = await prisma.tenant.findUnique({
      where: { id: user.tenantId },
      select: { id: true, name: true, slug: true, plan: true, isActive: true },
    });

    return NextResponse.json(tenant);
  } catch (error) {
    console.error("[GET /api/tenant/me]", error);
    return NextResponse.json({ error: "Erro ao buscar tenant" }, { status: 500 });
  }
}
