import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@firmes/db";
import { getSession } from "../../../lib/auth";

export async function GET(request: NextRequest) {
  try {
    const session = await getSession();
    if (!session?.tenantId) return NextResponse.json({ error: "Não autorizado" }, { status: 401 });

    const { searchParams } = new URL(request.url);
    const categoria = searchParams.get("categoria");
    const busca = searchParams.get("busca");

    const where: any = { tenantId: session.tenantId };
    if (categoria) where.categoria = categoria;
    if (busca) {
      where.OR = [
        { titulo: { contains: busca, mode: "insensitive" } },
        { pregador: { contains: busca, mode: "insensitive" } },
      ];
    }

    const midias = await prisma.midia.findMany({
      where,
      orderBy: { createdAt: "desc" },
    });

    return NextResponse.json({ midias });
  } catch (error) {
    console.error("[GET /api/midias]", error);
    return NextResponse.json({ error: "Erro interno" }, { status: 500 });
  }
}

export async function POST(request: NextRequest) {
  try {
    const session = await getSession();
    if (!session?.tenantId) return NextResponse.json({ error: "Não autorizado" }, { status: 401 });

    const body = await request.json();
    const { titulo, tipo, categoria, url, pregador, data, duracao } = body;

    if (!titulo || !tipo || !url) {
      return NextResponse.json({ error: "Campos obrigatórios: titulo, tipo, url" }, { status: 400 });
    }

    const midia = await prisma.midia.create({
      data: {
        tenantId: session.tenantId,
        titulo,
        tipo,
        categoria: categoria ?? "CULTO",
        url,
        pregador: pregador ?? null,
        data: data ? new Date(data) : null,
        duracao: duracao ?? null,
      },
    });

    return NextResponse.json({ midia }, { status: 201 });
  } catch (error) {
    console.error("[POST /api/midias]", error);
    return NextResponse.json({ error: "Erro interno" }, { status: 500 });
  }
}
