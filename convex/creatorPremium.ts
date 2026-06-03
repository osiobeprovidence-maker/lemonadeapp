import { v } from "convex/values";
import { api } from "./_generated/api";
import { mutation, query } from "./_generated/server";

const now = () => new Date().toISOString();
const addDaysIso = (dateIso: string, days: number) =>
  new Date(Date.parse(dateIso) + days * 24 * 60 * 60 * 1000).toISOString();
const addMonthsIso = (dateIso: string, months: number) => {
  const d = new Date(dateIso);
  d.setMonth(d.getMonth() + months);
  return d.toISOString();
};

async function getUserByFirebaseUid(ctx: any, firebaseUid: string) {
  return await ctx.db
    .query("users")
    .withIndex("by_firebaseUid", (q: any) => q.eq("firebaseUid", firebaseUid))
    .unique();
}

const PAYSTACK_SECRET = process.env.PAYSTACK_SECRET_KEY || process.env.PAYSTACK_SECRET || process.env.PAYSTACK_KEY || null;
async function paystackRequest(path: string, method = 'GET', body?: any) {
  if (!PAYSTACK_SECRET) throw new Error('Paystack secret not configured in environment.');
  const res = await fetch(`https://api.paystack.co${path}`, {
    method,
    headers: {
      Authorization: `Bearer ${PAYSTACK_SECRET}`,
      'Content-Type': 'application/json',
    },
    body: body ? JSON.stringify(body) : undefined,
  });
  const json = await res.json();
  if (!json) throw new Error('Empty response from Paystack');
  return json;
}

export const createPaystackCustomer = mutation({
  args: { firebaseUid: v.string(), email: v.string(), firstName: v.optional(v.string()), lastName: v.optional(v.string()), phone: v.optional(v.string()) },
  handler: async (ctx, args) => {
    const user = await getUserByFirebaseUid(ctx, args.firebaseUid);
    if (!user) throw new Error('User not found');
    const payload: any = { email: args.email };
    if (args.firstName) payload.first_name = args.firstName;
    if (args.lastName) payload.last_name = args.lastName;
    if (args.phone) payload.phone = args.phone;

    const resp = await paystackRequest('/customer', 'POST', payload);
    if (!resp || !resp.status) throw new Error('Failed to create Paystack customer');
    const customer = resp.data;

    return { customerCode: customer.customer_code || customer.id, data: customer };
  },
});

export const createPremiumTrial = mutation({
  args: { firebaseUid: v.string(), creatorId: v.optional(v.string()) },
  handler: async (ctx, args) => {
    const user = await getUserByFirebaseUid(ctx, args.firebaseUid);
    if (!user) throw new Error("User not found");

    const trialDays = 90;
    const startedAt = now();
    const trialEnd = addDaysIso(startedAt, trialDays);

    // update user fields
    await ctx.db.patch(user._id, {
      premiumStatus: "trial",
      premiumStartedAt: startedAt,
      premiumRenewsAt: trialEnd,
      premiumProvider: "paystack",
      premiumReference: "trial",
      updatedAt: now(),
    });

    const subscription = await ctx.db.insert("subscriptions", {
      creatorId: args.creatorId || null,
      userId: user._id,
      plan: "premium",
      amount: 0,
      billingCycle: "monthly",
      status: "trial",
      trialStart: startedAt,
      trialEnd,
      nextBillingDate: trialEnd,
      paystackCustomerId: null,
      paystackAuthorizationCode: null,
      paymentMethodConnected: false,
      metadata: { trialDays },
      createdAt: now(),
      updatedAt: now(),
    });

    return { subscriptionId: subscription._id, trialEnd };
  },
});

export const getCreatorSubscription = query({
  args: { firebaseUid: v.string() },
  handler: async (ctx, args) => {
    const user = await getUserByFirebaseUid(ctx, args.firebaseUid);
    if (!user) return null;
    const subs = await ctx.db
      .query("subscriptions")
      .withIndex("by_userId", (q: any) => q.eq("userId", user._id))
      .take(10);
    const subscription = subs[0] || null;
    if (!subscription) return { premiumStatus: user.premiumStatus || "free" };

    const trialEnd = subscription.trialEnd ? Date.parse(subscription.trialEnd) : 0;
    const nowTs = Date.now();
    const msPerDay = 24 * 60 * 60 * 1000;
    const daysRemaining = trialEnd > nowTs ? Math.ceil((trialEnd - nowTs) / msPerDay) : 0;

    return {
      subscription,
      premiumStatus: user.premiumStatus || "free",
      daysRemaining,
      nextBillingDate: subscription.nextBillingDate || null,
      paymentMethodConnected: Boolean(subscription.paymentMethodConnected),
    };
  },
});

