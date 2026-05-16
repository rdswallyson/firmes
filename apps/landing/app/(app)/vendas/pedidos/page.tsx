"use client";

import { useState, useEffect } from "react";
import { motion } from "framer-motion";
import { Search, Package, Eye, Banknote, CreditCard, Truck, Clock, CheckCircle, XCircle } from "lucide-react";

interface Pedido {
  id: string;
  nomeComprador: string;
  telefone?: string;
  email?: string;
  status: string;
  formaPagamento?: string;
  total: number;
  createdAt: string;
  itens?: { id: string; quantidade: number; preco: number; produto: { nome: string } }[];
}

const STATUS_CONFIG: Record<string, { label: string; color: string; bg: string; icon: React.ReactNode }> = {
  PENDENTE: { label: "Pendente", color: "#F59E0B", bg: "#FEF3C7", icon: <Clock size={14} /> },
  AGUARDANDO_PAGAMENTO: { label: "Aguardando Pagamento", color: "#3B82F6", bg: "#DBEAFE", icon: <Clock size={14} /> },
  PAGO: { label: "Pago", color: "#16A34A", bg: "#DCFCE7", icon: <CheckCircle size={14} /> },
  ENTREGUE: { label: "Entregue", color: "#7C3AED", bg: "#EDE9FE", icon: <Truck size={14} /> },
  CANCELADO: { label: "Cancelado", color: "#DC2626", bg: "#FEE2E2", icon: <XCircle size={14} /> },
};

