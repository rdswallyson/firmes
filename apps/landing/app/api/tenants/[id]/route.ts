import { NextRequest, NextResponse } from "next/server";
import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();

export async function GET(
  _req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id } = await params;
  try {
    const tenant = await prisma.tenant.findUnique({
      where: { id },
      include: {
        _count: { select: { members: true, users: true, events: true } },
      },
    });
    if (!tenant) return NextResponse.json({ error: "Nao encontrado" }, { status: 404 });
    return NextResponse.json(tenant);
  } catch (error) {
    return NextResponse.json({ error: "Erro interno" }, { status: 500 });
  }
}

export async function PUT(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id } = await params;
  try {
    const body = await request.json();
    const tenant = await prisma.tenant.update({
      where: { id },
      data: {
        ...(body.name !== undefined && { name: body.name }),
        ...(body.slug !== undefined && { slug: body.slug }),
        ...(body.plan !== undefined && { plan: body.plan }),
        ...(body.isActive !== undefined && { isActive: body.isActive }),
        ...(body.maxChurches !== undefined && { maxChurches: body.maxChurches }),
      },
    });
    return NextResponse.json(tenant);
  } catch (error) {
    return NextResponse.json({ error: "Erro interno" }, { status: 500 });
  }
}

export async function DELETE(
  _req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id } = await params;
  try {
    await prisma.tenant.update({
      where: { id },
      data: { isActive: false },
    });
    return NextResponse.json({ ok: true });
  } catch (error) {
    return NextResponse.json({ error: "Erro interno" }, { status: 500 });
  }
}
