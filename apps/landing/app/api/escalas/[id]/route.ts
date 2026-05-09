import { NextRequest, NextResponse } from "next/server";
import { getSession } from "../../../../lib/auth";
import { prisma } from "@firmes/db";

export async function GET(request: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  try {
    const { id } = await params;
    const session = await getSession();
    if (!session?.tenantId) return NextResponse.json({ error: "Não autorizado" }, { status: 401 });

    const escala = await prisma.escala.findFirst({
      where: { id, tenantId: session.tenantId },
      include: {
        membros: { include: { member: { select: { id: true, name: true, photo: true, phone: true, email: true } } } },
      },
    });

    if (!escala) return NextResponse.json({ error: "Escala não encontrada" }, { status: 404 });
    return NextResponse.json({ escala });
  } catch (error) {
    return NextResponse.json({ error: "Erro interno" }, { status: 500 });
  }
}

export async function PUT(request: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  try {
    const { id } = await params;
    const session = await getSession();
    if (!session?.tenantId) return NextResponse.json({ error: "Não autorizado" }, { status: 401 });

    const body = await request.json();
    const { status, membros } = body;

    if (status) {
      await prisma.escala.update({ where: { id }, data: { status } });
    }

    if (membros) {
      for (const m of membros) {
        await prisma.escalaMembro.updateMany({
          where: { id: m.id, escalaId: id },
          data: { status: m.status },
        });
      }
    }

    return NextResponse.json({ ok: true });
  } catch (error) {
    return NextResponse.json({ error: "Erro interno" }, { status: 500 });
  }
}

export async function DELETE(request: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  try {
    const { id } = await params;
    const session = await getSession();
    if (!session?.tenantId) return NextResponse.json({ error: "Não autorizado" }, { status: 401 });

    await prisma.escala.delete({ where: { id } });
    return NextResponse.json({ ok: true });
  } catch (error) {
    return NextResponse.json({ error: "Erro interno" }, { status: 500 });
  }
}
