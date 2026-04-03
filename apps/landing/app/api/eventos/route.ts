import { NextRequest, NextResponse } from "next/server";
import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();

function slugify(text: string): string {
  return text
    .toLowerCase()
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .replace(/[^a-z0-9\s-]/g, "")
    .trim()
    .replace(/\s+/g, "-")
    .replace(/-+/g, "-");
}

export async function GET(request: NextRequest) {
  try {
    const tenant = await prisma.tenant.findFirst();
    if (!tenant) return NextResponse.json({ error: "No tenant" }, { status: 400 });

    const { searchParams } = new URL(request.url);
    const slugParam = searchParams.get("slug");

    if (slugParam) {
      const evento = await prisma.event.findFirst({
        where: { slug: slugParam, tenantId: tenant.id },
        include: { inscricoes: true },
      });
      if (!evento) return NextResponse.json({ error: "Evento não encontrado" }, { status: 404 });
      return NextResponse.json(evento);
    }

    const eventos = await prisma.event.findMany({
      where: { tenantId: tenant.id },
      orderBy: { date: "desc" },
      include: { _count: { select: { inscricoes: true } } },
    });

    return NextResponse.json(eventos);
  } catch (error) {
    console.error("[GET /api/eventos]", error);
    return NextResponse.json({ error: "Erro interno" }, { status: 500 });
  }
}

export async function POST(request: NextRequest) {
  try {
    const tenant = await prisma.tenant.findFirst();
    if (!tenant) return NextResponse.json({ error: "No tenant" }, { status: 400 });

    const body = await request.json();
    const { title, description, date, location, maxVagas, isGratuito, valor, banner, linkExterno, recorrente, avancado, endereco, googleMapsLink } = body;

    if (!title || !date) {
      return NextResponse.json({ error: "Campos obrigatórios: title, date" }, { status: 400 });
    }

    const baseSlug = slugify(title);
    let slug = baseSlug;
    const existing = await prisma.event.findFirst({ where: { slug } });
    if (existing) slug = `${baseSlug}-${Math.random().toString(36).slice(2, 7)}`;

    const evento = await prisma.event.create({
      data: {
        tenantId: tenant.id,
        title,
        slug,
        description: description ?? null,
        date: new Date(date),
        location: location ?? null,
        maxVagas: maxVagas ?? null,
        isGratuito: isGratuito ?? true,
        valor: valor ?? null,
        banner: banner ?? null,
        linkExterno: linkExterno ?? null,
        recorrente: recorrente ?? false,
        avancado: avancado ?? false,
        endereco: endereco ?? null,
        googleMapsLink: googleMapsLink ?? null,
        status: "ABERTO",
      },
    });

    return NextResponse.json(evento, { status: 201 });
  } catch (error) {
    console.error("[POST /api/eventos]", error);
    return NextResponse.json({ error: "Erro interno" }, { status: 500 });
  }
}
