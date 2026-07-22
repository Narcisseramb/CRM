import { json } from '../_lib/auth.js';

function toInt(v, fallback = 0) {
  const n = Number.parseInt(v, 10);
  return Number.isFinite(n) ? n : fallback;
}

export async function onRequestPost({ request, env }) {
  let body;
  try {
    body = await request.json();
  } catch {
    return json({ error: 'Invalid request body' }, 400);
  }

  const score = toInt(body.score);
  const maxScore = toInt(body.maxScore);
  const correctCount = toInt(body.correctCount);
  const totalQuestions = toInt(body.totalQuestions);
  const firstTryCount = toInt(body.firstTryCount);

  if (totalQuestions <= 0 || maxScore <= 0) {
    return json({ error: 'Invalid quiz result payload' }, 400);
  }

  await env.DB.prepare(
    `INSERT INTO quiz_results (score, max_score, correct_count, total_questions, first_try_count)
     VALUES (?, ?, ?, ?, ?)`
  ).bind(score, maxScore, correctCount, totalQuestions, firstTryCount).run();

  return json({ ok: true });
}
