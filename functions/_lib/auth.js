export function isAuthorized(request, env) {
  const auth = request.headers.get('Authorization') || '';
  const match = auth.match(/^Bearer\s+(.+)$/i);
  const token = match ? match[1] : '';
  return !!env.ADMIN_TOKEN && token === env.ADMIN_TOKEN;
}

export function unauthorized() {
  return json({ error: 'Unauthorized' }, 401);
}

export function json(obj, status = 200) {
  return new Response(JSON.stringify(obj), {
    status,
    headers: { 'content-type': 'application/json' },
  });
}
