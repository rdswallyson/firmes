import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@firmes/db";
import bcrypt from "bcryptjs";
import { getSession } from "../../../../../lib/auth";

// POST — definir pastor responsável da congregação (cria User role PASTOR)
export async function POST(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const session = await getSession();
    if (!session?.tenantId) {
      return NextResponse.json({ error: "Não autenticado" }, { status: 401 });
    }
    // Apenas ADMIN pode definir pastores
    if (session.role !== "ADMIN") {
      return NextResponse.json({ error: "Sem permissão" }, { status: 403 });
    }

    const { id } = await params;

    const congregation = await prisma.congregation.findFirst({
      where: { id, tenantId: session.tenantId, deletedAt: null },
      select: { id: true },
    });
    if (!congregation) {
      return NextResponse.json({ error: "Congregação não encontrada" }, { status: 404 });
    }

    const body = await req.json() as {
      memberId?: string;
      name?: string;
      email?: string;
      password?: string;
    };

    const email = body.email?.toLowerCase().trim();
    if (!email || !body.password) {
      return NextResponse.json({ error: "Email e senha são obrigatórios" }, { status: 400 });
    }

    let memberName = body.name?.trim();
    // Se memberId informado, validar e usar nome do membro
    if (body.memberId) {
      const member = await prisma.member.findFirst({
        where: { id: body.memberId, tenantId: session.tenantId },
        select: { id: true, name: true },
      });
      if (!member) {
        return NextResponse.json({ error: "Membro não encontrado" }, { status: 404 });
      }
      memberName = member.name;
      // Vincular membro à congregação também
      await prisma.member.update({
        where: { id: member.id },
        data: { congregationId: id },
      });
    }

    if (!memberName) {
      return NextResponse.json({ error: "Nome é obrigatório" }, { status: 400 });
    }

    const existingUser = await prisma.user.findUnique({
      where: { email },
      select: { id: true },
    });
    if (existingUser) {
      return NextResponse.json({ error: "Já existe um usuário com este email" }, { status: 409 });
    }

    const user = await prisma.user.create({
      data: {
        name: memberName,
        email,
        password: await bcrypt.hash(body.password, 10),
        role: "PASTOR",
        tenantId: session.tenantId,
        congregationId: id,
        memberId: body.memberId || undefined,
        isActive: true,
      },
      select: { id: true, name: true, email: true, role: true },
    });

    // Atualizar pastorId da congregação se membro foi vinculado
    if (body.memberId) {
      await prisma.congregation.update({
        where: { id },
        data: { pastorId: body.memberId },
      });
    }

    return NextResponse.json({ user }, { status: 201 });
  } catch (error: any) {
    console.error("[POST /api/congregacoes/[id]/pastor]", error?.message);
    return NextResponse.json({ error: "Erro interno: " + error?.message }, { status: 500 });
  }
}
