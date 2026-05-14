import { NextRequest, NextResponse } from "next/server";
import { hash } from "bcryptjs";
import { prisma } from "@firmes/db";

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const { name, email, password, churchName, slug } = body;

    if (!name || !email || !password || !churchName || !slug) {
      return NextResponse.json({ error: "Todos os campos são obrigatórios" }, { status: 400 });
    }

    // Verificar se o slug já existe
    const existingTenant = await prisma.tenant.findUnique({
      where: { slug },
    });

    if (existingTenant) {
      return NextResponse.json({ error: "Este slug já está em uso" }, { status: 400 });
    }

    // Verificar se o email já existe
    const existingUser = await prisma.user.findUnique({
      where: { email },
    });

    if (existingUser) {
      return NextResponse.json({ error: "Este email já está cadastrado" }, { status: 400 });
    }

    // Criar tenant
    const tenant = await prisma.tenant.create({
      data: {
        name: churchName,
        slug,
        plan: "FREE",
        isActive: true,
        maxChurches: 1,
      },
    });

    // Criar usuário admin
    const hashedPassword = await hash(password, 10);
    const user = await prisma.user.create({
      data: {
        name,
        email,
        password: hashedPassword,
        role: "ADMIN",
        tenantId: tenant.id,
        isActive: true,
      },
    });

    return NextResponse.json({
      success: true,
      user: {
        id: user.id,
        name: user.name,
        email: user.email,
        tenant: {
          id: tenant.id,
          name: tenant.name,
          slug: tenant.slug,
        },
      },
    });
  } catch (error) {
    console.error("[POST /api/auth/register]", error);
    return NextResponse.json({ error: "Erro ao criar conta" }, { status: 500 });
  }
}