export const connectPaymentMethod = mutation({
  args: {
    firebaseUid: v.string(),
    subscriptionId: v.id("subscriptions"),
    paystackCustomerId: v.optional(v.string()),
    paystackAuthorizationCode: v.optional(v.string()),
  },
  handler: async (ctx, args) => {
    const user = await getUserByFirebaseUid(ctx, args.firebaseUid);
    if (!user) throw new Error("User not found");

    const sub = await ctx.db.get(args.subscriptionId);
    if (!sub) throw new Error("Subscription not found");

    // Optionally verify customer exists on Paystack
    if (args.paystackCustomerId) {
      try {
        await paystackRequest(`/customer/${args.paystackCustomerId}`);
      } catch (err) {
        // continue — we still store the provided id
      }
    }

    await ctx.db.patch(sub._id, {
      paystackCustomerId: args.paystackCustomerId || sub.paystackCustomerId || null,
      paystackAuthorizationCode: args.paystackAuthorizationCode || sub.paystackAuthorizationCode || null,
      paymentMethodConnected: true,
      updatedAt: now(),
    });

    await ctx.db.insert("payments", {
      creatorId: sub.creatorId || null,
      userId: user._id,
      subscriptionId: sub._id,
      amount: 0,
      currency: "NGN",
      status: "success",
      transactionReference: null,
      provider: "paystack",
      providerPayload: { connectedAt: now() },
      paymentDate: now(),
      metadata: { note: "payment_method_connected" },
    });

    await ctx.db.patch(user._id, {
      premiumProvider: "paystack",
      premiumReference: sub._id,
      updatedAt: now(),
    });

    return { success: true };
  },
});

export const attemptAutoCharge = mutation({
  args: { subscriptionId: v.id("subscriptions") },
  handler: async (ctx, args) => {
    const sub = await ctx.db.get(args.subscriptionId);
    if (!sub) throw new Error("Subscription not found");

    if (!sub.paymentMethodConnected) {
      // record failed payment
      await ctx.db.insert("payments", {
        creatorId: sub.creatorId || null,
        userId: sub.userId || null,
        subscriptionId: sub._id,
        amount: sub.amount || 0,
        currency: "NGN",
        status: "failed",
        transactionReference: null,
        provider: "paystack",
        providerPayload: { reason: "no_payment_method" },
        paymentDate: now(),
        metadata: {},
      });

      await ctx.db.patch(sub._id, { status: "past_due", updatedAt: now() });
      if (sub.userId) await ctx.db.patch(sub.userId, { premiumStatus: "expired", updatedAt: now() });

      return { success: false, reason: "no_payment_method" };
    }

    // Use Paystack charge_authorization to perform recurring charge
    const paystackAuth = sub.paystackAuthorizationCode;
    if (!paystackAuth) {
      await ctx.db.insert("payments", {
        creatorId: sub.creatorId || null,
        userId: sub.userId || null,
        subscriptionId: sub._id,
        amount: sub.amount || 0,
        currency: "NGN",
        status: "failed",
        transactionReference: null,
        provider: "paystack",
        providerPayload: { reason: "no_authorization_code" },
        paymentDate: now(),
        metadata: {},
      });
      await ctx.db.patch(sub._id, { status: "past_due", updatedAt: now() });
      if (sub.userId) await ctx.db.patch(sub.userId, { premiumStatus: "expired", updatedAt: now() });
      return { success: false, reason: "no_authorization_code" };
    }

    try {
      const amountKobo = Math.round((sub.amount || 0) * 100);
      const email = (sub.metadata && sub.metadata.email) || null;
      const payload: any = { authorization_code: paystackAuth, amount: amountKobo };
      if (email) payload.email = email;
      const resp = await paystackRequest('/transaction/charge_authorization', 'POST', payload);
      if (!resp || !resp.status) {
        throw new Error('Paystack charge failed');
      }

      const tx = resp.data;
      await ctx.db.insert('payments', {
        creatorId: sub.creatorId || null,
        userId: sub.userId || null,
        subscriptionId: sub._id,
        amount: sub.amount || 0,
        currency: 'NGN',
        status: 'success',
        transactionReference: tx.reference || tx.id || null,
        provider: 'paystack',
        providerPayload: tx,
        paymentDate: now(),
        metadata: {},
      });

      const currentNext = sub.nextBillingDate || now();
      const next = addMonthsIso(currentNext, 1);
      await ctx.db.patch(sub._id, { status: 'active', nextBillingDate: next, updatedAt: now() });
      if (sub.userId) await ctx.db.patch(sub.userId, { premiumStatus: 'premium', premiumStartedAt: now(), premiumRenewsAt: next, updatedAt: now() });

      return { success: true, nextBillingDate: next, charge: tx };
    } catch (err: any) {
      await ctx.db.insert('payments', {
        creatorId: sub.creatorId || null,
        userId: sub.userId || null,
        subscriptionId: sub._id,
        amount: sub.amount || 0,
        currency: 'NGN',
        status: 'failed',
        transactionReference: null,
        provider: 'paystack',
        providerPayload: { error: String(err?.message || err) },
        paymentDate: now(),
        metadata: {},
      });
      await ctx.db.patch(sub._id, { status: 'past_due', updatedAt: now() });
      if (sub.userId) await ctx.db.patch(sub.userId, { premiumStatus: 'expired', updatedAt: now() });
      return { success: false, reason: String(err?.message || err) };
    }
  },
});

