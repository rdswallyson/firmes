import { NextRequest, NextResponse } from "next/server";
import { getSession } from "../../../../lib/auth";
import { prisma } from "@firmes/db";

export async function GET(req: NextRequest) {
  const session = await getSession();
  if (!session) return NextResponse.json({ error: "Não autenticado" }, { status: 401 });

  const { tenantId } = session;

  const categorias = await prisma.cursoCategoria.findMany({
    where: { tenantId },
    orderBy: { ordem: "asc" },
  });

  // Count cursos per categoria
  const cursos = await prisma.curso.findMany({
    where: { tenantId },
    select: { categoria: true },
  });

  const countMap: Record<string, number> = {};
  cursos.forEach((c) => {
    countMap[c.categoria] = (countMap[c.categoria] || 0) + 1;
  });

  const result = categorias.map((cat) => ({
    ...cat,
    totalCursos: countMap[cat.nome] || 0,
  }));

  return NextResponse.json({ categorias: result });
}

export async function POST(req: NextRequest) {
  const session = await getSession();
  if (!session) return NextResponse.json({ error: "Não autenticado" }, { status: 401 });

  const { tenantId } = session;
  const body = await req.json() as { nome: string; cor?: string; ordem?: number };

  if (!body.nome?.trim()) {
    return NextResponse.json({ error: "Nome é obrigatório" }, { status: 400 });
  }

  try {
    const categoria = await prisma.cursoCategoria.create({
      data: {
        tenantId,
        nome: body.nome.trim(),
        cor: body.cor || "#1D4ED8",
        ordem: body.ordem ?? 0,
      },
    });
    return NextResponse.json({ categoria }, { status: 201 });
  } catch (error: any) {
    if (error.code === "P2002") {
      return NextResponse.json({ error: "Categoria já existe" }, { status: 409 });
    }
    throw error;
  }
}
