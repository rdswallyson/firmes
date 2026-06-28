import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@firmes/db";

export async function GET(
  _req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id } = await params;
  try {
    const inscricao = await prisma.inscricao.findUnique({
      where: { id },
      include: {
        event: {
          select: {
            id: true,
            title: true,
            date: true,
            dataFim: true,
            location: true,
            endereco: true,
            banner: true,
            isGratuito: true,
            valor: true,
            status: true,
          },
        },
        itensPedido: true,
      },
    });

    if (!inscricao) {
      return NextResponse.json({ error: "Inscrição não encontrada" }, { status: 404 });
    }

    return NextResponse.json(inscricao);
  } catch (error) {
    console.error("[GET /api/inscricoes/id]", error);
    return NextResponse.json({ error: "Erro interno" }, { status: 500 });
  }
}
