"use client";

import { useState, useEffect } from "react";
import { motion } from "framer-motion";
import {
  ShoppingBag,
  Package,
  DollarSign,
  Copy,
  Check,
  ExternalLink,
  ShoppingCart,
} from "lucide-react";
import Link from "next/link";

const NAVY = "#1A3C6E";
const GOLD = "#C8922A";
const BG = "#F0EBE1";

interface VendasStats {
  totalProdutos: number;
  pedidosHoje: number;
  receitaMes: number;
}

function CopyButton({ text }: { text: string }) {
  const [copied, setCopied] = useState(false);
  return (
    <button
      onClick={() => {
        navigator.clipboard.writeText(text);
        setCopied(true);
        setTimeout(() => setCopied(false), 2000);
      }}
      style={{
        display: "inline-flex",
        alignItems: "center",
        gap: "0.35rem",
        padding: "0.45rem 0.85rem",
        borderRadius: "7px",
        border: `1.5px solid ${copied ? "#16A34A" : "#E5E7EB"}`,
        background: copied ? "#DCFCE7" : "#FFF",
        color: copied ? "#16A34A" : "#374151",
        fontSize: "0.8rem",
        fontWeight: 600,
        cursor: "pointer",
        transition: "all 0.2s",
        fontFamily: "var(--font-nunito), sans-serif",
        whiteSpace: "nowrap",
        flexShrink: 0,
      }}
    >
      {copied ? <Check size={14} strokeWidth={2} /> : <Copy size={14} strokeWidth={1.5} />}
      {copied ? "Copiado!" : "Copiar"}
    </button>
  );
}

const cardVariants = {
  hidden: { opacity: 0, y: 18 },
  visible: { opacity: 1, y: 0, transition: { duration: 0.35 } },
};

