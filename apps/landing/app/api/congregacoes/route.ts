import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@firmes/db";
import { getSession } from "../../../lib/auth";

// GET — listar congregações filtradas por tenantId (exclui soft-deleted)
export async function GET(req: NextRequest) {
  try {
    const session = await getSession();
    if (!session?.tenantId) {
      return NextResponse.json({ error: "Não autenticado" }, { status: 401 });
    }

    const { searchParams } = new URL(req.url);
    const id = searchParams.get("id");

    if (id) {
      const congregation = await prisma.congregation.findFirst({
        where: { id, tenantId: session.tenantId, deletedAt: null },
        include: {
          pastor: { select: { id: true, name: true } },
          members: {
            where: { isActive: true },
            select: { id: true, name: true, role: true, phone: true },
            orderBy: { name: "asc" },
          },
          cultos: {
            where: { ativo: true },
            select: { id: true, titulo: true, data: true, tipo: true },
            orderBy: { data: "desc" },
            take: 10,
          },
          finances: {
            where: { isActive: true },
            select: { id: true, type: true, amount: true },
          },
          _count: { select: { members: true, finances: true, cultos: true } },
        },
      });
      if (!congregation) {
        return NextResponse.json({ error: "Congregação não encontrada" }, { status: 404 });
      }

      const receitas = congregation.finances
        .filter((f) => f.type === "RECEITA")
        .reduce((s, f) => s + f.amount, 0);
      const despesas = congregation.finances
        .filter((f) => f.type === "DESPESA")
        .reduce((s, f) => s + f.amount, 0);

      const { finances, ...rest } = congregation;
      void finances;

      return NextResponse.json({
        congregation: { ...rest, resumoFinanceiro: { receitas, despesas, saldo: receitas - despesas } },
      });
    }

    const congregations = await prisma.congregation.findMany({
      where: { tenantId: session.tenantId, deletedAt: null },
      orderBy: { name: "asc" },
      include: {
        pastor: { select: { id: true, name: true } },
        _count: { select: { members: true } },
      },
    });

    return NextResponse.json({ congregations });
  } catch (error) {
    console.error("[GET /api/congregacoes]", error);
    return NextResponse.json({ error: "Erro interno" }, { status: 500 });
  }
}

// POST — criar congregação
export async function POST(req: NextRequest) {
  try {
    const session = await getSession();
    if (!session?.tenantId) {
      return NextResponse.json({ error: "Não autenticado" }, { status: 401 });
    }

    const body = await req.json();
    const { name, address, city, phone, pastorId } = body;

    if (!name || typeof name !== "string" || !name.trim()) {
      return NextResponse.json({ error: "Nome é obrigatório" }, { status: 400 });
    }

    const congregation = await prisma.congregation.create({
      data: {
        tenantId: session.tenantId,
        name: name.trim(),
        address: address || null,
        city: city || null,
        phone: phone || null,
        pastorId: pastorId || null,
      },
    });

    return NextResponse.json({ congregation }, { status: 201 });
  } catch (error) {
    console.error("[POST /api/congregacoes]", error);
    return NextResponse.json({ error: "Erro interno" }, { status: 500 });
  }
}

// PUT — atualizar congregação
export async function PUT(req: NextRequest) {
  try {
    const session = await getSession();
    if (!session?.tenantId) {
      return NextResponse.json({ error: "Não autenticado" }, { status: 401 });
    }

    const { searchParams } = new URL(req.url);
    const id = searchParams.get("id");

    if (!id) {
      return NextResponse.json({ error: "ID é obrigatório" }, { status: 400 });
    }

    const existente = await prisma.congregation.findFirst({
      where: { id, tenantId: session.tenantId, deletedAt: null },
      select: { id: true },
    });
    if (!existente) {
      return NextResponse.json({ error: "Congregação não encontrada" }, { status: 404 });
    }

    const body = await req.json();

    const congregation = await prisma.congregation.update({
      where: { id },
      data: {
        name: body.name !== undefined ? String(body.name).trim() : undefined,
        address: body.address !== undefined ? body.address || null : undefined,
        city: body.city !== undefined ? body.city || null : undefined,
        phone: body.phone !== undefined ? body.phone || null : undefined,
        pastorId: body.pastorId !== undefined ? body.pastorId || null : undefined,
      },
    });

    return NextResponse.json({ congregation });
  } catch (error) {
    console.error("[PUT /api/congregacoes]", error);
    return NextResponse.json({ error: "Erro interno" }, { status: 500 });
  }
}

// DELETE — soft delete (deletedAt)
export async function DELETE(req: NextRequest) {
  try {
    const session = await getSession();
    if (!session?.tenantId) {
      return NextResponse.json({ error: "Não autenticado" }, { status: 401 });
    }

    const { searchParams } = new URL(req.url);
    const id = searchParams.get("id");

    if (!id) {
      return NextResponse.json({ error: "ID é obrigatório" }, { status: 400 });
    }

    const existente = await prisma.congregation.findFirst({
      where: { id, tenantId: session.tenantId, deletedAt: null },
      select: { id: true },
    });
    if (!existente) {
      return NextResponse.json({ error: "Congregação não encontrada" }, { status: 404 });
    }

    await prisma.congregation.update({
      where: { id },
      data: { deletedAt: new Date() },
    });

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error("[DELETE /api/congregacoes]", error);
    return NextResponse.json({ error: "Erro interno" }, { status: 500 });
  }
}
