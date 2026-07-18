"use client";

import { useState } from "react";
import { createClient } from "@/lib/supabase/client";
import { useRealtimeRows } from "@/lib/useRealtimeRows";
import { INTERACTION_TYPE } from "@/lib/constants";
import { formatDateTime } from "@/lib/utils";
import type { Interaction, InteractionType, Profile } from "@/lib/types";

export function InteractionTimeline({
  prospectId,
  initialInteractions,
  profileMap,
}: {
  prospectId: string;
  initialInteractions: Interaction[];
  profileMap: Map<string, string>;
}) {
  const [interactions] = useRealtimeRows<Interaction>(
    "interactions",
    initialInteractions,
    `prospect_id=eq.${prospectId}`,
  );
  const sorted = [...interactions].sort(
    (a, b) => new Date(b.created_at).getTime() - new Date(a.created_at).getTime(),
  );

  return (
    <div>
      <AddInteractionForm prospectId={prospectId} />
      <div className="mt-4 space-y-3">
        {sorted.length === 0 && (
          <p className="text-sm text-slate-400">Aucune interaction enregistrée.</p>
        )}
        {sorted.map((i) => (
          <div key={i.id} className="border-l-2 border-slate-200 pl-3">
            <div className="flex flex-wrap items-center gap-2 text-xs text-slate-500">
              <span className="rounded-full bg-slate-100 px-2 py-0.5 font-medium text-slate-600">
                {INTERACTION_TYPE[i.interaction_type]}
              </span>
              <span>{formatDateTime(i.created_at)}</span>
              {i.done_by && profileMap.get(i.done_by) && (
                <span>· {profileMap.get(i.done_by)}</span>
              )}
              {i.outcome && (
                <span className="font-medium text-[#3B82F6]">· {i.outcome}</span>
              )}
            </div>
            <p className="mt-1 text-sm text-[#0F172A]">{i.summary}</p>
            {i.next_action && (
              <p className="mt-0.5 text-xs text-slate-500">
                Prochaine action : {i.next_action}
                {i.next_action_date ? ` (${i.next_action_date})` : ""}
              </p>
            )}
          </div>
        ))}
      </div>
    </div>
  );
}

const TYPE_OPTIONS: InteractionType[] = [
  "appel_sortant",
  "appel_entrant",
  "email_envoyé",
  "email_reçu",
  "relance",
  "rdv",
  "teams",
  "message_marek",
];

function AddInteractionForm({ prospectId }: { prospectId: string }) {
  const [open, setOpen] = useState(false);
  const [type, setType] = useState<InteractionType>("appel_sortant");
  const [summary, setSummary] = useState("");
  const [outcome, setOutcome] = useState("");
  const [saving, setSaving] = useState(false);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!summary.trim()) return;
    setSaving(true);
    const supabase = createClient();
    const {
      data: { user },
    } = await supabase.auth.getUser();
    await supabase.from("interactions").insert({
      prospect_id: prospectId,
      interaction_type: type,
      summary: summary.trim(),
      outcome: outcome.trim() || null,
      done_by: user?.id ?? null,
    });
    await supabase
      .from("prospects")
      .update({ date_last_contact: new Date().toISOString().slice(0, 10) })
      .eq("id", prospectId);
    setSaving(false);
    setSummary("");
    setOutcome("");
    setOpen(false);
  }

  if (!open) {
    return (
      <button
        onClick={() => setOpen(true)}
        className="rounded-lg border border-slate-300 px-3 py-1.5 text-xs font-medium text-slate-600 hover:bg-slate-50"
      >
        + Ajouter une interaction
      </button>
    );
  }

  return (
    <form
      onSubmit={handleSubmit}
      className="space-y-2 rounded-lg border border-slate-200 bg-slate-50 p-3"
    >
      <div className="flex gap-2">
        <select
          value={type}
          onChange={(e) => setType(e.target.value as InteractionType)}
          className="rounded-md border border-slate-300 bg-white px-2 py-1.5 text-xs"
        >
          {TYPE_OPTIONS.map((t) => (
            <option key={t} value={t}>
              {INTERACTION_TYPE[t]}
            </option>
          ))}
        </select>
        <input
          value={outcome}
          onChange={(e) => setOutcome(e.target.value)}
          placeholder="Résultat (optionnel)"
          className="flex-1 rounded-md border border-slate-300 bg-white px-2 py-1.5 text-xs"
        />
      </div>
      <textarea
        autoFocus
        rows={2}
        required
        value={summary}
        onChange={(e) => setSummary(e.target.value)}
        placeholder="Résumé de l'échange..."
        className="w-full rounded-md border border-slate-300 bg-white px-2 py-1.5 text-sm"
      />
      <div className="flex justify-end gap-2">
        <button
          type="button"
          onClick={() => setOpen(false)}
          className="rounded-md px-2 py-1 text-xs text-slate-500 hover:bg-slate-100"
        >
          Annuler
        </button>
        <button
          type="submit"
          disabled={saving}
          className="rounded-md bg-[#3B82F6] px-3 py-1 text-xs font-semibold text-white hover:bg-[#2563EB] disabled:opacity-60"
        >
          {saving ? "Enregistrement..." : "Enregistrer"}
        </button>
      </div>
    </form>
  );
}

export function profileMapFrom(profiles: Profile[] | null): Map<string, string> {
  return new Map((profiles ?? []).map((p) => [p.id, p.full_name]));
}
