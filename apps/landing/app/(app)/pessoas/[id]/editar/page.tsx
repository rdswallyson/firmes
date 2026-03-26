"use client";

import { useEffect, useState } from "react";
import { useParams } from "next/navigation";
import { MemberForm } from "../../../../components/MemberForm";

interface MemberData {
  id: string;
  name: string;
  email: string | null;
  phone: string | null;
  photo: string | null;
  birthDate: string | null;
  baptismDate: string | null;
  address: string | null;
  cep: string | null;
  city: string | null;
  state: string | null;
  neighborhood: string | null;
  number: string | null;
  complement: string | null;
  role: string | null;
  groupId: string | null;
  status: string;
  notes: string | null;
}

export default function EditarMembroPage() {
  const params = useParams();
  const [data, setData] = useState<MemberData | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetch(`/api/members/${params.id}`)
      .then((r) => r.json())
      .then((d: { member?: MemberData }) => setData(d.member ?? null))
      .catch(() => null)
      .finally(() => setLoading(false));
  }, [params.id]);

  if (loading) return <div style={{ padding: "3rem", textAlign: "center", color: "#9CA3AF" }}>Carregando...</div>;
  if (!data) return <div style={{ padding: "3rem", textAlign: "center", color: "#DC2626" }}>Membro não encontrado</div>;

  const formatted = {
    ...data,
    email: data.email ?? "",
    phone: data.phone ?? "",
    photo: data.photo ?? undefined,
    birthDate: data.birthDate ? data.birthDate.split("T")[0] : "",
    baptismDate: data.baptismDate ? data.baptismDate.split("T")[0] : "",
    cep: data.cep ?? "",
    address: data.address ?? "",
    city: data.city ?? "",
    state: data.state ?? "",
    neighborhood: data.neighborhood ?? "",
    number: data.number ?? "",
    complement: data.complement ?? "",
    role: data.role ?? "",
    groupId: data.groupId ?? "",
    notes: data.notes ?? "",
  };

  return <MemberForm mode="edit" initialData={formatted} />;
}
