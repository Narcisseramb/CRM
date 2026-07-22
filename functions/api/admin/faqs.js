import { isAuthorized, unauthorized, json } from '../../_lib/auth.js';

export async function onRequestGet({ request, env }) {
  if (!isAuthorized(request, env)) return unauthorized();
  const { results } = await env.DB.prepare(
    'SELECT * FROM faqs ORDER BY sort_order ASC, id ASC'
  ).all();
  return json({ faqs: results || [] });
}

export async function onRequestPost({ request, env }) {
  if (!isAuthorized(request, env)) return unauthorized();
  let b;
  try {
    b = await request.json();
  } catch {
    return json({ error: 'Invalid request body' }, 400);
  }

  const required = ['question_en', 'answer_en', 'question_fr', 'answer_fr'];
  for (const f of required) {
    if (!String(b[f] || '').trim()) return json({ error: `Missing field: ${f}` }, 400);
  }

  const result = await env.DB.prepare(
    `INSERT INTO faqs (sort_order, question_en, answer_en, question_fr, answer_fr, active)
     VALUES (?, ?, ?, ?, ?, ?)`
  ).bind(
    Number.isFinite(Number(b.sort_order)) ? Number(b.sort_order) : 0,
    b.question_en, b.answer_en, b.question_fr, b.answer_fr,
    b.active === false ? 0 : 1
  ).run();

  return json({ ok: true, id: result.meta.last_row_id });
}
