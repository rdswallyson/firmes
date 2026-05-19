import { NextRequest, NextResponse } from "next/server";
import { getSession } from "../../../lib/auth";
import { prisma } from "@firmes/db";

export async function POST() {
  try {
    const session = await getSession();
    if (!session?.tenantId) return NextResponse.json({ error: "Não autorizado" }, { status: 401 });

    const tenantId = session.tenantId;

    const [members, finances, events, groups] = await Promise.all([
      prisma.member.findMany({ where: { tenantId } }),
      prisma.finance.findMany({ where: { tenantId } }),
      prisma.event.findMany({ where: { tenantId } }),
      prisma.group.findMany({ where: { tenantId } }),
    ]);

    const backup = {
      tenantId,
      exportedAt: new Date().toISOString(),
      members,
      finances,
      events,
      groups,
    };

    return NextResponse.json({ success: true, backup });
  } catch (error) {
    console.error("[POST /api/backup]", error);
    return NextResponse.json({ error: "Erro ao gerar backup" }, { status: 500 });
  }
}
