"use client";

import { useState, useEffect } from "react";
import { motion } from "framer-motion";
import { ArrowLeft, Trophy, Users, User, TrendingUp, TrendingDown } from "lucide-react";
import Link from "next/link";

interface Grupo {
  id: string;
  name: string;
  description: string | null;
  leader: { name: string } | null;
  frequencias: { presentes: number; ausentes: number }[];
  _count: { members: number };
}

function getPresencaMedia(g: Grupo): number {
  const freqs = g.frequencias ?? [];
  if (freqs.length === 0) return 0;
  const totalPres = freqs.reduce((s, f) => s + f.presentes, 0);
  const totalTot = freqs.reduce((s, f) => s + f.presentes + f.ausentes, 0);
  return totalTot > 0 ? Math.round((totalPres / totalTot) * 100) : 0;
}

const MEDALS = ["🥇", "🥈", "🥉"];

export default function RankingGruposPage() {
  const [grupos, setGrupos] = useState<Grupo[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetch("/api/grupos?includeFrequencia=true")
      .then((r) => r.json())
      .then((d) => {
        const sorted = [...(d.grupos || [])].sort((a: Grupo, b: Grupo) => getPresencaMedia(b) - getPresencaMedia(a));
        setGrupos(sorted);
      })
      .finally(() => setLoading(false));
  }, []);

  const comFreq = grupos.filter((g) => (g.frequencias ?? []).length > 0);
  const semFreq = grupos.filter((g) => (g.frequencias ?? []).length === 0);
  const mediaGeral = comFreq.length > 0
    ? Math.round(comFreq.reduce((s, g) => s + getPresencaMedia(g), 0) / comFreq.length)
    : 0;

  return (
    <div style={{ padding: "1.5rem", maxWidth: "900px", margin: "0 auto" }}>
      <div style={{ display: "flex", alignItems: "center", gap: "0.75rem", marginBottom: "1.5rem" }}>
        <Link href="/grupos" style={{ color: "#6B7280", display: "flex" }}>
          <ArrowLeft size={20} strokeWidth={1.5} />
        </Link>
        <div>
          <h1 style={{ fontSize: "1.5rem", fontWeight: 700, color: "#0D2545", margin: 0 }}>Ranking de Células</h1>
          <p style={{ color: "#6B7280", fontSize: "0.875rem", margin: "0.2rem 0 0" }}>Comparativo de presença entre grupos</p>
        </div>
      </div>

      {loading ? (
        <div style={{ textAlign: "center", padding: "3rem", color: "#6B7280" }}>Carregando...</div>
      ) : (
        <>
          {/* Stat geral */}
          <div style={{ display: "grid", gridTemplateColumns: "repeat(3, 1fr)", gap: "1rem", marginBottom: "1.5rem" }}>
            {[
              { label: "Total de Grupos", value: grupos.length, color: "#1A3C6E" },
              { label: "Média Geral de Presença", value: `${mediaGeral}%`, color: mediaGeral >= 70 ? "#16A34A" : mediaGeral >= 50 ? "#C8922A" : "#DC2626" },
              { label: "Grupos com Reuniões", value: comFreq.length, color: "#7C3AED" },
            ].map((s) => (
              <div key={s.label} style={{ background: "white", borderRadius: "10px", padding: "1rem", border: "1px solid #E5E7EB", textAlign: "center" }}>
                <div style={{ fontSize: "1.75rem", fontWeight: 700, color: s.color }}>{s.value}</div>
                <div style={{ fontSize: "0.75rem", color: "#6B7280", marginTop: "0.2rem" }}>{s.label}</div>
              </div>
            ))}
          </div>

          {/* Ranking principal */}
          {comFreq.length === 0 ? (
            <div style={{ textAlign: "center", padding: "3rem", background: "white", borderRadius: "12px", border: "1px dashed #E5E7EB" }}>
              <Trophy size={48} strokeWidth={1.5} color="#D1D5DB" />
              <p style={{ color: "#9CA3AF", margin: "0.75rem 0 0" }}>Nenhum grupo possui frequências registradas ainda</p>
            </div>
          ) : (
            <div style={{ background: "white", borderRadius: "12px", border: "1px solid #E5E7EB", overflow: "hidden", marginBottom: "1.5rem" }}>
              <div style={{ padding: "1rem 1.25rem", borderBottom: "1px solid #E5E7EB", display: "flex", alignItems: "center", gap: "0.5rem" }}>
                <Trophy size={18} strokeWidth={1.5} color="#C8922A" />
                <h3 style={{ fontSize: "1rem", fontWeight: 600, color: "#0D2545", margin: 0 }}>Grupos com Frequência Registrada</h3>
              </div>
              <div style={{ display: "flex", flexDirection: "column" }}>
                {comFreq.map((grupo, idx) => {
                  const pct = getPresencaMedia(grupo);
                  const acimaDaMedia = pct >= mediaGeral;
                  return (
                    <motion.div
                      key={grupo.id}
                      initial={{ opacity: 0, x: -10 }}
                      animate={{ opacity: 1, x: 0 }}
                      transition={{ delay: idx * 0.05 }}
                      style={{
                        display: "flex", alignItems: "center", gap: "1rem",
                        padding: "1rem 1.25rem",
                        background: idx === 0 ? "#FFFBEB" : "white",
                        borderBottom: "1px solid #F3F4F6",
                      }}
                    >
                      <div style={{ fontSize: "1.4rem", minWidth: "32px", textAlign: "center" }}>
                        {idx < 3 ? MEDALS[idx] : <span style={{ fontSize: "0.9rem", color: "#9CA3AF", fontWeight: 700 }}>{idx + 1}.</span>}
                      </div>

                      <div style={{ flex: 1 }}>
                        <div style={{ display: "flex", alignItems: "center", gap: "0.5rem", marginBottom: "0.25rem" }}>
                          <span style={{ fontSize: "0.9rem", fontWeight: 600, color: "#0D2545" }}>{grupo.name}</span>
                          {idx === 0 && (
                            <span style={{ fontSize: "0.65rem", background: "#C8922A", color: "white", padding: "0.1rem 0.5rem", borderRadius: "10px", fontWeight: 700 }}>
                              MELHOR PRESENÇA
                            </span>
                          )}
                          <span style={{ fontSize: "0.7rem", color: acimaDaMedia ? "#16A34A" : "#DC2626", display: "flex", alignItems: "center", gap: "0.2rem" }}>
                            {acimaDaMedia ? <TrendingUp size={12} strokeWidth={2} /> : <TrendingDown size={12} strokeWidth={2} />}
                            {acimaDaMedia ? "Acima" : "Abaixo"} da média
                          </span>
                        </div>
                        <div style={{ display: "flex", alignItems: "center", gap: "0.5rem" }}>
                          <div style={{ flex: 1, height: "8px", background: "#E5E7EB", borderRadius: "4px", overflow: "hidden" }}>
                            <motion.div
                              initial={{ width: 0 }}
                              animate={{ width: `${pct}%` }}
                              transition={{ duration: 0.7, delay: idx * 0.05 }}
                              style={{
                                height: "100%",
                                background: pct >= 70 ? "#16A34A" : pct >= 50 ? "#C8922A" : "#DC2626",
                                borderRadius: "4px",
                              }}
                            />
                          </div>
                          <span style={{ fontSize: "0.875rem", fontWeight: 700, color: "#374151", minWidth: "40px" }}>{pct}%</span>
                        </div>
                        <div style={{ fontSize: "0.75rem", color: "#6B7280", marginTop: "0.25rem" }}>
                          {grupo.leader ? (
                            <span><User size={11} strokeWidth={1.5} style={{ display: "inline", verticalAlign: "middle", marginRight: "0.25rem" }} />{grupo.leader.name}</span>
                          ) : (
                            <span style={{ color: "#DC2626" }}>Sem líder</span>
                          )}
                          <span style={{ margin: "0 0.5rem" }}>·</span>
                          <span><Users size={11} strokeWidth={1.5} style={{ display: "inline", verticalAlign: "middle", marginRight: "0.25rem" }} />{grupo._count.members} membros</span>
                          <span style={{ margin: "0 0.5rem" }}>·</span>
                          <span>{(grupo.frequencias ?? []).length} reuniões</span>
                        </div>
                      </div>

                      <Link href={`/grupos/${grupo.id}`}>
                        <button style={{ padding: "0.4rem 0.75rem", background: "white", border: "1px solid #E5E7EB", borderRadius: "6px", cursor: "pointer", fontSize: "0.75rem", color: "#374151" }}>
                          Ver
                        </button>
                      </Link>
                    </motion.div>
                  );
                })}
              </div>
            </div>
          )}

          {/* Grupos sem frequência */}
          {semFreq.length > 0 && (
            <div style={{ background: "white", borderRadius: "12px", border: "1px solid #E5E7EB", overflow: "hidden" }}>
              <div style={{ padding: "1rem 1.25rem", borderBottom: "1px solid #E5E7EB" }}>
                <h3 style={{ fontSize: "0.9rem", fontWeight: 600, color: "#6B7280", margin: 0 }}>Grupos sem reuniões registradas ({semFreq.length})</h3>
              </div>
              {semFreq.map((g) => (
                <div key={g.id} style={{ display: "flex", alignItems: "center", justifyContent: "space-between", padding: "0.75rem 1.25rem", borderBottom: "1px solid #F3F4F6" }}>
                  <div>
                    <span style={{ fontSize: "0.875rem", color: "#374151" }}>{g.name}</span>
                    <span style={{ fontSize: "0.75rem", color: "#9CA3AF", marginLeft: "0.5rem" }}>· {g._count.members} membros</span>
                  </div>
                  <Link href={`/grupos/${g.id}`}>
                    <button style={{ padding: "0.3rem 0.625rem", background: "white", border: "1px solid #E5E7EB", borderRadius: "6px", cursor: "pointer", fontSize: "0.75rem", color: "#374151" }}>
                      Ver
                    </button>
                  </Link>
                </div>
              ))}
            </div>
          )}
        </>
      )}
    </div>
  );
}
