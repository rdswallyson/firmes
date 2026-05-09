import { NextRequest, NextResponse } from "next/server";
import { getSession } from "../../../lib/auth";
import { prisma } from "@firmes/db";

export async function POST(request: NextRequest) {
  try {
    const session = await getSession();
    if (!session?.tenantId) return NextResponse.json({ error: "Não autorizado" }, { status: 401 });

    const body = await request.json();
    const { titulo, mensagem, canal, destinatario, grupoId } = body;
    if (!titulo || !mensagem || !canal || !destinatario) {
      return NextResponse.json({ error: "Campos obrigatórios" }, { status: 400 });
    }

    // Buscar destinatários
    let destinatarios: { nome: string; email?: string; phone?: string }[] = [];

    if (destinatario === "TODOS") {
      const membros = await prisma.member.findMany({
        where: { tenantId: session.tenantId, isActive: true },
        select: { name: true, email: true, phone: true },
      });
      destinatarios = membros.map(m => ({ nome: m.name, email: m.email || undefined, phone: m.phone || undefined }));
    } else if (destinatario === "ANIVERSARIANTES") {
      const hoje = new Date();
      const membros = await prisma.member.findMany({
        where: { tenantId: session.tenantId, isActive: true },
        select: { name: true, email: true, phone: true, birthDate: true },
      });
      destinatarios = membros.filter(m => {
        if (!m.birthDate) return false;
        const d = new Date(m.birthDate);
        return d.getMonth() === hoje.getMonth();
      }).map(m => ({ nome: m.name, email: m.email || undefined, phone: m.phone || undefined }));
    } else if (destinatario === "AUSENTES") {
      const trintaDias = new Date(); trintaDias.setDate(trintaDias.getDate() - 30);
      const membros = await prisma.member.findMany({
        where: { tenantId: session.tenantId, isActive: true },
        select: { name: true, email: true, phone: true },
      });
      const checkins = await prisma.checkin.findMany({
        where: { tenantId: session.tenantId, createdAt: { gte: trintaDias } },
        select: { memberId: true, nome: true },
      });
      const presentes = new Set(checkins.map(c => c.memberId || c.nome));
      destinatarios = membros.filter(m => !presentes.has(m.name)).map(m => ({ nome: m.name, email: m.email || undefined, phone: m.phone || undefined }));
    } else if (destinatario === "GRUPO" && grupoId) {
      const grupo = await prisma.group.findFirst({
        where: { id: grupoId, tenantId: session.tenantId },
        include: { members: { include: { member: { select: { name: true, email: true, phone: true } } } } },
      });
      destinatarios = grupo?.members.map(gm => ({ nome: gm.member.name, email: gm.member.email || undefined, phone: gm.member.phone || undefined })) || [];
    } else if (destinatario === "ESCALADOS") {
      const hoje = new Date();
      const proxSemana = new Date(); proxSemana.setDate(proxSemana.getDate() + 7);
      const escalas = await prisma.escala.findMany({
        where: { tenantId: session.tenantId, data: { gte: hoje, lte: proxSemana } },
        include: { membros: { include: { member: { select: { name: true, email: true, phone: true } } } } },
      });
      const vistos = new Set();
      for (const e of escalas) {
        for (const em of e.membros) {
          if (em.member && !vistos.has(em.member.name)) {
            vistos.add(em.member.name);
            destinatarios.push({ nome: em.member.name, email: em.member.email || undefined, phone: em.member.phone || undefined });
          }
        }
      }
    }

    // Salvar notificação
    const notif = await prisma.notificacao.create({
      data: {
        tenantId: session.tenantId,
        titulo,
        mensagem,
        canal,
        destinatario,
        grupoId: grupoId || null,
        enviadoEm: new Date(),
        totalEnviados: destinatarios.length,
      },
    });

    // Enviar (simulado — integração real com Resend/WhatsApp Business API)
    const resultados = destinatarios.map(d => ({
      nome: d.nome,
      enviado: true,
      canal,
    }));

    return NextResponse.json({ notif, total: destinatarios.length, resultados }, { status: 201 });
  } catch (error) {
    console.error("[POST /api/notificacoes]", error);
    return NextResponse.json({ error: "Erro interno" }, { status: 500 });
  }
}

export async function GET() {
  try {
    const session = await getSession();
    if (!session?.tenantId) return NextResponse.json({ error: "Não autorizado" }, { status: 401 });

    const notifs = await prisma.notificacao.findMany({
      where: { tenantId: session.tenantId },
      orderBy: { createdAt: "desc" },
      take: 50,
    });
    return NextResponse.json({ notificacoes: notifs });
  } catch (error) {
    return NextResponse.json({ error: "Erro interno" }, { status: 500 });
  }
}
