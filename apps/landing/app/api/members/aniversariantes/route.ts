import { NextResponse } from "next/server";
import { prisma } from "@firmes/db";
import { getSession } from "../../../../lib/auth";

export async function GET() {
  try {
    const session = await getSession();
    if (!session?.tenantId) {
      return NextResponse.json({ error: "Não autenticado" }, { status: 401 });
    }

    const hoje = new Date();
    const mesAtual = hoje.getMonth() + 1;
    const diaAtual = hoje.getDate();

    const members = await prisma.member.findMany({
      where: {
        tenantId: session.tenantId,
        status: "ACTIVE",
        ...(session.role === "PASTOR" && session.congregationId ? { congregationId: session.congregationId } : {}),
      },
      select: {
        id: true,
        name: true,
        photo: true,
        birthDate: true,
      },
    });

    const aniversariantes = members
      .filter((m) => {
        if (!m.birthDate) return false;
        const data = new Date(m.birthDate);
        return data.getMonth() + 1 === mesAtual;
      })
      .map((m) => {
        const data = new Date(m.birthDate!);
        const dia = data.getDate();
        const diasRestantes = dia - diaAtual;
        const meses = [
          "jan", "fev", "mar", "abr", "mai", "jun",
          "jul", "ago", "set", "out", "nov", "dez",
        ];
        return {
          id: m.id,
          name: m.name,
          avatar: m.photo,
          date: `${dia} ${meses[mesAtual - 1]}`,
          daysLeft: diasRestantes,
        };
      })
      .sort((a, b) => a.daysLeft - b.daysLeft)
      .slice(0, 10);

    return NextResponse.json(aniversariantes);
  } catch (error) {
    console.error("[GET /api/members/aniversariantes]", error);
    return NextResponse.json({ error: "Erro ao buscar aniversariantes" }, { status: 500 });
  }
}
