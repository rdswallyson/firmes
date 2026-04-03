import { NextRequest, NextResponse } from "next/server";
import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();

export async function POST(
  request: NextRequest,
  { params }: { params: Promise<{ qrCode: string }> }
) {
  const { qrCode } = await params;
  try {
    const inscricao = await prisma.inscricao.findUnique({
      where: { qrCode },
      include: { event: { select: { title: true } } },
    });
    if (!inscricao) return NextResponse.json({ error: "QR Code inválido" }, { status: 404 });
    if (inscricao.checkinAt) return NextResponse.json({ error: "Check-in já realizado", inscricao }, { status: 409 });

    const updated = await prisma.inscricao.update({
      where: { qrCode },
      data: { checkinAt: new Date() },
      include: { event: { select: { title: true } } },
    });
    return NextResponse.json(updated);
  } catch (error) {
    console.error("[POST /api/inscricoes/checkin]", error);
    return NextResponse.json({ error: "Erro interno" }, { status: 500 });
  }
}