export const adminSetPremiumPrice = mutation({
  args: { amount: v.number(), billingCycle: v.union(v.literal("monthly"), v.literal("yearly")) },
  handler: async (ctx, args) => {
    const settings = await ctx.db.query("platformSettings").take(1);
    if (settings.length) {
      await ctx.db.patch(settings[0]._id, { premiumPricing: { amount: args.amount, billingCycle: args.billingCycle }, updatedAt: now() });
      return { updated: true };
    }
    await ctx.db.insert("platformSettings", { premiumPricing: { amount: args.amount, billingCycle: args.billingCycle }, showMockData: false, maintenanceMode: false, updatedAt: now() });
    return { updated: true };
  },
});

export const grantFreeMonths = mutation({
  args: { subscriptionId: v.id("subscriptions"), months: v.number() },
  handler: async (ctx, args) => {
    const sub = await ctx.db.get(args.subscriptionId);
    if (!sub) throw new Error("Subscription not found");
    const base = sub.nextBillingDate || sub.trialEnd || now();
    const newNext = addMonthsIso(base, args.months);
    await ctx.db.patch(sub._id, { nextBillingDate: newNext, updatedAt: now() });
    if (sub.userId) await ctx.db.patch(sub.userId, { premiumStatus: "premium", premiumRenewsAt: newNext, updatedAt: now() });
    return { success: true, newNext };
  },
});

export const suspendMembership = mutation({
  args: { subscriptionId: v.id("subscriptions"), reason: v.optional(v.string()) },
  handler: async (ctx, args) => {
    const sub = await ctx.db.get(args.subscriptionId);
    if (!sub) throw new Error("Subscription not found");
    await ctx.db.patch(sub._id, { status: "suspended", updatedAt: now(), metadata: { ...(sub.metadata || {}), suspendedReason: args.reason || null } });
    if (sub.userId) await ctx.db.patch(sub.userId, { premiumStatus: "expired", updatedAt: now() });
    await ctx.db.insert("adminActivity", { action: "suspend_membership", adminEmail: "system", timestamp: now(), metadata: { subscriptionId: sub._id, reason: args.reason || null } });
    return { success: true };
  },
});

export const listActiveCreators = query({
  args: {},
  handler: async (ctx) => {
    const active = await ctx.db.query("subscriptions").withIndex("by_status", (q: any) => q.eq("status", "active")).take(500);
    return active;
  },
});

export const listFailedPayments = query({
  args: {},
  handler: async (ctx) => {
    const failed = await ctx.db.query("payments").withIndex("by_status", (q: any) => q.eq("status", "failed")).take(500);
    return failed;
  },
});