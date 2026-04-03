"use client";

import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Package, X, ShoppingBag } from "lucide-react";

const NAVY = "#1A3C6E";
const GOLD = "#C8922A";
const BG = "#F0EBE1";

interface Variacao {
  id: string;
  tipo: string;
  opcao: string;
  estoque: number;
}

interface Produto {
  id: string;
  nome: string;
  descricao?: string;
  foto?: string;
  preco: number;
  categoria: string;
  estoque: number;
  variacoes: Variacao[];
}

interface Props {
  churchName: string;
  slug: string;
  produtos: Produto[];
}

const CAT_BADGE: Record<string, { bg: string; color: string; label: string }> = {
  ROUPA:  { bg: "#EDE9FE", color: "#7C3AED", label: "Roupa" },
  LIVRO:  { bg: "#DBEAFE", color: "#1D4ED8", label: "Livro" },
  COMIDA: { bg: "#FEF3C7", color: "#C8922A", label: "Comida" },
  EVENTO: { bg: "#DCFCE7", color: "#16A34A", label: "Evento" },
  OUTROS: { bg: "#F3F4F6", color: "#6B7280", label: "Outros" },
};

const containerVariants = {
  hidden: {},
  visible: { transition: { staggerChildren: 0.07 } },
};
const cardVariants = {
  hidden: { opacity: 0, y: 20 },
  visible: { opacity: 1, y: 0, transition: { duration: 0.35 } },
};

const overlayStyle: React.CSSProperties = {
  position: "fixed",
  inset: 0,
  background: "rgba(0,0,0,0.5)",
  display: "flex",
  alignItems: "center",
  justifyContent: "center",
  zIndex: 999,
  padding: "1rem",
};

const modalStyle: React.CSSProperties = {
  background: "#FFF",
  borderRadius: "16px",
  width: "100%",
  maxWidth: "480px",
  maxHeight: "88vh",
  overflowY: "auto",
  boxShadow: "0 20px 60px rgba(0,0,0,0.2)",
  fontFamily: "sans-serif",
};

