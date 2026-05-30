import { NextRequest, NextResponse } from "next/server";
import { getSession } from "../../../lib/auth";
import { prisma } from "@firmes/db";
import bcrypt from "bcryptjs";

/* ── helpers ── */
function pick<T extends string | Date | null>(v: unknown, fn: (s: string) => T): T | undefined {
  if (v === undefined || v === null || v === "") return undefined;
  if (typeof v === "string") return fn(v);
  return undefined;
}
function pickDate(v: unknown): Date | undefined {
  return pick(v, s => { const d = new Date(s); return isNaN(d.getTime()) ? null! : d; });
}
function pickStr(v: unknown): string | undefined {
  return pick(v, s => s);
}
function pickArr(v: unknown): string[] | undefined {
  return Array.isArray(v) && v.length > 0 ? v.filter((i): i is string => typeof i === "string") : undefined;
}

/* ── lista de campos expandidos (adicionados recentemente) ──
   se uma migration ainda não rodou no banco, esses campos podem
   não existir.  Usamos "safeCreate" que tenta salvá-los e cai
   automaticamente para os campos básicos se falhar.   */
const EXPANDED_FIELDS = [
  "sexo", "estadoCivil", "whatsapp", "dataBatismoEspirito",
  "ministerios", "disponibilidadeDias", "disponibilidadeTurnos", "tags",
  "conjugeId", "filhos", "indicadoPorId", "comoConheceu",
  "observacoesPastorais", "portalEmail", "portalPassword", "portalStatus"
] as const;

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
      where,
      skip,
      take: limit,
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

    console.log("[POST /api/members] body:", JSON.stringify(body, null, 2));

    if (!body.name || typeof body.name !== "string") {
      return NextResponse.json({ error: "Nome é obrigatório" }, { status: 400 });
    }

    const member = await prisma.member.create({
      data: {
        tenantId: session.tenantId,
        name: body.name as string,
        email: pickStr(body.email),
        phone: pickStr(body.phone),
        status: "ACTIVE",
      },
      select: { id: true, name: true, email: true, phone: true, status: true, createdAt: true },
    });

    return NextResponse.json({ member }, { status: 201 });
  } catch (error: any) {
    console.error("[POST /api/members] ERRO COMPLETO:", error);
    console.error("[POST /api/members] MESSAGE:", error.message);
    console.error("[POST /api/members] CODE:", error.code);
    console.error("[POST /api/members] STACK:", error.stack);
    return NextResponse.json({ error: "Erro ao salvar membro: " + error.message, code: error.code }, { status: 500 });
  }
}
