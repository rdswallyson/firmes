import { NextRequest, NextResponse } from "next/server";
import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();

export async function POST(
  request: NextRequest,
  { params }: { params: Promise<{ qrCode: string }> }
) {
  const { qrCode } = await params;
  try {
    const body = await request.json();
    const { pontoId } = body;

    if (!pontoId) return NextResponse.json({ error: "pontoId obrigatorio" }, { status: 400 });

    const inscricao = await prisma.inscricao.findUnique({ where: { qrCode } });
    if (!inscricao) return NextResponse.json({ error: "QR Code invalido" }, { status: 404 });

    // Check if already scanned at this point today
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    const tomorrow = new Date(today);
    tomorrow.setDate(tomorrow.getDate() + 1);

    const existing = await prisma.eventoCheckinScan.findFirst({
      where: {
        inscricaoId: inscricao.id,
        pontoId,
        dataHora: { gte: today, lt: tomorrow },
      },
    });

    if (existing) {
      return NextResponse.json({ error: "Ja realizado neste ponto hoje" }, { status: 409 });
    }

    const scan = await prisma.eventoCheckinScan.create({
      data: {
        pontoId,
        inscricaoId: inscricao.id,
      },
      include: { ponto: true },
    });

    // Also update the main checkinAt if not set
    if (!inscricao.checkinAt) {
      await prisma.inscricao.update({
        where: { id: inscricao.id },
        data: { checkinAt: new Date() },
      });
    }

    return NextResponse.json(scan, { status: 201 });
  } catch (error) {
    console.error("[POST checkin-ponto]", error);
    return NextResponse.json({ error: "Erro interno" }, { status: 500 });
  }
}
