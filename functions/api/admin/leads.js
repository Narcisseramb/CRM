import { isAuthorized, unauthorized, json } from '../../_lib/auth.js';

export async function onRequestGet({ request, env }) {
  if (!isAuthorized(request, env)) return unauthorized();
  const { results } = await env.DB.prepare(
    'SELECT id, name, email, service, message, lang, created_at FROM leads ORDER BY id DESC LIMIT 500'
  ).all();
  return json({ leads: results || [] });
}
