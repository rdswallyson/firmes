"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { motion } from "framer-motion";
import { Save, ArrowLeft, Upload, MapPin, X, Plus, Lock, Eye, EyeOff } from "lucide-react";

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
  // Campos expandidos
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
});

type MemberFormData = z.infer<typeof memberSchema>;

interface MemberFormProps {
  initialData?: MemberFormData & { id?: string; photo?: string; ministerios?: string[]; disponibilidadeDias?: string[]; disponibilidadeTurnos?: string[]; tags?: string[]; filhos?: any[] };
  mode: "create" | "edit";
}

const TABS = [
  { id: "identificacao", label: "Identificação" },
  { id: "contato", label: "Contato" },
  { id: "eclesiastica", label: "Vida Eclesiástica" },
  { id: "familia", label: "Família" },
  { id: "portal", label: "Portal do Membro" },
  { id: "pastoral", label: "Pastoral" },
];

const MINISTERIOS_OPTIONS = ["Louvor", "Jovens", "EBD", "Intercessão", "Mídia", "Infantil", "Dança", "Teatro", "Outro"];
const DIAS_OPTIONS = ["Dom", "Seg", "Ter", "Qua", "Qui", "Sex", "Sáb"];
const TURNOS_OPTIONS = ["Manhã", "Tarde", "Noite"];

