import { NextRequest, NextResponse } from "next/server";
import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();

export async function GET() {
  try {
    const tenant = await prisma.tenant.findFirst();
    if (!tenant) return NextResponse.json({ error: "No tenant" }, { status: 400 });
    const cupons = await prisma.cupom.findMany({ where: { tenantId: tenant.id }, orderBy: { ativo: "desc" } });
    return NextResponse.json({ cupons });
  } catch (error) {
    return NextResponse.json({ error: "Erro interno" }, { status: 500 });
  }
}

export async function POST(request: NextRequest) {
  try {
    const tenant = await prisma.tenant.findFirst();
    if (!tenant) return NextResponse.json({ error: "No tenant" }, { status: 400 });
    const body = await request.json();
    const { codigo, desconto, tipo, maxUsos, validade } = body;
    if (!codigo || desconto === undefined || !tipo) {
      return NextResponse.json({ error: "Campos obrigatórios: codigo, desconto, tipo" }, { status: 400 });
    }
    const cupom = await prisma.cupom.create({
      data: {
        tenantId: tenant.id,
        codigo: codigo.toUpperCase(),
        desconto: Number(desconto),
        tipo,
        maxUsos: maxUsos ?? null,
        validade: validade ? new Date(validade) : null,
      },
    });
    return NextResponse.json(cupom, { status: 201 });
  } catch (error) {
    console.error("[POST /api/cupons]", error);
    return NextResponse.json({ error: "Erro interno" }, { status: 500 });
  }
}
