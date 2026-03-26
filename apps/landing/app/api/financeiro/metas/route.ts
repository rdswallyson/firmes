import { NextRequest, NextResponse } from "next/server";
import { getSession } from "../../../../lib/auth";
import { prisma } from "@firmes/db";

export async function GET(req: NextRequest) {
  const session = await getSession();
  if (!session) return NextResponse.json({ error: "Não autenticado" }, { status: 401 });

  const metas = await prisma.meta.findMany({
    where: { tenantId: session.tenantId },
    orderBy: { createdAt: "desc" },
  });
  return NextResponse.json({ metas });
}

export async function POST(req: NextRequest) {
  const session = await getSession();
  if (!session) return NextResponse.json({ error: "Não autenticado" }, { status: 401 });

  const body = await req.json() as Record<string, unknown>;
  if (!body.titulo || !body.valorMeta) {
    return NextResponse.json({ error: "titulo e valorMeta são obrigatórios" }, { status: 400 });
  }

  const meta = await prisma.meta.create({
    data: {
      tenantId: session.tenantId,
      titulo: body.titulo as string,
      descricao: (body.descricao as string) || undefined,
      valorMeta: Number(body.valorMeta),
      dataFim: body.dataFim ? new Date(body.dataFim as string) : undefined,
    },
  });
  return NextResponse.json({ meta }, { status: 201 });
}
