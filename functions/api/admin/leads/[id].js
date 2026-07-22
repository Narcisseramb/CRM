import { isAuthorized, unauthorized, json } from '../../../_lib/auth.js';

export async function onRequestDelete({ request, env, params }) {
  if (!isAuthorized(request, env)) return unauthorized();
  const id = Number.parseInt(params.id, 10);
  if (!Number.isFinite(id)) return json({ error: 'Invalid id' }, 400);
  await env.DB.prepare('DELETE FROM leads WHERE id = ?').bind(id).run();
  return json({ ok: true });
}
