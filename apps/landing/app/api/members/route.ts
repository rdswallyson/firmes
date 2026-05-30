import { NextRequest, NextResponse } from "next/server";
import { getSession } from "../../../lib/auth";
import { prisma } from "@firmes/db";
import bcrypt from "bcryptjs";

export async function GET(req: NextRequest) {
  const session = await getSession();
  if (!session) return NextResponse.json({ error: "Não autenticado" }, { status: 401 });

  const { tenantId } = session;
  const { searchParams } = req.nextUrl;

  const pageVal = Number(searchParams.get("page"));
  const limitVal = Number(searchParams.get("limit"));
  const page = !isNaN(pageVal) && pageVal > 0 ? pageVal : 1;
  const limit = !isNaN(limitVal) && limitVal > 0 ? Math.min(limitVal, 100) : 20;
  const search = searchParams.get("search") ?? "";
  const status = searchParams.get("status") ?? undefined;
  const role = searchParams.get("role") ?? undefined;
  const groupId = searchParams.get("groupId") ?? undefined;

  const skip = (page - 1) * limit;

  const where = {
    tenantId,
    ...(status ? { status } : {}),
    ...(role ? { role } : {}),
    ...(groupId ? { groupId } : {}),
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

  const total = await prisma.member.count({ where });
  const members = await prisma.member.findMany({
    where,
    skip,
    take: limit,
    orderBy: { createdAt: "desc" },
    select: {
      id: true,
      name: true,
      email: true,
      phone: true,
      photo: true,
      status: true,
      role: true,
      groupId: true,
      birthDate: true,
      isActive: true,
      memberSince: true,
      createdAt: true,
      sexo: true,
      estadoCivil: true,
      whatsapp: true,
      ministerios: true,
      tags: true,
      portalStatus: true,
    },
  });

  return NextResponse.json({
    members,
    total,
    page,
    totalPages: Math.ceil(total / limit),
  });
}

export async function POST(req: NextRequest) {
  try {
    const session = await getSession();
    if (!session) return NextResponse.json({ error: "Não autenticado" }, { status: 401 });

    const { tenantId } = session;
    const body = await req.json() as Record<string, unknown>;

    console.log("[POST /api/members] body:", JSON.stringify(body, null, 2));

    if (!body.name) return NextResponse.json({ error: "Nome é obrigatório" }, { status: 400 });

    if (body.groupId) {
      const group = await prisma.group.findFirst({ where: { id: body.groupId as string, tenantId } });
      if (!group) return NextResponse.json({ error: "Grupo não encontrado" }, { status: 400 });
    }

    const hashedPassword = body.portalPassword
      ? await bcrypt.hash(body.portalPassword as string, 10)
      : undefined;

    const member = await prisma.member.create({
      data: {
        tenantId,
        name: body.name as string,
        email: body.email as string | undefined,
        phone: body.phone as string | undefined,
        birthDate: body.birthDate ? new Date(body.birthDate as string) : undefined,
        baptismDate: body.baptismDate ? new Date(body.baptismDate as string) : undefined,
        address: body.address as string | undefined,
        cep: body.cep as string | undefined,
        city: body.city as string | undefined,
        state: body.state as string | undefined,
        neighborhood: body.neighborhood as string | undefined,
        number: body.number as string | undefined,
        complement: body.complement as string | undefined,
        photo: body.photo as string | undefined,
        role: body.role as string | undefined,
        groupId: body.groupId as string | undefined,
        status: (body.status as string) ?? "ACTIVE",
        notes: body.notes as string | undefined,
        sexo: body.sexo as string | undefined,
        estadoCivil: body.estadoCivil as string | undefined,
        whatsapp: body.whatsapp as string | undefined,
        dataBatismoEspirito: body.dataBatismoEspirito ? new Date(body.dataBatismoEspirito as string) : undefined,
        ministerios: (body.ministerios as string[]) ?? [],
        disponibilidadeDias: (body.disponibilidadeDias as string[]) ?? [],
        disponibilidadeTurnos: (body.disponibilidadeTurnos as string[]) ?? [],
        tags: (body.tags as string[]) ?? [],
        conjugeId: body.conjugeId as string | undefined,
        filhos: body.filhos as any,
        indicadoPorId: body.indicadoPorId as string | undefined,
        comoConheceu: body.comoConheceu as string | undefined,
        observacoesPastorais: body.observacoesPastorais as string | undefined,
        portalEmail: body.portalEmail as string | undefined,
        portalPassword: hashedPassword,
        portalStatus: (body.portalStatus as string) ?? "PENDENTE",
      },
      select: {
        id: true, name: true, email: true, phone: true, photo: true, status: true,
        role: true, groupId: true, birthDate: true, createdAt: true,
        sexo: true, estadoCivil: true, whatsapp: true, ministerios: true, tags: true,
        portalStatus: true, portalEmail: true,
      },
    });

    return NextResponse.json({ member }, { status: 201 });
  } catch (error: any) {
    console.error("[POST /api/members] ERROR:", error.message);
    console.error("[POST /api/members] STACK:", error.stack);
    return NextResponse.json({ error: "Erro interno: " + error.message }, { status: 500 });
  }
}
