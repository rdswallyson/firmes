import { NextResponse } from "next/server";
import { prisma } from "@firmes/db";

export async function GET() {
  try {
    const tenant = await prisma.tenant.findFirst();
    if (!tenant) return NextResponse.json({ error: "No tenant" }, { status: 404 });
    return NextResponse.json({ tenant: { id: tenant.id, nome: tenant.name, slug: tenant.slug } });
  } catch (error) {
    console.error("[GET /api/tenant]", error);
    return NextResponse.json({ error: "Erro interno" }, { status: 500 });
  }
}
