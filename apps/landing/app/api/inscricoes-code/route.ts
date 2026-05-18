import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@firmes/db";

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { code } = body;

    if (!code) return NextResponse.json({ error: "Código obrigatório" }, { status: 400 });

    const inscricao = await prisma.inscricao.findUnique({
      where: { qrCode: code },
      include: { event: { select: { title: true } } },
    });
    if (!inscricao) return NextResponse.json({ error: "QR Code inválido" }, { status: 404 });
    if (inscricao.checkinAt) return NextResponse.json({ error: "Check-in já realizado", inscricao }, { status: 409 });

    const updated = await prisma.inscricao.update({
      where: { qrCode: code },
      data: { checkinAt: new Date() },
      include: { event: { select: { title: true } } },
    });

    return NextResponse.json(updated);
  } catch (error) {
    console.error("[POST /api/inscricoes-code]", error);
    return NextResponse.json({ error: "Erro interno" }, { status: 500 });
  }
}
