import { NextResponse } from "next/server";
import { getSession } from "../../../../lib/auth";
import { prisma } from "@firmes/db";

export async function GET() {
  try {
    const session = await getSession();
    if (!session) {
      return NextResponse.json({ error: "Não autenticado" }, { status: 401 });
    }

    const { tenantId } = session;

    // Buscar eventos recentes como "avisos" (substituir por model Aviso quando criado)
    const recentEvents = await prisma.event.findMany({
      where: { tenantId },
      orderBy: { createdAt: "desc" },
      take: 5,
      select: {
        id: true,
        title: true,
        createdAt: true,
        status: true,
      },
    });

    // Buscar membros recentes
    const recentMembers = await prisma.member.findMany({
      where: { tenantId },
      orderBy: { createdAt: "desc" },
      take: 3,
      select: {
        id: true,
        name: true,
        createdAt: true,
      },
    });

    // Combinar em formato de avisos
    const notices = [
      ...recentEvents.map((e) => ({
        id: e.id,
        title: e.title,
        author: "Admin",
        date: new Date(e.createdAt).toLocaleDateString("pt-BR", {
          day: "2-digit",
          month: "short",
        }),
        status: e.status === "ABERTO" ? "Publicado" : "Arquivado",
      })),
      ...recentMembers.map((m) => ({
        id: m.id,
        title: `Novo membro: ${m.name}`,
        author: "Sistema",
        date: new Date(m.createdAt).toLocaleDateString("pt-BR", {
          day: "2-digit",
          month: "short",
        }),
        status: "Publicado",
      })),
    ]
      .sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime())
      .slice(0, 5);

    return NextResponse.json({ notices });
  } catch (error) {
    console.error("[GET /api/dashboard/notices]", error);
    return NextResponse.json(
      { error: "Erro ao buscar avisos" },
      { status: 500 }
    );
  }
}
