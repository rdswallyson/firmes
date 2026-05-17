import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@firmes/db";

export async function GET(req: NextRequest) {
  try {
    const session = req.cookies.get("session")?.value;
    if (!session) return NextResponse.json({ error: "Não autenticado" }, { status: 401 });

    const user = await prisma.user.findFirst({
      where: { id: session },
      select: { tenantId: true },
    });

    if (!user) return NextResponse.json({ error: "Usuário não encontrado" }, { status: 404 });

    const bens = await prisma.patrimonio.findMany({
      where: { tenantId: user.tenantId },
      orderBy: { createdAt: "desc" },
    });

    return NextResponse.json(bens);
  } catch (error) {
    console.error("[GET /api/patrimonio]", error);
    return NextResponse.json({ error: "Erro ao buscar patrimônio" }, { status: 500 });
  }
}

export async function POST(req: NextRequest) {
  try {
    const session = req.cookies.get("session")?.value;
    if (!session) return NextResponse.json({ error: "Não autenticado" }, { status: 401 });

    const user = await prisma.user.findFirst({
      where: { id: session },
      select: { tenantId: true },
    });

    if (!user) return NextResponse.json({ error: "Usuário não encontrado" }, { status: 404 });

    const body = await req.json();
    const { nome, descricao, categoria, localizacao, valor, dataAquisicao, estado } = body;

    const bem = await prisma.patrimonio.create({
      data: {
        tenantId: user.tenantId,
        nome,
        descricao,
        categoria,
        localizacao,
        valor: valor || 0,
        dataAquisicao: dataAquisicao ? new Date(dataAquisicao) : null,
        estado: estado || "BOM",
      },
    });

    return NextResponse.json(bem);
  } catch (error) {
    console.error("[POST /api/patrimonio]", error);
    return NextResponse.json({ error: "Erro ao criar bem" }, { status: 500 });
  }
}