export default function LojaClient({ churchName, slug, produtos }: Props) {
  const [selected, setSelected] = useState<Produto | null>(null);

  const fmt = (v: number) =>
    `R$ ${v.toLocaleString("pt-BR", { minimumFractionDigits: 2 })}`;

  return (
    <div
      style={{
        minHeight: "100vh",
        background: BG,
        fontFamily: "'Nunito', sans-serif",
      }}
    >
      {/* Header */}
      <div
        style={{
          background: `linear-gradient(135deg, ${NAVY} 0%, #1E4A84 100%)`,
          padding: "2.5rem 1.5rem 3rem",
          textAlign: "center",
          color: "#FFF",
        }}
      >
        <div
          style={{
            width: 52,
            height: 52,
            borderRadius: 14,
            background: "rgba(200,146,42,0.2)",
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            margin: "0 auto 1rem",
            color: GOLD,
          }}
        >
          <ShoppingBag size={26} strokeWidth={1.5} />
        </div>
        <h1
          style={{
            margin: "0 0 0.35rem",
            fontSize: "1.75rem",
            fontWeight: 800,
            letterSpacing: "-0.01em",
          }}
        >
          {churchName}
        </h1>
        <p style={{ margin: 0, color: "rgba(255,255,255,0.65)", fontSize: "0.95rem" }}>
          Loja oficial — confira nossos produtos
        </p>
      </div>

      {/* Wave divider */}
      <svg
        viewBox="0 0 1440 48"
        preserveAspectRatio="none"
        style={{ display: "block", marginTop: -1, background: BG }}
      >
        <path
          d="M0,48 L0,24 C360,0 1080,48 1440,24 L1440,48 Z"
          fill={NAVY}
        />
      </svg>

      {/* Products grid */}
      <div style={{ maxWidth: "1100px", margin: "0 auto", padding: "2rem 1.25rem 3rem" }}>
        {produtos.length === 0 ? (
          <div
            style={{
              textAlign: "center",
              padding: "4rem 1rem",
              color: "#9CA3AF",
            }}
          >
            <ShoppingBag size={48} strokeWidth={1} style={{ marginBottom: "1rem", opacity: 0.4 }} />
            <p style={{ fontSize: "1rem", margin: 0 }}>Nenhum produto disponível no momento.</p>
          </div>
        ) : (
          <motion.div
            variants={containerVariants}
            initial="hidden"
            animate="visible"
            style={{
              display: "grid",
              gridTemplateColumns: "repeat(auto-fill, minmax(240px, 1fr))",
              gap: "1.25rem",
            }}
          >
            {produtos.map((produto) => {
              const cat = CAT_BADGE[produto.categoria] ?? CAT_BADGE["OUTROS"]!;
              return (
                <motion.div
                  key={produto.id}
                  variants={cardVariants}
                  whileHover={{ y: -3, boxShadow: "0 10px 30px rgba(0,0,0,0.12)" }}
                  onClick={() => setSelected(produto)}
                  style={{
                    background: "#FFF",
                    borderRadius: "14px",
                    overflow: "hidden",
                    boxShadow: "0 2px 8px rgba(0,0,0,0.07)",
                    cursor: "pointer",
                    transition: "box-shadow 0.2s",
                  }}
                >
                  {/* Product image / placeholder */}
                  <div
                    style={{
                      height: 180,
                      background: produto.foto
                        ? `url(${produto.foto}) center/cover no-repeat`
                        : `linear-gradient(135deg, ${NAVY}, #2A5BA0)`,
                      display: "flex",
                      alignItems: "center",
                      justifyContent: "center",
                      position: "relative",
                    }}
                  >
                    {!produto.foto && (
                      <Package size={40} color="rgba(255,255,255,0.35)" strokeWidth={1} />
                    )}
                    {/* Category badge over image */}
                    <span
                      style={{
                        position: "absolute",
                        top: 10,
                        right: 10,
                        background: cat.bg,
                        color: cat.color,
                        fontSize: "0.68rem",
                        fontWeight: 700,
                        padding: "0.2rem 0.55rem",
                        borderRadius: "999px",
                      }}
                    >
                      {cat.label}
                    </span>
                  </div>

                  {/* Info */}
                  <div style={{ padding: "1rem" }}>
                    <h3
                      style={{
                        margin: "0 0 0.3rem",
                        fontSize: "0.9375rem",
                        fontWeight: 700,
                        color: "#0D2545",
                        lineHeight: 1.3,
                      }}
                    >
                      {produto.nome}
                    </h3>
                    {produto.descricao && (
                      <p
                        style={{
                          margin: "0 0 0.75rem",
                          fontSize: "0.8rem",
                          color: "#6B7280",
                          lineHeight: 1.4,
                          display: "-webkit-box",
                          WebkitLineClamp: 2,
                          WebkitBoxOrient: "vertical",
                          overflow: "hidden",
                        }}
                      >
                        {produto.descricao}
                      </p>
                    )}

                    <div
                      style={{
                        display: "flex",
                        alignItems: "center",
                        justifyContent: "space-between",
                        marginTop: produto.descricao ? 0 : "0.5rem",
                      }}
                    >
                      <span
                        style={{
                          fontSize: "1.15rem",
                          fontWeight: 800,
                          color: GOLD,
                        }}
                      >
                        {fmt(produto.preco)}
                      </span>
                      <span
                        style={{
                          fontSize: "0.72rem",
                          color:
                            produto.variacoes.length > 0
                              ? NAVY
                              : "#9CA3AF",
                          fontWeight: produto.variacoes.length > 0 ? 700 : 400,
                          background:
                            produto.variacoes.length > 0 ? "#EEF2FA" : "transparent",
                          padding: produto.variacoes.length > 0 ? "0.2rem 0.5rem" : 0,
                          borderRadius: 6,
                        }}
                      >
                        {produto.variacoes.length > 0
                          ? `${produto.variacoes.length} variações`
                          : `${produto.estoque} em estoque`}
                      </span>
                    </div>

                    <button
                      style={{
                        marginTop: "0.85rem",
                        width: "100%",
                        padding: "0.6rem",
                        background: NAVY,
                        color: "#FFF",
                        border: "none",
                        borderRadius: "8px",
                        fontSize: "0.8375rem",
                        fontWeight: 700,
                        cursor: "pointer",
                        fontFamily: "inherit",
                      }}
                    >
                      Ver detalhes
                    </button>
                  </div>
                </motion.div>
              );
            })}
          </motion.div>
        )}
      </div>

      {/* Detail Modal */}
      <AnimatePresence>
        {selected && (
          <motion.div
            style={overlayStyle}
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={(e) => e.target === e.currentTarget && setSelected(null)}
          >
            <motion.div
              style={modalStyle}
              initial={{ scale: 0.93, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.93, opacity: 0 }}
            >
              {/* Image */}
              <div
                style={{
                  height: 220,
                  background: selected.foto
                    ? `url(${selected.foto}) center/cover no-repeat`
                    : `linear-gradient(135deg, ${NAVY}, #2A5BA0)`,
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                  position: "relative",
                  borderRadius: "16px 16px 0 0",
                }}
              >
                {!selected.foto && (
                  <Package size={56} color="rgba(255,255,255,0.3)" strokeWidth={1} />
                )}
                <button
                  onClick={() => setSelected(null)}
                  style={{
                    position: "absolute",
                    top: 12,
                    right: 12,
                    background: "rgba(0,0,0,0.4)",
                    border: "none",
                    borderRadius: "50%",
                    width: 32,
                    height: 32,
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "center",
                    cursor: "pointer",
                    color: "#FFF",
                  }}
                >
                  <X size={16} strokeWidth={2} />
                </button>
              </div>

              {/* Content */}
              <div style={{ padding: "1.5rem" }}>
                <div
                  style={{
                    display: "flex",
                    alignItems: "flex-start",
                    justifyContent: "space-between",
                    gap: "0.75rem",
                    marginBottom: "0.75rem",
                  }}
                >
                  <h2
                    style={{
                      margin: 0,
                      fontSize: "1.2rem",
                      fontWeight: 800,
                      color: "#0D2545",
                      lineHeight: 1.25,
                    }}
                  >
                    {selected.nome}
                  </h2>
                  <span
                    style={{
                      fontSize: "1.3rem",
                      fontWeight: 800,
                      color: GOLD,
                      whiteSpace: "nowrap",
                      flexShrink: 0,
                    }}
                  >
                    {fmt(selected.preco)}
                  </span>
                </div>

                {selected.descricao && (
                  <p
                    style={{
                      margin: "0 0 1rem",
                      fontSize: "0.875rem",
                      color: "#6B7280",
                      lineHeight: 1.55,
                    }}
                  >
                    {selected.descricao}
                  </p>
                )}

                {/* Variations */}
                {selected.variacoes.length > 0 && (
                  <div style={{ marginBottom: "1rem" }}>
                    <div
                      style={{
                        fontSize: "0.78rem",
                        fontWeight: 700,
                        color: "#374151",
                        textTransform: "uppercase",
                        letterSpacing: "0.06em",
                        marginBottom: "0.6rem",
                      }}
                    >
                      Variações disponíveis
                    </div>

                    {/* Group variations by type */}
                    {Array.from(new Set(selected.variacoes.map((v) => v.tipo))).map((tipo) => (
                      <div key={tipo} style={{ marginBottom: "0.75rem" }}>
                        <div
                          style={{
                            fontSize: "0.75rem",
                            color: "#9CA3AF",
                            marginBottom: "0.35rem",
                          }}
                        >
                          {tipo}
                        </div>
                        <div style={{ display: "flex", flexWrap: "wrap", gap: "0.4rem" }}>
                          {selected.variacoes
                            .filter((v) => v.tipo === tipo)
                            .map((v) => (
                              <span
                                key={v.id}
                                style={{
                                  padding: "0.3rem 0.75rem",
                                  borderRadius: "7px",
                                  border: `1.5px solid ${v.estoque > 0 ? NAVY : "#E5E7EB"}`,
                                  background: v.estoque > 0 ? "#EEF2FA" : "#F9FAFB",
                                  color: v.estoque > 0 ? NAVY : "#9CA3AF",
                                  fontSize: "0.8125rem",
                                  fontWeight: 600,
                                }}
                              >
                                {v.opcao}
                                {v.estoque === 0 && (
                                  <span
                                    style={{
                                      marginLeft: "0.35rem",
                                      fontSize: "0.68rem",
                                      color: "#DC2626",
                                    }}
                                  >
                                    (esgotado)
                                  </span>
                                )}
                              </span>
                            ))}
                        </div>
                      </div>
                    ))}
                  </div>
                )}

                {/* Stock (no variations) */}
                {selected.variacoes.length === 0 && (
                  <div
                    style={{
                      display: "inline-flex",
                      alignItems: "center",
                      gap: "0.4rem",
                      fontSize: "0.8rem",
                      color: selected.estoque > 0 ? "#16A34A" : "#DC2626",
                      background: selected.estoque > 0 ? "#DCFCE7" : "#FEE2E2",
                      padding: "0.3rem 0.75rem",
                      borderRadius: "6px",
                      fontWeight: 600,
                      marginBottom: "1rem",
                    }}
                  >
                    {selected.estoque > 0
                      ? `${selected.estoque} em estoque`
                      : "Fora de estoque"}
                  </div>
                )}

                <div
                  style={{
                    marginTop: "0.5rem",
                    padding: "0.85rem 1rem",
                    background: "#F9FAFB",
                    borderRadius: "10px",
                    fontSize: "0.8125rem",
                    color: "#6B7280",
                    textAlign: "center",
                    lineHeight: 1.5,
                  }}
                >
                  Para adquirir este produto, entre em contato com a{" "}
                  <strong style={{ color: NAVY }}>{/* church name passed from parent */}nossa equipe</strong>{" "}
                  ou visite-nos presencialmente.
                </div>

                <button
                  onClick={() => setSelected(null)}
                  style={{
                    marginTop: "1rem",
                    width: "100%",
                    padding: "0.75rem",
                    background: NAVY,
                    color: "#FFF",
                    border: "none",
                    borderRadius: "9px",
                    fontSize: "0.9rem",
                    fontWeight: 700,
                    cursor: "pointer",
                    fontFamily: "inherit",
                  }}
                >
                  Fechar
                </button>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
