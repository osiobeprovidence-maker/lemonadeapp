import crypto from 'crypto';

const getPaystackSecret = () => process.env.PAYSTACK_SECRET_KEY || process.env.PAYSTACK_SECRET || process.env.PAYSTACK_KEY;

async function rawBody(req: any) {
  return new Promise<string>((resolve, reject) => {
    const chunks: any[] = [];
    req.on('data', (chunk: any) => chunks.push(chunk));
    req.on('end', () => resolve(Buffer.concat(chunks).toString('utf8')));
    req.on('error', reject);
  });
}

export default async function handler(req: any, res: any) {
  if (req.method !== 'POST') {
    res.setHeader('Allow', 'POST');
    return res.status(405).json({ error: 'Method not allowed' });
  }

  const secret = getPaystackSecret();
  if (!secret) {
    console.warn('Paystack secret not configured');
    return res.status(500).json({ error: 'Paystack secret not configured' });
  }

  const signature = String(req.headers['x-paystack-signature'] || '');
  const body = await rawBody(req);
  const computed = crypto.createHmac('sha512', secret).update(body).digest('hex');
  if (computed !== signature) {
    console.warn('Invalid Paystack signature', { computed, signature });
    return res.status(400).json({ error: 'Invalid signature' });
  }

  let payload: any;
  try {
    payload = JSON.parse(body);
  } catch (err) {
    console.warn('Invalid JSON in Paystack webhook');
    return res.status(400).json({ error: 'Invalid JSON' });
  }

  // Forward to Convex webhook endpoint if configured. This lets Convex handle business logic.
  const convexUrl = process.env.CONVEX_DEPLOYMENT_URL;
  const convexSecret = process.env.CONVEX_WEBHOOK_SECRET;
  if (convexUrl && convexSecret) {
    try {
      await fetch(`${convexUrl.replace(/\/$/, '')}/api/webhooks/paystack`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'x-convex-webhook-secret': convexSecret,
          'Convex-Webhook-Secret': convexSecret,
        },
        body: JSON.stringify(payload),
      });
    } catch (err) {
      console.error('Failed to forward Paystack webhook to Convex', err);
    }
  } else {
    // If Convex isn't configured, attempt to handle common events locally.
    try {
      const event = payload.event || payload.event_type || null;
      if (event === 'charge.success' || event === 'charge.successful') {
        // Best-effort: verify transaction via Paystack verify API then return.
        // Use server-side secret to hit Paystack verify endpoint.
        const secretKey = secret;
        const reference = payload?.data?.reference || payload?.data?.id || null;
        if (reference && secretKey) {
          await fetch(`https://api.paystack.co/transaction/verify/${encodeURIComponent(reference)}`, {
            headers: { Authorization: `Bearer ${secretKey}` },
          });
        }
      }
    } catch (err) {
      console.error('Local processing of Paystack webhook failed', err);
    }
  }

  // Acknowledge quickly
  return res.status(200).json({ received: true });
}
