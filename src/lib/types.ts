export type ProspectStatus =
  | "non_contacté"
  | "contacté"
  | "relancé"
  | "intéressé"
  | "rdv_confirmé"
  | "lead_chaud"
  | "pas_intéressé"
  | "rappel_futur"
  | "retiré"
  | "client";

export type Priority = "urgente" | "haute" | "normale" | "basse";

export type LeadStatus =
  | "actif"
  | "rdv_planifié"
  | "rdv_fait"
  | "en_négociation"
  | "converti"
  | "perdu"
  | "rappel_futur";

export type LeadPriority = "urgente" | "haute" | "normale";

export type InteractionType =
  | "appel_sortant"
  | "appel_entrant"
  | "email_envoyé"
  | "email_reçu"
  | "relance"
  | "rdv"
  | "teams"
  | "message_marek";

export type ReminderType = "unique" | "mensuel" | "trimestriel" | "annuel";

export type ScriptType =
  | "script_appel"
  | "email_prospection"
  | "email_relance"
  | "email_agressif"
  | "email_reponse"
  | "fiche_lead";

export type Role = "prospecteur" | "president";

export type Profile = {
  id: string;
  email: string;
  full_name: string;
  role: Role;
  created_at: string;
}

export type Prospect = {
  id: string;
  created_at: string;
  updated_at: string;
  company_name: string;
  sector: string | null;
  address: string | null;
  city: string | null;
  province: string | null;
  postal_code: string | null;
  website: string | null;
  contact_name: string | null;
  contact_title: string | null;
  phone_main: string | null;
  phone_direct: string | null;
  email_main: string | null;
  email_general: string | null;
  contact2_name: string | null;
  contact2_title: string | null;
  contact2_email: string | null;
  mkb_angle: string[] | null;
  why_mkb: string | null;
  estimated_volume: string | null;
  employees_range: string | null;
  revenue_range: string | null;
  status: ProspectStatus;
  priority: Priority;
  semaine_contact: string | null;
  date_first_contact: string | null;
  date_last_contact: string | null;
  date_next_followup: string | null;
  notes: string | null;
  marek_notes: string | null;
  response_received: string | null;
  real_contact_found: string | null;
  is_competitor: boolean;
  is_too_large: boolean;
  has_lead_sheet: boolean;
  added_by: string | null;
}

export type Lead = {
  id: string;
  created_at: string;
  updated_at: string;
  prospect_id: string;
  lead_status: LeadStatus;
  lead_priority: LeadPriority;
  decision_maker_name: string | null;
  decision_maker_title: string | null;
  decision_maker_phone: string | null;
  decision_maker_email: string | null;
  referred_by: string | null;
  need_description: string | null;
  need_type: string[] | null;
  urgency_level: string | null;
  special_requirements: string | null;
  rdv_date: string | null;
  rdv_platform: string | null;
  rdv_link: string | null;
  rdv_notes: string | null;
  action_narcisse: string | null;
  action_marek: string | null;
  action_deadline: string | null;
  partner_review_date: string | null;
  follow_up_note: string | null;
  created_by: string | null;
}

export type LeadWithProspect = Lead & {
  prospect: Prospect;
};

export type Interaction = {
  id: string;
  created_at: string;
  prospect_id: string;
  interaction_type: InteractionType;
  direction: "sortant" | "entrant" | null;
  contact_name: string | null;
  contact_email: string | null;
  summary: string;
  full_message: string | null;
  outcome: string | null;
  next_action: string | null;
  next_action_date: string | null;
  done_by: string | null;
}

export type Reminder = {
  id: string;
  created_at: string;
  prospect_id: string | null;
  lead_id: string | null;
  reminder_date: string;
  title: string;
  description: string | null;
  assigned_to: string | null;
  is_done: boolean;
  done_at: string | null;
  reminder_type: ReminderType;
}

export type ReminderWithProspect = Reminder & {
  prospect: Pick<Prospect, "id" | "company_name"> | null;
};

export type ScriptEmail = {
  id: string;
  created_at: string;
  prospect_id: string | null;
  type: ScriptType;
  subject: string | null;
  content: string;
  is_sent: boolean;
  sent_at: string | null;
  created_by: string | null;
}

export type ScriptEmailWithProspect = ScriptEmail & {
  prospect: Pick<Prospect, "id" | "company_name"> | null;
};

// Minimal Database type for the Supabase client generics. Hand-written
// (no `supabase gen types` access in this environment) — keep in sync with
// supabase/migrations/0001_schema.sql if columns change.
export interface Database {
  public: {
    Tables: {
      profiles: {
        Row: Profile;
        Insert: Partial<Profile>;
        Update: Partial<Profile>;
        Relationships: [];
      };
      prospects: {
        Row: Prospect;
        Insert: Partial<Prospect>;
        Update: Partial<Prospect>;
        Relationships: [];
      };
      leads: {
        Row: Lead;
        Insert: Partial<Lead>;
        Update: Partial<Lead>;
        Relationships: [
          {
            foreignKeyName: "leads_prospect_id_fkey";
            columns: ["prospect_id"];
            isOneToOne: false;
            referencedRelation: "prospects";
            referencedColumns: ["id"];
          },
        ];
      };
      interactions: {
        Row: Interaction;
        Insert: Partial<Interaction>;
        Update: Partial<Interaction>;
        Relationships: [
          {
            foreignKeyName: "interactions_prospect_id_fkey";
            columns: ["prospect_id"];
            isOneToOne: false;
            referencedRelation: "prospects";
            referencedColumns: ["id"];
          },
        ];
      };
      reminders: {
        Row: Reminder;
        Insert: Partial<Reminder>;
        Update: Partial<Reminder>;
        Relationships: [
          {
            foreignKeyName: "reminders_prospect_id_fkey";
            columns: ["prospect_id"];
            isOneToOne: false;
            referencedRelation: "prospects";
            referencedColumns: ["id"];
          },
          {
            foreignKeyName: "reminders_lead_id_fkey";
            columns: ["lead_id"];
            isOneToOne: false;
            referencedRelation: "leads";
            referencedColumns: ["id"];
          },
        ];
      };
      scripts_emails: {
        Row: ScriptEmail;
        Insert: Partial<ScriptEmail>;
        Update: Partial<ScriptEmail>;
        Relationships: [
          {
            foreignKeyName: "scripts_emails_prospect_id_fkey";
            columns: ["prospect_id"];
            isOneToOne: false;
            referencedRelation: "prospects";
            referencedColumns: ["id"];
          },
        ];
      };
    };
    Views: Record<string, never>;
    Functions: Record<string, never>;
    Enums: Record<string, never>;
    CompositeTypes: Record<string, never>;
  };
}