export default function PedidosPage() {
  const [pedidos, setPedidos] = useState<Pedido[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");
  const [filter, setFilter] = useState("TODOS");

  useEffect(() => {
    fetch("/api/pedidos")
      .then((r) => r.json())
      .then((data) => {
        if (Array.isArray(data)) setPedidos(data);
      })
      .catch(() => {})
      .finally(() => setLoading(false));
  }, []);

  const filtered = pedidos.filter((p) => {
    const matchSearch = p.nomeComprador.toLowerCase().includes(search.toLowerCase());
    const matchFilter = filter === "TODOS" || p.status === filter;
    return matchSearch && matchFilter;
  });

  async function updateStatus(id: string, status: string) {
    try {
      const res = await fetch(`/api/pedidos/${id}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ status }),
      });
      if (res.ok) {
        setPedidos((prev) => prev.map((p) => (p.id === id ? { ...p, status } : p)));
      }
    } catch {
      alert("Erro ao atualizar status");
    }
  }

  return (
    <div className="page-pad" style={{ maxWidth: 1400, margin: "0 auto" }}>
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 24 }}>
        <div>
          <h1 style={{ fontSize: 24, fontWeight: 800, color: "#0D2545", margin: 0 }}>Pedidos</h1>
          <p style={{ color: "#6B7280", margin: "4px 0 0" }}>Gerencie os pedidos da sua loja</p>
        </div>
      </div>

      <div style={{ display: "flex", gap: 12, marginBottom: 20, flexWrap: "wrap" }}>
        <div style={{ position: "relative", flex: 1, minWidth: 200 }}>
          <Search size={16} style={{ position: "absolute", left: 12, top: "50%", transform: "translateY(-50%)", color: "#9CA3AF" }} />
          <input
            type="text"
            placeholder="Buscar por nome..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            style={{ width: "100%", padding: "10px 12px 10px 40px", border: "1.5px solid #E5E7EB", borderRadius: 10, fontSize: 14, background: "white" }}
          />
        </div>
        <select
          value={filter}
          onChange={(e) => setFilter(e.target.value)}
          style={{ padding: "10px 12px", border: "1.5px solid #E5E7EB", borderRadius: 10, fontSize: 14, background: "white" }}
        >
          <option value="TODOS">Todos os status</option>
          <option value="PENDENTE">Pendente</option>
          <option value="AGUARDANDO_PAGAMENTO">Aguardando Pagamento</option>
          <option value="PAGO">Pago</option>
          <option value="ENTREGUE">Entregue</option>
          <option value="CANCELADO">Cancelado</option>
        </select>
      </div>

      {loading ? (
        <p style={{ color: "#6B7280" }}>Carregando...</p>
      ) : filtered.length === 0 ? (
        <div style={{ textAlign: "center", padding: "60px 20px", background: "white", borderRadius: 16 }}>
          <Package size={48} style={{ color: "#E5E7EB", marginBottom: 16 }} />
          <p style={{ color: "#6B7280" }}>Nenhum pedido encontrado.</p>
        </div>
      ) : (
        <div style={{ display: "flex", flexDirection: "column", gap: 12 }}>
          {filtered.map((pedido, i) => {
            const status = STATUS_CONFIG[pedido.status] || STATUS_CONFIG.PENDENTE;
            if (!status) return null;
            return (
              <motion.div
                key={pedido.id}
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: i * 0.05 }}
                style={{ background: "white", borderRadius: 12, padding: 20, boxShadow: "0 1px 3px rgba(0,0,0,0.06)" }}
              >
                <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", marginBottom: 12 }}>
                  <div>
                    <div style={{ display: "flex", alignItems: "center", gap: 8, marginBottom: 4 }}>
                      <span style={{ fontSize: 14, fontWeight: 700, color: "#111827" }}>{pedido.nomeComprador}</span>
                      <span style={{ background: status.bg, color: status.color, padding: "2px 8px", borderRadius: 6, fontSize: 11, fontWeight: 700, display: "flex", alignItems: "center", gap: 4 }}>
                        {status.icon}
                        {status.label}
                      </span>
                    </div>
                    <p style={{ margin: 0, fontSize: 12, color: "#9CA3AF" }}>{pedido.telefone} {pedido.email && `· ${pedido.email}`}</p>
                  </div>
                  <span style={{ fontSize: 18, fontWeight: 800, color: "#1A3C6E" }}>R$ {pedido.total.toFixed(2)}</span>
                </div>

                {pedido.itens && pedido.itens.length > 0 && (
                  <div style={{ marginBottom: 12, padding: 10, background: "#F9FAFB", borderRadius: 8 }}>
                    {pedido.itens.map((item) => (
                      <div key={item.id} style={{ fontSize: 13, color: "#4B5563" }}>
                        {item.quantidade}x {item.produto?.nome || "Produto"} — R$ {item.preco.toFixed(2)}
                      </div>
                    ))}
                  </div>
                )}

                <div style={{ display: "flex", gap: 8, flexWrap: "wrap" }}>
                  {pedido.status !== "PAGO" && pedido.status !== "CANCELADO" && pedido.status !== "ENTREGUE" && (
                    <button
                      onClick={() => updateStatus(pedido.id, "PAGO")}
                      style={{ padding: "6px 12px", background: "#DCFCE7", border: "none", borderRadius: 6, fontSize: 12, fontWeight: 600, color: "#16A34A", cursor: "pointer" }}
                    >
                      <CheckCircle size={12} /> Marcar como Pago
                    </button>
                  )}
                  {pedido.status === "PAGO" && (
                    <button
                      onClick={() => updateStatus(pedido.id, "ENTREGUE")}
                      style={{ padding: "6px 12px", background: "#EDE9FE", border: "none", borderRadius: 6, fontSize: 12, fontWeight: 600, color: "#7C3AED", cursor: "pointer" }}
                    >
                      <Truck size={12} /> Marcar como Entregue
                    </button>
                  )}
                  {pedido.status !== "CANCELADO" && pedido.status !== "ENTREGUE" && (
                    <button
                      onClick={() => updateStatus(pedido.id, "CANCELADO")}
                      style={{ padding: "6px 12px", background: "#FEE2E2", border: "none", borderRadius: 6, fontSize: 12, fontWeight: 600, color: "#DC2626", cursor: "pointer" }}
                    >
                      <XCircle size={12} /> Cancelar
                    </button>
                  )}
                </div>
              </motion.div>
            );
          })}
        </div>
      )}
    </div>
  );
}
