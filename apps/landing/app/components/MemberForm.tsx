"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { motion } from "framer-motion";
import { Save, ArrowLeft, Upload, MapPin } from "lucide-react";

const memberSchema = z.object({
  name: z.string().min(2, "Nome deve ter pelo menos 2 caracteres"),
  email: z.string().email("E-mail inválido").or(z.literal("")),
  phone: z.string().optional(),
  birthDate: z.string().optional(),
  baptismDate: z.string().optional(),
  cep: z.string().optional(),
  address: z.string().optional(),
  neighborhood: z.string().optional(),
  city: z.string().optional(),
  state: z.string().optional(),
  number: z.string().optional(),
  complement: z.string().optional(),
  role: z.string().optional(),
  groupId: z.string().optional(),
  status: z.string().optional(),
  notes: z.string().optional(),
});

type MemberFormData = z.infer<typeof memberSchema>;

interface MemberFormProps {
  initialData?: MemberFormData & { id?: string; photo?: string };
  mode: "create" | "edit";
}

export function MemberForm({ initialData, mode }: MemberFormProps) {
  const router = useRouter();
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState("");
  const [photoPreview, setPhotoPreview] = useState<string | null>(initialData?.photo ?? null);
  const [cepLoading, setCepLoading] = useState(false);

  const { register, handleSubmit, setValue, watch, formState: { errors } } = useForm<MemberFormData>({
    resolver: zodResolver(memberSchema),
    defaultValues: {
      name: initialData?.name ?? "",
      email: initialData?.email ?? "",
      phone: initialData?.phone ?? "",
      birthDate: initialData?.birthDate ?? "",
      baptismDate: initialData?.baptismDate ?? "",
      cep: initialData?.cep ?? "",
      address: initialData?.address ?? "",
      neighborhood: initialData?.neighborhood ?? "",
      city: initialData?.city ?? "",
      state: initialData?.state ?? "",
      number: initialData?.number ?? "",
      complement: initialData?.complement ?? "",
      role: initialData?.role ?? "",
      groupId: initialData?.groupId ?? "",
      status: initialData?.status ?? "ACTIVE",
      notes: initialData?.notes ?? "",
    },
  });

  const cepValue = watch("cep");

  async function lookupCep(cep: string) {
    const cleaned = cep.replace(/\D/g, "");
    if (cleaned.length !== 8) return;
    setCepLoading(true);
    try {
      const res = await fetch(`https://viacep.com.br/ws/${cleaned}/json/`);
      const data = await res.json() as { logradouro?: string; bairro?: string; localidade?: string; uf?: string; erro?: boolean };
      if (!data.erro) {
        if (data.logradouro) setValue("address", data.logradouro);
        if (data.bairro) setValue("neighborhood", data.bairro);
        if (data.localidade) setValue("city", data.localidade);
        if (data.uf) setValue("state", data.uf);
      }
    } catch { /* ignore */ } finally {
      setCepLoading(false);
    }
  }

  async function onSubmit(data: MemberFormData) {
    setSaving(true);
    setError("");
    try {
      const url = mode === "edit" ? `/api/members/${initialData?.id}` : "/api/members";
      const method = mode === "edit" ? "PUT" : "POST";
      const res = await fetch(url, {
        method,
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ ...data, photo: photoPreview }),
      });
      if (!res.ok) {
        const err = await res.json() as { error?: string };
        setError(err.error ?? "Erro ao salvar");
        return;
      }
      const result = await res.json() as { member: { id: string } };
      router.push(`/pessoas/${result.member.id}`);
    } catch {
      setError("Erro de conexão");
    } finally {
      setSaving(false);
    }
  }

  function handlePhotoChange(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0];
    if (!file) return;
    const reader = new FileReader();
    reader.onload = () => setPhotoPreview(reader.result as string);
    reader.readAsDataURL(file);
  }

  const inputStyle: React.CSSProperties = {
    width: "100%", padding: "0.625rem 0.75rem", border: "1.5px solid #E5E7EB",
    borderRadius: "8px", fontSize: "0.875rem", outline: "none", background: "white",
    boxSizing: "border-box", transition: "border-color 0.2s", color: "#111827",
  };

  const labelStyle: React.CSSProperties = {
    display: "block", marginBottom: "0.35rem", fontSize: "0.8rem", fontWeight: 500, color: "#374151",
  };

  return (
    <div style={{ padding: "1.75rem 2rem", maxWidth: "900px", margin: "0 auto" }}>
      <button onClick={() => router.back()} style={{ display: "flex", alignItems: "center", gap: "0.3rem", background: "none", border: "none", cursor: "pointer", color: "#6B7280", fontSize: "0.8375rem", marginBottom: "1rem", padding: 0 }}>
        <ArrowLeft size={16} strokeWidth={1.5} /> Voltar
      </button>

      <h1 style={{ fontSize: "1.4rem", fontWeight: 700, color: "#0D2545", margin: "0 0 1.5rem" }}>
        {mode === "create" ? "Novo Membro" : "Editar Membro"}
      </h1>

      {error && (
        <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }}
          style={{ background: "#FEF2F2", border: "1px solid #FECACA", borderRadius: "8px", padding: "0.75rem 1rem", color: "#DC2626", fontSize: "0.875rem", marginBottom: "1.25rem" }}>
          {error}
        </motion.div>
      )}

      <form onSubmit={handleSubmit(onSubmit)}>
        <div style={{ background: "white", borderRadius: "12px", padding: "1.5rem", boxShadow: "0 1px 4px rgba(0,0,0,0.06)", marginBottom: "1rem" }}>
          <h3 style={{ fontSize: "0.875rem", fontWeight: 600, color: "#1A3C6E", margin: "0 0 1rem", textTransform: "uppercase", letterSpacing: "0.05em" }}>Foto</h3>
          <div style={{ display: "flex", alignItems: "center", gap: "1.25rem" }}>
            <div style={{
              width: "80px", height: "80px", borderRadius: "50%",
              background: photoPreview ? `url(${photoPreview}) center/cover` : "#F3F4F6",
              display: "flex", alignItems: "center", justifyContent: "center",
              border: "2px dashed #D1D5DB", flexShrink: 0,
            }}>
              {!photoPreview && <Upload size={20} strokeWidth={1.5} color="#9CA3AF" />}
            </div>
            <div>
              <label style={{ display: "inline-flex", alignItems: "center", gap: "0.4rem", padding: "0.5rem 1rem", background: "#F3F4F6", borderRadius: "6px", cursor: "pointer", fontSize: "0.8375rem", fontWeight: 500 }}>
                <Upload size={14} strokeWidth={1.5} /> Escolher foto
                <input type="file" accept="image/*" onChange={handlePhotoChange} style={{ display: "none" }} />
              </label>
              <p style={{ fontSize: "0.75rem", color: "#9CA3AF", margin: "0.35rem 0 0" }}>JPG, PNG. Máx 2MB.</p>
            </div>
          </div>
        </div>

        <div style={{ background: "white", borderRadius: "12px", padding: "1.5rem", boxShadow: "0 1px 4px rgba(0,0,0,0.06)", marginBottom: "1rem" }}>
          <h3 style={{ fontSize: "0.875rem", fontWeight: 600, color: "#1A3C6E", margin: "0 0 1rem", textTransform: "uppercase", letterSpacing: "0.05em" }}>Dados Pessoais</h3>
          <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "1rem" }}>
            <div style={{ gridColumn: "1 / -1" }}>
              <label style={labelStyle}>Nome completo *</label>
              <input {...register("name")} style={{ ...inputStyle, borderColor: errors.name ? "#DC2626" : "#E5E7EB" }} placeholder="Nome do membro" />
              {errors.name && <span style={{ color: "#DC2626", fontSize: "0.75rem" }}>{errors.name.message}</span>}
            </div>
            <div>
              <label style={labelStyle}>E-mail</label>
              <input {...register("email")} type="email" style={{ ...inputStyle, borderColor: errors.email ? "#DC2626" : "#E5E7EB" }} placeholder="email@exemplo.com" />
              {errors.email && <span style={{ color: "#DC2626", fontSize: "0.75rem" }}>{errors.email.message}</span>}
            </div>
            <div>
              <label style={labelStyle}>Telefone</label>
              <input {...register("phone")} style={inputStyle} placeholder="(00) 00000-0000" />
            </div>
            <div>
              <label style={labelStyle}>Data de nascimento</label>
              <input {...register("birthDate")} type="date" style={inputStyle} />
            </div>
            <div>
              <label style={labelStyle}>Data de batismo</label>
              <input {...register("baptismDate")} type="date" style={inputStyle} />
            </div>
          </div>
        </div>

        <div style={{ background: "white", borderRadius: "12px", padding: "1.5rem", boxShadow: "0 1px 4px rgba(0,0,0,0.06)", marginBottom: "1rem" }}>
          <h3 style={{ fontSize: "0.875rem", fontWeight: 600, color: "#1A3C6E", margin: "0 0 1rem", textTransform: "uppercase", letterSpacing: "0.05em" }}>Endereço</h3>
          <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr 1fr", gap: "1rem" }}>
            <div>
              <label style={labelStyle}>CEP</label>
              <div style={{ position: "relative" }}>
                <input {...register("cep")} style={inputStyle} placeholder="00000-000"
                  onBlur={(e) => lookupCep(e.target.value)} />
                {cepLoading && <MapPin size={14} style={{ position: "absolute", right: "0.75rem", top: "50%", transform: "translateY(-50%)", color: "#C8922A", animation: "spin 1s linear infinite" }} />}
              </div>
            </div>
            <div style={{ gridColumn: "2 / -1" }}>
              <label style={labelStyle}>Rua</label>
              <input {...register("address")} style={inputStyle} placeholder="Rua, Avenida..." />
            </div>
            <div>
              <label style={labelStyle}>Número</label>
              <input {...register("number")} style={inputStyle} placeholder="123" />
            </div>
            <div>
              <label style={labelStyle}>Complemento</label>
              <input {...register("complement")} style={inputStyle} placeholder="Apto, Bloco..." />
            </div>
            <div>
              <label style={labelStyle}>Bairro</label>
              <input {...register("neighborhood")} style={inputStyle} placeholder="Bairro" />
            </div>
            <div>
              <label style={labelStyle}>Cidade</label>
              <input {...register("city")} style={inputStyle} placeholder="Cidade" />
            </div>
            <div>
              <label style={labelStyle}>Estado</label>
              <input {...register("state")} style={inputStyle} placeholder="UF" maxLength={2} />
            </div>
          </div>
        </div>

        <div style={{ background: "white", borderRadius: "12px", padding: "1.5rem", boxShadow: "0 1px 4px rgba(0,0,0,0.06)", marginBottom: "1.5rem" }}>
          <h3 style={{ fontSize: "0.875rem", fontWeight: 600, color: "#1A3C6E", margin: "0 0 1rem", textTransform: "uppercase", letterSpacing: "0.05em" }}>Igreja</h3>
          <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "1rem" }}>
            <div>
              <label style={labelStyle}>Cargo / Função</label>
              <input {...register("role")} style={inputStyle} placeholder="Membro, Líder, Diácono..." />
            </div>
            <div>
              <label style={labelStyle}>Status</label>
              <select {...register("status")} style={inputStyle}>
                <option value="ACTIVE">Ativo</option>
                <option value="VISITOR">Visitante</option>
                <option value="INACTIVE">Inativo</option>
                <option value="PENDING">Pendente</option>
              </select>
            </div>
            <div style={{ gridColumn: "1 / -1" }}>
              <label style={labelStyle}>Observações</label>
              <textarea {...register("notes")} rows={3} style={{ ...inputStyle, resize: "vertical" }} placeholder="Anotações sobre o membro..." />
            </div>
          </div>
        </div>

        <div style={{ display: "flex", gap: "0.75rem", justifyContent: "flex-end" }}>
          <button type="button" onClick={() => router.back()} style={{ padding: "0.65rem 1.5rem", background: "#F3F4F6", border: "none", borderRadius: "8px", cursor: "pointer", fontWeight: 500, fontSize: "0.875rem" }}>
            Cancelar
          </button>
          <motion.button type="submit" disabled={saving} whileTap={{ scale: 0.97 }}
            style={{ display: "flex", alignItems: "center", gap: "0.4rem", padding: "0.65rem 1.5rem", background: saving ? "#6B7280" : "linear-gradient(135deg, #1A3C6E 0%, #1E4A84 100%)", color: "white", border: "none", borderRadius: "8px", cursor: saving ? "not-allowed" : "pointer", fontWeight: 600, fontSize: "0.875rem" }}>
            <Save size={16} strokeWidth={1.5} />
            {saving ? "Salvando..." : mode === "create" ? "Cadastrar" : "Salvar"}
          </motion.button>
        </div>
      </form>
    </div>
  );
}
