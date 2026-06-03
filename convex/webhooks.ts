import { v } from 'convex/values';
import { httpAction } from './_generated/server';
import { api } from './_generated/api';

const SECRET_HEADER = 'x-convex-webhook-secret';

export default httpAction(async (ctx, req) => {
  const secret = process.env.CONVEX_WEBHOOK_SECRET;
  if (!secret) {
    return new Response(JSON.stringify({ error: 'Convex webhook secret not configured' }), { status: 500 });
  }

  const header = req.headers.get(SECRET_HEADER) || req.headers.get('Convex-Webhook-Secret') || '';
  if (header !== secret) {
    return new Response(JSON.stringify({ error: 'Unauthorized' }), { status: 401 });
  }

  let payload: any;
  try {
    payload = await req.json();
  } catch (err) {
    return new Response(JSON.stringify({ error: 'Invalid JSON' }), { status: 400 });
  }

  const event = payload?.event || payload?.event_type || null;

  try {
    if (event === 'charge.success' || event === 'charge.successful') {
      const tx = payload.data || payload;
      // If metadata indicates a wallet topup, call creditWalletAfterPaystack
      const meta = tx.metadata || {};
      if (meta?.product === 'wallet_topup' || meta?.type === 'wallet_topup') {
        await ctx.runMutation(api.payments.creditWalletAfterPaystack, {
          firebaseUid: meta.firebaseUid || meta.firebaseUid || null,
          userId: meta.userId || null,
          coins: meta.coins || meta.amount || 0,
          nairaAmount: Number(tx.amount) / 100,
          reference: tx.reference || tx.id,
          providerPayload: tx,
        });
        return new Response(JSON.stringify({ ok: true }));
      }

      // Else if metadata indicates premium activation, call activatePremiumAfterPaystack
      if (meta?.planType || meta?.premium) {
        await ctx.runMutation(api.payments.activatePremiumAfterPaystack, {
          firebaseUid: meta.firebaseUid || null,
          userId: meta.userId || null,
          reference: tx.reference || tx.id,
          planType: meta.planType || 'premium',
          billingCycle: meta.billingCycle || 'monthly',
          amount: Number(tx.amount) / 100,
          providerPayload: tx,
        });
        return new Response(JSON.stringify({ ok: true }));
      }

      // Otherwise record a generic payment
      await ctx.runMutation(api.payments.record, {
        userId: meta.userId || null,
        type: 'premium',
        amount: Number(tx.amount) / 100,
        currency: 'NGN',
        status: tx.status || 'success',
        reference: tx.reference || tx.id,
        provider: 'paystack',
        providerPayload: tx,
        metadata: meta,
      });
      return new Response(JSON.stringify({ ok: true }));
    }

    if (event === 'charge.failed' || event === 'charge.failedful') {
      const tx = payload.data || payload;
      const meta = tx.metadata || {};
      await ctx.runMutation(api.creatorPremium.listFailedPayments, {});
      // Best-effort: insert a failed payment record
      await ctx.runMutation(api.payments.record, {
        userId: meta.userId || null,
        type: 'refund',
        amount: Number(tx.amount || 0) / 100,
        currency: 'NGN',
        status: 'failed',
        reference: tx.reference || tx.id,
        provider: 'paystack',
        providerPayload: tx,
        metadata: meta,
      });
      return new Response(JSON.stringify({ ok: true }));
    }

    // Unhandled event: ack
    return new Response(JSON.stringify({ ok: true }));
  } catch (err: any) {
    return new Response(JSON.stringify({ error: String(err?.message || err) }), { status: 500 });
  }
});
