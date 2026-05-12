import { NextRequest, NextResponse } from "next/server";
import { getSuperAdminSession } from "../../../../../lib/auth";
import { prisma } from "@firmes/db";

export async function DELETE(request: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  try {
    const session = await getSuperAdminSession();
    if (!session) return NextResponse.json({ error: "Não autorizado" }, { status: 401 });

    const { id } = await params;
    await prisma.tenant.delete({ where: { id } });
    return NextResponse.json({ success: true });
  } catch (error) {
    console.error("[DELETE /api/superadmin/tenants/[id]]", error);
    return NextResponse.json({ error: "Erro interno" }, { status: 500 });
  }
}

export async function GET(request: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  try {
    const session = await getSuperAdminSession();
    if (!session) return NextResponse.json({ error: "Não autorizado" }, { status: 401 });

    const { id } = await params;
    const tenant = await prisma.tenant.findFirst({
      where: { id },
      include: {
        members: { select: { id: true, name: true, status: true, createdAt: true } },
        users: { select: { id: true, name: true, email: true, role: true } },
        churches: { select: { id: true, name: true, isActive: true } },
        cultos: { select: { id: true, titulo: true, data: true } },
        events: { select: { id: true, title: true, date: true } },
        _count: { select: { members: true, churches: true, users: true, cultos: true, events: true, checkins: true } },
      },
    });

    if (!tenant) return NextResponse.json({ error: "Tenant não encontrado" }, { status: 404 });
    return NextResponse.json({ tenant });
  } catch (error) {
    console.error("[GET /api/superadmin/tenants/[id]]", error);
    return NextResponse.json({ error: "Erro interno" }, { status: 500 });
  }
}
