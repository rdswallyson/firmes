import { NextRequest, NextResponse } from "next/server";
import { getSession } from "../../../../lib/auth";
import { prisma } from "@firmes/db";

export async function GET(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const session = await getSession();
  if (!session) return NextResponse.json({ error: "Não autenticado" }, { status: 401 });

  const { id } = await params;
  const member = await prisma.member.findFirst({
    where: { id, tenantId: session.tenantId },
  });

  if (!member) return NextResponse.json({ error: "Membro não encontrado" }, { status: 404 });
  return NextResponse.json({ member });
}

export async function PUT(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const session = await getSession();
  if (!session) return NextResponse.json({ error: "Não autenticado" }, { status: 401 });

  const { id } = await params;
  const body = await req.json() as Record<string, unknown>;

  const existing = await prisma.member.findFirst({
    where: { id, tenantId: session.tenantId },
  });
  if (!existing) return NextResponse.json({ error: "Membro não encontrado" }, { status: 404 });

  const member = await prisma.member.update({
    where: { id },
    data: {
      name: body.name as string | undefined,
      email: body.email as string | undefined,
      phone: body.phone as string | undefined,
      birthDate: body.birthDate ? new Date(body.birthDate as string) : undefined,
      baptismDate: body.baptismDate ? new Date(body.baptismDate as string) : undefined,
      address: body.address as string | undefined,
      cep: body.cep as string | undefined,
      city: body.city as string | undefined,
      state: body.state as string | undefined,
      neighborhood: body.neighborhood as string | undefined,
      number: body.number as string | undefined,
      complement: body.complement as string | undefined,
      photo: body.photo as string | undefined,
      role: body.role as string | undefined,
      groupId: body.groupId as string | undefined,
      status: body.status as string | undefined,
      notes: body.notes as string | undefined,
    },
  });

  return NextResponse.json({ member });
}

export async function DELETE(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const session = await getSession();
  if (!session) return NextResponse.json({ error: "Não autenticado" }, { status: 401 });

  const { id } = await params;
  const existing = await prisma.member.findFirst({
    where: { id, tenantId: session.tenantId },
  });
  if (!existing) return NextResponse.json({ error: "Membro não encontrado" }, { status: 404 });

  await prisma.member.update({
    where: { id },
    data: { isActive: false, status: "INACTIVE" },
  });

  return NextResponse.json({ success: true });
}
