js// POST /api/price
// Body: { willPay: boolean }
export async function onRequestPost(context) {
  let body;
  try {
    body = await context.request.json();
  } catch {
    return new Response(JSON.stringify({ error: 'bad request' }), { status: 400 });
  }

  const willPay = body.willPay === true;

  const raw = await context.env.MOKAMINDER_KV.get('counts');
  const counts = raw ? JSON.parse(raw) : { votes: 0, priceYes: 0, priceNo: 0 };
  if (willPay) counts.priceYes = (counts.priceYes || 0) + 1;
  else counts.priceNo = (counts.priceNo || 0) + 1;
  await context.env.MOKAMINDER_KV.put('counts', JSON.stringify(counts));

  return new Response(JSON.stringify({ ok: true }), {
    headers: { 'Content-Type': 'application/json' }
  });
}
