import { json } from '../_lib/auth.js';

export async function onRequestGet({ request, env }) {
  const url = new URL(request.url);
  const lang = url.searchParams.get('lang') === 'fr' ? 'fr' : 'en';

  const [services, faqs] = await Promise.all([
    env.DB.prepare('SELECT * FROM services WHERE active = 1 ORDER BY sort_order ASC, id ASC').all(),
    env.DB.prepare('SELECT * FROM faqs WHERE active = 1 ORDER BY sort_order ASC, id ASC').all(),
  ]);

  const mapService = (s) => ({
    id: s.id,
    cat: s.cat,
    icon: s.icon,
    title: lang === 'fr' ? s.title_fr : s.title_en,
    desc: lang === 'fr' ? s.desc_fr : s.desc_en,
    tag: lang === 'fr' ? s.tag_fr : s.tag_en,
    titleEn: s.title_en,
    link: s.link || null,
    linkLabel: (lang === 'fr' ? s.link_label_fr : s.link_label_en) || null,
  });

  const mapFaq = (f) => ({
    id: f.id,
    question: lang === 'fr' ? f.question_fr : f.question_en,
    answer: lang === 'fr' ? f.answer_fr : f.answer_en,
  });

  return json({
    lang,
    services: (services.results || []).map(mapService),
    faqs: (faqs.results || []).map(mapFaq),
  });
}
