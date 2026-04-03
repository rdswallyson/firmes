import { NextRequest, NextResponse } from "next/server";
import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();

export async function POST(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  try {
    const body = await req.json();
    const { pontoQrToken, inscricaoQrCode } = body;

    if (!pontoQrToken || !inscricaoQrCode) {
      return NextResponse.json({ error: "pontoQrToken e inscricaoQrCode obrigatórios" }, { status: 400 });
    }

    const ponto = await prisma.eventoCheckinPonto.findUnique({ where: { qrToken: pontoQrToken } });
    if (!ponto) return NextResponse.json({ error: "Ponto de check-in inválido" }, { status: 404 });

    const inscricao = await prisma.inscricao.findUnique({ where: { qrCode: inscricaoQrCode } });
    if (!inscricao) return NextResponse.json({ error: "Inscrição inválida" }, { status: 404 });

    if (inscricao.eventId !== id) {
      return NextResponse.json({ error: "Inscrição não pertence a este evento" }, { status: 400 });
    }

    const scan = await prisma.eventoCheckinScan.create({
      data: { pontoId: ponto.id, inscricaoId: inscricao.id },
    });

    return NextResponse.json({ scan, inscricao: { nome: inscricao.nome, tipo: inscricao.tipo } });
  } catch (error) {
    console.error("[POST /api/eventos/id/scan]", error);
    return NextResponse.json({ error: "Erro interno" }, { status: 500 });
  }
}
