"use client";

import { useState, useEffect, useCallback } from "react";
import { useRouter } from "next/navigation";
import { Calendar, Users } from "lucide-react";

interface Congregation {
  id: string;
  name: string;
}

interface Culto {
  id: string;
  titulo: string;
  data: string;
  tipo: string;
  _count?: { checkins: number };
}

export default function CongregacaoCultosPage() {
  const router = useRouter();
  const [congregations, setCongregations] = useState<Congregation[]>([]);
  const [selectedCongregation, setSelectedCongregation] = useState<string>("");
  const [cultos, setCultos] = useState<Culto[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetch("/api/congregacoes")
      .then(r => r.json())
      .then((d: { congregations?: Congregation[] }) => setCongregations(d.congregations ?? []))
      .catch(() => null);
  }, []);

  const fetchCultos = useCallback(async () => {
    setLoading(true);
    const params = new URLSearchParams();
    if (selectedCongregation) {
      params.set("congregationId", selectedCongregation === "sede" ? "sede" : selectedCongregation);
    }
    params.set("limit", "20");
    try {
      const res = await fetch(`/api/cultos?${params}`);
      const data = await res.json() as { cultos?: Culto[] };
      setCultos(data.cultos ?? []);
    } catch {
      setCultos([]);
    } finally {
      setLoading(false);
    }
  }, [selectedCongregation]);

  useEffect(() => { fetchCultos(); }, [fetchCultos]);

  return (
    <div style={{ padding: "1.75rem 2rem", maxWidth: "1400px", margin: "0 auto" }}>
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "1.5rem", flexWrap: "wrap", gap: 12 }}>
        <div>
          <h1 style={{ fontSize: "1.5rem", fontWeight: 700, color: "#0D2545", margin: 0 }}>Últimos Cultos</h1>
          <p style={{ color: "#6B7280", fontSize: "0.875rem", margin: "2px 0 0" }}>Cultos realizados por congregação</p>
        </div>
        <select
          value={selectedCongregation}
          onChange={(e) => setSelectedCongregation(e.target.value)}
          style={{ padding: "8px 12px", borderRadius: 8, border: "1.5px solid #E5E7EB", fontSize: 14, minWidth: 180 }}
        >
          <option value="">Todas</option>
          <option value="sede">Sede</option>
          {congregations.map(c => (
            <option key={c.id} value={c.id}>{c.name}</option>
          ))}
        </select>
      </div>

      <div style={{ background: "white", borderRadius: 12, boxShadow: "0 1px 4px rgba(0,0,0,0.06)", overflow: "hidden" }}>
        {loading ? (
          <div style={{ padding: "3rem", textAlign: "center", color: "#9CA3AF" }}>Carregando...</div>
        ) : cultos.length === 0 ? (
          <div style={{ padding: "3rem", textAlign: "center", color: "#9CA3AF" }}>Nenhum culto encontrado</div>
        ) : (
          <div style={{ display: "flex", flexDirection: "column", gap: 0 }}>
            {cultos.map(c => (
              <div key={c.id} onClick={() => router.push(`/cultos/${c.id}`)} style={{ display: "flex", justifyContent: "space-between", alignItems: "center", padding: "1rem 1.5rem", borderBottom: "1px solid #F3F4F6", cursor: "pointer" }}>
                <div style={{ display: "flex", alignItems: "center", gap: 12 }}>
                  <div style={{ width: 40, height: 40, borderRadius: 10, background: "#EFF6FF", display: "flex", alignItems: "center", justifyContent: "center", color: "#1A3C6E" }}><Calendar size={18} /></div>
                  <div>
                    <div style={{ fontWeight: 600, color: "#374151", fontSize: 14 }}>{c.titulo}</div>
                    <div style={{ fontSize: 12, color: "#9CA3AF" }}>{c.tipo} · {c._count?.checkins ?? 0} presenças</div>
                  </div>
                </div>
                <div style={{ fontSize: 13, color: "#6B7280" }}>{new Date(c.data).toLocaleDateString("pt-BR", { day: "2-digit", month: "short", year: "numeric" })}</div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
