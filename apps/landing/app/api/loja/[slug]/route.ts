import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@firmes/db";

export async function GET(req: NextRequest, { params }: { params: Promise<{ slug: string }> }) {
  try {
    const { slug } = await params;

    const tenant = await prisma.tenant.findUnique({
      where: { slug },
      select: { id: true, name: true, slug: true, logo: true, primaryColor: true },
    });

    if (!tenant) {
      return NextResponse.json({ error: "Igreja não encontrada" }, { status: 404 });
    }

    const produtos = await prisma.produto.findMany({
      where: { tenantId: tenant.id, ativo: true },
      include: { variacoes: true },
      orderBy: { createdAt: "desc" },
    });

    return NextResponse.json({ tenant, produtos });
  } catch (error) {
    console.error("[GET /api/loja/[slug]]", error);
    return NextResponse.json({ error: "Erro ao buscar loja" }, { status: 500 });
  }
}
