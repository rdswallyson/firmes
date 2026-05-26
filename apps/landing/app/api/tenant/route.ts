import { NextRequest, NextResponse } from "next/server";
import { getSession } from "../../../lib/auth";
import { prisma } from "@firmes/db";

export async function GET() {
  try {
    const session = await getSession();
    if (!session?.tenantId) return NextResponse.json({ error: "Não autorizado" }, { status: 401 });

    const tenant = await prisma.tenant.findUnique({
      where: { id: session.tenantId },
      select: {
        id: true,
        name: true,
        slug: true,
        logo: true,
        primaryColor: true,
        secondaryColor: true,
        domain: true,
        plan: true,
        isWhiteLabel: true,
        maxChurches: true,
        isActive: true,
        stripeCustomerId: true,
        stripeSubscriptionId: true,
        stripePriceId: true,
        trialEndsAt: true,
        subscriptionStatus: true,
        customName: true,
        customDomain: true,
        onboardingCompleted: true,
        createdAt: true,
      },
    });

    if (!tenant) return NextResponse.json({ error: "Tenant não encontrado" }, { status: 404 });
    return NextResponse.json({ tenant });
  } catch (error) {
    console.error("[GET /api/tenant]", error);
    return NextResponse.json({ error: "Erro interno" }, { status: 500 });
  }
}

export async function PUT(req: NextRequest) {
  try {
    const session = await getSession();
    if (!session?.tenantId) return NextResponse.json({ error: "Não autorizado" }, { status: 401 });

    const body = await req.json();
    const {
      name,
      logo,
      primaryColor,
      secondaryColor,
      domain,
      customName,
      customDomain,
    } = body;

    const tenant = await prisma.tenant.update({
      where: { id: session.tenantId },
      data: {
        ...(name !== undefined && { name }),
        ...(logo !== undefined && { logo }),
        ...(primaryColor !== undefined && { primaryColor }),
        ...(secondaryColor !== undefined && { secondaryColor }),
        ...(domain !== undefined && { domain }),
        ...(customName !== undefined && { customName }),
        ...(customDomain !== undefined && { customDomain }),
      },
    });

    return NextResponse.json({ tenant });
  } catch (error) {
    console.error("[PUT /api/tenant]", error);
    return NextResponse.json({ error: "Erro ao atualizar tenant" }, { status: 500 });
  }
}
