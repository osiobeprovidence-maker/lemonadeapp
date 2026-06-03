import crypto from 'crypto';
import { Readable } from 'stream';
import { describe, test, expect, vi } from 'vitest';
import webhookHandler from '../api/webhooks/paystack';
import connectHandler from '../api/paystack-connect';

// Simple mock request that supports raw body streaming for the webhook handler
function makeRawReq(method: string, rawBody: string, headers: Record<string, string> = {}) {
  const stream = new Readable();
  stream.push(rawBody);
  stream.push(null);
  // expose on() to match Node request event emitter
  const req: any = stream as any;
  req.method = method;
  req.headers = headers;
  return req;
}

function makeRes() {
  let statusCode = 200;
  let body: any = null;
  return {
    status(code: number) {
      statusCode = code;
      return this;
    },
    setHeader() {},
    json(obj: any) {
      body = obj;
      return { statusCode, body };
    },
    _get() {
      return { statusCode, body };
    },
  } as any;
}

describe('Paystack webhook handler', () => {
  test('valid signature forwards to Convex (mocked fetch)', async () => {
    const secret = 'test_paystack_secret';
    process.env.PAYSTACK_SECRET_KEY = secret;

    const payload = { event: 'charge.success', data: { reference: 'ref_123', amount: 10000 } };
    const raw = JSON.stringify(payload);
    const signature = crypto.createHmac('sha512', secret).update(raw).digest('hex');

    // stub global fetch to observe forward
    const sf = vi.fn().mockResolvedValue({ ok: true });
    // @ts-ignore
    global.fetch = sf;

    const req: any = makeRawReq('POST', raw, { 'x-paystack-signature': signature });
    const res: any = makeRes();

    const result = await webhookHandler(req, res);
    // handler returns a response object when run in Node; also we expect our mocked fetch to have been called
    expect(sf).toHaveBeenCalled();
    // ensure response acknowledged
    const out = res._get();
    expect(out.body).toEqual({ received: true });
  });
});

describe('Paystack connect endpoint', () => {
  test('forwards authorization code to Convex', async () => {
    const convexUrl = 'https://convex.example.com';
    const convexSecret = 'convex_secret';
    process.env.CONVEX_DEPLOYMENT_URL = convexUrl;
    process.env.CONVEX_WEBHOOK_SECRET = convexSecret;

    const sf = vi.fn().mockResolvedValue({ ok: true, json: async () => ({ success: true }) });
    // @ts-ignore
    global.fetch = sf;

    const body = { firebaseUid: 'uid_1', subscriptionId: 'subs_1', authorizationCode: 'auth_xyz' };
    const req: any = { method: 'POST', body };
    const res: any = makeRes();

    const out = await connectHandler(req, res);
    // verify fetch called to convex endpoint
    expect(sf).toHaveBeenCalled();
    const r = res._get();
    expect(r.body.success).toBe(true);
  });
});