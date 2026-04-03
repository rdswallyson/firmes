import { NextRequest, NextResponse } from "next/server";
import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { codigo } = body;

    if (!codigo) {
      return NextResponse.json({ error: "Codigo obrigatorio" }, { status: 400 });
    }

    const cupom = await prisma.cupom.findUnique({
      where: { codigo: codigo.toUpperCase() },
    });

    if (!cupom || !cupom.ativo) {
      return NextResponse.json({ error: "Cupom invalido ou inativo" }, { status: 404 });
    }

    if (cupom.validade && new Date(cupom.validade) < new Date()) {
      return NextResponse.json({ error: "Cupom expirado" }, { status: 400 });
    }

    if (cupom.maxUsos && cupom.usosAtual >= cupom.maxUsos) {
      return NextResponse.json({ error: "Cupom esgotado" }, { status: 400 });
    }

    return NextResponse.json({
      id: cupom.id,
      codigo: cupom.codigo,
      desconto: cupom.desconto,
      tipo: cupom.tipo,
    });
  } catch (error) {
    console.error("[POST /api/cupons/validar]", error);
    return NextResponse.json({ error: "Erro interno" }, { status: 500 });
  }
}
