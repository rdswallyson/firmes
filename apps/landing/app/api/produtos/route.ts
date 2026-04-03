import { NextRequest, NextResponse } from "next/server";
import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();

export async function GET() {
  try {
    const tenant = await prisma.tenant.findFirst();
    if (!tenant) return NextResponse.json({ error: "No tenant" }, { status: 400 });
    const produtos = await prisma.produto.findMany({
      where: { tenantId: tenant.id, ativo: true },
      include: { variacoes: true },
      orderBy: { createdAt: "desc" },
    });
    return NextResponse.json({ produtos });
  } catch (error) {
    console.error("[GET /api/produtos]", error);
    return NextResponse.json({ error: "Erro interno" }, { status: 500 });
  }
}

export async function POST(request: NextRequest) {
  try {
    const tenant = await prisma.tenant.findFirst();
    if (!tenant) return NextResponse.json({ error: "No tenant" }, { status: 400 });
    const body = await request.json();
    const { nome, descricao, foto, preco, categoria, estoque, variacoes } = body;
    if (!nome || preco === undefined || !categoria) {
      return NextResponse.json({ error: "Campos obrigatórios: nome, preco, categoria" }, { status: 400 });
    }
    const produto = await prisma.produto.create({
      data: {
        tenantId: tenant.id,
        nome,
        descricao: descricao ?? null,
        foto: foto ?? null,
        preco: Number(preco),
        categoria,
        estoque: estoque ?? 0,
        variacoes: variacoes?.length ? {
          create: variacoes.map((v: { tipo: string; opcao: string; estoque?: number }) => ({
            tipo: v.tipo, opcao: v.opcao, estoque: v.estoque ?? 0,
          })),
        } : undefined,
      },
      include: { variacoes: true },
    });
    return NextResponse.json(produto, { status: 201 });
  } catch (error) {
    console.error("[POST /api/produtos]", error);
    return NextResponse.json({ error: "Erro interno" }, { status: 500 });
  }
}
