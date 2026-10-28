// Cloudflare Pages Function: POST /api/signup
// Keeps Joshua's own tagged copy of every newsletter signup (quiz and EchoOS "Get notified").
// The browser subscribes the visitor to Substack separately; this only stores the row.
// Forwards to the shared Google Apps Script receiver, which appends to the
// "Social Money Models signups" tab of the Sheet "Leads (website forms)".
// Env (Pages > Settings > Variables, encrypted): APPS_SCRIPT_URL, FORM_SECRET.

const EMAIL = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
const ORIGINS = ['https://socialmoneymodels.com', 'https://www.socialmoneymodels.com'];
const SOURCES = { quiz: 'Quiz', echoos: 'EchoOS: get notified' };
const STEPS = { prereq: 'Prereq: offer and list', start: 'Step 0 and 1: start', dm: 'Step 2: DM to booked call', close: 'Step 3: the close call' };
const clean = (v, max) => String(v ?? '').replace(/[\u0000-\u001F\u007F]/g, ' ').trim().slice(0, max);

const json = (body, status = 200) => new Response(JSON.stringify(body), {
  status, headers: { 'content-type': 'application/json', 'cache-control': 'no-store' },
});

export async function onRequestPost({ request, env }) {
  if (!ORIGINS.includes(request.headers.get('origin') || '')) return json({ ok: false, error: 'origin' }, 403);

  let d;
  try { d = await request.json(); } catch { return json({ ok: false, error: 'bad_request' }, 400); }

  if (clean(d.company_site, 10)) return json({ ok: true }); // honeypot: pretend, store nothing

  const email = clean(d.email, 200).toLowerCase();
  const source = SOURCES[d.source] ? d.source : '';
  if (!EMAIL.test(email) || !source) return json({ ok: false, error: 'invalid' }, 400);
  const step = source === 'quiz' && STEPS[d.step] ? d.step : '';

  const tags = ['socialmoneymodels', source === 'quiz' ? 'quiz' : 'echoos-waitlist'];
  if (step) tags.push('step-' + step);

  if (!env.APPS_SCRIPT_URL || !env.FORM_SECRET) return json({ ok: false, error: 'not_configured' }, 500);

  const res = await fetch(env.APPS_SCRIPT_URL, {
    method: 'POST',
    redirect: 'follow',
    headers: { 'content-type': 'application/json' },
    body: JSON.stringify({
      secret: env.FORM_SECRET,
      kind: 'signup',
      email,
      tags: tags.join(', '),
      source: SOURCES[source],
      step: step ? STEPS[step] : '',
      q1: source === 'quiz' ? clean(d.q1, 200) : '',
      q2: source === 'quiz' ? clean(d.q2, 200) : '',
      page: clean(request.headers.get('referer'), 300),
      country: request.headers.get('CF-IPCountry') || '',
      ts: new Date().toISOString(),
    }),
  }).catch(() => null);
  const out = res ? await res.json().catch(() => ({})) : {};
  return out.ok ? json({ ok: true }) : json({ ok: false, error: 'store_failed' }, 502);
}