export default function VendasPage() {
  const [stats, setStats] = useState<VendasStats>({
    totalProdutos: 0,
    pedidosHoje: 0,
    receitaMes: 0,
  });
  const [lojaUrl, setLojaUrl] = useState("");
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function load() {
      try {
        // Fetch tenant slug to build the public store URL
        const tenantRes = await fetch("/api/tenant");
        if (tenantRes.ok) {
          const tenantData = await tenantRes.json();
          const slug: string = tenantData.slug ?? tenantData.tenant?.slug ?? "";
          if (slug) {
            const origin = typeof window !== "undefined" ? window.location.origin : "";
            setLojaUrl(`${origin}/loja/${slug}`);
          }
        }

        // Fetch produtos count
        const prodRes = await fetch("/api/produtos");
        if (prodRes.ok) {
          const prodData = await prodRes.json();
          const lista = prodData.produtos ?? (Array.isArray(prodData) ? prodData : []);
          setStats((prev) => ({ ...prev, totalProdutos: lista.length }));
        }

        // Fetch pedidos for hoje + receita do mês
        const pedRes = await fetch("/api/pedidos");
        if (pedRes.ok) {
          const pedData = await pedRes.json();
          const pedidos = pedData.pedidos ?? (Array.isArray(pedData) ? pedData : []);
          const hoje = new Date();
          const inicioHoje = new Date(hoje.getFullYear(), hoje.getMonth(), hoje.getDate());
          const inicioMes = new Date(hoje.getFullYear(), hoje.getMonth(), 1);

          const pedidosHoje = pedidos.filter(
            (p: { createdAt: string }) => new Date(p.createdAt) >= inicioHoje
          ).length;

          const receitaMes = pedidos
            .filter(
              (p: { createdAt: string; status: string }) =>
                new Date(p.createdAt) >= inicioMes && p.status !== "CANCELADO"
            )
            .reduce((acc: number, p: { total: number }) => acc + (p.total ?? 0), 0);

          setStats((prev) => ({ ...prev, pedidosHoje, receitaMes }));
        }
      } catch {
        /* ignore */
      } finally {
        setLoading(false);
      }
    }

    load();
  }, []);

  const fmt = (v: number) =>
    `R$ ${v.toLocaleString("pt-BR", { minimumFractionDigits: 2 })}`;

  const statCards = [
    {
      icon: <Package size={22} strokeWidth={1.5} />,
      label: "Total Produtos",
      value: String(stats.totalProdutos),
      color: NAVY,
      bg: "#EEF2FA",
    },
    {
      icon: <ShoppingCart size={22} strokeWidth={1.5} />,
      label: "Pedidos Hoje",
      value: String(stats.pedidosHoje),
      color: "#7C3AED",
      bg: "#EDE9FE",
    },
    {
      icon: <DollarSign size={22} strokeWidth={1.5} />,
      label: "Receita do Mês",
      value: fmt(stats.receitaMes),
      color: "#16A34A",
      bg: "#DCFCE7",
    },
  ];

  return (
    <div
      style={{
        padding: "1.75rem 2rem",
        maxWidth: "1200px",
        margin: "0 auto",
        fontFamily: "var(--font-nunito), sans-serif",
      }}
    >
      {/* Header */}
      <motion.div
        initial={{ opacity: 0, y: -10 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.35 }}
        style={{ marginBottom: "1.75rem" }}
      >
        <h1
          style={{
            fontSize: "1.5rem",
            fontWeight: 700,
            color: "#0D2545",
            margin: "0 0 0.2rem",
          }}
        >
          Vendas
        </h1>
        <p style={{ color: "#6B7280", fontSize: "0.875rem", margin: 0 }}>
          Gerencie sua loja, produtos e pedidos
        </p>
      </motion.div>

      {/* Stat Cards */}
      <div
        style={{
          display: "grid",
          gridTemplateColumns: "repeat(auto-fill, minmax(220px, 1fr))",
          gap: "1rem",
          marginBottom: "1.5rem",
        }}
      >
        {statCards.map((card, i) => (
          <motion.div
            key={card.label}
            variants={cardVariants}
            initial="hidden"
            animate="visible"
            transition={{ delay: i * 0.08 }}
            style={{
              background: "#FFF",
              borderRadius: "12px",
              padding: "1.25rem 1.35rem",
              boxShadow: "0 2px 8px rgba(0,0,0,0.06)",
              display: "flex",
              alignItems: "center",
              gap: "1rem",
            }}
          >
            <div
              style={{
                width: 46,
                height: 46,
                borderRadius: 10,
                background: card.bg,
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                color: card.color,
                flexShrink: 0,
              }}
            >
              {card.icon}
            </div>
            <div>
              <div
                style={{
                  color: "#6B7280",
                  fontSize: "0.75rem",
                  fontWeight: 500,
                  marginBottom: "0.15rem",
                }}
              >
                {card.label}
              </div>
              <div
                style={{
                  color: "#111827",
                  fontSize: "1.35rem",
                  fontWeight: 700,
                  lineHeight: 1.2,
                }}
              >
                {loading ? (
                  <span style={{ color: "#D1D5DB" }}>—</span>
                ) : (
                  card.value
                )}
              </div>
            </div>
          </motion.div>
        ))}
      </div>

      {/* Loja Pública card */}
      <motion.div
        initial={{ opacity: 0, y: 16 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.28, duration: 0.35 }}
        style={{
          background: `linear-gradient(135deg, ${NAVY} 0%, #1E4A84 100%)`,
          borderRadius: "14px",
          padding: "1.5rem 1.75rem",
          marginBottom: "1.5rem",
          boxShadow: "0 4px 16px rgba(26,60,110,0.2)",
          color: "#FFF",
        }}
      >
        <div
          style={{
            display: "flex",
            alignItems: "flex-start",
            justifyContent: "space-between",
            flexWrap: "wrap",
            gap: "1rem",
          }}
        >
          <div style={{ display: "flex", alignItems: "center", gap: "0.75rem" }}>
            <div
              style={{
                width: 42,
                height: 42,
                borderRadius: 10,
                background: "rgba(200,146,42,0.2)",
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                color: GOLD,
                flexShrink: 0,
              }}
            >
              <ShoppingBag size={22} strokeWidth={1.5} />
            </div>
            <div>
              <div
                style={{
                  fontSize: "0.7rem",
                  textTransform: "uppercase",
                  letterSpacing: "0.1em",
                  color: "rgba(200,146,42,0.9)",
                  fontWeight: 700,
                  marginBottom: "0.2rem",
                }}
              >
                Loja Pública
              </div>
              <h2 style={{ margin: 0, fontSize: "1.05rem", fontWeight: 700 }}>
                Compartilhe sua loja com a comunidade
              </h2>
              <p
                style={{
                  margin: "0.25rem 0 0",
                  fontSize: "0.8125rem",
                  color: "rgba(255,255,255,0.65)",
                }}
              >
                Qualquer pessoa pode acessar sem precisar fazer login
              </p>
            </div>
          </div>
        </div>

        {lojaUrl && (
          <div
            style={{
              marginTop: "1.15rem",
              background: "rgba(255,255,255,0.08)",
              borderRadius: "9px",
              padding: "0.75rem 1rem",
              display: "flex",
              alignItems: "center",
              gap: "0.75rem",
              flexWrap: "wrap",
            }}
          >
            <span
              style={{
                flex: 1,
                fontSize: "0.8375rem",
                color: "rgba(255,255,255,0.85)",
                fontFamily: "monospace",
                wordBreak: "break-all",
                minWidth: 0,
              }}
            >
              {lojaUrl}
            </span>
            <div style={{ display: "flex", gap: "0.5rem", flexShrink: 0 }}>
              <CopyButton text={lojaUrl} />
              <a
                href={lojaUrl}
                target="_blank"
                rel="noopener noreferrer"
                style={{
                  display: "inline-flex",
                  alignItems: "center",
                  gap: "0.35rem",
                  padding: "0.45rem 0.85rem",
                  borderRadius: "7px",
                  background: GOLD,
                  color: "#FFF",
                  fontSize: "0.8rem",
                  fontWeight: 700,
                  textDecoration: "none",
                  whiteSpace: "nowrap",
                }}
              >
                <ExternalLink size={14} strokeWidth={1.5} /> Abrir
              </a>
            </div>
          </div>
        )}

        {!lojaUrl && !loading && (
          <div
            style={{
              marginTop: "1rem",
              fontSize: "0.8125rem",
              color: "rgba(255,255,255,0.5)",
            }}
          >
            URL da loja não disponível — verifique a configuração do tenant.
          </div>
        )}
      </motion.div>

      {/* Quick links */}
      <div
        style={{
          display: "grid",
          gridTemplateColumns: "repeat(auto-fill, minmax(260px, 1fr))",
          gap: "1rem",
        }}
      >
        {/* PDV */}
        <motion.div
          initial={{ opacity: 0, y: 16 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.38, duration: 0.35 }}
        >
          <Link
            href="/vendas/pdv"
            style={{ textDecoration: "none" }}
          >
            <div
              style={{
                background: "#FFF",
                borderRadius: "12px",
                padding: "1.25rem 1.35rem",
                boxShadow: "0 2px 8px rgba(0,0,0,0.06)",
                display: "flex",
                alignItems: "center",
                gap: "1rem",
                cursor: "pointer",
                transition: "box-shadow 0.15s, transform 0.15s",
                border: `1.5px solid transparent`,
              }}
              onMouseEnter={(e) => {
                (e.currentTarget as HTMLDivElement).style.boxShadow =
                  "0 6px 20px rgba(26,60,110,0.13)";
                (e.currentTarget as HTMLDivElement).style.borderColor = NAVY;
              }}
              onMouseLeave={(e) => {
                (e.currentTarget as HTMLDivElement).style.boxShadow =
                  "0 2px 8px rgba(0,0,0,0.06)";
                (e.currentTarget as HTMLDivElement).style.borderColor = "transparent";
              }}
            >
              <div
                style={{
                  width: 46,
                  height: 46,
                  borderRadius: 10,
                  background: "#EEF2FA",
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                  color: NAVY,
                  flexShrink: 0,
                }}
              >
                <ShoppingCart size={22} strokeWidth={1.5} />
              </div>
              <div style={{ flex: 1 }}>
                <div
                  style={{
                    fontSize: "1rem",
                    fontWeight: 700,
                    color: "#0D2545",
                    marginBottom: "0.15rem",
                  }}
                >
                  PDV
                </div>
                <div style={{ fontSize: "0.8125rem", color: "#6B7280" }}>
                  Ponto de Venda — registre vendas rapidamente
                </div>
              </div>
              <ExternalLink size={16} strokeWidth={1.5} color="#9CA3AF" />
            </div>
          </Link>
        </motion.div>

        {/* Produtos */}
        <motion.div
          initial={{ opacity: 0, y: 16 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.46, duration: 0.35 }}
        >
          <Link
            href="/produtos"
            style={{ textDecoration: "none" }}
          >
            <div
              style={{
                background: "#FFF",
                borderRadius: "12px",
                padding: "1.25rem 1.35rem",
                boxShadow: "0 2px 8px rgba(0,0,0,0.06)",
                display: "flex",
                alignItems: "center",
                gap: "1rem",
                cursor: "pointer",
                transition: "box-shadow 0.15s, transform 0.15s",
                border: "1.5px solid transparent",
              }}
              onMouseEnter={(e) => {
                (e.currentTarget as HTMLDivElement).style.boxShadow =
                  "0 6px 20px rgba(200,146,42,0.15)";
                (e.currentTarget as HTMLDivElement).style.borderColor = GOLD;
              }}
              onMouseLeave={(e) => {
                (e.currentTarget as HTMLDivElement).style.boxShadow =
                  "0 2px 8px rgba(0,0,0,0.06)";
                (e.currentTarget as HTMLDivElement).style.borderColor = "transparent";
              }}
            >
              <div
                style={{
                  width: 46,
                  height: 46,
                  borderRadius: 10,
                  background: "#FFF8EE",
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                  color: GOLD,
                  flexShrink: 0,
                }}
              >
                <Package size={22} strokeWidth={1.5} />
              </div>
              <div style={{ flex: 1 }}>
                <div
                  style={{
                    fontSize: "1rem",
                    fontWeight: 700,
                    color: "#0D2545",
                    marginBottom: "0.15rem",
                  }}
                >
                  Produtos
                </div>
                <div style={{ fontSize: "0.8125rem", color: "#6B7280" }}>
                  Catálogo — adicione e edite produtos
                </div>
              </div>
              <ExternalLink size={16} strokeWidth={1.5} color="#9CA3AF" />
            </div>
          </Link>
        </motion.div>
      </div>
    </div>
  );
}
