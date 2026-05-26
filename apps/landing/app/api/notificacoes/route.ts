import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@firmes/db";

export async function GET(req: NextRequest) {
  try {
    const session = req.cookies.get("session")?.value;
    if (!session) return NextResponse.json({ error: "Não autenticado" }, { status: 401 });

    const user = await prisma.user.findFirst({
      where: { id: session },
      select: { tenantId: true },
    });

    if (!user) return NextResponse.json({ error: "Usuário não encontrado" }, { status: 404 });

    // TODO: Criar model Notificacao no schema.prisma
    // const notificacoes = await prisma.notificacao.findMany({
    //   where: { tenantId: user.tenantId },
    //   orderBy: { createdAt: "desc" },
    // });
    // return NextResponse.json(notificacoes);
    return NextResponse.json([]);
  } catch (error) {
    console.error("[GET /api/notificacoes]", error);
    return NextResponse.json({ error: "Erro ao buscar notificações" }, { status: 500 });
  }
}

export async function POST(req: NextRequest) {
  try {
    const session = req.cookies.get("session")?.value;
    if (!session) return NextResponse.json({ error: "Não autenticado" }, { status: 401 });

    const user = await prisma.user.findFirst({
      where: { id: session },
      select: { tenantId: true },
    });

    if (!user) return NextResponse.json({ error: "Usuário não encontrado" }, { status: 404 });

    // TODO: Criar model Notificacao no schema.prisma
    // const body = await req.json();
    // const { titulo, mensagem, canal, destinatario, grupoId } = body;
    // const notificacao = await prisma.notificacao.create({
    //   data: { tenantId: user.tenantId, titulo, mensagem, canal, destinatario, grupoId: grupoId || null },
    // });
    // return NextResponse.json(notificacao);
    return NextResponse.json({ message: "Notificações em desenvolvimento" }, { status: 501 });
  } catch (error) {
    console.error("[POST /api/notificacoes]", error);
    return NextResponse.json({ error: "Erro ao criar notificação" }, { status: 500 });
  }
}
