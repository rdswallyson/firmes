import { NextRequest, NextResponse } from "next/server";
import { getSession } from "../../../lib/auth";
import { prisma } from "@firmes/db";
import bcrypt from "bcryptjs";

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

    console.log("[POST /api/members] raw keys:", Object.keys(body));

    if (!body.name || typeof body.name !== "string") {
      return NextResponse.json({ error: "Nome é obrigatório" }, { status: 400 });
    }

    const pickStr = (v: unknown) => (typeof v === "string" && v.length > 0) ? v : undefined;
    const pickDate = (v: unknown) => {
      if (typeof v !== "string" || v === "") return undefined;
      const d = new Date(v);
      return isNaN(d.getTime()) ? undefined : d;
    };
    const pickArr = (v: unknown) => {
      if (!Array.isArray(v) || v.length === 0) return undefined;
      return v.filter((i): i is string => typeof i === "string");
    };

    // ── DADOS BÁSICOS (sempre existem no banco) ──
    const memberData: any = {
      tenantId,
      name: body.name as string,
      email: pickStr(body.email),
      phone: pickStr(body.phone),
      birthDate: pickDate(body.birthDate),
      baptismDate: pickDate(body.baptismDate),
      address: pickStr(body.address),
      cep: pickStr(body.cep),
      city: pickStr(body.city),
      state: pickStr(body.state),
      neighborhood: pickStr(body.neighborhood),
      number: pickStr(body.number),
      complement: pickStr(body.complement),
      photo: pickStr(body.photo),
      role: pickStr(body.role),
      groupId: pickStr(body.groupId),
      status: pickStr(body.status) ?? "ACTIVE",
      notes: pickStr(body.notes),
    };

    // ── CAMPOS EXPANDIDOS (só se existem no banco) ──
    // Se der erro de coluna inexistente, descomente o try/catch abaixo
    const expanded: any = {};

    // Só adiciona se o valor existir (não envia undefined para não forçar a coluna)
    const maybe = (key: string, val: unknown) => {
      if (val !== undefined && val !== null && val !== "") expanded[key] = val;
    };

    maybe("sexo", pickStr(body.sexo));
    maybe("estadoCivil", pickStr(body.estadoCivil));
    maybe("whatsapp", pickStr(body.whatsapp));
    maybe("dataBatismoEspirito", pickDate(body.dataBatismoEspirito));
    maybe("ministerios", pickArr(body.ministerios));
    maybe("disponibilidadeDias", pickArr(body.disponibilidadeDias));
    maybe("disponibilidadeTurnos", pickArr(body.disponibilidadeTurnos));
    maybe("tags", pickArr(body.tags));
    maybe("conjugeId", pickStr(body.conjugeId));
    maybe("indicadoPorId", pickStr(body.indicadoPorId));
    maybe("comoConheceu", pickStr(body.comoConheceu));
    maybe("observacoesPastorais", pickStr(body.observacoesPastorais));
    maybe("portalEmail", pickStr(body.portalEmail));
    maybe("portalStatus", pickStr(body.portalStatus) ?? "PENDENTE");
    maybe("cpf", pickStr(body.cpf));
    maybe("rg", pickStr(body.rg));
    maybe("escolaridade", pickStr(body.escolaridade));
    maybe("pais", pickStr(body.pais));
    maybe("batizado", pickStr(body.batizado));
    maybe("phone2", pickStr(body.phone2));
    maybe("dataConversao", pickDate(body.dataConversao));

    // filhos como JSONB
    if (body.filhos && Array.isArray(body.filhos) && body.filhos.length > 0) {
      expanded.filhos = body.filhos;
    }

    // portalPassword hasheada
    if (body.portalPassword && typeof body.portalPassword === "string") {
      expanded.portalPassword = await bcrypt.hash(body.portalPassword, 10);
    }

    // lgpdAceite boolean
    if (typeof body.lgpdAceite === "boolean") {
      expanded.lgpdAceite = body.lgpdAceite;
    }

    console.log("[POST /api/members] expanded keys:", Object.keys(expanded));

    // ── TENTAR SALVAR COM TUDO ──
    try {
      const member = await prisma.member.create({
        data: { ...memberData, ...expanded },
        select: { id: true, name: true, email: true, phone: true, status: true, createdAt: true },
      });
      return NextResponse.json({ member }, { status: 201 });
    } catch (err: any) {
      const msg = String(err.message || "").toLowerCase();
      const isMissingColumn = msg.includes("column") || msg.includes("does not exist") || msg.includes("field");

      if (isMissingColumn) {
        console.log("[POST /api/members] Coluna faltando. Salvando sem campos expandidos.");
        const member = await prisma.member.create({
          data: memberData,
          select: { id: true, name: true, email: true, phone: true, status: true, createdAt: true },
        });
        return NextResponse.json({
          member,
          warning: "Campos expandidos não salvos: colunas ainda não existem no banco. Execute: ALTER TABLE Member ADD COLUMN ..."
        }, { status: 201 });
      }

      throw err;
    }
  } catch (error: any) {
    console.error("[POST /api/members] ERRO CRÍTICO:", error.message);
    console.error("[POST /api/members] CODE:", error.code);
    console.error("[POST /api/members] STACK:", error.stack);
    return NextResponse.json({
      error: "Erro ao salvar membro: " + error.message,
      code: error.code,
    }, { status: 500 });
  }
}
