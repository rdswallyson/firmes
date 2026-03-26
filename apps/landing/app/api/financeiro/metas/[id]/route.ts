import { NextRequest, NextResponse } from "next/server";
import { getSession } from "../../../../../lib/auth";
import { prisma } from "@firmes/db";

export async function PUT(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const session = await getSession();
  if (!session) return NextResponse.json({ error: "Não autenticado" }, { status: 401 });
  const { id } = await params;
  const body = await req.json() as Record<string, unknown>;

  const meta = await prisma.meta.update({
    where: { id },
    data: {
      titulo: body.titulo as string | undefined,
      descricao: body.descricao as string | undefined,
      valorMeta: body.valorMeta ? Number(body.valorMeta) : undefined,
      dataFim: body.dataFim ? new Date(body.dataFim as string) : undefined,
      isAtiva: body.isAtiva as boolean | undefined,
    },
  });
  return NextResponse.json({ meta });
}

export async function DELETE(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const session = await getSession();
  if (!session) return NextResponse.json({ error: "Não autenticado" }, { status: 401 });
  const { id } = await params;
  await prisma.meta.update({ where: { id }, data: { isAtiva: false } });
  return NextResponse.json({ success: true });
}
