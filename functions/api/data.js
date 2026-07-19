// GET /api/data
// Returns the public vote/price counts only. Never returns the email list —
// that would leak every submitted address to anyone who calls this endpoint.
export async function onRequestGet(context) {
  const raw = await context.env.MOKAMINDER_KV.get('counts');
  const counts = raw ? JSON.parse(raw) : { votes: 0, priceYes: 0, priceNo: 0 };

  return new Response(JSON.stringify(counts), {
    headers: {
      'Content-Type': 'application/json',
      'Cache-Control': 'no-store'
    }
  });
}
