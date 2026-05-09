import { NextRequest, NextResponse } from "next/server";
import { getSession } from "../../../../../lib/auth";
import { prisma } from "@firmes/db";

export async function PUT(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const session = await getSession();
  if (!session) return NextResponse.json({ error: "Não autenticado" }, { status: 401 });

  const { id } = await params;
  const { tenantId } = session;
  const body = await req.json() as { nome?: string; cor?: string; ordem?: number };

  const existing = await prisma.cursoCategoria.findFirst({
    where: { id, tenantId },
  });
  if (!existing) return NextResponse.json({ error: "Categoria não encontrada" }, { status: 404 });

  try {
    const categoria = await prisma.cursoCategoria.update({
      where: { id },
      data: {
        ...(body.nome !== undefined && { nome: body.nome.trim() }),
        ...(body.cor !== undefined && { cor: body.cor }),
        ...(body.ordem !== undefined && { ordem: body.ordem }),
      },
    });
    return NextResponse.json({ categoria });
  } catch (error: any) {
    if (error.code === "P2002") {
      return NextResponse.json({ error: "Categoria já existe" }, { status: 409 });
    }
    throw error;
  }
}

export async function DELETE(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const session = await getSession();
  if (!session) return NextResponse.json({ error: "Não autenticado" }, { status: 401 });

  const { id } = await params;
  const { tenantId } = session;

  const existing = await prisma.cursoCategoria.findFirst({
    where: { id, tenantId },
  });
  if (!existing) return NextResponse.json({ error: "Categoria não encontrada" }, { status: 404 });

  await prisma.cursoCategoria.delete({ where: { id } });

  return NextResponse.json({ ok: true });
}
