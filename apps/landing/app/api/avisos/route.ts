import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@firmes/db";
import { getSession } from "../../../lib/auth";

// GET — listar avisos filtrados por tenantId
export async function GET(req: NextRequest) {
  try {
    const session = await getSession();
    if (!session?.tenantId) {
      return NextResponse.json({ error: "Não autenticado" }, { status: 401 });
    }

    const { searchParams } = new URL(req.url);
    const pinned = searchParams.get("pinned");
    const search = searchParams.get("search");

    const where = {
      tenantId: session.tenantId,
      ...(pinned ? { pinned: pinned === "true" } : {}),
      ...(search
        ? {
            OR: [
              { title: { contains: search, mode: "insensitive" as const } },
              { content: { contains: search, mode: "insensitive" as const } },
            ],
          }
        : {}),
    };

    const avisos = await prisma.aviso.findMany({
      where,
      orderBy: [{ pinned: "desc" }, { dataInicio: "desc" }],
      include: {
        tenant: { select: { name: true } },
      },
    });

    return NextResponse.json({ avisos });
  } catch (error) {
    console.error("[GET /api/avisos]", error);
    return NextResponse.json({ error: "Erro interno" }, { status: 500 });
  }
}

// POST — criar aviso
export async function POST(req: NextRequest) {
  try {
    const session = await getSession();
    if (!session?.tenantId) {
      return NextResponse.json({ error: "Não autenticado" }, { status: 401 });
    }

    const body = await req.json();
    const { title, content, dataInicio, dataFim, pinned } = body;

    if (!title || !content) {
      return NextResponse.json(
        { error: "Título e conteúdo são obrigatórios" },
        { status: 400 }
      );
    }

    const aviso = await prisma.aviso.create({
      data: {
        tenantId: session.tenantId,
        title,
        content,
        dataInicio: dataInicio ? new Date(dataInicio) : new Date(),
        dataFim: dataFim ? new Date(dataFim) : null,
        pinned: !!pinned,
        authorId: session.userId,
      },
    });

    return NextResponse.json({ aviso }, { status: 201 });
  } catch (error) {
    console.error("[POST /api/avisos]", error);
    return NextResponse.json({ error: "Erro interno" }, { status: 500 });
  }
}

// PUT — atualizar aviso
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
        { error: "ID do aviso é obrigatório" },
        { status: 400 }
      );
    }

    const body = await req.json();

    const aviso = await prisma.aviso.update({
      where: { id, tenantId: session.tenantId },
      data: {
        title: body.title,
        content: body.content,
        dataInicio: body.dataInicio ? new Date(body.dataInicio) : undefined,
        dataFim: body.dataFim ? new Date(body.dataFim) : null,
        pinned: body.pinned !== undefined ? !!body.pinned : undefined,
      },
    });

    return NextResponse.json({ aviso });
  } catch (error) {
    console.error("[PUT /api/avisos]", error);
    return NextResponse.json({ error: "Erro interno" }, { status: 500 });
  }
}

// DELETE — deletar aviso
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
        { error: "ID do aviso é obrigatório" },
        { status: 400 }
      );
    }

    const avisoExistente = await prisma.aviso.findFirst({
      where: { id, tenantId: session.tenantId },
      select: { id: true },
    });

    if (!avisoExistente) {
      return NextResponse.json({ error: "Aviso não encontrado" }, { status: 404 });
    }

    await prisma.aviso.delete({
      where: { id },
    });

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error("[DELETE /api/avisos]", error);
    return NextResponse.json({ error: "Erro interno" }, { status: 500 });
  }
}
