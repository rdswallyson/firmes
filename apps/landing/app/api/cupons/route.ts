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

    const cupons = await prisma.cupom.findMany({
      where: { tenantId: user.tenantId },
      orderBy: { id: "desc" },
    });
    return NextResponse.json(cupons);
  } catch (error) {
    console.error("[GET /api/cupons]", error);
    return NextResponse.json({ error: "Erro ao buscar cupons" }, { status: 500 });
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
    const { codigo, desconto, tipo, maxUsos, validade } = body;

    if (!codigo || !desconto || !tipo) {
      return NextResponse.json({ error: "Dados incompletos" }, { status: 400 });
    }

    const cupom = await prisma.cupom.create({
      data: {
        tenantId: user.tenantId,
        codigo: codigo.toUpperCase(),
        desconto,
        tipo,
        maxUsos: maxUsos || null,
        validade: validade ? new Date(validade) : null,
      },
    });

    return NextResponse.json(cupom);
  } catch (error) {
    console.error("[POST /api/cupons]", error);
    return NextResponse.json({ error: "Erro ao criar cupom" }, { status: 500 });
  }
}
