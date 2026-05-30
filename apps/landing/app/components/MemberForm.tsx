"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { motion } from "framer-motion";
import {
  Save, ArrowLeft, Upload, MapPin, X, Plus, Lock, Eye, EyeOff,
  User, Phone, Mail, Calendar, Heart, Church, Users, Shield, FileText, CheckCircle,
} from "lucide-react";
import { MemberSelector } from "./MemberSelector";

const memberSchema = z.object({
  name: z.string().min(2, "Nome deve ter pelo menos 2 caracteres"),
  email: z.string().email("E-mail inválido").or(z.literal("")),
  phone: z.string().optional(),
  phone2: z.string().optional(),
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
  sexo: z.string().optional(),
  estadoCivil: z.string().optional(),
  whatsapp: z.string().optional(),
  dataBatismoEspirito: z.string().optional(),
  conjugeId: z.string().optional(),
  indicadoPorId: z.string().optional(),
  comoConheceu: z.string().optional(),
  observacoesPastorais: z.string().optional(),
  portalEmail: z.string().optional().or(z.literal("")),
  portalPassword: z.string().optional(),
  portalPasswordConfirm: z.string().optional(),
  portalStatus: z.string().optional(),
  escolaridade: z.string().optional(),
  cpf: z.string().optional(),
  rg: z.string().optional(),
  pais: z.string().optional(),
  dataConversao: z.string().optional(),
  batizado: z.string().optional(),
  lgpdAceite: z.boolean().optional(),
});

type MemberFormData = z.infer<typeof memberSchema>;

interface MemberFormProps {
  initialData?: MemberFormData & { id?: string; photo?: string; ministerios?: string[]; disponibilidadeDias?: string[]; disponibilidadeTurnos?: string[]; tags?: string[]; filhos?: any[] };
  mode: "create" | "edit";
}

const CARGOS = ["Membro", "Congregado", "Diácono", "Diáconisa", "Presbítero", "Evangelista", "Missionário", "Pastor", "Pastora", "Líder", "Cooperador", "Auxiliar", "Visitante"];
const CATEGORIAS = ["Congregado", "Visitante", "Novo Convertido", "Membro Ativo", "Membro Afastado"];
const MINISTERIOS = ["Louvor", "Jovens", "EBD", "Intercessão", "Mídia", "Infantil", "Dança", "Teatro", "Outro"];
const DIAS = ["Dom", "Seg", "Ter", "Qua", "Qui", "Sex", "Sáb"];
const TURNOS = ["Manhã", "Tarde", "Noite"];
const ESCOLARIDADE = ["Fundamental", "Médio", "Técnico", "Superior", "Pós-graduação", "Mestrado", "Doutorado"];

const inputStyle: React.CSSProperties = {
  width: "100%", padding: "0.625rem 0.75rem", border: "1.5px solid #E5E7EB",
  borderRadius: "8px", fontSize: "0.875rem", outline: "none", background: "white",
  boxSizing: "border-box", transition: "border-color 0.2s", color: "#111827",
};

const labelStyle: React.CSSProperties = {
  display: "block", marginBottom: "0.35rem", fontSize: "0.8rem", fontWeight: 500, color: "#374151",
};

const sectionTitleStyle: React.CSSProperties = {
  fontSize: "1rem", fontWeight: 700, color: "#0D2545", margin: "0 0 1.25rem",
  display: "flex", alignItems: "center", gap: "0.5rem", paddingBottom: "0.75rem", borderBottom: "2px solid #1A3C6E",
};

