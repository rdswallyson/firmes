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
    const { refeicaoId, dia } = body;

    if (!refeicaoId || !dia) return NextResponse.json({ error: "refeicaoId e dia obrigatorios" }, { status: 400 });

    const inscricao = await prisma.inscricao.findUnique({ where: { qrCode } });
    if (!inscricao) return NextResponse.json({ error: "QR Code invalido" }, { status: 404 });

    // @@unique prevents duplicate
    const refeicao = await prisma.inscricaoRefeicao.create({
      data: {
        inscricaoId: inscricao.id,
        refeicaoId,
        dia,
      },
      include: { refeicao: true },
    });

    return NextResponse.json(refeicao, { status: 201 });
  } catch (error: any) {
    if (error?.code === "P2002") {
      return NextResponse.json({ error: "Refeicao ja utilizada neste dia" }, { status: 409 });
    }
    console.error("[POST refeicao]", error);
    return NextResponse.json({ error: "Erro interno" }, { status: 500 });
  }
}
