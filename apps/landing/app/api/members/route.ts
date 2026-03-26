import { NextRequest, NextResponse } from "next/server";
import { getSession } from "../../../lib/auth";
import { prisma } from "@firmes/db";

export async function GET(req: NextRequest) {
  const session = await getSession();

  if (!session) {
    return NextResponse.json({ error: "Não autenticado" }, { status: 401 });
  }

  const { tenantId } = session;
  const { searchParams } = req.nextUrl;

  const pageVal = Number(searchParams.get("page"));
  const limitVal = Number(searchParams.get("limit"));
  const page = !isNaN(pageVal) && pageVal > 0 ? pageVal : 1;
  const limit = !isNaN(limitVal) && limitVal > 0 ? Math.min(limitVal, 100) : 20;
  const search = searchParams.get("search") ?? "";
  const status = searchParams.get("status") ?? undefined;

  const skip = (page - 1) * limit;

  const where = {
    tenantId,
    ...(status ? { status } : {}),
    ...(search
      ? {
          OR: [
            { name: { contains: search, mode: "insensitive" as const } },
            { email: { contains: search, mode: "insensitive" as const } },
            { phone: { contains: search, mode: "insensitive" as const } },
          ],
        }
      : {}),
  };

  const [members, total] = await Promise.all([
    prisma.member.findMany({
      where,
      skip,
      take: limit,
      orderBy: { createdAt: "desc" },
      select: {
        id: true,
        name: true,
        email: true,
        phone: true,
        status: true,
        role: true,
        memberSince: true,
        createdAt: true,
      },
    }),
    prisma.member.count({ where }),
  ]);

  return NextResponse.json({
    members,
    total,
    page,
    totalPages: Math.ceil(total / limit),
  });
}

export async function POST(req: NextRequest) {
  const session = await getSession();

  if (!session) {
    return NextResponse.json({ error: "Não autenticado" }, { status: 401 });
  }

  const { tenantId } = session;
  const body = await req.json() as {
    name: string;
    email?: string;
    phone?: string;
    birthDate?: string;
    address?: string;
    role?: string;
    groupId?: string;
  };

  if (!body.name) {
    return NextResponse.json({ error: "Nome é obrigatório" }, { status: 400 });
  }

  if (body.groupId) {
    const group = await prisma.group.findFirst({
      where: { id: body.groupId, tenantId },
    });
    if (!group) {
      return NextResponse.json({ error: "Grupo não encontrado" }, { status: 400 });
    }
  }

  const member = await prisma.member.create({
    data: {
      tenantId,
      name: body.name,
      email: body.email,
      phone: body.phone,
      birthDate: body.birthDate ? new Date(body.birthDate) : undefined,
      address: body.address,
      role: body.role,
      groupId: body.groupId,
    },
  });

  return NextResponse.json({ member }, { status: 201 });
}
