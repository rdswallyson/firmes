import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@firmes/db";
import { getSession } from "../../../lib/auth";
import { randomUUID } from "crypto";

// GET — listar patrimônio filtrado por tenantId
export async function GET(req: NextRequest) {
  try {
    const session = await getSession();
    if (!session?.tenantId) {
      return NextResponse.json({ error: "Não autenticado" }, { status: 401 });
    }

    const { searchParams } = new URL(req.url);
    const categoria = searchParams.get("categoria");
    const estado = searchParams.get("estado");
    const search = searchParams.get("search");

    const where = {
      tenantId: session.tenantId,
      isActive: true,
      ...(categoria ? { categoria } : {}),
      ...(estado ? { estado } : {}),
      ...(search
        ? {
            OR: [
              { nome: { contains: search, mode: "insensitive" as const } },
              { descricao: { contains: search, mode: "insensitive" as const } },
              { localizacao: { contains: search, mode: "insensitive" as const } },
            ],
          }
        : {}),
    };

    const bens = await prisma.patrimonio.findMany({
      where,
      orderBy: { createdAt: "desc" },
      include: {
        tenant: { select: { name: true } },
      },
    });

    return NextResponse.json({ bens });
  } catch (error) {
    console.error("[GET /api/patrimonio]", error);
    return NextResponse.json({ error: "Erro interno" }, { status: 500 });
  }
}

// POST — criar item de patrimônio
export async function POST(req: NextRequest) {
  try {
    const session = await getSession();
    if (!session?.tenantId) {
      return NextResponse.json({ error: "Não autenticado" }, { status: 401 });
    }

    const body = await req.json();
    const {
      nome,
      descricao,
      categoria,
      localizacao,
      dataAquisicao,
      valor,
      estado,
      responsavelId,
      foto,
    } = body;

    if (!nome) {
      return NextResponse.json(
        { error: "Nome é obrigatório" },
        { status: 400 }
      );
    }

    const bem = await prisma.patrimonio.create({
      data: {
        tenantId: session.tenantId,
        nome,
        descricao: descricao ?? null,
        categoria: categoria ?? null,
        localizacao: localizacao ?? null,
        dataAquisicao: dataAquisicao ? new Date(dataAquisicao) : null,
        valor: valor ? Number(valor) : null,
        estado: estado ?? "NOVO",
        responsavelId: responsavelId ?? null,
        foto: foto ?? null,
        qrCode: randomUUID(),
        isActive: true,
      },
    });

    return NextResponse.json({ bem }, { status: 201 });
  } catch (error) {
    console.error("[POST /api/patrimonio]", error);
    return NextResponse.json({ error: "Erro interno" }, { status: 500 });
  }
}

// PUT — atualizar item de patrimônio
export async function PUT(req: NextRequest) {
  try {
    const session = await getSession();
    if (!session?.tenantId) {
      return NextResponse.json({ error: "Não autenticado" }, { status: 401 });
    }

    const { searchParams } = new URL(req.url);
    const id = searchParams.get("id");

    if (!id) {
      return NextResponse.json(
        { error: "ID do item é obrigatório" },
        { status: 400 }
      );
    }

    const body = await req.json();

    const bem = await prisma.patrimonio.update({
      where: { id, tenantId: session.tenantId },
      data: {
        nome: body.nome,
        descricao: body.descricao ?? null,
        categoria: body.categoria ?? null,
        localizacao: body.localizacao ?? null,
        dataAquisicao: body.dataAquisicao ? new Date(body.dataAquisicao) : undefined,
        valor: body.valor ? Number(body.valor) : null,
        estado: body.estado,
        responsavelId: body.responsavelId ?? null,
        foto: body.foto ?? null,
        isActive: body.isActive !== undefined ? !!body.isActive : undefined,
      },
    });

    return NextResponse.json({ bem });
  } catch (error) {
    console.error("[PUT /api/patrimonio]", error);
    return NextResponse.json({ error: "Erro interno" }, { status: 500 });
  }
}

// DELETE — soft delete (desativar) item de patrimônio
export async function DELETE(req: NextRequest) {
  try {
    const session = await getSession();
    if (!session?.tenantId) {
      return NextResponse.json({ error: "Não autenticado" }, { status: 401 });
    }

    const { searchParams } = new URL(req.url);
    const id = searchParams.get("id");

    if (!id) {
      return NextResponse.json(
        { error: "ID do item é obrigatório" },
        { status: 400 }
      );
    }

    await prisma.patrimonio.update({
      where: { id, tenantId: session.tenantId },
      data: { isActive: false },
    });

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error("[DELETE /api/patrimonio]", error);
    return NextResponse.json({ error: "Erro interno" }, { status: 500 });
  }
}