export function MemberForm({ initialData, mode }: MemberFormProps) {
  const router = useRouter();
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState("");
  const [activeTab, setActiveTab] = useState("identificacao");
  const [photoPreview, setPhotoPreview] = useState<string | null>(initialData?.photo ?? null);
  const [cepLoading, setCepLoading] = useState(false);
  const [ministerios, setMinisterios] = useState<string[]>(initialData?.ministerios ?? []);
  const [disponibilidadeDias, setDisponibilidadeDias] = useState<string[]>(initialData?.disponibilidadeDias ?? []);
  const [disponibilidadeTurnos, setDisponibilidadeTurnos] = useState<string[]>(initialData?.disponibilidadeTurnos ?? []);
  const [tags, setTags] = useState<string[]>(initialData?.tags ?? []);
  const [tagInput, setTagInput] = useState("");
  const [filhos, setFilhos] = useState<{ nome: string; dataNascimento: string }[]>(initialData?.filhos ?? []);
  const [showPassword, setShowPassword] = useState(false);
  const [membersList, setMembersList] = useState<{ id: string; name: string }[]>([]);

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
    },
  });

  const phoneValue = watch("phone");
  const whatsappValue = watch("whatsapp");

  // Buscar membros para autocomplete de cônjuge/indicado
  useEffect(() => {
    fetch("/api/members?limit=1000")
      .then(r => r.json())
      .then((d: { members?: { id: string; name: string }[] }) => {
        if (d.members) setMembersList(d.members.filter(m => m.id !== initialData?.id));
      })
      .catch(() => null);
  }, [initialData?.id]);

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
      setActiveTab("portal");
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
          disponibilidadeDias,
          disponibilidadeTurnos,
          tags,
          filhos: filhos.length > 0 ? filhos : undefined,
          portalPassword: data.portalPassword || undefined,
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
    if (updated[index]) {
      updated[index][field] = value;
    }
    setFilhos(updated);
  }

  function removeFilho(index: number) {
    setFilhos(filhos.filter((_, i) => i !== index));
  }

  const inputStyle: React.CSSProperties = {
    width: "100%", padding: "0.625rem 0.75rem", border: "1.5px solid #E5E7EB",
    borderRadius: "8px", fontSize: "0.875rem", outline: "none", background: "white",
    boxSizing: "border-box", transition: "border-color 0.2s", color: "#111827",
  };

  const labelStyle: React.CSSProperties = {
    display: "block", marginBottom: "0.35rem", fontSize: "0.8rem", fontWeight: 500, color: "#374151",
  };

  const tabBtnStyle = (active: boolean): React.CSSProperties => ({
    padding: "0.6rem 1rem",
    border: "none",
    background: active ? "#1A3C6E" : "transparent",
    color: active ? "white" : "#6B7280",
    borderRadius: 8,
    fontSize: "0.8rem",
    fontWeight: 600,
    cursor: "pointer",
    transition: "all 0.2s",
    whiteSpace: "nowrap",
  });

  const chipStyle = (selected: boolean, color: string): React.CSSProperties => ({
    padding: "0.35rem 0.75rem",
    borderRadius: 20,
    border: `1.5px solid ${selected ? color : "#E5E7EB"}`,
    background: selected ? `${color}14` : "white",
    color: selected ? color : "#6B7280",
    fontSize: "0.75rem",
    fontWeight: 600,
    cursor: "pointer",
    transition: "all 0.15s",
  });

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
        {/* Tabs */}
        <div style={{ display: "flex", gap: "0.5rem", marginBottom: "1.5rem", overflowX: "auto", paddingBottom: "0.5rem" }}>
          {TABS.map(tab => (
            <button key={tab.id} type="button" onClick={() => setActiveTab(tab.id)} style={tabBtnStyle(activeTab === tab.id)}>
              {tab.label}
            </button>
          ))}
        </div>

        {/* ABA 1 — Identificação */}
        {activeTab === "identificacao" && (
          <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.25 }}>
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
                  <label style={labelStyle}>Sexo</label>
                  <select {...register("sexo")} style={inputStyle}>
                    <option value="">Selecione...</option>
                    <option value="MASCULINO">Masculino</option>
                    <option value="FEMININO">Feminino</option>
                    <option value="OUTRO">Outro</option>
                  </select>
                </div>
                <div>
                  <label style={labelStyle}>Estado Civil</label>
                  <select {...register("estadoCivil")} style={inputStyle}>
                    <option value="">Selecione...</option>
                    <option value="SOLTEIRO">Solteiro(a)</option>
                    <option value="CASADO">Casado(a)</option>
                    <option value="DIVORCIADO">Divorciado(a)</option>
                    <option value="VIUVO">Viúvo(a)</option>
                  </select>
                </div>
                <div>
                  <label style={labelStyle}>Data de nascimento</label>
                  <input {...register("birthDate")} type="date" style={inputStyle} />
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
              </div>
            </div>
          </motion.div>
        )}

        {/* ABA 2 — Contato */}
        {activeTab === "contato" && (
          <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.25 }}>
            <div style={{ background: "white", borderRadius: "12px", padding: "1.5rem", boxShadow: "0 1px 4px rgba(0,0,0,0.06)", marginBottom: "1rem" }}>
              <h3 style={{ fontSize: "0.875rem", fontWeight: 600, color: "#1A3C6E", margin: "0 0 1rem", textTransform: "uppercase", letterSpacing: "0.05em" }}>Contato</h3>
              <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "1rem" }}>
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
                  <label style={labelStyle}>WhatsApp</label>
                  <div style={{ display: "flex", gap: "0.5rem" }}>
                    <input {...register("whatsapp")} style={inputStyle} placeholder="(00) 00000-0000" />
                    <button type="button" onClick={() => setValue("whatsapp", phoneValue || "")}
                      style={{ padding: "0 0.75rem", background: "#F3F4F6", border: "1px solid #E5E7EB", borderRadius: 8, fontSize: "0.7rem", fontWeight: 500, cursor: "pointer", whiteSpace: "nowrap" }}>
                      Mesmo número
                    </button>
                  </div>
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
          </motion.div>
        )}

        {/* ABA 3 — Vida Eclesiástica */}
        {activeTab === "eclesiastica" && (
          <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.25 }}>
            <div style={{ background: "white", borderRadius: "12px", padding: "1.5rem", boxShadow: "0 1px 4px rgba(0,0,0,0.06)", marginBottom: "1rem" }}>
              <h3 style={{ fontSize: "0.875rem", fontWeight: 600, color: "#1A3C6E", margin: "0 0 1rem", textTransform: "uppercase", letterSpacing: "0.05em" }}>Vida Eclesiástica</h3>
              <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "1rem" }}>
                <div>
                  <label style={labelStyle}>Cargo / Função</label>
                  <input {...register("role")} style={inputStyle} placeholder="Membro, Líder, Diácono..." />
                </div>
                <div>
                  <label style={labelStyle}>Data de batismo (águas)</label>
                  <input {...register("baptismDate")} type="date" style={inputStyle} />
                </div>
                <div>
                  <label style={labelStyle}>Data de batismo (Espírito)</label>
                  <input {...register("dataBatismoEspirito")} type="date" style={inputStyle} />
                </div>
                <div>
                  <label style={labelStyle}>Célula / Grupo</label>
                  <input {...register("groupId")} style={inputStyle} placeholder="ID do grupo" />
                </div>
              </div>

              <div style={{ marginTop: "1rem" }}>
                <label style={labelStyle}>Ministérios</label>
                <div style={{ display: "flex", flexWrap: "wrap", gap: "0.5rem" }}>
                  {MINISTERIOS_OPTIONS.map(m => (
                    <button key={m} type="button" onClick={() => toggleArrayItem(ministerios, m, setMinisterios)}
                      style={chipStyle(ministerios.includes(m), "#1A3C6E")}>
                      {m}
                    </button>
                  ))}
                </div>
              </div>

              <div style={{ marginTop: "1rem" }}>
                <label style={labelStyle}>Disponibilidade — Dias</label>
                <div style={{ display: "flex", flexWrap: "wrap", gap: "0.5rem" }}>
                  {DIAS_OPTIONS.map(d => (
                    <button key={d} type="button" onClick={() => toggleArrayItem(disponibilidadeDias, d, setDisponibilidadeDias)}
                      style={chipStyle(disponibilidadeDias.includes(d), "#C8922A")}>
                      {d}
                    </button>
                  ))}
                </div>
              </div>

              <div style={{ marginTop: "1rem" }}>
                <label style={labelStyle}>Disponibilidade — Turnos</label>
                <div style={{ display: "flex", flexWrap: "wrap", gap: "0.5rem" }}>
                  {TURNOS_OPTIONS.map(t => (
                    <button key={t} type="button" onClick={() => toggleArrayItem(disponibilidadeTurnos, t, setDisponibilidadeTurnos)}
                      style={chipStyle(disponibilidadeTurnos.includes(t), "#16A34A")}>
                      {t}
                    </button>
                  ))}
                </div>
              </div>

              <div style={{ marginTop: "1rem" }}>
                <label style={labelStyle}>Tags</label>
                <div style={{ display: "flex", flexWrap: "wrap", gap: "0.5rem", marginBottom: "0.5rem" }}>
                  {tags.map((tag, i) => (
                    <span key={i} style={{ display: "inline-flex", alignItems: "center", gap: "0.25rem", padding: "0.25rem 0.6rem", background: "#EFF6FF", color: "#1A3C6E", borderRadius: 20, fontSize: "0.75rem", fontWeight: 500 }}>
                      {tag}
                      <button type="button" onClick={() => setTags(tags.filter((_, idx) => idx !== i))} style={{ background: "none", border: "none", cursor: "pointer", padding: 0, display: "flex" }}>
                        <X size={12} />
                      </button>
                    </span>
                  ))}
                </div>
                <div style={{ display: "flex", gap: "0.5rem" }}>
                  <input value={tagInput} onChange={e => setTagInput(e.target.value)} onKeyDown={e => { if (e.key === "Enter") { e.preventDefault(); addTag(); } }}
                    style={{ ...inputStyle, flex: 1 }} placeholder="Nova tag..." />
                  <button type="button" onClick={addTag}
                    style={{ padding: "0 0.75rem", background: "#1A3C6E", color: "white", border: "none", borderRadius: 8, cursor: "pointer" }}>
                    <Plus size={14} />
                  </button>
                </div>
              </div>
            </div>
          </motion.div>
        )}

        {/* ABA 4 — Família */}
        {activeTab === "familia" && (
          <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.25 }}>
            <div style={{ background: "white", borderRadius: "12px", padding: "1.5rem", boxShadow: "0 1px 4px rgba(0,0,0,0.06)", marginBottom: "1rem" }}>
              <h3 style={{ fontSize: "0.875rem", fontWeight: 600, color: "#1A3C6E", margin: "0 0 1rem", textTransform: "uppercase", letterSpacing: "0.05em" }}>Família</h3>
              <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "1rem", marginBottom: "1rem" }}>
                <div>
                  <label style={labelStyle}>Cônjuge (buscar membro)</label>
                  <select {...register("conjugeId")} style={inputStyle}>
                    <option value="">Selecione...</option>
                    {membersList.map(m => (
                      <option key={m.id} value={m.id}>{m.name}</option>
                    ))}
                  </select>
                </div>
                <div>
                  <label style={labelStyle}>Indicado por</label>
                  <select {...register("indicadoPorId")} style={inputStyle}>
                    <option value="">Selecione...</option>
                    {membersList.map(m => (
                      <option key={m.id} value={m.id}>{m.name}</option>
                    ))}
                  </select>
                </div>
              </div>

              <div style={{ marginBottom: "1rem" }}>
                <label style={labelStyle}>Como conheceu a igreja?</label>
                <textarea {...register("comoConheceu")} rows={3} style={{ ...inputStyle, resize: "vertical" }} placeholder="Conte como conheceu a igreja..." />
              </div>

              <div>
                <label style={labelStyle}>Filhos</label>
                {filhos.map((filho, i) => (
                  <div key={i} style={{ display: "flex", gap: "0.5rem", marginBottom: "0.5rem", alignItems: "center" }}>
                    <input value={filho.nome} onChange={e => updateFilho(i, "nome", e.target.value)}
                      style={{ ...inputStyle, flex: 2 }} placeholder="Nome do filho" />
                    <input value={filho.dataNascimento} onChange={e => updateFilho(i, "dataNascimento", e.target.value)}
                      type="date" style={{ ...inputStyle, flex: 1 }} />
                    <button type="button" onClick={() => removeFilho(i)}
                      style={{ padding: "0.5rem", background: "#FEF2F2", border: "none", borderRadius: 6, cursor: "pointer", color: "#DC2626" }}>
                      <X size={14} />
                    </button>
                  </div>
                ))}
                <button type="button" onClick={addFilho}
                  style={{ display: "inline-flex", alignItems: "center", gap: "0.3rem", padding: "0.4rem 0.875rem", background: "#F3F4F6", border: "1px dashed #D1D5DB", borderRadius: 8, cursor: "pointer", fontSize: "0.8rem", fontWeight: 500, color: "#374151" }}>
                  <Plus size={14} /> Adicionar filho
                </button>
              </div>
            </div>
          </motion.div>
        )}

        {/* ABA 5 — Portal do Membro */}
        {activeTab === "portal" && (
          <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.25 }}>
            <div style={{ background: "#FFF8EE", border: "1px solid #FDE68A", borderRadius: "12px", padding: "1.5rem", marginBottom: "1rem" }}>
              <div style={{ display: "flex", alignItems: "center", gap: "0.5rem", marginBottom: "1rem" }}>
                <Lock size={18} color="#C8922A" />
                <h3 style={{ fontSize: "0.875rem", fontWeight: 600, color: "#92400E", margin: 0, textTransform: "uppercase", letterSpacing: "0.05em" }}>Portal do Membro</h3>
              </div>
              <p style={{ fontSize: "0.8rem", color: "#92400E", marginBottom: "1rem" }}>
                Estas credenciais são para acesso ao portal público do membro.
              </p>
              <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "1rem" }}>
                <div>
                  <label style={labelStyle}>E-mail do portal</label>
                  <input {...register("portalEmail")} type="email" style={{ ...inputStyle, borderColor: errors.portalEmail ? "#DC2626" : "#E5E7EB" }} placeholder="membro@portal.com" />
                  {errors.portalEmail && <span style={{ color: "#DC2626", fontSize: "0.75rem" }}>{errors.portalEmail.message}</span>}
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
                    <button type="button" onClick={() => setShowPassword(!showPassword)}
                      style={{ position: "absolute", right: "0.75rem", top: "50%", transform: "translateY(-50%)", background: "none", border: "none", cursor: "pointer", color: "#9CA3AF" }}>
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
          </motion.div>
        )}

        {/* ABA 6 — Pastoral */}
        {activeTab === "pastoral" && (
          <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.25 }}>
            <div style={{ background: "#FEF2F2", border: "1px solid #FECACA", borderRadius: "12px", padding: "1.5rem", marginBottom: "1rem" }}>
              <div style={{ display: "flex", alignItems: "center", gap: "0.5rem", marginBottom: "1rem" }}>
                <Lock size={18} color="#DC2626" />
                <h3 style={{ fontSize: "0.875rem", fontWeight: 600, color: "#991B1B", margin: 0, textTransform: "uppercase", letterSpacing: "0.05em" }}>Área Pastoral — Confidencial</h3>
              </div>
              <p style={{ fontSize: "0.8rem", color: "#991B1B", marginBottom: "1rem" }}>
                Estas informações são visíveis apenas para administradores e pastores.
              </p>
              <div style={{ marginBottom: "1rem" }}>
                <label style={labelStyle}>Observações Pastorais</label>
                <textarea {...register("observacoesPastorais")} rows={5} style={{ ...inputStyle, resize: "vertical" }} placeholder="Anotações confidenciais sobre o membro..." />
              </div>
              <div>
                <label style={labelStyle}>Observações Gerais</label>
                <textarea {...register("notes")} rows={3} style={{ ...inputStyle, resize: "vertical" }} placeholder="Anotações gerais sobre o membro..." />
              </div>
            </div>
          </motion.div>
        )}

        {/* Botões de ação */}
        <div style={{ display: "flex", gap: "0.75rem", justifyContent: "flex-end", marginTop: "1.5rem" }}>
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
