import { NextRequest, NextResponse } from "next/server";
import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();

export async function GET(request: NextRequest) {
  try {
    const tenant = await prisma.tenant.findFirst();
    if (!tenant) return NextResponse.json({ error: "No tenant" }, { status: 400 });
    
    const { searchParams } = new URL(request.url);
    const categoria = searchParams.get("categoria");
    const busca = searchParams.get("busca");
    
    const where: any = { tenantId: tenant.id };
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
    const tenant = await prisma.tenant.findFirst();
    if (!tenant) return NextResponse.json({ error: "No tenant" }, { status: 400 });
    
    const body = await request.json();
    const { titulo, tipo, categoria, url, pregador, data, duracao } = body;
    
    if (!titulo || !tipo || !categoria || !url) {
      return NextResponse.json({ error: "Campos obrigatórios: titulo, tipo, categoria, url" }, { status: 400 });
    }
    
    const midia = await prisma.midia.create({
      data: {
        tenantId: tenant.id,
        titulo,
        tipo,
        categoria,
        url,
        pregador: pregador ?? null,
        data: data ? new Date(data) : null,
        duracao: duracao ?? null,
        reproducoes: 0,
      },
    });
    
    return NextResponse.json(midia, { status: 201 });
  } catch (error) {
    console.error("[POST /api/midias]", error);
    return NextResponse.json({ error: "Erro interno" }, { status: 500 });
  }
}
