import { NextRequest, NextResponse } from "next/server";
import { getSuperAdminSession } from "../../../../../../lib/auth";
import { prisma } from "@firmes/db";

export async function PUT(request: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  try {
    const session = await getSuperAdminSession();
    if (!session) return NextResponse.json({ error: "Não autorizado" }, { status: 401 });

    const { id } = await params;
    const body = await request.json();
    const { isActive, plan, maxChurches, status } = body;

    const data: any = {};
    if (typeof isActive === "boolean") data.isActive = isActive;
    if (plan) data.plan = plan;
    if (typeof maxChurches === "number") data.maxChurches = maxChurches;
    if (status) data.subscriptionStatus = status;

    const updated = await prisma.tenant.update({
      where: { id },
      data,
    });

    return NextResponse.json({ tenant: updated });
  } catch (error) {
    console.error("[PUT /api/superadmin/tenants/[id]/status]", error);
    return NextResponse.json({ error: "Erro interno" }, { status: 500 });
  }
}
