// POST /api/vote
// Body: { email: string | null }
// Increments the vote count server-side (client can't set an arbitrary number)
// and separately stores the email, deduplicated, without ever exposing that
// list back over the API.
export async function onRequestPost(context) {
  let body;
  try {
    body = await context.request.json();
  } catch {
    return new Response(JSON.stringify({ error: 'bad request' }), { status: 400 });
  }

  const email = typeof body.email === 'string'
    ? body.email.trim().slice(0, 200)
    : null;

  const raw = await context.env.MOKAMINDER_KV.get('counts');
  const counts = raw ? JSON.parse(raw) : { votes: 0, priceYes: 0, priceNo: 0 };
  counts.votes = (counts.votes || 0) + 1;
  await context.env.MOKAMINDER_KV.put('counts', JSON.stringify(counts));

  if (email) {
    const emailsRaw = await context.env.MOKAMINDER_KV.get('emails');
    const emails = emailsRaw ? JSON.parse(emailsRaw) : [];
    if (!emails.includes(email)) {
      emails.push(email);
      await context.env.MOKAMINDER_KV.put('emails', JSON.stringify(emails));
    }
  }

  return new Response(JSON.stringify({ votes: counts.votes }), {
    headers: { 'Content-Type': 'application/json' }
  });
}
