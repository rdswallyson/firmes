import { NextResponse } from "next/server";
import { getSuperAdminSession } from "../../../../lib/auth";
import { prisma } from "@firmes/db";

export async function GET(request: Request) {
  try {
    const session = await getSuperAdminSession();
    if (!session) return NextResponse.json({ error: "Não autorizado" }, { status: 401 });

    const { searchParams } = new URL(request.url);
    const plano = searchParams.get("plano");
    const status = searchParams.get("status");
    const busca = searchParams.get("busca");

    const where: any = {};
    if (plano && plano !== "TODOS") where.plan = plano;
    if (status && status !== "TODOS") {
      if (status === "ATIVO") where.isActive = true;
      if (status === "INATIVO") where.isActive = false;
      if (status === "TRIAL") where.trialEndsAt = { gte: new Date() };
      if (status === "INADIMPLENTE") where.subscriptionStatus = "past_due";
    }
    if (busca) {
      where.OR = [
        { name: { contains: busca, mode: "insensitive" } },
        { slug: { contains: busca, mode: "insensitive" } },
      ];
    }

    const tenants = await prisma.tenant.findMany({
      where,
      orderBy: { createdAt: "desc" },
      include: {
        _count: { select: { members: true, churches: true, users: true } },
      },
    });

    return NextResponse.json({ tenants });
  } catch (error) {
    console.error("[GET /api/superadmin/tenants]", error);
    return NextResponse.json({ error: "Erro interno" }, { status: 500 });
  }
}
