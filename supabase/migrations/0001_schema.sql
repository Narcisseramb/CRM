-- MKB Logistics CRM — schéma initial
-- Tables principales, extensions requises.

create extension if not exists pgcrypto;

-- ---------------------------------------------------------------------------
-- profiles : étend auth.users avec le rôle (prospecteur | president)
-- ---------------------------------------------------------------------------
create table profiles (
  id uuid primary key references auth.users(id) on delete cascade,
  email text not null unique,
  full_name text not null,
  role text not null default 'prospecteur' check (role in ('prospecteur', 'president')),
  created_at timestamptz default now()
);

-- Crée automatiquement un profil lors de l'inscription d'un utilisateur Supabase Auth.
create or replace function public.handle_new_user()
returns trigger as $$
begin
  insert into public.profiles (id, email, full_name, role)
  values (
    new.id,
    new.email,
    case
      when new.email = 'narcisse@mkblogistics.ca' then 'Narcisse Rambeloson'
      when new.email = 'marek@mkblogistics.ca' then 'Marek Bailly'
      else split_part(new.email, '@', 1)
    end,
    case
      when new.email = 'marek@mkblogistics.ca' then 'president'
      else 'prospecteur'
    end
  )
  on conflict (id) do nothing;
  return new;
end;
$$ language plpgsql security definer set search_path = public;

create trigger on_auth_user_created
  after insert on auth.users
  for each row execute function public.handle_new_user();

-- ---------------------------------------------------------------------------
-- prospects
-- ---------------------------------------------------------------------------
create table prospects (
  id uuid default gen_random_uuid() primary key,
  created_at timestamptz default now(),
  updated_at timestamptz default now(),

  -- Identification
  company_name text not null,
  sector text,
  address text,
  city text,
  province text default 'QC',
  postal_code text,
  website text,

  -- Contact principal
  contact_name text,
  contact_title text,
  phone_main text,
  phone_direct text,
  email_main text,
  email_general text,

  -- Contact secondaire
  contact2_name text,
  contact2_title text,
  contact2_email text,

  -- Qualification MKB
  mkb_angle text[],
  why_mkb text,
  estimated_volume text,
  employees_range text,
  revenue_range text,

  -- Statut CRM
  status text not null default 'non_contacté'
    check (status in (
      'non_contacté', 'contacté', 'relancé', 'intéressé', 'rdv_confirmé',
      'lead_chaud', 'pas_intéressé', 'rappel_futur', 'retiré', 'client'
    )),

  priority text default 'normale'
    check (priority in ('urgente', 'haute', 'normale', 'basse')),

  semaine_contact text,
  date_first_contact date,
  date_last_contact date,
  date_next_followup date,

  -- Notes et historique
  notes text,
  marek_notes text,
  response_received text,
  real_contact_found text,

  -- Flags
  is_competitor boolean default false,
  is_too_large boolean default false,
  has_lead_sheet boolean default false,
  added_by uuid references auth.users(id) default auth.uid()
);

create index idx_prospects_status on prospects(status);
create index idx_prospects_priority on prospects(priority);
create index idx_prospects_province on prospects(province);
create index idx_prospects_company_name on prospects using gin (to_tsvector('french', company_name));

-- ---------------------------------------------------------------------------
-- leads
-- ---------------------------------------------------------------------------
create table leads (
  id uuid default gen_random_uuid() primary key,
  created_at timestamptz default now(),
  updated_at timestamptz default now(),
  prospect_id uuid references prospects(id) on delete cascade,

  lead_status text not null default 'actif'
    check (lead_status in (
      'actif', 'rdv_planifié', 'rdv_fait', 'en_négociation',
      'converti', 'perdu', 'rappel_futur'
    )),

  lead_priority text default 'haute'
    check (lead_priority in ('urgente', 'haute', 'normale')),

  decision_maker_name text,
  decision_maker_title text,
  decision_maker_phone text,
  decision_maker_email text,
  referred_by text,

  need_description text,
  need_type text[],
  urgency_level text,
  special_requirements text,

  rdv_date timestamptz,
  rdv_platform text,
  rdv_link text,
  rdv_notes text,

  action_narcisse text,
  action_marek text,
  action_deadline date,

  partner_review_date date,
  follow_up_note text,
  created_by uuid references auth.users(id) default auth.uid()
);

