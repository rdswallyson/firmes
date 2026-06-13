import { NextRequest, NextResponse } from "next/server";
import { getSession } from "../../../lib/auth";
import { prisma } from "@firmes/db";
import { randomUUID } from "crypto";

export async function GET(req: NextRequest) {
  try {
    const session = await getSession();
    if (!session?.tenantId) return NextResponse.json({ error: "Não autorizado" }, { status: 401 });

    const { searchParams } = new URL(req.url);
    const congregationIdParam = searchParams.get("congregationId") || undefined;

    const cultos = await prisma.culto.findMany({
      where: {
        tenantId: session.tenantId,
        ...(session.role === "PASTOR" && session.congregationId ? { congregationId: session.congregationId } : {}),
        ...(congregationIdParam ? { congregationId: congregationIdParam } : {}),
      },
      include: { _count: { select: { checkins: true } } },
      orderBy: { data: "desc" },
    });
    return NextResponse.json({ cultos });
  } catch (error) {
    console.error("[GET /api/cultos]", error);
    return NextResponse.json({ error: "Erro interno" }, { status: 500 });
  }
}

export async function POST(request: NextRequest) {
  try {
    const session = await getSession();
    if (!session?.tenantId) return NextResponse.json({ error: "Não autorizado" }, { status: 401 });

    const body = await request.json();
    const { titulo, data, local, tipo, descricao, tema, serie, transmissaoUrl, pregadorId, liderLouvorId, congregationId } = body;
    if (!titulo || !data) return NextResponse.json({ error: "Título e data obrigatórios" }, { status: 400 });

    const qrCode = randomUUID();

    const culto = await prisma.culto.create({
      data: {
        tenantId: session.tenantId,
        titulo,
        data: new Date(data),
        qrCode,
        local: local ?? null,
        tipo: tipo ?? "DOMINICAL",
        descricao: descricao ?? null,
        tema: tema ?? null,
        serie: serie ?? null,
        transmissaoUrl: transmissaoUrl ?? null,
        pregadorId: pregadorId ?? null,
        liderLouvorId: liderLouvorId ?? null,
        congregationId: congregationId ?? null,
      },
    });
    return NextResponse.json({ culto }, { status: 201 });
  } catch (error) {
    console.error("[POST /api/cultos]", error);
    return NextResponse.json({ error: "Erro interno" }, { status: 500 });
  }
}
