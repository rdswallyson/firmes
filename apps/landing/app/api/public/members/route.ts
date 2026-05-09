import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@firmes/db";

// POST /api/public/members?slug={tenantSlug}
// Endpoint público para auto-cadastro de visitantes/membros (sem autenticação)
export async function POST(req: NextRequest) {
  try {
    const { searchParams } = new URL(req.url);
    const slug = searchParams.get("slug");

    if (!slug) {
      return NextResponse.json({ error: "Slug da igreja obrigatório" }, { status: 400 });
    }

    // Find tenant by slug
    const tenant = await prisma.tenant.findUnique({ where: { slug } });
    if (!tenant) {
      return NextResponse.json({ error: "Igreja não encontrada" }, { status: 404 });
    }

    const body = await req.json() as Record<string, unknown>;

    if (!body.name) {
      return NextResponse.json({ error: "Nome é obrigatório" }, { status: 400 });
    }

    const member = await prisma.member.create({
      data: {
        tenantId: tenant.id,
        name: body.name as string,
        email: body.email as string | undefined,
        phone: body.phone as string | undefined,
        birthDate: body.birthDate ? new Date(body.birthDate as string) : undefined,
        photo: body.photo as string | undefined,
        role: body.role as string | undefined,
        status: "PENDING", // Always pending for public registration
        notes: body.notes as string | undefined,
      },
    });

    return NextResponse.json({ member }, { status: 201 });
  } catch (error) {
    console.error("[POST /api/public/members]", error);
    return NextResponse.json({ error: "Erro interno" }, { status: 500 });
  }
}
