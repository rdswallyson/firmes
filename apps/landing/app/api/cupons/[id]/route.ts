import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@firmes/db";

export async function PUT(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  try {
    const { id } = await params;
    const body = await req.json();

    const cupom = await prisma.cupom.update({
      where: { id },
      data: body,
    });

    return NextResponse.json(cupom);
  } catch (error) {
    console.error("[PUT /api/cupons/[id]]", error);
    return NextResponse.json({ error: "Erro ao atualizar cupom" }, { status: 500 });
  }
}

export async function DELETE(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  try {
    const { id } = await params;
    await prisma.cupom.delete({ where: { id } });
    return NextResponse.json({ success: true });
  } catch (error) {
    console.error("[DELETE /api/cupons/[id]]", error);
    return NextResponse.json({ error: "Erro ao excluir cupom" }, { status: 500 });
  }
}
