import { NextRequest, NextResponse } from "next/server";
import { getSession } from "../../../../../lib/auth";
import { prisma } from "@firmes/db";

// POST /api/grupos/[id]/frequencia - Register attendance
export async function POST(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const session = await getSession();
  if (!session) return NextResponse.json({ error: "Não autenticado" }, { status: 401 });

  const { id } = await params;
  const { tenantId } = session;
  const body = await req.json() as {
    presentes?: number;
    ausentes?: number;
    visitantes?: number;
    observacao?: string;
  };

  const grupo = await prisma.group.findFirst({
    where: { id, tenantId },
  });
  if (!grupo) return NextResponse.json({ error: "Grupo não encontrado" }, { status: 404 });

  const frequencia = await prisma.groupFrequencia.create({
    data: {
      groupId: id,
      date: new Date(),
      presentes: body.presentes ?? 0,
      ausentes: body.ausentes ?? 0,
      visitantes: body.visitantes ?? 0,
      observacao: body.observacao ?? null,
    },
  });

  return NextResponse.json({ frequencia }, { status: 201 });
}

// GET /api/grupos/[id]/frequencia - Get attendance history
export async function GET(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const session = await getSession();
  if (!session) return NextResponse.json({ error: "Não autenticado" }, { status: 401 });

  const { id } = await params;
  const { tenantId } = session;

  const grupo = await prisma.group.findFirst({
    where: { id, tenantId },
  });
  if (!grupo) return NextResponse.json({ error: "Grupo não encontrado" }, { status: 404 });

  const frequencias = await prisma.groupFrequencia.findMany({
    where: { groupId: id },
    orderBy: { date: "desc" },
  });

  return NextResponse.json({ frequencias });
}