export function MemberForm({ initialData, mode }: MemberFormProps) {
  const router = useRouter();
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState("");
  const [photoPreview, setPhotoPreview] = useState<string | null>(initialData?.photo ?? null);
  const [cepLoading, setCepLoading] = useState(false);
  const [ministerios, setMinisterios] = useState<string[]>(initialData?.ministerios ?? []);
  const [categorias, setCategorias] = useState<string[]>([]);
  const [disponibilidadeDias, setDisponibilidadeDias] = useState<string[]>(initialData?.disponibilidadeDias ?? []);
  const [disponibilidadeTurnos, setDisponibilidadeTurnos] = useState<string[]>(initialData?.disponibilidadeTurnos ?? []);
  const [tags, setTags] = useState<string[]>(initialData?.tags ?? []);
  const [tagInput, setTagInput] = useState("");
  const [filhos, setFilhos] = useState<{ nome: string; dataNascimento: string }[]>(initialData?.filhos ?? []);
  const [showPassword, setShowPassword] = useState(false);
  const [groupsList, setGroupsList] = useState<{ id: string; name: string }[]>([]);
  const [conjuge, setConjuge] = useState<{ id: string; name: string; photo?: string | null } | null>(null);
  const [indicadoPor, setIndicadoPor] = useState<{ id: string; name: string; photo?: string | null } | null>(null);

  const { register, handleSubmit, setValue, watch, formState: { errors } } = useForm<MemberFormData>({
    resolver: zodResolver(memberSchema),
    defaultValues: {
      name: initialData?.name ?? "",
      email: initialData?.email ?? "",
      phone: initialData?.phone ?? "",
      phone2: "",
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
      sexo: initialData?.sexo ?? "",
      estadoCivil: initialData?.estadoCivil ?? "",
      whatsapp: initialData?.whatsapp ?? "",
      dataBatismoEspirito: initialData?.dataBatismoEspirito ?? "",
      conjugeId: initialData?.conjugeId ?? "",
      indicadoPorId: initialData?.indicadoPorId ?? "",
      comoConheceu: initialData?.comoConheceu ?? "",
      observacoesPastorais: initialData?.observacoesPastorais ?? "",
      portalEmail: initialData?.portalEmail ?? "",
      portalPassword: initialData?.portalPassword ?? "",
      portalStatus: initialData?.portalStatus ?? "PENDENTE",
      escolaridade: "",
      cpf: "",
      rg: "",
      pais: "Brasil",
      dataConversao: "",
      batizado: "",
      lgpdAceite: false,
    },
  });

  const phoneValue = watch("phone");

  useEffect(() => {
    fetch("/api/grupos")
      .then(r => r.json())
      .then((d: { grupos?: { id: string; name: string }[] }) => {
        if (d.grupos) setGroupsList(d.grupos);
      })
      .catch(() => null);
  }, []);

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
    if (data.portalPassword && data.portalPassword !== data.portalPasswordConfirm) {
      setError("As senhas do portal não conferem");
      return;
    }
    if (!data.lgpdAceite) {
      setError("É necessário aceitar a declaração LGPD");
      return;
    }

    setSaving(true);
    setError("");
    try {
      const url = mode === "edit" ? `/api/members/${initialData?.id}` : "/api/members";
      const method = mode === "edit" ? "PUT" : "POST";
      const res = await fetch(url, {
        method,
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          ...data,
          photo: photoPreview,
          ministerios,
          categorias,
          disponibilidadeDias,
          disponibilidadeTurnos,
          tags,
          filhos: filhos.length > 0 ? filhos : undefined,
          portalPassword: data.portalPassword || undefined,
          conjugeId: conjuge?.id || data.conjugeId,
          indicadoPorId: indicadoPor?.id || data.indicadoPorId,
        }),
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

  function toggleArrayItem(arr: string[], item: string, setter: (v: string[]) => void) {
    if (arr.includes(item)) setter(arr.filter(i => i !== item));
    else setter([...arr, item]);
  }

  function addTag() {
    if (tagInput.trim() && !tags.includes(tagInput.trim())) {
      setTags([...tags, tagInput.trim()]);
      setTagInput("");
    }
  }

  function addFilho() {
    setFilhos([...filhos, { nome: "", dataNascimento: "" }]);
  }

  function updateFilho(index: number, field: "nome" | "dataNascimento", value: string) {
    const updated = [...filhos];
    if (updated[index]) updated[index][field] = value;
    setFilhos(updated);
  }

  function removeFilho(index: number) {
    setFilhos(filhos.filter((_, i) => i !== index));
  }

  const chipStyle = (selected: boolean, color: string): React.CSSProperties => ({
    padding: "0.35rem 0.75rem", borderRadius: 20,
    border: `1.5px solid ${selected ? color : "#E5E7EB"}`,
    background: selected ? `${color}14` : "white",
    color: selected ? color : "#6B7280",
    fontSize: "0.75rem", fontWeight: 600, cursor: "pointer", transition: "all 0.15s",
  });

  return (
    <div style={{ minHeight: "100vh", background: "#F0EBE1", padding: "2rem" }}>
      <div style={{ maxWidth: 1200, margin: "0 auto" }}>
        {/* Header */}
        <div style={{ display: "flex", alignItems: "center", gap: "0.75rem", marginBottom: "2rem" }}>
          <button onClick={() => router.back()} style={{ display: "flex", alignItems: "center", gap: "0.3rem", background: "none", border: "none", cursor: "pointer", color: "#6B7280", fontSize: "0.875rem" }}>
            <ArrowLeft size={18} strokeWidth={1.5} /> Voltar
          </button>
          <h1 style={{ fontSize: "1.35rem", fontWeight: 700, color: "#0D2545", margin: 0 }}>
            {mode === "create" ? "Novo Membro" : "Editar Membro"}
          </h1>
        </div>

        {error && (
          <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }}
            style={{ background: "#FEF2F2", border: "1px solid #FECACA", borderRadius: "8px", padding: "0.75rem 1rem", color: "#DC2626", fontSize: "0.875rem", marginBottom: "1.5rem" }}>
            {error}
          </motion.div>
        )}

        <form onSubmit={handleSubmit(onSubmit)}>
          {/* SEÇÃO 1 — Dados Pessoais + Contato (2 colunas) */}
          <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "1.5rem", marginBottom: "2rem" }}>
            {/* Coluna Esquerda — Dados Pessoais */}
            <div style={{ background: "white", borderRadius: "12px", padding: "1.5rem", boxShadow: "0 1px 4px rgba(0,0,0,0.06)" }}>
              <h2 style={sectionTitleStyle}><User size={18} strokeWidth={1.5} color="#1A3C6E" /> Dados Pessoais</h2>

              {/* Foto */}
              <div style={{ display: "flex", alignItems: "center", gap: "1rem", marginBottom: "1.25rem" }}>
                <div style={{ width: 72, height: 72, borderRadius: "50%", background: photoPreview ? `url(${photoPreview}) center/cover` : "#F3F4F6", display: "flex", alignItems: "center", justifyContent: "center", border: "2px dashed #D1D5DB", flexShrink: 0 }}>
                  {!photoPreview && <Upload size={20} strokeWidth={1.5} color="#9CA3AF" />}
                </div>
                <label style={{ display: "inline-flex", alignItems: "center", gap: "0.4rem", padding: "0.5rem 1rem", background: "#F3F4F6", borderRadius: "6px", cursor: "pointer", fontSize: "0.8rem", fontWeight: 500 }}>
                  <Upload size={14} strokeWidth={1.5} /> Escolher foto
                  <input type="file" accept="image/*" onChange={handlePhotoChange} style={{ display: "none" }} />
                </label>
              </div>

              <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "0.875rem" }}>
                <div style={{ gridColumn: "1 / -1" }}>
                  <label style={labelStyle}>Nome completo *</label>
                  <input {...register("name")} style={{ ...inputStyle, borderColor: errors.name ? "#DC2626" : "#E5E7EB" }} placeholder="Nome do membro" />
                  {errors.name && <span style={{ color: "#DC2626", fontSize: "0.75rem" }}>{errors.name.message}</span>}
                </div>
                <div>
                  <label style={labelStyle}>Data de nascimento</label>
                  <input {...register("birthDate")} type="date" style={inputStyle} />
                </div>
                <div>
                  <label style={labelStyle}>Sexo</label>
                  <div style={{ display: "flex", gap: "0.5rem" }}>
                    {["MASCULINO", "FEMININO", "OUTRO"].map(s => (
                      <label key={s} style={{ display: "flex", alignItems: "center", gap: "0.3rem", fontSize: "0.8rem", cursor: "pointer", flex: 1, padding: "0.5rem", border: `1.5px solid ${watch("sexo") === s ? "#1A3C6E" : "#E5E7EB"}`, borderRadius: 8, background: watch("sexo") === s ? "#EFF6FF" : "white", color: watch("sexo") === s ? "#1A3C6E" : "#6B7280", fontWeight: 500, justifyContent: "center" }}>
                        <input type="radio" value={s} {...register("sexo")} style={{ display: "none" }} />
                        {s === "MASCULINO" ? "Masculino" : s === "FEMININO" ? "Feminino" : "Outro"}
                      </label>
                    ))}
                  </div>
                </div>
                <div>
                  <label style={labelStyle}>Estado Civil</label>
                  <select {...register("estadoCivil")} style={inputStyle}>
                    <option value="">Selecione...</option>
                    {["SOLTEIRO", "CASADO", "DIVORCIADO", "VIUVO"].map(s => <option key={s} value={s}>{s}</option>)}
                  </select>
                </div>
                <div>
                  <label style={labelStyle}>Escolaridade</label>
                  <select {...register("escolaridade")} style={inputStyle}>
                    <option value="">Selecione...</option>
                    {ESCOLARIDADE.map(s => <option key={s} value={s}>{s}</option>)}
                  </select>
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
                <div>
                  <label style={labelStyle}>CPF</label>
                  <input {...register("cpf")} style={inputStyle} placeholder="000.000.000-00" />
                </div>
                <div>
                  <label style={labelStyle}>RG</label>
                  <input {...register("rg")} style={inputStyle} placeholder="00.000.000-0" />
                </div>
              </div>
            </div>

            {/* Coluna Direita — Contato + Endereço */}
            <div style={{ background: "white", borderRadius: "12px", padding: "1.5rem", boxShadow: "0 1px 4px rgba(0,0,0,0.06)" }}>
              <h2 style={sectionTitleStyle}><Phone size={18} strokeWidth={1.5} color="#1A3C6E" /> Contato e Endereço</h2>

              <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "0.875rem" }}>
                <div>
                  <label style={labelStyle}>Telefone 1 *</label>
                  <input {...register("phone")} style={inputStyle} placeholder="(00) 00000-0000" />
                </div>
                <div>
                  <label style={labelStyle}>Telefone 2</label>
                  <input {...register("phone2")} style={inputStyle} placeholder="(00) 00000-0000" />
                </div>
                <div style={{ gridColumn: "1 / -1" }}>
                  <label style={labelStyle}>WhatsApp</label>
                  <div style={{ display: "flex", gap: "0.5rem" }}>
                    <input {...register("whatsapp")} style={inputStyle} placeholder="(00) 00000-0000" />
                    <button type="button" onClick={() => setValue("whatsapp", phoneValue || "")}
                      style={{ padding: "0 0.75rem", background: "#F3F4F6", border: "1px solid #E5E7EB", borderRadius: 8, fontSize: "0.7rem", fontWeight: 500, cursor: "pointer", whiteSpace: "nowrap" }}>
                      Mesmo número
                    </button>
                  </div>
                </div>
                <div style={{ gridColumn: "1 / -1" }}>
                  <label style={labelStyle}>E-mail</label>
                  <input {...register("email")} type="email" style={{ ...inputStyle, borderColor: errors.email ? "#DC2626" : "#E5E7EB" }} placeholder="email@exemplo.com" />
                </div>

                {/* Separador Endereço */}
                <div style={{ gridColumn: "1 / -1", marginTop: "0.5rem", paddingTop: "1rem", borderTop: "1px solid #F3F4F6" }}>
                  <label style={{ ...labelStyle, color: "#1A3C6E", fontWeight: 700, fontSize: "0.85rem" }}><MapPin size={14} strokeWidth={1.5} style={{ display: "inline", verticalAlign: "middle", marginRight: 4 }} />Endereço</label>
                </div>
                <div>
                  <label style={labelStyle}>CEP</label>
                  <div style={{ position: "relative" }}>
                    <input {...register("cep")} style={inputStyle} placeholder="00000-000" onBlur={(e) => lookupCep(e.target.value)} />
                    {cepLoading && <MapPin size={14} style={{ position: "absolute", right: "0.75rem", top: "50%", transform: "translateY(-50%)", color: "#C8922A" }} />}
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
                <div>
                  <label style={labelStyle}>País</label>
                  <input {...register("pais")} style={inputStyle} placeholder="Brasil" />
                </div>
              </div>
            </div>
          </div>

          {/* SEÇÃO 2 — Vida Eclesiástica (largura total) */}
          <div style={{ background: "white", borderRadius: "12px", padding: "1.5rem", boxShadow: "0 1px 4px rgba(0,0,0,0.06)", marginBottom: "2rem" }}>
            <h2 style={sectionTitleStyle}><Church size={18} strokeWidth={1.5} color="#1A3C6E" /> Vida Eclesiástica</h2>

            <div style={{ display: "grid", gridTemplateColumns: "repeat(3, 1fr)", gap: "1.5rem" }}>
              {/* Cargo/Função */}
              <div>
                <label style={labelStyle}>Cargo / Função</label>
                <div style={{ display: "flex", flexWrap: "wrap", gap: "0.4rem" }}>
                  {CARGOS.map(c => (
                    <button key={c} type="button" onClick={() => setValue("role", c)}
                      style={chipStyle(watch("role") === c, "#1A3C6E")}>
                      {c}
                    </button>
                  ))}
                </div>
              </div>

              {/* Categorias */}
              <div>
                <label style={labelStyle}>Categorias</label>
                <div style={{ display: "flex", flexWrap: "wrap", gap: "0.4rem" }}>
                  {CATEGORIAS.map(c => (
                    <button key={c} type="button" onClick={() => toggleArrayItem(categorias, c, setCategorias)}
                      style={chipStyle(categorias.includes(c), "#C8922A")}>
                      {c}
                    </button>
                  ))}
                </div>
              </div>

              {/* Grupo/Célula */}
              <div>
                <label style={labelStyle}>Grupo / Célula</label>
                <select {...register("groupId")} style={inputStyle}>
                  <option value="">Nenhum</option>
                  {groupsList.map(g => <option key={g.id} value={g.id}>{g.name}</option>)}
                </select>
              </div>
            </div>

            <div style={{ display: "grid", gridTemplateColumns: "repeat(4, 1fr)", gap: "0.875rem", marginTop: "1.25rem" }}>
              <div>
                <label style={labelStyle}>Data de conversão</label>
                <input {...register("dataConversao")} type="date" style={inputStyle} />
              </div>
              <div>
                <label style={labelStyle}>Batizado?</label>
                <div style={{ display: "flex", gap: "0.5rem" }}>
                  {["SIM", "NAO"].map(s => (
                    <label key={s} style={{ display: "flex", alignItems: "center", gap: "0.3rem", fontSize: "0.8rem", cursor: "pointer", flex: 1, padding: "0.5rem", border: `1.5px solid ${watch("batizado") === s ? "#1A3C6E" : "#E5E7EB"}`, borderRadius: 8, background: watch("batizado") === s ? "#EFF6FF" : "white", color: watch("batizado") === s ? "#1A3C6E" : "#6B7280", fontWeight: 500, justifyContent: "center" }}>
                      <input type="radio" value={s} {...register("batizado")} style={{ display: "none" }} />
                      {s === "SIM" ? "Sim" : "Não"}
                    </label>
                  ))}
                </div>
              </div>
              <div>
                <label style={labelStyle}>Batismo águas</label>
                <input {...register("baptismDate")} type="date" style={inputStyle} />
              </div>
              <div>
                <label style={labelStyle}>Batismo Espírito</label>
                <input {...register("dataBatismoEspirito")} type="date" style={inputStyle} />
              </div>
            </div>

            <div style={{ display: "grid", gridTemplateColumns: "repeat(3, 1fr)", gap: "1.5rem", marginTop: "1.25rem" }}>
              <div>
                <label style={labelStyle}>Ministérios</label>
                <div style={{ display: "flex", flexWrap: "wrap", gap: "0.4rem" }}>
                  {MINISTERIOS.map(m => (
                    <button key={m} type="button" onClick={() => toggleArrayItem(ministerios, m, setMinisterios)}
                      style={chipStyle(ministerios.includes(m), "#7C3AED")}>
                      {m}
                    </button>
                  ))}
                </div>
              </div>
              <div>
                <label style={labelStyle}>Disponibilidade — Dias</label>
                <div style={{ display: "flex", flexWrap: "wrap", gap: "0.4rem" }}>
                  {DIAS.map(d => (
                    <button key={d} type="button" onClick={() => toggleArrayItem(disponibilidadeDias, d, setDisponibilidadeDias)}
                      style={chipStyle(disponibilidadeDias.includes(d), "#C8922A")}>
                      {d}
                    </button>
                  ))}
                </div>
              </div>
              <div>
                <label style={labelStyle}>Disponibilidade — Turnos</label>
                <div style={{ display: "flex", flexWrap: "wrap", gap: "0.4rem" }}>
                  {TURNOS.map(t => (
                    <button key={t} type="button" onClick={() => toggleArrayItem(disponibilidadeTurnos, t, setDisponibilidadeTurnos)}
                      style={chipStyle(disponibilidadeTurnos.includes(t), "#16A34A")}>
                      {t}
                    </button>
                  ))}
                </div>
              </div>
            </div>

            {/* Tags */}
            <div style={{ marginTop: "1.25rem" }}>
              <label style={labelStyle}>Tags</label>
              <div style={{ display: "flex", flexWrap: "wrap", gap: "0.4rem", marginBottom: "0.5rem" }}>
                {tags.map((tag, i) => (
                  <span key={i} style={{ display: "inline-flex", alignItems: "center", gap: "0.25rem", padding: "0.25rem 0.6rem", background: "#EFF6FF", color: "#1A3C6E", borderRadius: 20, fontSize: "0.75rem", fontWeight: 500 }}>
                    {tag}
                    <button type="button" onClick={() => setTags(tags.filter((_, idx) => idx !== i))} style={{ background: "none", border: "none", cursor: "pointer", padding: 0, display: "flex" }}><X size={12} /></button>
                  </span>
                ))}
              </div>
              <div style={{ display: "flex", gap: "0.5rem" }}>
                <input value={tagInput} onChange={e => setTagInput(e.target.value)} onKeyDown={e => { if (e.key === "Enter") { e.preventDefault(); addTag(); } }}
                  style={{ ...inputStyle, flex: 1, maxWidth: 200 }} placeholder="Nova tag..." />
                <button type="button" onClick={addTag} style={{ padding: "0 0.75rem", background: "#1A3C6E", color: "white", border: "none", borderRadius: 8, cursor: "pointer" }}><Plus size={14} /></button>
              </div>
            </div>
          </div>

          {/* SEÇÃO 3 — Família + Portal (2 colunas) */}
          <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "1.5rem", marginBottom: "2rem" }}>
            {/* Família */}
            <div style={{ background: "white", borderRadius: "12px", padding: "1.5rem", boxShadow: "0 1px 4px rgba(0,0,0,0.06)" }}>
              <h2 style={sectionTitleStyle}><Users size={18} strokeWidth={1.5} color="#1A3C6E" /> Família</h2>

              <div style={{ display: "flex", flexDirection: "column", gap: "1rem" }}>
                <MemberSelector
                  label="Cônjuge"
                  placeholder="Buscar cônjuge..."
                  value={conjuge}
                  onSelect={(m) => { setConjuge(m as any); setValue("conjugeId", (m as any)?.id || ""); }}
                />
                <MemberSelector
                  label="Indicado por"
                  placeholder="Quem indicou..."
                  value={indicadoPor}
                  onSelect={(m) => { setIndicadoPor(m as any); setValue("indicadoPorId", (m as any)?.id || ""); }}
                />
                <div>
                  <label style={labelStyle}>Como conheceu a igreja?</label>
                  <textarea {...register("comoConheceu")} rows={3} style={{ ...inputStyle, resize: "vertical" }} placeholder="Conte como conheceu a igreja..." />
                </div>
                <div>
                  <label style={labelStyle}>Filhos</label>
                  {filhos.map((filho, i) => (
                    <div key={i} style={{ display: "flex", gap: "0.5rem", marginBottom: "0.5rem", alignItems: "center" }}>
                      <input value={filho.nome} onChange={e => updateFilho(i, "nome", e.target.value)} style={{ ...inputStyle, flex: 2 }} placeholder="Nome do filho" />
                      <input value={filho.dataNascimento} onChange={e => updateFilho(i, "dataNascimento", e.target.value)} type="date" style={{ ...inputStyle, flex: 1 }} />
                      <button type="button" onClick={() => removeFilho(i)} style={{ padding: "0.5rem", background: "#FEF2F2", border: "none", borderRadius: 6, cursor: "pointer", color: "#DC2626" }}><X size={14} /></button>
                    </div>
                  ))}
                  <button type="button" onClick={addFilho} style={{ display: "inline-flex", alignItems: "center", gap: "0.3rem", padding: "0.4rem 0.875rem", background: "#F3F4F6", border: "1px dashed #D1D5DB", borderRadius: 8, cursor: "pointer", fontSize: "0.8rem", fontWeight: 500, color: "#374151" }}>
                    <Plus size={14} /> Adicionar filho
                  </button>
                </div>
              </div>
            </div>

            {/* Portal do Membro */}
            <div style={{ background: "white", borderRadius: "12px", padding: "1.5rem", boxShadow: "0 1px 4px rgba(0,0,0,0.06)" }}>
              <h2 style={sectionTitleStyle}><Shield size={18} strokeWidth={1.5} color="#1A3C6E" /> Portal do Membro</h2>

              <div style={{ background: "#FFF8EE", border: "1px solid #FDE68A", borderRadius: "8px", padding: "1rem", marginBottom: "1rem" }}>
                <div style={{ display: "flex", alignItems: "center", gap: "0.4rem" }}>
                  <Lock size={14} color="#C8922A" />
                  <span style={{ fontSize: "0.8rem", fontWeight: 600, color: "#92400E" }}>Credenciais de Acesso</span>
                </div>
                <p style={{ fontSize: "0.75rem", color: "#92400E", margin: "0.35rem 0 0" }}>Estas credenciais são para acesso ao portal público do membro.</p>
              </div>

              <div style={{ display: "flex", flexDirection: "column", gap: "0.875rem" }}>
                <div>
                  <label style={labelStyle}>E-mail do portal</label>
                  <input {...register("portalEmail")} type="email" style={inputStyle} placeholder="membro@portal.com" />
                </div>
                <div>
                  <label style={labelStyle}>Status do portal</label>
                  <select {...register("portalStatus")} style={inputStyle}>
                    <option value="PENDENTE">Pendente</option>
                    <option value="ATIVO">Ativo</option>
                    <option value="BLOQUEADO">Bloqueado</option>
                  </select>
                </div>
                <div>
                  <label style={labelStyle}>Senha do portal</label>
                  <div style={{ position: "relative" }}>
                    <input {...register("portalPassword")} type={showPassword ? "text" : "password"} style={inputStyle} placeholder="••••••" />
                    <button type="button" onClick={() => setShowPassword(!showPassword)} style={{ position: "absolute", right: "0.75rem", top: "50%", transform: "translateY(-50%)", background: "none", border: "none", cursor: "pointer", color: "#9CA3AF" }}>
                      {showPassword ? <EyeOff size={16} /> : <Eye size={16} />}
                    </button>
                  </div>
                </div>
                <div>
                  <label style={labelStyle}>Confirmar senha</label>
                  <input {...register("portalPasswordConfirm")} type={showPassword ? "text" : "password"} style={inputStyle} placeholder="••••••" />
                </div>
              </div>
            </div>
          </div>

          {/* SEÇÃO 4 — Anotações (largura total) */}
          <div style={{ background: "white", borderRadius: "12px", padding: "1.5rem", boxShadow: "0 1px 4px rgba(0,0,0,0.06)", marginBottom: "2rem" }}>
            <h2 style={sectionTitleStyle}><FileText size={18} strokeWidth={1.5} color="#1A3C6E" /> Anotações</h2>

            <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "1.5rem" }}>
              <div>
                <div style={{ display: "flex", alignItems: "center", gap: "0.4rem", marginBottom: "0.5rem" }}>
                  <Lock size={14} color="#DC2626" />
                  <span style={{ fontSize: "0.8rem", fontWeight: 600, color: "#991B1B" }}>Observações Pastorais — Confidencial</span>
                </div>
                <textarea {...register("observacoesPastorais")} rows={5} style={{ ...inputStyle, resize: "vertical", borderColor: "#FECACA", background: "#FEF2F2" }} placeholder="Anotações confidenciais sobre o membro..." />
              </div>
              <div>
                <div style={{ display: "flex", alignItems: "center", gap: "0.4rem", marginBottom: "0.5rem" }}>
                  <FileText size={14} color="#6B7280" />
                  <span style={{ fontSize: "0.8rem", fontWeight: 600, color: "#374151" }}>Observações Gerais</span>
                </div>
                <textarea {...register("notes")} rows={5} style={{ ...inputStyle, resize: "vertical" }} placeholder="Anotações gerais..." />
                <p style={{ fontSize: "0.7rem", color: "#9CA3AF", marginTop: "0.35rem" }}>Atenção: o conteúdo deste campo pode ser visualizado pela própria pessoa.</p>
              </div>
            </div>
          </div>

          {/* LGPD + Botão Salvar */}
          <div style={{ background: "white", borderRadius: "12px", padding: "1.5rem", boxShadow: "0 1px 4px rgba(0,0,0,0.06)", textAlign: "center" }}>
            <label style={{ display: "flex", alignItems: "center", justifyContent: "center", gap: "0.5rem", marginBottom: "1.5rem", fontSize: "0.85rem", color: "#374151", cursor: "pointer" }}>
              <input type="checkbox" {...register("lgpdAceite")} style={{ width: 18, height: 18 }} />
              Sou consciente das minhas responsabilidades com os dados cadastrados, em conformidade com a LGPD e GDPR.
            </label>

            <div style={{ display: "flex", gap: "0.75rem", justifyContent: "center" }}>
              <button type="button" onClick={() => router.back()} style={{ padding: "0.65rem 2rem", background: "#F3F4F6", border: "none", borderRadius: "8px", cursor: "pointer", fontWeight: 500, fontSize: "0.875rem" }}>
                Cancelar
              </button>
              <motion.button type="submit" disabled={saving} whileTap={{ scale: 0.97 }}
                style={{ display: "flex", alignItems: "center", gap: "0.4rem", padding: "0.65rem 2.5rem", background: saving ? "#6B7280" : "linear-gradient(135deg, #1A3C6E 0%, #1E4A84 100%)", color: "white", border: "none", borderRadius: "8px", cursor: saving ? "not-allowed" : "pointer", fontWeight: 600, fontSize: "0.875rem" }}>
                <Save size={16} strokeWidth={1.5} />
                {saving ? "Salvando..." : mode === "create" ? "Cadastrar Membro" : "Salvar Alterações"}
              </motion.button>
            </div>
          </div>
        </form>
      </div>
    </div>
  );
}
