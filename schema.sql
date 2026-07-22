-- Rambelson Global — D1 schema + seed data
-- Run with: wrangler d1 execute rambelson-global-db --remote --file=./schema.sql

CREATE TABLE IF NOT EXISTS leads (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  name TEXT NOT NULL,
  email TEXT NOT NULL,
  service TEXT,
  message TEXT NOT NULL,
  lang TEXT NOT NULL DEFAULT 'en',
  created_at TEXT NOT NULL DEFAULT (datetime('now'))
);

CREATE TABLE IF NOT EXISTS quiz_results (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  score INTEGER NOT NULL,
  max_score INTEGER NOT NULL,
  correct_count INTEGER NOT NULL,
  total_questions INTEGER NOT NULL,
  first_try_count INTEGER NOT NULL,
  created_at TEXT NOT NULL DEFAULT (datetime('now'))
);

CREATE TABLE IF NOT EXISTS services (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  sort_order INTEGER NOT NULL DEFAULT 0,
  cat TEXT NOT NULL,
  icon TEXT NOT NULL,
  title_en TEXT NOT NULL,
  desc_en TEXT NOT NULL,
  tag_en TEXT NOT NULL,
  title_fr TEXT NOT NULL,
  desc_fr TEXT NOT NULL,
  tag_fr TEXT NOT NULL,
  link TEXT,
  link_label_en TEXT,
  link_label_fr TEXT,
  active INTEGER NOT NULL DEFAULT 1
);

CREATE TABLE IF NOT EXISTS faqs (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  sort_order INTEGER NOT NULL DEFAULT 0,
  question_en TEXT NOT NULL,
  answer_en TEXT NOT NULL,
  question_fr TEXT NOT NULL,
  answer_fr TEXT NOT NULL,
  active INTEGER NOT NULL DEFAULT 1
);

DELETE FROM services;
DELETE FROM faqs;

INSERT INTO services (sort_order, cat, icon, title_en, desc_en, tag_en, title_fr, desc_fr, tag_fr, link, link_label_en, link_label_fr, active) VALUES
(1,'language','🌐','Translation & interpretation','Professional translation and live interpretation with nearly a decade of experience across medical, humanitarian, legal and business content.','EN · FR · Malagasy','Traduction & interprétation','Traduction professionnelle et interprétation en direct, avec près de dix ans d''expérience dans les domaines médical, humanitaire, juridique et commercial.','EN · FR · Malagasy',NULL,NULL,NULL,1),
(2,'language','✨','Transcription & subtitling','Accurate transcription of Malagasy audio and video, translated into English with clean, broadcast-ready subtitles.','Malagasy → EN','Transcription & sous-titrage','Transcription fidèle de contenus audio et vidéo en malgache, traduits en anglais avec des sous-titres soignés, prêts à diffuser.','Malgache → EN',NULL,NULL,NULL,1),
(3,'language','📚','Learn Malagasy','Structured Malagasy lessons for travelers, researchers and expats — taught by a native speaker with real teaching experience.','Language coaching','Apprendre le malgache','Cours de malgache structurés pour voyageurs, chercheurs et expatriés — enseignés par un locuteur natif ayant une réelle expérience pédagogique.','Cours de langue',NULL,NULL,NULL,1),
(4,'business','🏢','Company registration in Madagascar','End-to-end business facilitation: register your company with bilingual documentation, power-of-attorney handling and progress reporting.','Business setup','Création d''entreprise à Madagascar','Accompagnement complet : création de votre société avec documentation bilingue, gestion de procuration et suivi régulier de l''avancement.','Création d''entreprise','guide-company-registration-madagascar.html','Free 2026 guide ↗','Guide gratuit 2026 ↗',1),
(5,'business','🔍','Local sourcing & market research','Supplier identification, price benchmarking, B2B connections and on-the-ground verification across Madagascar''s key sectors.','Market entry','Sourcing local & étude de marché','Identification de fournisseurs, comparaison des prix, mise en relation B2B et vérification sur le terrain dans les secteurs clés de Madagascar.','Entrée sur le marché',NULL,NULL,NULL,1),
(6,'digital','👥','Facebook group growth','Grow your Facebook group with real, engaged members through organic promotion — no bots, no fake accounts.','Social media','Croissance de groupe Facebook','Développez votre groupe Facebook avec de vrais membres engagés grâce à une promotion organique — aucun bot, aucun faux compte.','Réseaux sociaux',NULL,NULL,NULL,1),
(7,'digital','💻','WordPress websites','Design, build and maintain WordPress and WooCommerce sites — multilingual setup, migrations, e-commerce and ongoing support.','Web services','Sites WordPress','Conception, création et maintenance de sites WordPress et WooCommerce — configuration multilingue, migrations, e-commerce et support continu.','Services web',NULL,NULL,NULL,1),
(8,'digital','📊','B2B prospecting & virtual assistance','Cold calling, email outreach, CRM pipeline management and lead generation for North American and European markets.','Sales support','Prospection B2B & assistance virtuelle','Démarchage téléphonique, emailing, gestion de pipeline CRM et génération de leads pour les marchés nord-américain et européen.','Support commercial',NULL,NULL,NULL,1),
(9,'travel','🧭','Madagascar trip planning','Custom itineraries, overland expedition guides and on-the-ground insight to plan and organize your journey across Madagascar.','Travel','Organisation de voyage à Madagascar','Itinéraires sur mesure, guides d''expédition terrestre et connaissance du terrain pour planifier et organiser votre voyage à travers Madagascar.','Voyage',NULL,NULL,NULL,1);

