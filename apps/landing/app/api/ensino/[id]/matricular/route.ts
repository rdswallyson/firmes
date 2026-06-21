import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@firmes/db";
import { getSession } from "../../../../../lib/auth";

export async function POST(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id: cursoId } = await params;
  try {
    const session = await getSession();
    if (!session?.tenantId) return NextResponse.json({ error: "Não autorizado" }, { status: 401 });

    const body = await request.json();
    const { memberId } = body;
    if (!memberId) return NextResponse.json({ error: "memberId obrigatorio" }, { status: 400 });

    // Cria progresso inicial (0 aulas concluidas) para que o membro apareca nos discipulados
    const progresso = await prisma.cursoProgresso.create({
      data: {
        cursoId,
        memberId,
        aulaId: "inicio",
        concluido: false,
      },
    });

    return NextResponse.json({ progresso }, { status: 201 });
  } catch (error: any) {
    if (error?.code === "P2002") {
      return NextResponse.json({ error: "Membro ja matriculado neste curso" }, { status: 409 });
    }
    console.error("[POST /api/ensino/id/matricular]", error);
    return NextResponse.json({ error: "Erro interno" }, { status: 500 });
  }
}
