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

/* ── helpers ── */
function pickString(v: unknown): string | undefined {
  return typeof v === "string" && v.length > 0 ? v : undefined;
}
function pickDate(v: unknown): Date | undefined {
  if (v === undefined || v === null || v === "") return undefined;
  const d = new Date(v as string);
  return isNaN(d.getTime()) ? undefined : d;
}
function pickArray(v: unknown): string[] {
  return Array.isArray(v) ? v.filter((i): i is string => typeof i === "string") : [];
}

export async function POST(req: NextRequest) {
  try {
    const session = await getSession();
    if (!session) return NextResponse.json({ error: "Não autenticado" }, { status: 401 });

    const { tenantId } = session;
    const body = await req.json() as Record<string, unknown>;

    console.log("[POST /api/members] raw keys:", Object.keys(body));

    if (!body.name || typeof body.name !== "string") {
      return NextResponse.json({ error: "Nome é obrigatório" }, { status: 400 });
    }

    if (body.groupId) {
      const group = await prisma.group.findFirst({
        where: { id: String(body.groupId), tenantId },
      });
      if (!group) return NextResponse.json({ error: "Grupo não encontrado" }, { status: 400 });
    }

    const hashedPw = body.portalPassword
      ? await bcrypt.hash(String(body.portalPassword), 10)
      : undefined;

    /* montar data APENAS com campos que existem no schema */
    const data: any = {
      tenantId,
      name: body.name as string,
      email: pickString(body.email),
      phone: pickString(body.phone),
      birthDate: pickDate(body.birthDate),
      baptismDate: pickDate(body.baptismDate),
      address: pickString(body.address),
      cep: pickString(body.cep),
      city: pickString(body.city),
      state: pickString(body.state),
      neighborhood: pickString(body.neighborhood),
      number: pickString(body.number),
      complement: pickString(body.complement),
      photo: pickString(body.photo),
      role: pickString(body.role),
      groupId: pickString(body.groupId),
      status: pickString(body.status) ?? "ACTIVE",
      notes: pickString(body.notes),
      sexo: pickString(body.sexo),
      estadoCivil: pickString(body.estadoCivil),
      whatsapp: pickString(body.whatsapp),
      dataBatismoEspirito: pickDate(body.dataBatismoEspirito),
      ministerios: pickArray(body.ministerios),
      disponibilidadeDias: pickArray(body.disponibilidadeDias),
      disponibilidadeTurnos: pickArray(body.disponibilidadeTurnos),
      tags: pickArray(body.tags),
      conjugeId: pickString(body.conjugeId),
      indicadoPorId: pickString(body.indicadoPorId),
      comoConheceu: pickString(body.comoConheceu),
      observacoesPastorais: pickString(body.observacoesPastorais),
      portalEmail: pickString(body.portalEmail),
      portalPassword: hashedPw,
      portalStatus: pickString(body.portalStatus) ?? "PENDENTE",
    };

    /* filhos — guardar como json para compatibilidade */
    if (body.filhos) data.filhos = body.filhos;

    console.log("[POST /api/members] prisma data keys:", Object.keys(data));

    const member = await prisma.member.create({
      data,
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
