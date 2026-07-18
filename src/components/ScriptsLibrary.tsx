"use client";

import { useMemo, useState } from "react";
import Link from "next/link";
import { createClient } from "@/lib/supabase/client";
import { useRealtimeRows } from "@/lib/useRealtimeRows";
import { SCRIPT_TYPE } from "@/lib/constants";
import { formatDate } from "@/lib/utils";
import type { Prospect, ScriptEmail, ScriptType } from "@/lib/types";

export function ScriptsLibrary({
  initialScripts,
  prospects,
}: {
  initialScripts: ScriptEmail[];
  prospects: Prospect[];
}) {
  const [scripts] = useRealtimeRows<ScriptEmail>("scripts_emails", initialScripts);
  const [typeFilter, setTypeFilter] = useState<ScriptType | "">("");
  const [showNew, setShowNew] = useState(false);

  const prospectMap = useMemo(() => new Map(prospects.map((p) => [p.id, p])), [prospects]);

  const filtered = useMemo(() => {
    return [...scripts]
      .filter((s) => (typeFilter ? s.type === typeFilter : true))
      .sort((a, b) => new Date(b.created_at).getTime() - new Date(a.created_at).getTime());
  }, [scripts, typeFilter]);

  return (
    <div>
      <div className="flex flex-wrap items-center gap-2">
        <select
          value={typeFilter}
          onChange={(e) => setTypeFilter(e.target.value as ScriptType | "")}
          className="rounded-lg border border-slate-300 bg-white px-3 py-2 text-sm"
        >
          <option value="">Tous les types</option>
          {Object.entries(SCRIPT_TYPE).map(([key, label]) => (
            <option key={key} value={key}>
              {label}
            </option>
          ))}
        </select>
        <button
          onClick={() => setShowNew(true)}
          className="ml-auto rounded-lg bg-[#3B82F6] px-3 py-2 text-sm font-semibold text-white hover:bg-[#2563EB]"
        >
          + Nouveau script/courriel
        </button>
      </div>

      <div className="mt-4 grid grid-cols-1 gap-4 md:grid-cols-2">
        {filtered.map((s) => {
          const prospect = s.prospect_id ? prospectMap.get(s.prospect_id) : undefined;
          return (
            <div key={s.id} className="rounded-xl border border-slate-200 bg-white p-4">
              <div className="flex items-center justify-between gap-2">
                <span className="rounded-full bg-slate-100 px-2 py-0.5 text-[11px] font-medium text-slate-600">
                  {SCRIPT_TYPE[s.type]}
                </span>
                <span className="text-[11px] text-slate-400">{formatDate(s.created_at)}</span>
              </div>
              {prospect && (
                <Link
                  href={`/prospects/${prospect.id}`}
                  className="mt-2 block text-sm font-semibold text-[#0F172A] hover:text-[#3B82F6]"
                >
                  {prospect.company_name}
                </Link>
              )}
              {s.subject && <p className="mt-1 text-sm font-medium text-slate-700">{s.subject}</p>}
              <p className="mt-1 line-clamp-4 whitespace-pre-line text-xs text-slate-500">
                {s.content}
              </p>
              {s.is_sent && (
                <span className="mt-2 inline-block rounded-full bg-emerald-50 px-2 py-0.5 text-[10px] font-medium text-emerald-700">
                  Envoyé
                </span>
              )}
            </div>
          );
        })}
        {filtered.length === 0 && (
          <p className="col-span-full py-8 text-center text-sm text-slate-400">
            Aucun script ou courriel.
          </p>
        )}
      </div>

      {showNew && <NewScriptModal prospects={prospects} onClose={() => setShowNew(false)} />}
    </div>
  );
}

function NewScriptModal({
  prospects,
  onClose,
}: {
  prospects: Prospect[];
  onClose: () => void;
}) {
  const [prospectId, setProspectId] = useState("");
  const [type, setType] = useState<ScriptType>("email_prospection");
  const [subject, setSubject] = useState("");
  const [content, setContent] = useState("");
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!content.trim()) {
      setError("Le contenu est requis.");
      return;
    }
    setSaving(true);
    const supabase = createClient();
    const {
      data: { user },
    } = await supabase.auth.getUser();
    const { error: insertError } = await supabase.from("scripts_emails").insert({
      prospect_id: prospectId || null,
      type,
      subject: subject.trim() || null,
      content: content.trim(),
      created_by: user?.id ?? null,
    });
    setSaving(false);
    if (insertError) {
      setError("Erreur lors de l'enregistrement.");
      return;
    }
    onClose();
  }

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 p-4">
      <div className="w-full max-w-lg rounded-xl bg-white p-5 shadow-xl">
        <h2 className="text-sm font-semibold text-[#0F172A]">Nouveau script / courriel</h2>
        <form onSubmit={handleSubmit} className="mt-4 space-y-3">
          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="mb-1 block text-xs font-medium text-slate-600">Type</label>
              <select
                value={type}
                onChange={(e) => setType(e.target.value as ScriptType)}
                className="w-full rounded-lg border border-slate-300 px-3 py-2 text-sm"
              >
                {Object.entries(SCRIPT_TYPE).map(([key, label]) => (
                  <option key={key} value={key}>
                    {label}
                  </option>
                ))}
              </select>
            </div>
            <div>
              <label className="mb-1 block text-xs font-medium text-slate-600">Prospect</label>
              <select
                value={prospectId}
                onChange={(e) => setProspectId(e.target.value)}
                className="w-full rounded-lg border border-slate-300 px-3 py-2 text-sm"
              >
                <option value="">Aucun (générique)</option>
                {prospects.map((p) => (
                  <option key={p.id} value={p.id}>
                    {p.company_name}
                  </option>
                ))}
              </select>
            </div>
          </div>
          <div>
            <label className="mb-1 block text-xs font-medium text-slate-600">Sujet (optionnel)</label>
            <input
              value={subject}
              onChange={(e) => setSubject(e.target.value)}
              className="w-full rounded-lg border border-slate-300 px-3 py-2 text-sm"
            />
          </div>
          <div>
            <label className="mb-1 block text-xs font-medium text-slate-600">Contenu *</label>
            <textarea
              autoFocus
              rows={8}
              value={content}
              onChange={(e) => setContent(e.target.value)}
              className="w-full rounded-lg border border-slate-300 px-3 py-2 text-sm"
            />
          </div>

          {error && <p className="text-xs text-red-600">{error}</p>}

          <div className="flex justify-end gap-2">
            <button
              type="button"
              onClick={onClose}
              className="rounded-lg border border-slate-300 px-3 py-2 text-sm font-medium text-slate-600 hover:bg-slate-50"
            >
              Annuler
            </button>
            <button
              type="submit"
              disabled={saving}
              className="rounded-lg bg-[#3B82F6] px-3 py-2 text-sm font-semibold text-white hover:bg-[#2563EB] disabled:opacity-60"
            >
              {saving ? "Enregistrement..." : "Enregistrer"}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
