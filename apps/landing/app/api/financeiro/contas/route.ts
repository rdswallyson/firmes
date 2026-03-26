import { NextRequest, NextResponse } from "next/server";
import { getSession } from "../../../../lib/auth";
import { prisma } from "@firmes/db";

export async function GET(req: NextRequest) {
  const session = await getSession();
  if (!session) return NextResponse.json({ error: "Não autenticado" }, { status: 401 });

  const contas = await prisma.contaBancaria.findMany({
    where: { tenantId: session.tenantId },
    orderBy: { createdAt: "desc" },
  });
  return NextResponse.json({ contas });
}

export async function POST(req: NextRequest) {
  const session = await getSession();
  if (!session) return NextResponse.json({ error: "Não autenticado" }, { status: 401 });

  const body = await req.json() as Record<string, unknown>;
  if (!body.nome) return NextResponse.json({ error: "Nome é obrigatório" }, { status: 400 });

  const conta = await prisma.contaBancaria.create({
    data: {
      tenantId: session.tenantId,
      nome: body.nome as string,
      banco: (body.banco as string) || undefined,
      agencia: (body.agencia as string) || undefined,
      numeroConta: (body.numeroConta as string) || undefined,
      saldo: Number(body.saldo) || 0,
    },
  });
  return NextResponse.json({ conta }, { status: 201 });
}
