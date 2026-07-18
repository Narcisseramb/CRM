"use client";

import { useState } from "react";
import { createClient } from "@/lib/supabase/client";

type BaseProps = {
  table: string;
  id: string;
  field: string;
  label: string;
  disabled?: boolean;
};

// `table`/`field` are caller-supplied strings so this helper can edit any
// column on any table generically — the Database generic can't narrow
// Update to a specific table shape here, hence the controlled `any`.
async function saveField(table: string, id: string, field: string, value: unknown) {
  const supabase = createClient();
  const { error } = await supabase
    // eslint-disable-next-line @typescript-eslint/no-explicit-any -- dynamic table/column editor, can't be narrowed to one table's Update type
    .from(table as any)
    .update({ [field]: value })
    .eq("id", id);
  return error;
}

export function EditableText({
  table,
  id,
  field,
  label,
  value,
  disabled,
  multiline,
  type = "text",
}: BaseProps & { value: string | null; multiline?: boolean; type?: "text" | "email" | "tel" | "url" }) {
  const [editing, setEditing] = useState(false);
  const [draft, setDraft] = useState(value ?? "");
  const [current, setCurrent] = useState(value ?? "");
  const [saving, setSaving] = useState(false);

  async function commit() {
    if (draft === current) {
      setEditing(false);
      return;
    }
    setSaving(true);
    const error = await saveField(table, id, field, draft || null);
    setSaving(false);
    if (!error) {
      setCurrent(draft);
      setEditing(false);
    }
  }

  if (disabled) {
    return (
      <div>
        <div className="text-[11px] font-medium text-slate-400">{label}</div>
        <div className="text-sm text-slate-400">{current || "—"}</div>
      </div>
    );
  }

  return (
    <div>
      <div className="text-[11px] font-medium text-slate-400">{label}</div>
      {editing ? (
        multiline ? (
          <textarea
            autoFocus
            rows={3}
            value={draft}
            onChange={(e) => setDraft(e.target.value)}
            onBlur={commit}
            className="mt-0.5 w-full rounded-md border border-[#3B82F6] px-2 py-1 text-sm focus:outline-none"
          />
        ) : (
          <input
            autoFocus
            type={type}
            value={draft}
            onChange={(e) => setDraft(e.target.value)}
            onBlur={commit}
            onKeyDown={(e) => e.key === "Enter" && commit()}
            className="mt-0.5 w-full rounded-md border border-[#3B82F6] px-2 py-1 text-sm focus:outline-none"
          />
        )
      ) : (
        <button
          type="button"
          onClick={() => {
            setDraft(current);
            setEditing(true);
          }}
          className="mt-0.5 block w-full rounded-md px-2 py-1 text-left text-sm text-[#0F172A] hover:bg-slate-100"
        >
          {saving ? "..." : current || <span className="text-slate-400">—</span>}
        </button>
      )}
    </div>
  );
}

export function EditableSelect({
  table,
  id,
  field,
  label,
  value,
  options,
  disabled,
  onSaved,
}: BaseProps & {
  value: string | null;
  options: { value: string; label: string }[];
  onSaved?: (value: string) => void;
}) {
  const [current, setCurrent] = useState(value ?? "");
  const [saving, setSaving] = useState(false);

  async function handleChange(newValue: string) {
    setSaving(true);
    const error = await saveField(table, id, field, newValue);
    setSaving(false);
    if (!error) {
      setCurrent(newValue);
      onSaved?.(newValue);
    }
  }

  return (
    <div>
      <div className="text-[11px] font-medium text-slate-400">{label}</div>
      <select
        value={current}
        disabled={disabled || saving}
        onChange={(e) => handleChange(e.target.value)}
        className="mt-0.5 w-full rounded-md border border-slate-200 bg-white px-2 py-1.5 text-sm disabled:opacity-60"
      >
        {options.map((o) => (
          <option key={o.value} value={o.value}>
            {o.label}
          </option>
        ))}
      </select>
    </div>
  );
}

export function EditableDate({
  table,
  id,
  field,
  label,
  value,
  disabled,
}: BaseProps & { value: string | null }) {
  const [current, setCurrent] = useState(value ?? "");
  const [saving, setSaving] = useState(false);

  async function handleChange(newValue: string) {
    setSaving(true);
    const error = await saveField(table, id, field, newValue || null);
    setSaving(false);
    if (!error) setCurrent(newValue);
  }

  return (
    <div>
      <div className="text-[11px] font-medium text-slate-400">{label}</div>
      <input
        type="date"
        value={current}
        disabled={disabled || saving}
        onChange={(e) => handleChange(e.target.value)}
        className="mt-0.5 w-full rounded-md border border-slate-200 bg-white px-2 py-1.5 text-sm disabled:opacity-60"
      />
    </div>
  );
}
