import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@firmes/db";
import { getSession } from "../../../../lib/auth";

export async function PUT(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id } = await params;
  try {
    const session = await getSession();
    if (!session?.tenantId) return NextResponse.json({ error: "Não autorizado" }, { status: 401 });

    const body = await request.json();
    const { nome, descricao, coordenadorId, status } = body;

    const escola = await prisma.escola.updateMany({
      where: { id, tenantId: session.tenantId, deletedAt: null },
      data: {
        nome,
        descricao: descricao ?? null,
        coordenadorId: coordenadorId ?? null,
        status,
      },
    });
    return NextResponse.json({ escola });
  } catch (error) {
    console.error("[PUT /api/escolas/id]", error);
    return NextResponse.json({ error: "Erro interno" }, { status: 500 });
  }
}

export async function DELETE(
  _request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id } = await params;
  try {
    const session = await getSession();
    if (!session?.tenantId) return NextResponse.json({ error: "Não autorizado" }, { status: 401 });

    await prisma.escola.updateMany({
      where: { id, tenantId: session.tenantId },
      data: { deletedAt: new Date() },
    });
    return NextResponse.json({ success: true });
  } catch (error) {
    console.error("[DELETE /api/escolas/id]", error);
    return NextResponse.json({ error: "Erro interno" }, { status: 500 });
  }
}
