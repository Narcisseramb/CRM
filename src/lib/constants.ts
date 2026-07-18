import type {
  InteractionType,
  LeadPriority,
  LeadStatus,
  Priority,
  ProspectStatus,
  ReminderType,
  ScriptType,
} from "@/lib/types";

export const PROVINCES = ["QC", "ON", "AB", "BC", "MB", "SK", "NS", "NB", "NL", "PE"] as const;

export const MKB_ANGLES = [
  "FTL",
  "LTL",
  "Ocean Freight",
  "Air Freight",
  "Cross-border USA",
  "Entreposage",
  "Matières dangereuses",
  "Douanes",
] as const;

type BadgeStyle = { label: string; className: string };

// red = urgent, amber = en cours, green = intéressé/rdv, gray = pas intéressé
export const PROSPECT_STATUS: Record<ProspectStatus, BadgeStyle> = {
  non_contacté: { label: "Non contacté", className: "bg-slate-100 text-slate-600 border-slate-200" },
  contacté: { label: "Contacté", className: "bg-amber-50 text-amber-700 border-amber-200" },
  relancé: { label: "Relancé", className: "bg-amber-50 text-amber-700 border-amber-200" },
  intéressé: { label: "Intéressé", className: "bg-emerald-50 text-emerald-700 border-emerald-200" },
  rdv_confirmé: { label: "RDV confirmé", className: "bg-emerald-50 text-emerald-700 border-emerald-200" },
  lead_chaud: { label: "Lead chaud", className: "bg-red-50 text-red-700 border-red-200" },
  pas_intéressé: { label: "Pas intéressé", className: "bg-slate-100 text-slate-500 border-slate-200" },
  rappel_futur: { label: "Rappel futur", className: "bg-blue-50 text-blue-700 border-blue-200" },
  retiré: { label: "Retiré", className: "bg-slate-100 text-slate-400 border-slate-200" },
  client: { label: "Client", className: "bg-violet-50 text-violet-700 border-violet-200" },
};

export const PRIORITY: Record<Priority, BadgeStyle> = {
  urgente: { label: "Urgente", className: "bg-red-50 text-red-700 border-red-200" },
  haute: { label: "Haute", className: "bg-amber-50 text-amber-700 border-amber-200" },
  normale: { label: "Normale", className: "bg-slate-100 text-slate-600 border-slate-200" },
  basse: { label: "Basse", className: "bg-slate-50 text-slate-400 border-slate-200" },
};

export const LEAD_STATUS: Record<LeadStatus, BadgeStyle> = {
  actif: { label: "Actif", className: "bg-blue-50 text-blue-700 border-blue-200" },
  rdv_planifié: { label: "RDV planifié", className: "bg-amber-50 text-amber-700 border-amber-200" },
  rdv_fait: { label: "RDV fait", className: "bg-emerald-50 text-emerald-700 border-emerald-200" },
  en_négociation: { label: "En négociation", className: "bg-violet-50 text-violet-700 border-violet-200" },
  converti: { label: "Converti", className: "bg-emerald-100 text-emerald-800 border-emerald-300" },
  perdu: { label: "Perdu", className: "bg-slate-100 text-slate-500 border-slate-200" },
  rappel_futur: { label: "Rappel futur", className: "bg-blue-50 text-blue-700 border-blue-200" },
};

export const LEAD_PRIORITY: Record<LeadPriority, BadgeStyle> = {
  urgente: { label: "Urgente", className: "bg-red-50 text-red-700 border-red-200" },
  haute: { label: "Haute", className: "bg-amber-50 text-amber-700 border-amber-200" },
  normale: { label: "Normale", className: "bg-slate-100 text-slate-600 border-slate-200" },
};

export const INTERACTION_TYPE: Record<InteractionType, string> = {
  appel_sortant: "Appel sortant",
  appel_entrant: "Appel entrant",
  email_envoyé: "Email envoyé",
  email_reçu: "Email reçu",
  relance: "Relance",
  rdv: "RDV",
  teams: "Teams",
  message_marek: "Message de Marek",
};

export const REMINDER_TYPE: Record<ReminderType, string> = {
  unique: "Unique",
  mensuel: "Mensuel",
  trimestriel: "Trimestriel",
  annuel: "Annuel",
};

export const SCRIPT_TYPE: Record<ScriptType, string> = {
  script_appel: "Script d'appel",
  email_prospection: "Email de prospection",
  email_relance: "Email de relance",
  email_agressif: "Email agressif",
  email_reponse: "Email de réponse",
  fiche_lead: "Fiche lead",
};

export const BRAND = {
  navy: "#0F172A",
  blue: "#3B82F6",
};
