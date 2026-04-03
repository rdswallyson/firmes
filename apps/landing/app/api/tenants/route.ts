import { NextRequest, NextResponse } from "next/server";
import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();

export async function GET() {
  try {
    const tenant = await prisma.tenant.findFirst({
      include: {
        churches: {
          include: {
            _count: { select: { members: true, users: true } },
          },
        },
        _count: { select: { members: true } },
      },
    });
    if (!tenant) return NextResponse.json({ error: "No tenant" }, { status: 400 });
    
    // If this is a reseller, return their churches
    const isReseller = tenant.isWhiteLabel || tenant.plan.includes("ESMERALDA");
    
    return NextResponse.json({
      tenant,
      isReseller,
      churches: isReseller ? tenant.churches : [],
      totalMembers: isReseller 
        ? tenant.churches.reduce((acc: number, c: any) => acc + (c._count?.members || 0), 0)
        : tenant._count.members,
    });
  } catch (error) {
    console.error("[GET /api/tenants]", error);
    return NextResponse.json({ error: "Erro interno" }, { status: 500 });
  }
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { name, slug, resellerId } = body;
    
    if (!name || !slug) {
      return NextResponse.json({ error: "Nome e slug obrigatorios" }, { status: 400 });
    }

    // Check if slug already exists
    const existing = await prisma.tenant.findUnique({ where: { slug } });
    if (existing) {
      return NextResponse.json({ error: "Slug ja existe" }, { status: 400 });
    }

    // Get reseller limits
    let maxChurches = 1;
    if (resellerId) {
      const reseller = await prisma.tenant.findUnique({ where: { id: resellerId } });
      if (reseller) {
        maxChurches = reseller.maxChurches;
        const currentCount = await prisma.tenant.count({ where: { resellerId } });
        if (currentCount >= maxChurches) {
          return NextResponse.json({ error: "Limite de igrejas atingido" }, { status: 400 });
        }
      }
    }

    const tenant = await prisma.tenant.create({
      data: {
        name,
        slug,
        resellerId: resellerId || null,
        plan: "FREE",
        maxChurches: 1,
        trialEndsAt: new Date(Date.now() + 14 * 24 * 60 * 60 * 1000), // 14 days trial
      },
    });

    return NextResponse.json(tenant, { status: 201 });
  } catch (error) {
    console.error("[POST /api/tenants]", error);
    return NextResponse.json({ error: "Erro interno" }, { status: 500 });
  }
}
