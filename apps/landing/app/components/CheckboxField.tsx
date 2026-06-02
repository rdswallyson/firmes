"use client";

import React from "react";
import { Check } from "lucide-react";

export interface CheckboxItemProps {
  label: string;
  checked: boolean;
  onChange: () => void;
}

/** Checkbox quadrado inline — estilo padrão do sistema */
export function CheckboxItem({ label, checked, onChange }: CheckboxItemProps) {
  return (
    <label
      onClick={onChange}
      style={{
        display: "flex",
        alignItems: "center",
        gap: 10,
        padding: "6px 0",
        cursor: "pointer",
        fontSize: 14,
        fontWeight: 600,
        color: "#1e293b",
        userSelect: "none",
      }}
    >
      <span
        style={{
          width: 18,
          height: 18,
          border: "1.5px solid #CBD5E1",
          borderRadius: 4,
          background: checked ? "#1B2B6B" : "white",
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          flexShrink: 0,
          transition: "all 0.15s",
        }}
      >
        {checked && <Check size={12} color="white" strokeWidth={3} />}
      </span>
      <span>{label}</span>
    </label>
  );
}

export interface CheckboxGroupProps {
  title: string;
  children: React.ReactNode;
  layout?: "column" | "grid";
  columns?: number;
}

/** Grupo de checkboxes com título */
export function CheckboxGroup({ title, children, layout = "column", columns = 1 }: CheckboxGroupProps) {
  return (
    <div style={{ marginBottom: 20 }}>
      <div
        style={{
          fontSize: "0.8rem",
          fontWeight: 600,
          color: "#374151",
          marginBottom: 10,
          textTransform: "uppercase",
          letterSpacing: "0.05em",
        }}
      >
        {title}
      </div>
      <div
        style={
          layout === "grid"
            ? { display: "grid", gridTemplateColumns: `repeat(${columns}, 1fr)`, gap: "4px 16px" }
            : { display: "flex", flexDirection: "column", gap: 4 }
        }
      >
        {children}
      </div>
    </div>
  );
}

export interface CheckboxFieldProps {
  options: string[];
  selected: string[];
  onToggle: (v: string) => void;
  title: string;
  layout?: "column" | "grid";
  columns?: number;
}

/** Campo completo: título + lista de checkboxes */
export function CheckboxField({ options, selected, onToggle, title, layout = "grid", columns = 2 }: CheckboxFieldProps) {
  return (
    <CheckboxGroup title={title} layout={layout} columns={columns}>
      {options.map((opt) => (
        <CheckboxItem key={opt} label={opt} checked={selected.includes(opt)} onChange={() => onToggle(opt)} />
      ))}
    </CheckboxGroup>
  );
}

/** Checkbox único (radio-style mas visual checkbox) — para seleção única como Cargo/Função */
export function SingleCheckboxField({ options, selected, onChange, title }: { options: string[]; selected: string; onChange: (v: string) => void; title: string }) {
  return (
    <CheckboxGroup title={title} layout="grid" columns={2}>
      {options.map((opt) => (
        <CheckboxItem key={opt} label={opt} checked={selected === opt} onChange={() => onChange(opt)} />
      ))}
    </CheckboxGroup>
  );
}