INSERT INTO faqs (sort_order, question_en, answer_en, question_fr, answer_fr, active) VALUES
(1,'Do you work with clients in my country?','Yes — we serve clients worldwide, with most work coming from Canada, the United States, France, Switzerland, the UK and Australia. Everything is done remotely by email, WhatsApp and video call, in English or French.','Travaillez-vous avec des clients dans mon pays ?','Oui — nous servons des clients dans le monde entier, principalement au Canada, aux États-Unis, en France, en Suisse, au Royaume-Uni et en Australie. Tout se fait à distance par email, WhatsApp et appel vidéo, en anglais ou en français.',1),
(2,'How much does it cost to register a company in Madagascar?','It depends on the company type (SARL or SARLU) and the package. Every project starts with a free itemized quote — official government fees are always billed at actual cost with receipts.','Combien coûte la création d''une entreprise à Madagascar ?','Cela dépend du type de société (SARL ou SARLU) et de la formule choisie. Chaque projet commence par un devis détaillé gratuit — les frais officiels sont toujours facturés au coût réel, justificatifs à l''appui.',1),
(3,'How do payments work?','Written quote first. We accept PayPal, Visa/Mastercard via secure Payoneer payment request, bank transfer (USD, EUR, CHF, CAD) and Fiverr. 50% deposit for larger projects.','Comment fonctionnent les paiements ?','Un devis écrit est envoyé en premier. Nous acceptons PayPal, Visa/Mastercard via une demande de paiement Payoneer sécurisée, le virement bancaire (USD, EUR, CHF, CAD) et Fiverr. Acompte de 50 % pour les projets importants.',1),
(4,'How fast do you reply and deliver?','We reply within one business day. Translations are often delivered within 24–72 hours, and every quote includes a clear deadline.','Quels sont vos délais de réponse et de livraison ?','Nous répondons sous un jour ouvré. Les traductions sont souvent livrées sous 24 à 72 heures, et chaque devis précise un délai clair.',1),
(5,'Can I verify your reviews?','Yes — all testimonials are verified client reviews from our public Fiverr profile, where you can read every review in full.','Puis-je vérifier vos avis clients ?','Oui — tous les témoignages sont des avis clients vérifiés provenant de notre profil Fiverr public, où vous pouvez lire chaque avis en entier.',1),
(6,'Do you sign NDAs?','Yes. Documents and data are never shared, and we gladly sign a non-disclosure agreement before any project.','Signez-vous des accords de confidentialité (NDA) ?','Oui. Les documents et données ne sont jamais partagés, et nous signons volontiers un accord de confidentialité avant tout projet.',1);
