import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@firmes/db";

export async function POST(request: NextRequest, { params }: { params: Promise<{ qrCode: string }> }) {
  try {
    const { qrCode } = await params;
    const culto = await prisma.culto.findUnique({
      where: { qrCode },
      include: { tenant: { select: { id: true, name: true } } },
    });

    if (!culto || !culto.ativo) {
      return NextResponse.json({ error: "QR Code inválido ou culto encerrado" }, { status: 404 });
    }

    const body = await request.json();
    const { nome, tipo, memberId, telefone, comoConheceu } = body;

    if (!nome || !tipo) {
      return NextResponse.json({ error: "Nome e tipo obrigatórios" }, { status: 400 });
    }

    const checkin = await prisma.checkin.create({
      data: {
        cultoId: culto.id,
        tenantId: culto.tenant.id,
        nome,
        tipo,
        memberId: memberId || null,
        telefone: telefone || null,
        comoConheceu: comoConheceu || null,
      },
    });

    return NextResponse.json({ checkin, culto: { titulo: culto.titulo, data: culto.data } }, { status: 201 });
  } catch (error) {
    console.error("[POST /api/checkin/[qrCode]]", error);
    return NextResponse.json({ error: "Erro interno" }, { status: 500 });
  }
}

export async function GET(request: NextRequest, { params }: { params: Promise<{ qrCode: string }> }) {
  try {
    const { qrCode } = await params;
    const culto = await prisma.culto.findUnique({
      where: { qrCode },
      include: { tenant: { select: { name: true, logo: true } } },
    });

    if (!culto) return NextResponse.json({ error: "QR Code inválido" }, { status: 404 });

    return NextResponse.json({ culto });
  } catch (error) {
    return NextResponse.json({ error: "Erro interno" }, { status: 500 });
  }
}
