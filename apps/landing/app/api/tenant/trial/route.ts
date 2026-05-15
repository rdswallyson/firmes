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
      select: { trialEndsAt: true, plan: true, subscriptionStatus: true },
    });

    if (!tenant) {
      return NextResponse.json({ error: "Tenant não encontrado" }, { status: 404 });
    }

    const now = new Date();
    const trialEndsAt = tenant.trialEndsAt;
    const isTrialing = trialEndsAt && trialEndsAt > now;
    const daysLeft = trialEndsAt
      ? Math.max(0, Math.ceil((trialEndsAt.getTime() - now.getTime()) / (1000 * 60 * 60 * 24)))
      : 0;

    return NextResponse.json({
      isTrialing: !!isTrialing,
      daysLeft,
      trialEndsAt: trialEndsAt?.toISOString() || null,
      plan: tenant.plan,
      subscriptionStatus: tenant.subscriptionStatus,
    });
  } catch (error) {
    console.error("[GET /api/tenant/trial]", error);
    return NextResponse.json({ error: "Erro ao verificar trial" }, { status: 500 });
  }
}
