-- Données pré-chargées — à exécuter APRÈS avoir créé les deux comptes
-- Supabase Auth (narcisse@mkblogistics.ca et marek@mkblogistics.ca), car ce
-- script résout assigned_to/created_by via ces adresses courriel.
--
-- Idempotent : peut être ré-exécuté sans dupliquer les lignes.

-- ---------------------------------------------------------------------------
-- Prospects (créés seulement s'ils n'existent pas déjà par nom d'entreprise)
-- ---------------------------------------------------------------------------
insert into prospects (company_name, contact_name, status, priority, has_lead_sheet)
select v.company_name, v.contact_name, v.status, 'haute', true
from (values
  ('EcoloPharm', 'Edith Pimparé', 'rdv_confirmé'),
  ('Econoplastik', 'Vincent Mathieu', 'rdv_confirmé'),
  ('Eddynet Inc.', 'Tanya Lodge', 'lead_chaud'),
  ('Acema Importations', 'Erica Dancose', 'rappel_futur'),
  ('Sitraco', 'Jacques Chabot', 'lead_chaud'),
  ('Super Remover', 'Sébastien Plourde', 'lead_chaud'),
  ('Quinco / Smart Tiles', 'Frédérick Provençal', 'rdv_confirmé')
) as v(company_name, contact_name, status)
where not exists (select 1 from prospects p where p.company_name = v.company_name);

insert into prospects (company_name, contact_name, status, priority)
select v.company_name, v.contact_name, 'rappel_futur', 'normale'
from (values
  ('Dolbeau Oxygène', 'Jade Bouchard'),
  ('Industries Plastipak', 'Marouane Oufrid'),
  ('NRC Industries', 'Cédric Mailloux'),
  ('Landry Flexible Packaging', 'Alain Lefebvre')
) as v(company_name, contact_name)
where not exists (select 1 from prospects p where p.company_name = v.company_name);

-- ---------------------------------------------------------------------------
-- Leads actifs
-- ---------------------------------------------------------------------------
insert into leads (prospect_id, lead_status, lead_priority, decision_maker_name, follow_up_note, action_marek)
select p.id, v.lead_status, 'urgente', v.decision_maker_name, v.follow_up_note, v.action_marek
from (values
  ('EcoloPharm', 'rdv_fait', 'Edith Pimparé', 'RDV passé — suivi Marek', 'Assurer le suivi post-RDV'),
  ('Econoplastik', 'rdv_planifié', 'Vincent Mathieu', 'RDV Teams 14 juillet 10h', null),
  ('Eddynet Inc.', 'actif', 'Tanya Lodge', 'Taux Flatbed 1 800$ — attente réponse', null),
  ('Acema Importations', 'rappel_futur', 'Erica Dancose', 'Rappel sept./oct. 2026', null),
  ('Sitraco', 'actif', 'Jacques Chabot', 'Référé par Léonard Gagnon', null),
  ('Super Remover', 'actif', 'Sébastien Plourde', 'Solvants USA — Marek rappelle', 'Rappeler le prospect'),
  ('Quinco / Smart Tiles', 'rdv_planifié', 'Frédérick Provençal', 'RDV semaine prochaine — Marek doit booker', 'Booker le RDV')
) as v(company_name, lead_status, decision_maker_name, follow_up_note, action_marek)
join prospects p on p.company_name = v.company_name
where not exists (
  select 1 from leads l where l.prospect_id = p.id
);

update leads set referred_by = 'Référé par Léonard Gagnon'
where prospect_id = (select id from prospects where company_name = 'Sitraco')
  and referred_by is null;

update leads set partner_review_date = '2027-02-01'
where prospect_id = (select id from prospects where company_name = 'Quinco / Smart Tiles')
  and partner_review_date is null;

-- ---------------------------------------------------------------------------
-- Rappels
-- ---------------------------------------------------------------------------
insert into reminders (prospect_id, reminder_date, title, assigned_to)
select p.id, v.reminder_date, v.title,
  (select id from profiles where email = v.assignee_email)
from (values
  ('Dolbeau Oxygène', date '2026-08-13', 'Rappeler Jade Bouchard — Dolbeau Oxygène', 'narcisse@mkblogistics.ca'),
  ('Industries Plastipak', date '2026-10-13', 'Rappeler Marouane Oufrid — Industries Plastipak', 'narcisse@mkblogistics.ca'),
  ('NRC Industries', date '2027-01-15', 'Rappeler Cédric Mailloux — NRC Industries', 'narcisse@mkblogistics.ca'),
  ('Quinco / Smart Tiles', date '2027-02-15', 'Rappel révision partenaire — Frédérick Provençal', 'marek@mkblogistics.ca'),
  ('Landry Flexible Packaging', date '2026-11-15', 'Rappeler Alain Lefebvre — Landry Flexible Packaging', 'narcisse@mkblogistics.ca')
) as v(company_name, reminder_date, title, assignee_email)
join prospects p on p.company_name = v.company_name
where not exists (
  select 1 from reminders r where r.prospect_id = p.id and r.title = v.title
);
