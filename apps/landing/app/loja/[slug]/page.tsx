import { PrismaClient } from "@prisma/client";
import { notFound } from "next/navigation";
import LojaClient from "./LojaClient";

const prisma = new PrismaClient();

interface PageProps {
  params: { slug: string };
}

export async function generateMetadata({ params }: PageProps) {
  const tenant = await prisma.tenant.findUnique({ where: { slug: params.slug } });
  if (!tenant) return { title: "Loja não encontrada" };
  return { title: `Loja — ${tenant.name}` };
}

export default async function LojaPage({ params }: PageProps) {
  const tenant = await prisma.tenant.findUnique({ where: { slug: params.slug } });
  if (!tenant) notFound();

  const produtos = await prisma.produto.findMany({
    where: { tenantId: tenant.id, ativo: true },
    include: { variacoes: true },
    orderBy: { createdAt: "desc" },
  });

  return (
    <LojaClient
      churchName={tenant.name}
      slug={params.slug}
      produtos={produtos.map((p) => ({
        id: p.id,
        nome: p.nome,
        descricao: p.descricao ?? undefined,
        foto: p.foto ?? undefined,
        preco: p.preco,
        categoria: p.categoria,
        estoque: p.estoque,
        variacoes: p.variacoes.map((v) => ({
          id: v.id,
          tipo: v.tipo,
          opcao: v.opcao,
          estoque: v.estoque,
        })),
      }))}
    />
  );
}
