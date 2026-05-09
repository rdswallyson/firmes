import { NextRequest, NextResponse } from "next/server";
import { getSession } from "../../../../lib/auth";
import { prisma } from "@firmes/db";

export async function GET(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const session = await getSession();
  if (!session) return NextResponse.json({ error: "Não autenticado" }, { status: 401 });

  const { id } = await params;
  const { tenantId } = session;

  const grupo = await prisma.group.findFirst({
    where: { id, tenantId },
    include: {
      leader: { select: { id: true, name: true, photo: true } },
      members: {
        include: {
          member: { select: { id: true, name: true, photo: true, phone: true } },
        },
      },
      frequencias: { orderBy: { date: "desc" }, take: 10 },
      _count: { select: { members: true } },
    },
  });

  if (!grupo) return NextResponse.json({ error: "Grupo não encontrado" }, { status: 404 });

  return NextResponse.json({ grupo });
}

export async function PUT(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const session = await getSession();
  if (!session) return NextResponse.json({ error: "Não autenticado" }, { status: 401 });

  const { id } = await params;
  const { tenantId } = session;
  const body = await req.json() as Record<string, unknown>;

  const existing = await prisma.group.findFirst({ where: { id, tenantId } });
  if (!existing) return NextResponse.json({ error: "Grupo não encontrado" }, { status: 404 });

  const grupo = await prisma.group.update({
    where: { id },
    data: {
      ...(body.name !== undefined && { name: body.name as string }),
      ...(body.description !== undefined && { description: body.description as string | null }),
      ...(body.leaderId !== undefined && { leaderId: body.leaderId as string | null }),
      ...(body.meetingDay !== undefined && { meetingDay: body.meetingDay as string | null }),
      ...(body.meetingTime !== undefined && { meetingTime: body.meetingTime as string | null }),
      ...(body.address !== undefined && { address: body.address as string | null }),
    },
  });

  return NextResponse.json({ grupo });
}

export async function DELETE(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const session = await getSession();
  if (!session) return NextResponse.json({ error: "Não autenticado" }, { status: 401 });

  const { id } = await params;
  const { tenantId } = session;

  const existing = await prisma.group.findFirst({ where: { id, tenantId } });
  if (!existing) return NextResponse.json({ error: "Grupo não encontrado" }, { status: 404 });

  await prisma.group.update({
    where: { id },
    data: { isActive: false },
  });

  return NextResponse.json({ ok: true });
}
