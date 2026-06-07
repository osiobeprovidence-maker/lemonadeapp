// Server endpoint to accept Paystack authorization codes from the client
// and forward them to Convex for secure storage via the creatorPremium.connectPaymentMethod

export default async function handler(req: any, res: any) {
  if (req.method !== 'POST') {
    res.setHeader('Allow', 'POST');
    return res.status(405).json({ error: 'Method not allowed' });
  }

  const { firebaseUid, subscriptionId, paystackCustomerId, authorizationCode } = req.body || {};
  if (!firebaseUid || !subscriptionId || !authorizationCode) {
    return res.status(400).json({ error: 'firebaseUid, subscriptionId and authorizationCode are required.' });
  }

  const convexUrl = process.env.CONVEX_DEPLOYMENT_URL;
  const convexSecret = process.env.CONVEX_WEBHOOK_SECRET;
  if (!convexUrl || !convexSecret) {
    return res.status(500).json({ error: 'Convex webhook endpoint not configured on the server.' });
  }

  try {
    const resp = await fetch(`${convexUrl.replace(/\/$/, '')}/api/creatorPremium/connectPaymentMethod`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'x-convex-webhook-secret': convexSecret,
      },
      body: JSON.stringify({ firebaseUid, subscriptionId, paystackCustomerId, paystackAuthorizationCode: authorizationCode }),
    });

    const data = await resp.json().catch(() => ({}));
    if (!resp.ok) {
      return res.status(502).json({ error: 'Failed to forward to Convex', details: data });
    }

    return res.status(200).json({ success: true, result: data });
  } catch (err) {
    console.error('paystack-connect error', err);
    return res.status(500).json({ error: 'Internal server error' });
  }
}
