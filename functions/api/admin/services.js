import { isAuthorized, unauthorized, json } from '../../_lib/auth.js';

export async function onRequestGet({ request, env }) {
  if (!isAuthorized(request, env)) return unauthorized();
  const { results } = await env.DB.prepare(
    'SELECT * FROM services ORDER BY sort_order ASC, id ASC'
  ).all();
  return json({ services: results || [] });
}

export async function onRequestPost({ request, env }) {
  if (!isAuthorized(request, env)) return unauthorized();
  let b;
  try {
    b = await request.json();
  } catch {
    return json({ error: 'Invalid request body' }, 400);
  }

  const required = ['cat', 'icon', 'title_en', 'desc_en', 'tag_en', 'title_fr', 'desc_fr', 'tag_fr'];
  for (const f of required) {
    if (!String(b[f] || '').trim()) return json({ error: `Missing field: ${f}` }, 400);
  }

  const result = await env.DB.prepare(
    `INSERT INTO services (sort_order, cat, icon, title_en, desc_en, tag_en, title_fr, desc_fr, tag_fr, link, link_label_en, link_label_fr, active)
     VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`
  ).bind(
    Number.isFinite(Number(b.sort_order)) ? Number(b.sort_order) : 0,
    b.cat, b.icon, b.title_en, b.desc_en, b.tag_en, b.title_fr, b.desc_fr, b.tag_fr,
    b.link || null, b.link_label_en || null, b.link_label_fr || null,
    b.active === false ? 0 : 1
  ).run();

  return json({ ok: true, id: result.meta.last_row_id });
}
