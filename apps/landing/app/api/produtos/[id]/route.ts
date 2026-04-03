import { NextRequest, NextResponse } from "next/server";
import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();

export async function GET(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  try {
    const produto = await prisma.produto.findUnique({ where: { id }, include: { variacoes: true } });
    if (!produto) return NextResponse.json({ error: "Não encontrado" }, { status: 404 });
    return NextResponse.json(produto);
  } catch (error) {
    return NextResponse.json({ error: "Erro interno" }, { status: 500 });
  }
}

export async function PUT(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  try {
    const body = await req.json();
    const produto = await prisma.produto.update({
      where: { id },
      data: {
        ...(body.nome !== undefined && { nome: body.nome }),
        ...(body.descricao !== undefined && { descricao: body.descricao }),
        ...(body.preco !== undefined && { preco: Number(body.preco) }),
        ...(body.categoria !== undefined && { categoria: body.categoria }),
        ...(body.estoque !== undefined && { estoque: body.estoque }),
        ...(body.ativo !== undefined && { ativo: body.ativo }),
        ...(body.foto !== undefined && { foto: body.foto }),
      },
    });
    return NextResponse.json(produto);
  } catch (error) {
    return NextResponse.json({ error: "Erro interno" }, { status: 500 });
  }
}

export async function DELETE(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  try {
    await prisma.produto.update({ where: { id }, data: { ativo: false } });
    return NextResponse.json({ ok: true });
  } catch (error) {
    return NextResponse.json({ error: "Erro interno" }, { status: 500 });
  }
}
