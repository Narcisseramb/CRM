import { isAuthorized, unauthorized, json } from '../../../_lib/auth.js';

const FIELDS = ['sort_order', 'cat', 'icon', 'title_en', 'desc_en', 'tag_en', 'title_fr', 'desc_fr', 'tag_fr', 'link', 'link_label_en', 'link_label_fr', 'active'];

export async function onRequestPut({ request, env, params }) {
  if (!isAuthorized(request, env)) return unauthorized();
  const id = Number.parseInt(params.id, 10);
  if (!Number.isFinite(id)) return json({ error: 'Invalid id' }, 400);

  let b;
  try {
    b = await request.json();
  } catch {
    return json({ error: 'Invalid request body' }, 400);
  }

  const sets = [];
  const values = [];
  for (const f of FIELDS) {
    if (f in b) {
      sets.push(`${f} = ?`);
      values.push(f === 'active' ? (b[f] ? 1 : 0) : b[f]);
    }
  }
  if (!sets.length) return json({ error: 'No fields to update' }, 400);
  values.push(id);

  await env.DB.prepare(`UPDATE services SET ${sets.join(', ')} WHERE id = ?`).bind(...values).run();
  return json({ ok: true });
}

export async function onRequestDelete({ request, env, params }) {
  if (!isAuthorized(request, env)) return unauthorized();
  const id = Number.parseInt(params.id, 10);
  if (!Number.isFinite(id)) return json({ error: 'Invalid id' }, 400);
  await env.DB.prepare('DELETE FROM services WHERE id = ?').bind(id).run();
  return json({ ok: true });
}
