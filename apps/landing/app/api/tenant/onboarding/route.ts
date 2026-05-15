import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@firmes/db";

export async function POST(req: NextRequest) {
  try {
    const session = req.cookies.get("session")?.value;
    if (!session) {
      return NextResponse.json({ error: "Não autenticado" }, { status: 401 });
    }

    const user = await prisma.user.findFirst({
      where: { id: session },
      select: { tenantId: true },
    });

    if (!user) {
      return NextResponse.json({ error: "Usuário não encontrado" }, { status: 404 });
    }

    await prisma.tenant.update({
      where: { id: user.tenantId },
      data: { onboardingCompleted: true },
    });

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error("[POST /api/tenant/onboarding]", error);
    return NextResponse.json({ error: "Erro ao atualizar onboarding" }, { status: 500 });
  }
}