create index idx_leads_prospect_id on leads(prospect_id);
create index idx_leads_status on leads(lead_status);
create index idx_leads_priority on leads(lead_priority);

-- ---------------------------------------------------------------------------
-- interactions
-- ---------------------------------------------------------------------------
create table interactions (
  id uuid default gen_random_uuid() primary key,
  created_at timestamptz default now(),
  prospect_id uuid references prospects(id) on delete cascade,

  interaction_type text not null
    check (interaction_type in (
      'appel_sortant', 'appel_entrant', 'email_envoyé', 'email_reçu',
      'relance', 'rdv', 'teams', 'message_marek'
    )),

  direction text check (direction in ('sortant', 'entrant')),
  contact_name text,
  contact_email text,
  summary text not null,
  full_message text,
  outcome text,
  next_action text,
  next_action_date date,
  done_by uuid references auth.users(id) default auth.uid()
);

create index idx_interactions_prospect_id on interactions(prospect_id);
create index idx_interactions_created_at on interactions(created_at desc);

-- ---------------------------------------------------------------------------
-- reminders
-- ---------------------------------------------------------------------------
create table reminders (
  id uuid default gen_random_uuid() primary key,
  created_at timestamptz default now(),
  prospect_id uuid references prospects(id) on delete cascade,
  lead_id uuid references leads(id) on delete set null,

  reminder_date date not null,
  title text not null,
  description text,
  assigned_to uuid references auth.users(id),
  is_done boolean default false,
  done_at timestamptz,

  reminder_type text default 'unique'
    check (reminder_type in ('unique', 'mensuel', 'trimestriel', 'annuel'))
);

create index idx_reminders_date on reminders(reminder_date);
create index idx_reminders_assigned_to on reminders(assigned_to);
create index idx_reminders_is_done on reminders(is_done);

-- ---------------------------------------------------------------------------
-- scripts_emails
-- ---------------------------------------------------------------------------
create table scripts_emails (
  id uuid default gen_random_uuid() primary key,
  created_at timestamptz default now(),
  prospect_id uuid references prospects(id) on delete cascade,

  type text not null
    check (type in (
      'script_appel', 'email_prospection', 'email_relance',
      'email_agressif', 'email_reponse', 'fiche_lead'
    )),

  subject text,
  content text not null,
  is_sent boolean default false,
  sent_at timestamptz,
  created_by uuid references auth.users(id) default auth.uid()
);

create index idx_scripts_emails_prospect_id on scripts_emails(prospect_id);
create index idx_scripts_emails_type on scripts_emails(type);

-- ---------------------------------------------------------------------------
-- updated_at auto-maintenance
-- ---------------------------------------------------------------------------
create or replace function set_updated_at()
returns trigger as $$
begin
  new.updated_at = now();
  return new;
end;
$$ language plpgsql;

create trigger trg_prospects_updated_at
  before update on prospects
  for each row execute function set_updated_at();

create trigger trg_leads_updated_at
  before update on leads
  for each row execute function set_updated_at();

-- ---------------------------------------------------------------------------
-- marek_notes : éditable uniquement par le président (Marek)
-- ---------------------------------------------------------------------------
create or replace function protect_marek_notes()
returns trigger as $$
declare
  requester_role text;
begin
  if new.marek_notes is distinct from old.marek_notes then
    select role into requester_role from public.profiles where id = auth.uid();
    if requester_role is distinct from 'president' then
      new.marek_notes := old.marek_notes;
    end if;
  end if;
  return new;
end;
$$ language plpgsql security definer set search_path = public;

create trigger trg_protect_marek_notes
  before update on prospects
  for each row execute function protect_marek_notes();

-- ---------------------------------------------------------------------------
-- Realtime : publier les changements pour narcisse/marek en temps réel
-- ---------------------------------------------------------------------------
alter publication supabase_realtime add table prospects;
alter publication supabase_realtime add table leads;
alter publication supabase_realtime add table interactions;
alter publication supabase_realtime add table reminders;
alter publication supabase_realtime add table scripts_emails;
