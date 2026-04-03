import { NextRequest, NextResponse } from "next/server";
import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();

export async function PUT(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id } = await params;
  try {
    const body = await request.json();
    const { logo, primaryColor, secondaryColor, customName, customDomain } = body;

    const tenant = await prisma.tenant.update({
      where: { id },
      data: {
        ...(logo !== undefined && { logo }),
        ...(primaryColor !== undefined && { primaryColor }),
        ...(secondaryColor !== undefined && { secondaryColor }),
        ...(customName !== undefined && { customName }),
        ...(customDomain !== undefined && { customDomain }),
      },
    });

    return NextResponse.json(tenant);
  } catch (error) {
    console.error("[PUT /api/tenants/id/branding]", error);
    return NextResponse.json({ error: "Erro interno" }, { status: 500 });
  }
}
