"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { createClient } from "@/lib/supabase/client";
import { EditableSelect, EditableText, EditableDate } from "@/components/EditableField";
import { LEAD_STATUS, LEAD_PRIORITY } from "@/lib/constants";
import type { Lead } from "@/lib/types";

export function ProspectLeadPanel({
  prospectId,
  lead,
}: {
  prospectId: string;
  lead: Lead | null;
}) {
  const router = useRouter();
  const [creating, setCreating] = useState(false);

  async function createLead() {
    setCreating(true);
    const supabase = createClient();
    await supabase.from("leads").insert({
      prospect_id: prospectId,
      lead_status: "actif",
      lead_priority: "haute",
    });
    setCreating(false);
    router.refresh();
  }

  if (!lead) {
    return (
      <button
        onClick={createLead}
        disabled={creating}
        className="rounded-lg bg-[#3B82F6] px-3 py-2 text-sm font-semibold text-white hover:bg-[#2563EB] disabled:opacity-60"
      >
        {creating ? "Création..." : "Créer fiche lead"}
      </button>
    );
  }

  return (
    <div className="space-y-3">
      <div className="flex items-center justify-between">
        <Link href="/leads" className="text-xs font-medium text-[#3B82F6]">
          Voir dans Leads chauds →
        </Link>
      </div>
      <div className="grid grid-cols-2 gap-3">
        <EditableSelect
          table="leads"
          id={lead.id}
          field="lead_status"
          label="Statut du lead"
          value={lead.lead_status}
          options={Object.entries(LEAD_STATUS).map(([value, s]) => ({ value, label: s.label }))}
        />
        <EditableSelect
          table="leads"
          id={lead.id}
          field="lead_priority"
          label="Priorité du lead"
          value={lead.lead_priority}
          options={Object.entries(LEAD_PRIORITY).map(([value, s]) => ({ value, label: s.label }))}
        />
        <EditableText
          table="leads"
          id={lead.id}
          field="decision_maker_name"
          label="Décideur"
          value={lead.decision_maker_name}
        />
        <EditableText
          table="leads"
          id={lead.id}
          field="decision_maker_phone"
          label="Téléphone décideur"
          value={lead.decision_maker_phone}
        />
        <EditableDate
          table="leads"
          id={lead.id}
          field="rdv_date"
          label="Date RDV"
          value={lead.rdv_date ? lead.rdv_date.slice(0, 10) : null}
        />
        <EditableText
          table="leads"
          id={lead.id}
          field="rdv_platform"
          label="Plateforme RDV"
          value={lead.rdv_platform}
        />
        <EditableText
          table="leads"
          id={lead.id}
          field="action_narcisse"
          label="Action — Narcisse"
          value={lead.action_narcisse}
        />
        <EditableText
          table="leads"
          id={lead.id}
          field="action_marek"
          label="Action — Marek"
          value={lead.action_marek}
        />
        <EditableDate
          table="leads"
          id={lead.id}
          field="action_deadline"
          label="Échéance action"
          value={lead.action_deadline}
        />
        <EditableText
          table="leads"
          id={lead.id}
          field="referred_by"
          label="Référé par"
          value={lead.referred_by}
        />
      </div>
      <EditableText
        table="leads"
        id={lead.id}
        field="need_description"
        label="Besoin identifié"
        value={lead.need_description}
        multiline
      />
      <EditableText
        table="leads"
        id={lead.id}
        field="follow_up_note"
        label="Note de suivi"
        value={lead.follow_up_note}
        multiline
      />
    </div>
  );
}
