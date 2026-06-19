import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@firmes/db";
import { getSession } from "../../../../../lib/auth";

export async function POST(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id: escolaId } = await params;
  try {
    const session = await getSession();
    if (!session?.tenantId) return NextResponse.json({ error: "Não autorizado" }, { status: 401 });

    const body = await request.json();
    const { memberId } = body;
    if (!memberId) return NextResponse.json({ error: "memberId obrigatorio" }, { status: 400 });

    const aluno = await prisma.escolaAluno.create({
      data: { escolaId, memberId },
    });
    return NextResponse.json({ aluno }, { status: 201 });
  } catch (error) {
    console.error("[POST /api/escolas/id/alunos]", error);
    return NextResponse.json({ error: "Erro interno" }, { status: 500 });
  }
}

export async function DELETE(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id: escolaId } = await params;
  try {
    const session = await getSession();
    if (!session?.tenantId) return NextResponse.json({ error: "Não autorizado" }, { status: 401 });

    const { searchParams } = new URL(request.url);
    const memberId = searchParams.get("memberId");
    if (!memberId) return NextResponse.json({ error: "memberId obrigatorio" }, { status: 400 });

    await prisma.escolaAluno.deleteMany({
      where: { escolaId, memberId },
    });
    return NextResponse.json({ success: true });
  } catch (error) {
    console.error("[DELETE /api/escolas/id/alunos]", error);
    return NextResponse.json({ error: "Erro interno" }, { status: 500 });
  }
}
