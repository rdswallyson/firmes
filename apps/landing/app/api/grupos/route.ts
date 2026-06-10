import { NextRequest, NextResponse } from "next/server";
import { getSession } from "../../../lib/auth";
import { prisma } from "@firmes/db";

export async function GET(req: NextRequest) {
  const session = await getSession();
  if (!session) return NextResponse.json({ error: "Não autenticado" }, { status: 401 });

  const { tenantId } = session;
  const { searchParams } = req.nextUrl;
  const search = searchParams.get("search") ?? "";

  const where = {
    tenantId,
    isActive: true,
    ...(search
      ? {
          OR: [
            { name: { contains: search, mode: "insensitive" as const } },
            { description: { contains: search, mode: "insensitive" as const } },
          ],
        }
      : {}),
  };

  const includeFrequencia = req.nextUrl.searchParams.get("includeFrequencia") === "true";

  const grupos = await prisma.group.findMany({
    where,
    orderBy: { createdAt: "desc" },
    include: {
      leader: { select: { id: true, name: true, photo: true } },
      _count: { select: { members: true } },
      ...(includeFrequencia ? { frequencias: { select: { presentes: true, ausentes: true, visitantes: true, date: true }, orderBy: { date: "desc" }, take: 30 } } : {}),
    },
  });

  return NextResponse.json({ grupos });
}

export async function POST(req: NextRequest) {
  const session = await getSession();
  if (!session) return NextResponse.json({ error: "Não autenticado" }, { status: 401 });

  const { tenantId } = session;
  const body = await req.json() as Record<string, unknown>;
  console.log("[POST /api/grupos] body:", JSON.stringify(body));

  if (!body.name) {
    return NextResponse.json({ error: "Nome do grupo é obrigatório" }, { status: 400 });
  }

  try {
    const grupo = await prisma.group.create({
      data: {
        tenantId,
        name: body.name as string,
        description: body.description as string | undefined,
        leaderId: body.leaderId as string | undefined,
        leaderId2: body.leaderId2 as string | undefined,
        leaderId3: body.leaderId3 as string | undefined,
        leaderId4: body.leaderId4 as string | undefined,
        meetingDay: body.meetingDay as string | undefined,
        meetingTime: body.meetingTime as string | undefined,
        address: body.address as string | undefined,
        dataAbertura: body.dataAbertura ? new Date(body.dataAbertura as string) : undefined,
        perfil: body.perfil as string | undefined,
        categorias: (body.categorias as string[]) ?? [],
        grupoOrigemId: body.grupoOrigemId as string | undefined,
        members: (body.membros as string[])?.length
          ? {
              create: (body.membros as string[]).map((memberId: string) => ({
                memberId,
              })),
            }
          : undefined,
      },
    });
    return NextResponse.json({ grupo }, { status: 201 });
  } catch (error: any) {
    console.error("[POST /api/grupos] ERRO:", error);
    return NextResponse.json(
      { error: "Erro ao criar grupo: " + (error.message || String(error)) },
      { status: 500 }
    );
  }
}
