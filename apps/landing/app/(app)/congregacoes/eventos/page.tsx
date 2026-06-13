"use client";

import { useState, useEffect, useCallback } from "react";
import { useRouter } from "next/navigation";
import { Calendar } from "lucide-react";

interface Congregation {
  id: string;
  name: string;
}

interface Evento {
  id: string;
  title: string;
  date: string;
  location: string | null;
  status: string;
}

export default function CongregacaoEventosPage() {
  const router = useRouter();
  const [congregations, setCongregations] = useState<Congregation[]>([]);
  const [selectedCongregation, setSelectedCongregation] = useState<string>("");
  const [eventos, setEventos] = useState<Evento[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetch("/api/congregacoes")
      .then(r => r.json())
      .then((d: { congregations?: Congregation[] }) => setCongregations(d.congregations ?? []))
      .catch(() => null);
  }, []);

  const fetchEventos = useCallback(async () => {
    setLoading(true);
    const params = new URLSearchParams();
    if (selectedCongregation) {
      params.set("congregationId", selectedCongregation === "sede" ? "sede" : selectedCongregation);
    }
    try {
      const res = await fetch(`/api/eventos?${params}`);
      const data = await res.json() as { eventos?: Evento[] };
      const list = data.eventos ?? [];
      // Filtrar apenas futuros
      const now = new Date();
      const futuros = list.filter(e => new Date(e.date) >= now).sort((a, b) => new Date(a.date).getTime() - new Date(b.date).getTime());
      setEventos(futuros);
    } catch {
      setEventos([]);
    } finally {
      setLoading(false);
    }
  }, [selectedCongregation]);

  useEffect(() => { fetchEventos(); }, [fetchEventos]);

  return (
    <div style={{ padding: "1.75rem 2rem", maxWidth: "1400px", margin: "0 auto" }}>
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "1.5rem", flexWrap: "wrap", gap: 12 }}>
        <div>
          <h1 style={{ fontSize: "1.5rem", fontWeight: 700, color: "#0D2545", margin: 0 }}>Próximos Eventos</h1>
          <p style={{ color: "#6B7280", fontSize: "0.875rem", margin: "2px 0 0" }}>Eventos agendados por congregação</p>
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
        ) : eventos.length === 0 ? (
          <div style={{ padding: "3rem", textAlign: "center", color: "#9CA3AF" }}>Nenhum evento agendado</div>
        ) : (
          <div style={{ display: "flex", flexDirection: "column", gap: 0 }}>
            {eventos.map(ev => (
              <div key={ev.id} onClick={() => router.push(`/eventos/${ev.id}`)} style={{ display: "flex", justifyContent: "space-between", alignItems: "center", padding: "1rem 1.5rem", borderBottom: "1px solid #F3F4F6", cursor: "pointer" }}>
                <div style={{ display: "flex", alignItems: "center", gap: 12 }}>
                  <div style={{ width: 40, height: 40, borderRadius: 10, background: "#EFF6FF", display: "flex", alignItems: "center", justifyContent: "center", color: "#1A3C6E" }}><Calendar size={18} /></div>
                  <div>
                    <div style={{ fontWeight: 600, color: "#374151", fontSize: 14 }}>{ev.title}</div>
                    <div style={{ fontSize: 12, color: "#9CA3AF" }}>{ev.location ?? "Local não definido"} · {ev.status}</div>
                  </div>
                </div>
                <div style={{ fontSize: 13, color: "#6B7280" }}>{new Date(ev.date).toLocaleDateString("pt-BR", { day: "2-digit", month: "short", year: "numeric", hour: "2-digit", minute: "2-digit" })}</div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
