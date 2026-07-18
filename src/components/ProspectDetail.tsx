"use client";

import { useState } from "react";
import { createClient } from "@/lib/supabase/client";
import { EditableDate, EditableSelect, EditableText } from "@/components/EditableField";
import { InteractionTimeline } from "@/components/InteractionTimeline";
import { ProspectReminders } from "@/components/ProspectReminders";
import { ProspectLeadPanel } from "@/components/ProspectLeadPanel";
import { ProspectScripts } from "@/components/ProspectScripts";
import { ProspectStatusBadge } from "@/components/StatusBadge";
import { PriorityBadge } from "@/components/PriorityBadge";
import { MKB_ANGLES, PROSPECT_STATUS, PRIORITY, PROVINCES } from "@/lib/constants";
import type {
  Interaction,
  Lead,
  Prospect,
  Profile,
  Reminder,
  ScriptEmail,
} from "@/lib/types";

export function ProspectDetail({
  prospect,
  lead,
  interactions,
  reminders,
  scripts,
  profiles,
  profileMap,
  currentProfile,
}: {
  prospect: Prospect;
  lead: Lead | null;
  interactions: Interaction[];
  reminders: Reminder[];
  scripts: ScriptEmail[];
  profiles: Profile[];
  profileMap: Map<string, string>;
  currentProfile: Profile | null;
}) {
  const isPresident = currentProfile?.role === "president";
  const [status, setStatus] = useState(prospect.status);
  const [priority, setPriority] = useState(prospect.priority);
  const [angles, setAngles] = useState<string[]>(prospect.mkb_angle ?? []);
  const [flags, setFlags] = useState({
    is_competitor: prospect.is_competitor,
    is_too_large: prospect.is_too_large,
  });

  async function toggleAngle(angle: string) {
    const next = angles.includes(angle)
      ? angles.filter((a) => a !== angle)
      : [...angles, angle];
    setAngles(next);
    const supabase = createClient();
    await supabase.from("prospects").update({ mkb_angle: next }).eq("id", prospect.id);
  }

  async function toggleFlag(flag: "is_competitor" | "is_too_large") {
    const next = { ...flags, [flag]: !flags[flag] };
    setFlags(next);
    const supabase = createClient();
    await supabase
      .from("prospects")
      .update(flag === "is_competitor" ? { is_competitor: next.is_competitor } : { is_too_large: next.is_too_large })
      .eq("id", prospect.id);
  }

  return (
    <div className="mx-auto max-w-6xl">
      <div className="flex flex-wrap items-start justify-between gap-3">
        <div>
          <h1 className="text-xl font-semibold text-[#0F172A]">{prospect.company_name}</h1>
          <p className="mt-1 text-sm text-slate-500">
            {prospect.sector ?? "Secteur non précisé"}
            {prospect.city ? ` · ${prospect.city}, ${prospect.province ?? ""}` : ""}
          </p>
        </div>
        <div className="flex items-center gap-2">
          <ProspectStatusBadge status={status} />
          <PriorityBadge priority={priority} />
        </div>
      </div>

      <div className="mt-6 grid grid-cols-1 gap-6 lg:grid-cols-3">
        <div className="space-y-6 lg:col-span-2">
          <Section title="Informations générales">
            <div className="grid grid-cols-2 gap-3">
              <EditableText table="prospects" id={prospect.id} field="company_name" label="Entreprise" value={prospect.company_name} />
              <EditableText table="prospects" id={prospect.id} field="sector" label="Secteur" value={prospect.sector} />
              <EditableText table="prospects" id={prospect.id} field="address" label="Adresse" value={prospect.address} />
              <EditableText table="prospects" id={prospect.id} field="city" label="Ville" value={prospect.city} />
              <EditableSelect
                table="prospects"
                id={prospect.id}
                field="province"
                label="Province"
                value={prospect.province}
                options={PROVINCES.map((p) => ({ value: p, label: p }))}
              />
              <EditableText table="prospects" id={prospect.id} field="postal_code" label="Code postal" value={prospect.postal_code} />
              <EditableText table="prospects" id={prospect.id} field="website" label="Site web" value={prospect.website} type="url" />
              <EditableText table="prospects" id={prospect.id} field="semaine_contact" label="Semaine" value={prospect.semaine_contact} />
            </div>
          </Section>

          <Section title="Contacts">
            <div className="grid grid-cols-2 gap-3">
              <EditableText table="prospects" id={prospect.id} field="contact_name" label="Contact principal" value={prospect.contact_name} />
              <EditableText table="prospects" id={prospect.id} field="contact_title" label="Titre" value={prospect.contact_title} />
              <EditableText table="prospects" id={prospect.id} field="phone_main" label="Téléphone" value={prospect.phone_main} type="tel" />
              <EditableText table="prospects" id={prospect.id} field="phone_direct" label="Tél. direct" value={prospect.phone_direct} type="tel" />
              <EditableText table="prospects" id={prospect.id} field="email_main" label="Courriel" value={prospect.email_main} type="email" />
              <EditableText table="prospects" id={prospect.id} field="email_general" label="Courriel général" value={prospect.email_general} type="email" />
              <EditableText table="prospects" id={prospect.id} field="contact2_name" label="Contact secondaire" value={prospect.contact2_name} />
              <EditableText table="prospects" id={prospect.id} field="contact2_email" label="Courriel secondaire" value={prospect.contact2_email} type="email" />
            </div>
          </Section>

          <Section title="Qualification MKB">
            <div>
              <div className="text-[11px] font-medium text-slate-400">Angle MKB</div>
              <div className="mt-1 flex flex-wrap gap-1.5">
                {MKB_ANGLES.map((a) => (
                  <button
                    key={a}
                    onClick={() => toggleAngle(a)}
                    className={`rounded-full border px-2.5 py-1 text-xs font-medium transition-colors ${
                      angles.includes(a)
                        ? "border-[#3B82F6] bg-[#3B82F6] text-white"
                        : "border-slate-200 bg-white text-slate-500 hover:border-slate-300"
                    }`}
                  >
                    {a}
                  </button>
                ))}
              </div>
            </div>
            <div className="mt-3 grid grid-cols-2 gap-3">
              <EditableText table="prospects" id={prospect.id} field="estimated_volume" label="Volume estimé" value={prospect.estimated_volume} />
              <EditableText table="prospects" id={prospect.id} field="employees_range" label="Employés" value={prospect.employees_range} />
              <EditableText table="prospects" id={prospect.id} field="revenue_range" label="Chiffre d'affaires" value={prospect.revenue_range} />
            </div>
            <div className="mt-3">
              <EditableText table="prospects" id={prospect.id} field="why_mkb" label="Pourquoi MKB ?" value={prospect.why_mkb} multiline />
            </div>
            <div className="mt-3 flex gap-4">
              <label className="flex items-center gap-2 text-xs text-slate-600">
                <input type="checkbox" checked={flags.is_competitor} onChange={() => toggleFlag("is_competitor")} className="h-4 w-4 accent-[#3B82F6]" />
                Concurrent
              </label>
              <label className="flex items-center gap-2 text-xs text-slate-600">
                <input type="checkbox" checked={flags.is_too_large} onChange={() => toggleFlag("is_too_large")} className="h-4 w-4 accent-[#3B82F6]" />
                Trop grand
              </label>
            </div>
          </Section>

          <Section title="Notes">
            <EditableText table="prospects" id={prospect.id} field="notes" label="Notes (Narcisse)" value={prospect.notes} multiline />
            <div className="mt-3">
              <EditableText
                table="prospects"
                id={prospect.id}
                field="marek_notes"
                label="Notes de Marek (éditable par Marek seulement)"
                value={prospect.marek_notes}
                multiline
                disabled={!isPresident}
              />
            </div>
            <div className="mt-3">
              <EditableText table="prospects" id={prospect.id} field="response_received" label="Résumé de la réponse reçue" value={prospect.response_received} multiline />
            </div>
          </Section>

          <Section title="Historique des interactions">
            <InteractionTimeline
              prospectId={prospect.id}
              initialInteractions={interactions}
              profileMap={profileMap}
            />
          </Section>

          <Section title="Scripts & courriels">
            <ProspectScripts scripts={scripts} />
          </Section>
        </div>

        <div className="space-y-6">
          <Section title="Statut & priorité">
            <div className="grid grid-cols-1 gap-3">
              <EditableSelect
                table="prospects"
                id={prospect.id}
                field="status"
                label="Statut"
                value={prospect.status}
                options={Object.entries(PROSPECT_STATUS).map(([value, s]) => ({ value, label: s.label }))}
                onSaved={(v) => setStatus(v as Prospect["status"])}
              />
              <EditableSelect
                table="prospects"
                id={prospect.id}
                field="priority"
                label="Priorité"
                value={prospect.priority}
                options={Object.entries(PRIORITY).map(([value, s]) => ({ value, label: s.label }))}
                onSaved={(v) => setPriority(v as Prospect["priority"])}
              />
              <EditableDate table="prospects" id={prospect.id} field="date_first_contact" label="1er contact" value={prospect.date_first_contact} />
              <EditableDate table="prospects" id={prospect.id} field="date_last_contact" label="Dernier contact" value={prospect.date_last_contact} />
              <EditableDate table="prospects" id={prospect.id} field="date_next_followup" label="Prochain suivi" value={prospect.date_next_followup} />
            </div>
          </Section>

          <Section title="Fiche lead">
            <ProspectLeadPanel prospectId={prospect.id} lead={lead} />
          </Section>

          <Section title="Rappels">
            <ProspectReminders
              prospectId={prospect.id}
              initialReminders={reminders}
              profiles={profiles}
              currentUserId={currentProfile?.id ?? ""}
            />
          </Section>
        </div>
      </div>
    </div>
  );
}

function Section({ title, children }: { title: string; children: React.ReactNode }) {
  return (
    <section className="rounded-xl border border-slate-200 bg-white p-5">
      <h2 className="text-sm font-semibold text-[#0F172A]">{title}</h2>
      <div className="mt-3">{children}</div>
    </section>
  );
}
