"use client";

import { useState } from "react";
import { motion } from "framer-motion";
import { ArrowLeft, Database, Download, Cloud, Clock, CheckCircle, AlertTriangle } from "lucide-react";
import Link from "next/link";

interface Backup {
  id: string;
  data: string;
  tamanho: string;
  tipo: string;
  status: string;
}

export default function BackupPage() {
  const [backups] = useState<Backup[]>([]);
  const [loading, setLoading] = useState(false);

  async function fazerBackup() {
    setLoading(true);
    try {
      const res = await fetch("/api/backup", { method: "POST" });
      if (res.ok) {
        alert("Backup iniciado! Você receberá um e-mail quando estiver pronto.");
      } else {
        alert("Erro ao iniciar backup");
      }
    } catch {
      alert("Erro de conexão");
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="page-pad" style={{ maxWidth: 800, margin: "0 auto" }}>
      <div style={{ display: "flex", alignItems: "center", gap: 12, marginBottom: 24 }}>
        <Link href="/configuracoes" style={{ color: "#6B7280" }}>
          <ArrowLeft size={20} />
        </Link>
        <div>
          <h1 style={{ fontSize: 24, fontWeight: 800, color: "#0D2545", margin: 0 }}>Backup</h1>
          <p style={{ color: "#6B7280", margin: "4px 0 0" }}>Exporte e proteja seus dados</p>
        </div>
      </div>

      <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 16, marginBottom: 24 }}>
        <motion.div
          whileHover={{ scale: 1.01 }}
          style={{ background: "white", borderRadius: 12, padding: 24, boxShadow: "0 1px 3px rgba(0,0,0,0.06)", cursor: "pointer" }}
          onClick={fazerBackup}
        >
          <div style={{ width: 48, height: 48, borderRadius: 12, background: "#EFF6FF", display: "flex", alignItems: "center", justifyContent: "center", marginBottom: 12 }}>
            <Database size={24} style={{ color: "#1A3C6E" }} />
          </div>
          <h3 style={{ margin: "0 0 4px", fontSize: 15, fontWeight: 700, color: "#111827" }}>Backup Completo</h3>
          <p style={{ margin: 0, fontSize: 13, color: "#6B7280" }}>Exportar todos os dados do tenant</p>
        </motion.div>

        <motion.div
          whileHover={{ scale: 1.01 }}
          style={{ background: "white", borderRadius: 12, padding: 24, boxShadow: "0 1px 3px rgba(0,0,0,0.06)", cursor: "pointer" }}
          onClick={() => alert("Funcionalidade em desenvolvimento")}
        >
          <div style={{ width: 48, height: 48, borderRadius: 12, background: "#F0FDF4", display: "flex", alignItems: "center", justifyContent: "center", marginBottom: 12 }}>
            <Download size={24} style={{ color: "#16A34A" }} />
          </div>
          <h3 style={{ margin: "0 0 4px", fontSize: 15, fontWeight: 700, color: "#111827" }}>Exportar CSV</h3>
          <p style={{ margin: 0, fontSize: 13, color: "#6B7280" }}>Membros, finanças e eventos</p>
        </motion.div>
      </div>

      <div style={{ background: "white", borderRadius: 12, padding: 24, boxShadow: "0 1px 3px rgba(0,0,0,0.06)" }}>
        <h3 style={{ margin: "0 0 16px", fontSize: 16, fontWeight: 700, color: "#0D2545" }}>Histórico de Backups</h3>

        {backups.length === 0 ? (
          <div style={{ textAlign: "center", padding: "40px 20px" }}>
            <Cloud size={32} style={{ color: "#E5E7EB", marginBottom: 12 }} />
            <p style={{ color: "#6B7280", margin: 0 }}>Nenhum backup realizado ainda.</p>
          </div>
        ) : (
          <div style={{ display: "flex", flexDirection: "column", gap: 12 }}>
            {backups.map((b) => (
              <div key={b.id} style={{ display: "flex", alignItems: "center", gap: 12, padding: 12, background: "#F9FAFB", borderRadius: 8 }}>
                <CheckCircle size={16} style={{ color: "#16A34A" }} />
                <div style={{ flex: 1 }}>
                  <p style={{ margin: 0, fontSize: 13, fontWeight: 600, color: "#374151" }}>{b.tipo}</p>
                  <p style={{ margin: "2px 0 0", fontSize: 11, color: "#9CA3AF" }}>{b.data} · {b.tamanho}</p>
                </div>
                <button style={{ padding: "6px 12px", background: "white", border: "1.5px solid #E5E7EB", borderRadius: 6, fontSize: 12, cursor: "pointer" }}>
                  <Download size={12} style={{ display: "inline" }} />
                </button>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
