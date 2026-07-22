import { isAuthorized, unauthorized, json } from '../../_lib/auth.js';

export async function onRequestGet({ request, env }) {
  if (!isAuthorized(request, env)) return unauthorized();

  const { results } = await env.DB.prepare(
    'SELECT id, score, max_score, correct_count, total_questions, first_try_count, created_at FROM quiz_results ORDER BY id DESC LIMIT 500'
  ).all();

  const rows = results || [];
  const count = rows.length;
  const avgPct = count
    ? Math.round((rows.reduce((sum, r) => sum + r.score / r.max_score, 0) / count) * 100)
    : 0;

  return json({ results: rows, summary: { count, avgPct } });
}
