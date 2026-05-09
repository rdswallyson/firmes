import { NextRequest, NextResponse } from "next/server";
import { getSession } from "../../../../../lib/auth";
import { prisma } from "@firmes/db";

// POST /api/grupos/[id]/membros - Add member to group
export async function POST(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const session = await getSession();
  if (!session) return NextResponse.json({ error: "Não autenticado" }, { status: 401 });

  const { id } = await params;
  const { tenantId } = session;
  const body = await req.json() as { memberId?: string };

  if (!body.memberId) {
    return NextResponse.json({ error: "memberId obrigatório" }, { status: 400 });
  }

  const grupo = await prisma.group.findFirst({
    where: { id, tenantId },
  });
  if (!grupo) return NextResponse.json({ error: "Grupo não encontrado" }, { status: 404 });

  const member = await prisma.member.findFirst({
    where: { id: body.memberId, tenantId },
  });
  if (!member) return NextResponse.json({ error: "Membro não encontrado" }, { status: 404 });

  try {
    const groupMember = await prisma.groupMember.create({
      data: {
        groupId: id,
        memberId: body.memberId,
      },
    });
    return NextResponse.json({ groupMember }, { status: 201 });
  } catch (error: any) {
    if (error.code === "P2002") {
      return NextResponse.json({ error: "Membro já está no grupo" }, { status: 409 });
    }
    throw error;
  }
}

// DELETE /api/grupos/[id]/membros?memberId=xxx - Remove member from group
export async function DELETE(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const session = await getSession();
  if (!session) return NextResponse.json({ error: "Não autenticado" }, { status: 401 });

  const { id } = await params;
  const { tenantId } = session;
  const { searchParams } = new URL(req.url);
  const memberId = searchParams.get("memberId");

  if (!memberId) {
    return NextResponse.json({ error: "memberId obrigatório" }, { status: 400 });
  }

  const grupo = await prisma.group.findFirst({
    where: { id, tenantId },
  });
  if (!grupo) return NextResponse.json({ error: "Grupo não encontrado" }, { status: 404 });

  await prisma.groupMember.deleteMany({
    where: { groupId: id, memberId },
  });

  return NextResponse.json({ ok: true });
}
