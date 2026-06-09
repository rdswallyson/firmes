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
      // 1) Buscar a congregação base SEM includes pesados — 404 real só se não existir.
      const base = await prisma.congregation.findFirst({
        where: { id, tenantId: session.tenantId, deletedAt: null },
      });
      if (!base) {
        return NextResponse.json({ error: "Congregação não encontrada" }, { status: 404 });
      }

      // 2) Carregar relações em blocos isolados que degradam para vazio
      //    caso a coluna congregationId ainda não exista em alguma tabela.
      let pastor: { id: string; name: string; photo: string | null; role: string | null } | null = null;
      if (base.pastorId) {
        try {
          pastor = await prisma.member.findFirst({
            where: { id: base.pastorId },
            select: { id: true, name: true, photo: true, role: true },
          });
        } catch (e) { console.error("[congregacoes] pastor fail", e); }
      }

      let members: { id: string; name: string; role: string | null; phone: string | null; createdAt: Date }[] = [];
      try {
        members = await prisma.member.findMany({
          where: { congregationId: id },
          select: { id: true, name: true, role: true, phone: true, createdAt: true },
          orderBy: { createdAt: "desc" },
        });
      } catch (e) { console.error("[congregacoes] members fail", e); }

      let cultos: { id: string; titulo: string; data: Date; tipo: string; _count: { checkins: number } }[] = [];
      try {
        cultos = await prisma.culto.findMany({
          where: { congregationId: id },
          select: { id: true, titulo: true, data: true, tipo: true, _count: { select: { checkins: true } } },
          orderBy: { data: "desc" },
          take: 20,
        });
      } catch (e) { console.error("[congregacoes] cultos fail", e); }

      let finances: { id: string; type: string; amount: number; date: Date | null }[] = [];
      try {
        finances = await prisma.finance.findMany({
          where: { congregationId: id },
          select: { id: true, type: true, amount: true, date: true },
        });
      } catch (e) { console.error("[congregacoes] finances fail", e); }

      const receitas = finances.filter((f) => f.type === "RECEITA").reduce((s, f) => s + f.amount, 0);
      const despesas = finances.filter((f) => f.type === "DESPESA").reduce((s, f) => s + f.amount, 0);

      // Resumo do mês atual
      const now = new Date();
      const inicioMes = new Date(now.getFullYear(), now.getMonth(), 1);
      const fimMes = new Date(now.getFullYear(), now.getMonth() + 1, 1);
      const finMes = finances.filter((f) => f.date && f.date >= inicioMes && f.date < fimMes);
      const receitasMes = finMes.filter((f) => f.type === "RECEITA").reduce((s, f) => s + f.amount, 0);
      const despesasMes = finMes.filter((f) => f.type === "DESPESA").reduce((s, f) => s + f.amount, 0);

      // Próximo culto agendado (data futura mais próxima)
      const futuros = cultos
        .filter((c) => new Date(c.data) >= now)
        .sort((a, b) => new Date(a.data).getTime() - new Date(b.data).getTime());
      const proximoCulto = futuros[0] ?? null;

      // Frequência média = média de check-ins por culto realizado
      const realizados = cultos.filter((c) => new Date(c.data) < now);
      const totalCheckins = realizados.reduce((s, c) => s + (c._count?.checkins ?? 0), 0);
      const freqMedia = realizados.length > 0 ? Math.round(totalCheckins / realizados.length) : 0;

      // Próximos eventos vinculados à congregação
      let proximosEventos: { id: string; title: string; date: Date }[] = [];
      try {
        proximosEventos = await prisma.event.findMany({
          where: { congregationId: id, date: { gte: now } },
          select: { id: true, title: true, date: true },
          orderBy: { date: "asc" },
          take: 3,
        });
      } catch (e) { console.error("[congregacoes] eventos fail", e); }

      return NextResponse.json({
        congregation: {
          ...base,
          pastor,
          members,
          cultos,
          proximosEventos,
          resumoFinanceiro: { receitas, despesas, saldo: receitas - despesas },
          resumoMes: { receitas: receitasMes, despesas: despesasMes, saldo: receitasMes - despesasMes },
          proximoCulto,
          freqMedia,
          _count: { members: members.length, finances: finances.length, cultos: cultos.length },
        },
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
