-- Row Level Security — Narcisse et Marek voient et modifient toutes les données
-- (marek_notes est protégé au niveau trigger dans 0001_schema.sql, pas ici).

alter table profiles enable row level security;
alter table prospects enable row level security;
alter table leads enable row level security;
alter table interactions enable row level security;
alter table reminders enable row level security;
alter table scripts_emails enable row level security;

-- profiles : tout utilisateur authentifié peut voir les profils (pour afficher
-- "assigné à Narcisse/Marek"), mais seulement modifier le sien.
create policy "profiles_select_authenticated" on profiles
  for select using (auth.role() = 'authenticated');

create policy "profiles_update_own" on profiles
  for update using (auth.uid() = id);

-- prospects
create policy "prospects_select_authenticated" on prospects
  for select using (auth.role() = 'authenticated');
create policy "prospects_insert_authenticated" on prospects
  for insert with check (auth.role() = 'authenticated');
create policy "prospects_update_authenticated" on prospects
  for update using (auth.role() = 'authenticated');
create policy "prospects_delete_authenticated" on prospects
  for delete using (auth.role() = 'authenticated');

-- leads
create policy "leads_select_authenticated" on leads
  for select using (auth.role() = 'authenticated');
create policy "leads_insert_authenticated" on leads
  for insert with check (auth.role() = 'authenticated');
create policy "leads_update_authenticated" on leads
  for update using (auth.role() = 'authenticated');
create policy "leads_delete_authenticated" on leads
  for delete using (auth.role() = 'authenticated');

-- interactions
create policy "interactions_select_authenticated" on interactions
  for select using (auth.role() = 'authenticated');
create policy "interactions_insert_authenticated" on interactions
  for insert with check (auth.role() = 'authenticated');
create policy "interactions_update_authenticated" on interactions
  for update using (auth.role() = 'authenticated');
create policy "interactions_delete_authenticated" on interactions
  for delete using (auth.role() = 'authenticated');

-- reminders
create policy "reminders_select_authenticated" on reminders
  for select using (auth.role() = 'authenticated');
create policy "reminders_insert_authenticated" on reminders
  for insert with check (auth.role() = 'authenticated');
create policy "reminders_update_authenticated" on reminders
  for update using (auth.role() = 'authenticated');
create policy "reminders_delete_authenticated" on reminders
  for delete using (auth.role() = 'authenticated');

-- scripts_emails
create policy "scripts_emails_select_authenticated" on scripts_emails
  for select using (auth.role() = 'authenticated');
create policy "scripts_emails_insert_authenticated" on scripts_emails
  for insert with check (auth.role() = 'authenticated');
create policy "scripts_emails_update_authenticated" on scripts_emails
  for update using (auth.role() = 'authenticated');
create policy "scripts_emails_delete_authenticated" on scripts_emails
  for delete using (auth.role() = 'authenticated');
