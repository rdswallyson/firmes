import { NextRequest, NextResponse } from "next/server";
import { getSession } from "../../../lib/auth";
import { prisma } from "@firmes/db";
import bcrypt from "bcryptjs";

import { Prisma } from "@firmes/db";

/* ── helpers ── */
function pickStr(v: unknown): string | undefined {
  return (typeof v === "string" && v.length > 0) ? v : undefined;
}
function pickDate(v: unknown): Date | undefined {
  if (typeof v !== "string" || v === "") return undefined;
  const d = new Date(v);
  return isNaN(d.getTime()) ? undefined : d;
}
function pickArr(v: unknown): string[] | undefined {
  return (Array.isArray(v) && v.length > 0)
    ? v.filter((i): i is string => typeof i === "string")
    : undefined;
}
function pickBool(v: unknown): boolean | undefined {
  return typeof v === "boolean" ? v : undefined;
}

export async function GET(req: NextRequest) {
  try {
    const session = await getSession();
    if (!session) return NextResponse.json({ error: "Não autenticado" }, { status: 401 });

    const { tenantId } = session;
    const { searchParams } = req.nextUrl;

    const page  = Math.max(1, Number(searchParams.get("page")) || 1);
    const limit = Math.max(1, Math.min(100, Number(searchParams.get("limit")) || 20));
    const search = searchParams.get("search") || "";
    const skip = (page - 1) * limit;

    const where: any = { tenantId };
    if (search) {
      where.OR = [
        { name: { contains: search, mode: "insensitive" } },
        { email: { contains: search, mode: "insensitive" } },
        { phone: { contains: search, mode: "insensitive" } },
      ];
    }
    ["status", "role", "groupId"].forEach(f => {
      const v = searchParams.get(f);
      if (v) where[f] = v;
    });

    const total = await prisma.member.count({ where });
    const members = await prisma.member.findMany({
      where, skip, take: limit,
      orderBy: { createdAt: "desc" },
      select: {
        id: true, name: true, email: true, phone: true, photo: true,
        status: true, role: true, groupId: true, birthDate: true,
        memberSince: true, createdAt: true,
        sexo: true, estadoCivil: true, whatsapp: true,
        ministerios: true, tags: true, portalStatus: true,
      },
    });

    return NextResponse.json({ members, total, page, totalPages: Math.ceil(total / limit) });
  } catch (e: any) {
    console.error("[GET /api/members] ERRO:", e.message);
    return NextResponse.json({ error: "Erro ao buscar membros: " + e.message }, { status: 500 });
  }
}

export async function POST(req: NextRequest) {
  try {
    const session = await getSession();
    if (!session) return NextResponse.json({ error: "Não autenticado" }, { status: 401 });

    const { tenantId } = session;
    const body = await req.json() as Record<string, unknown>;

    console.log("[POST /api/members] body keys:", Object.keys(body));

    if (!body.name || typeof body.name !== "string") {
      return NextResponse.json({ error: "Nome é obrigatório" }, { status: 400 });
    }

    const data: any = {
      tenantId,
      name:    body.name as string,
      email:   pickStr(body.email),
      phone:   pickStr(body.phone),
      phone2:  pickStr(body.phone2),
      birthDate:     pickDate(body.birthDate),
      baptismDate:   pickDate(body.baptismDate),
      address:       pickStr(body.address),
      cep:           pickStr(body.cep),
      city:          pickStr(body.city),
      state:         pickStr(body.state),
      neighborhood:  pickStr(body.neighborhood),
      number:        pickStr(body.number),
      complement:    pickStr(body.complement),
      photo:         pickStr(body.photo),
      role:          pickStr(body.role),
      groupId:       pickStr(body.groupId),
      status:        pickStr(body.status) ?? "ACTIVE",
      notes:         pickStr(body.notes),
      sexo:              pickStr(body.sexo),
      estadoCivil:       pickStr(body.estadoCivil),
      whatsapp:          pickStr(body.whatsapp),
      dataBatismoEspirito: pickDate(body.dataBatismoEspirito),
      ministerios:        pickArr(body.ministerios),
      disponibilidadeDias:   pickArr(body.disponibilidadeDias),
      disponibilidadeTurnos: pickArr(body.disponibilidadeTurnos),
      tags: pickArr(body.tags),
      conjugeId:     pickStr(body.conjugeId),
      indicadoPorId: pickStr(body.indicadoPorId),
      comoConheceu:  pickStr(body.comoConheceu),
      observacoesPastorais: pickStr(body.observacoesPastorais),
      portalEmail:    pickStr(body.portalEmail),
      portalStatus:   pickStr(body.portalStatus) ?? "PENDENTE",
      cpf:          pickStr(body.cpf),
      rg:           pickStr(body.rg),
      escolaridade: pickStr(body.escolaridade),
      pais:         pickStr(body.pais),
      batizado:     pickStr(body.batizado),
      dataConversao: pickDate(body.dataConversao),
      lgpdAceite:   pickBool(body.lgpdAceite) ?? false,
    };

    if (body.filhos) data.filhos = body.filhos;
    if (body.portalPassword && typeof body.portalPassword === "string") {
      data.portalPassword = await bcrypt.hash(body.portalPassword, 10);
    }

    // Remove campos undefined para evitar erros de validação Prisma
    const cleanData = Object.fromEntries(
      Object.entries(data).filter(([_, v]) => v !== undefined)
    );

    console.log("[POST /api/members] clean keys:", Object.keys(cleanData));

    const member = await prisma.member.create({
      data: cleanData as any,
      select: { id: true, name: true, email: true, phone: true, photo: true, status: true, createdAt: true },
    });

    return NextResponse.json({ member }, { status: 201 });
  } catch (error: any) {
    console.error("[POST /api/members] ERRO:", error.message);
    console.error("[POST /api/members] CODE:", error.code);
    console.error("[POST /api/members] STACK:", error.stack);
    return NextResponse.json({
      error: "Erro ao salvar membro: " + error.message,
      code: error.code,
    }, { status: 500 });
  }
}
