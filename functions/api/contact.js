import { json } from '../_lib/auth.js';

const EMAIL_RE = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

export async function onRequestPost({ request, env }) {
  let body;
  try {
    body = await request.json();
  } catch {
    return json({ error: 'Invalid request body' }, 400);
  }

  const name = String(body.name || '').trim().slice(0, 200);
  const email = String(body.email || '').trim().slice(0, 200);
  const service = String(body.service || '').trim().slice(0, 200);
  const message = String(body.message || '').trim().slice(0, 5000);
  const lang = body.lang === 'fr' ? 'fr' : 'en';

  if (!name || !email || !message) {
    return json({ error: 'Please fill in name, email and message.' }, 400);
  }
  if (!EMAIL_RE.test(email)) {
    return json({ error: 'Please provide a valid email address.' }, 400);
  }

  await env.DB.prepare(
    'INSERT INTO leads (name, email, service, message, lang) VALUES (?, ?, ?, ?, ?)'
  ).bind(name, email, service, message, lang).run();

  if (env.RESEND_API_KEY) {
    try {
      await fetch('https://api.resend.com/emails', {
        method: 'POST',
        headers: {
          Authorization: `Bearer ${env.RESEND_API_KEY}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          from: env.CONTACT_FROM_EMAIL || 'Rambelson Global <onboarding@resend.dev>',
          to: env.CONTACT_TO_EMAIL || 'contact@rambelsonglobal.com',
          reply_to: email,
          subject: service ? `New enquiry — ${service}` : 'New enquiry — Rambelson Global',
          text: `From: ${name} <${email}>\nService: ${service || '-'}\nLanguage: ${lang}\n\n${message}`,
        }),
      });
    } catch {
      // Lead is already stored in D1; email notification is best-effort only.
    }
  }

  return json({ ok: true });
}
