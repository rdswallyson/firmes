"use client";

import { useState, useEffect, useRef, useCallback } from "react";
import { Search, X, User, Check } from "lucide-react";

interface Member {
  id: string;
  name: string;
  photo?: string | null;
  role?: string | null;
  phone?: string | null;
}

interface MemberSelectorProps {
  onSelect: (member: Member | Member[] | null) => void;
  placeholder?: string;
  label?: string;
  value?: Member | Member[] | null;
  multiple?: boolean;
  filterStatus?: string[];
  required?: boolean;
}

export function MemberSelector({
  onSelect,
  placeholder = "Buscar membro...",
  label,
  value,
  multiple = false,
  filterStatus,
  required = false,
}: MemberSelectorProps) {
  const [query, setQuery] = useState("");
  const [members, setMembers] = useState<Member[]>([]);
  const [loading, setLoading] = useState(false);
  const [open, setOpen] = useState(false);
  const [selected, setSelected] = useState<Member[]>(
    multiple
      ? (Array.isArray(value) ? value : value ? [value] : [])
      : value && !Array.isArray(value)
        ? [value]
        : []
  );
  const debounceRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const containerRef = useRef<HTMLDivElement>(null);

  const fetchMembers = useCallback(async (search: string) => {
    setLoading(true);
    try {
      const params = new URLSearchParams({ search, limit: "10" });
      if (filterStatus?.length) {
        filterStatus.forEach((s) => params.append("status", s));
      }
      const res = await fetch(`/api/members?${params}`);
      const data = await res.json();
      setMembers(data.members || []);
    } catch {
      setMembers([]);
    } finally {
      setLoading(false);
    }
  }, [filterStatus]);

  useEffect(() => {
    if (debounceRef.current) clearTimeout(debounceRef.current);
    if (query.trim().length >= 2) {
      debounceRef.current = setTimeout(() => fetchMembers(query), 300);
    } else {
      setMembers([]);
    }
    return () => { if (debounceRef.current) clearTimeout(debounceRef.current); };
  }, [query, fetchMembers]);

  useEffect(() => {
    function handleClickOutside(e: MouseEvent) {
      if (containerRef.current && !containerRef.current.contains(e.target as Node)) {
        setOpen(false);
      }
    }
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  function toggleMember(member: Member) {
    if (multiple) {
      const exists = selected.find((s) => s.id === member.id);
      const updated = exists
        ? selected.filter((s) => s.id !== member.id)
        : [...selected, member];
      setSelected(updated);
      onSelect(updated);
    } else {
      const updated = selected.find((s) => s.id === member.id) ? [] : [member];
      setSelected(updated);
      onSelect(updated[0] || null);
      setOpen(false);
      setQuery("");
    }
  }

  function removeMember(memberId: string) {
    const updated = selected.filter((s) => s.id !== memberId);
    setSelected(updated);
    onSelect(multiple ? updated : updated[0] || null);
  }

  const displayValue = multiple
    ? placeholder
    : selected[0]?.name || placeholder;

  return (
    <div ref={containerRef} style={{ position: "relative", width: "100%" }}>
      {label && (
        <label style={{ display: "block", marginBottom: "0.35rem", fontSize: "0.8rem", fontWeight: 500, color: "#374151" }}>
          {label}
          {required && <span style={{ color: "#DC2626" }}> *</span>}
        </label>
      )}

      {/* Selected chips */}
      {multiple && selected.length > 0 && (
        <div style={{ display: "flex", flexWrap: "wrap", gap: "0.4rem", marginBottom: "0.5rem" }}>
          {selected.map((s) => (
            <span
              key={s.id}
              style={{
                display: "inline-flex",
                alignItems: "center",
                gap: "0.3rem",
                padding: "0.25rem 0.6rem",
                background: "#EFF6FF",
                color: "#1A3C6E",
                borderRadius: 20,
                fontSize: "0.8rem",
                fontWeight: 500,
              }}
            >
              {s.photo ? (
                <img src={s.photo} alt="" style={{ width: 18, height: 18, borderRadius: "50%", objectFit: "cover" }} />
              ) : (
                <User size={14} />
              )}
              {s.name}
              <button
                type="button"
                onClick={() => removeMember(s.id)}
                style={{ background: "none", border: "none", cursor: "pointer", padding: 0, display: "flex", color: "#1A3C6E" }}
              >
                <X size={12} />
              </button>
            </span>
          ))}
        </div>
      )}

      {/* Input */}
      <div style={{ position: "relative" }}>
        <Search size={14} style={{ position: "absolute", left: "0.75rem", top: "50%", transform: "translateY(-50%)", color: "#9CA3AF" }} />
        <input
          type="text"
          value={open ? query : multiple ? "" : selected[0]?.name || ""}
          onChange={(e) => { setQuery(e.target.value); setOpen(true); }}
          onFocus={() => setOpen(true)}
          placeholder={displayValue}
          style={{
            width: "100%",
            padding: "0.625rem 0.75rem 0.625rem 2.25rem",
            border: "1.5px solid #E5E7EB",
            borderRadius: "8px",
            fontSize: "0.875rem",
            outline: "none",
            background: "white",
            boxSizing: "border-box",
            color: "#111827",
          }}
        />
        {!multiple && selected.length > 0 && (
          <button
            type="button"
            onClick={() => { setSelected([]); onSelect(null); setQuery(""); }}
            style={{ position: "absolute", right: "0.6rem", top: "50%", transform: "translateY(-50%)", background: "none", border: "none", cursor: "pointer", color: "#9CA3AF", padding: 0 }}
          >
            <X size={14} />
          </button>
        )}
      </div>

      {/* Dropdown */}
      {open && (
        <div
          style={{
            position: "absolute",
            top: "calc(100% + 4px)",
            left: 0,
            right: 0,
            background: "white",
            border: "1px solid #E5E7EB",
            borderRadius: "8px",
            boxShadow: "0 4px 12px rgba(0,0,0,0.1)",
            zIndex: 50,
            maxHeight: 280,
            overflowY: "auto",
          }}
        >
          {loading ? (
            <div style={{ padding: "1rem", textAlign: "center", color: "#9CA3AF", fontSize: "0.8rem" }}>Buscando...</div>
          ) : members.length === 0 ? (
            <div style={{ padding: "1rem", textAlign: "center", color: "#9CA3AF", fontSize: "0.8rem" }}>
              {query.trim().length >= 2 ? "Nenhum membro encontrado" : "Digite pelo menos 2 caracteres"}
            </div>
          ) : (
            members.map((m) => {
              const isSelected = selected.some((s) => s.id === m.id);
              return (
                <button
                  key={m.id}
                  type="button"
                  onClick={() => toggleMember(m)}
                  style={{
                    width: "100%",
                    display: "flex",
                    alignItems: "center",
                    gap: "0.625rem",
                    padding: "0.6rem 0.875rem",
                    border: "none",
                    borderBottom: "1px solid #F9FAFB",
                    background: isSelected ? "#EFF6FF" : "white",
                    cursor: "pointer",
                    textAlign: "left",
                    transition: "background 0.15s",
                  }}
                  onMouseEnter={(e) => { (e.currentTarget as HTMLButtonElement).style.background = "#F9FAFB"; }}
                  onMouseLeave={(e) => { (e.currentTarget as HTMLButtonElement).style.background = isSelected ? "#EFF6FF" : "white"; }}
                >
                  {m.photo ? (
                    <img src={m.photo} alt="" style={{ width: 32, height: 32, borderRadius: "50%", objectFit: "cover", flexShrink: 0 }} />
                  ) : (
                    <div style={{ width: 32, height: 32, borderRadius: "50%", background: "#E5E7EB", display: "flex", alignItems: "center", justifyContent: "center", flexShrink: 0 }}>
                      <User size={14} color="#9CA3AF" />
                    </div>
                  )}
                  <div style={{ flex: 1, minWidth: 0 }}>
                    <div style={{ fontSize: "0.85rem", fontWeight: 600, color: "#0D2545", whiteSpace: "nowrap", overflow: "hidden", textOverflow: "ellipsis" }}>{m.name}</div>
                    {m.role && <div style={{ fontSize: "0.7rem", color: "#9CA3AF" }}>{m.role}</div>}
                  </div>
                  {isSelected && <Check size={16} color="#16A34A" />}
                </button>
              );
            })
          )}
        </div>
      )}
    </div>
  );
}
