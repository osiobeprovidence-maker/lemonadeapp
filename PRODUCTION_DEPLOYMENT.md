# Production Deployment Checklist

This document lists the production deployment steps, required environment variables, verification steps, and rollback notes for deploying the Lemonade platform.

**Goal:** Deploy a working production instance with payments (Paystack), storage (Firebase), backend (Convex), and frontend served on Vercel. Verify webhooks and core flows before launch.

---

## 1. Required environment variables
- **Paystack:**
  - `PAYSTACK_SECRET_KEY` — Paystack secret key for verifying webhooks and server-side API calls.
  - `PAYSTACK_PUBLIC_KEY` — Client-side key for checkout widgets (if used).

- **Convex:**
  - `CONVEX_DEPLOYMENT_URL` — Public Convex deployment URL (used by server webhook to call Convex).
  - `CONVEX_WEBHOOK_SECRET` — Secret used by Vercel webhook handler to authenticate requests to Convex (if configured).

- **Firebase (Production project):**
  - `FIREBASE_API_KEY`
  - `FIREBASE_AUTH_DOMAIN`
  - `FIREBASE_PROJECT_ID`
  - `FIREBASE_STORAGE_BUCKET`
  - `FIREBASE_MESSAGING_SENDER_ID`
  - `FIREBASE_APP_ID`
  - `FIREBASE_CLIENT_EMAIL` / `FIREBASE_PRIVATE_KEY` (only if server-side admin SDK access required)

- **Vercel / Hosting:**
  - `VERCEL_ENV` (set to `production` in Vercel)
  - `NEXT_PUBLIC_SENTRY_DSN` (optional)

- **Misc / Optional:**
  - `SENTRY_DSN`
  - Any third-party keys (Mux, analytics, etc.)

---

## 2. High-level deployment steps
1. Prepare staging (recommended):
   - Create a staging Vercel project and staging Convex deployment.
   - Wire staging Firebase project + test Paystack keys.
   - Deploy and run smoke tests.

2. Prepare production environment variables:
   - Add all variables above to the Vercel project settings (Environment Variables).
   - For server-side secrets (Paystack secret, Convex webhook secret, Firebase admin keys) mark them as `Encrypted` / `Secret`.

3. Configure Paystack webhook:
   - In Paystack dashboard, add webhook URL: `https://<your-domain>/api/webhooks/paystack`.
   - Use the `PAYSTACK_SECRET_KEY` to verify signatures server-side.
   - Enable relevant events: `charge.success`, `charge.failed`, `transfer.*` as needed.

4. Deploy Convex functions (if not already deployed):
   - Push Convex changes and run `convex deploy` (or follow Convex docs).
   - Set `CONVEX_DEPLOYMENT_URL` to the deployed Convex endpoint.
   - Ensure `convex/webhooks.ts` mutation is available and has necessary permissions.

5. Deploy frontend (Vercel):
   - Connect GitHub repo to Vercel project.
   - Ensure build command (`npm run build` / `vite build`) and `dist` settings are correct.
   - Deploy; watch logs for build and runtime errors.

6. Verify Firebase Storage rules & CORS:
   - Set storage rules to allow authenticated uploads only.
   - Configure CORS for uploads if uploading directly from client.

7. Test webhooks & payments (sandbox → production):
   - Use Paystack test flows and verify webhook delivery to `/api/webhooks/paystack`.
   - Confirm Convex mutation updates user premium status.

8. Run smoke tests (see section below).

9. Cutover: update DNS, switch payment mode to live keys, re-run tests.

10. Monitor logs & metrics for 24–72 hours. Roll back if critical issues.

---

## 3. Smoke tests (run after deployment)
- **Auth:** Register, sign-in, sign-out (email/password and Google OAuth).
- **Profile:** Update profile, upload profile picture (verify URL stored in Convex + accessible).
- **Story flows:** Open Home, open StoryDetail, read chapter, confirm views increment.
- **Save/like:** Save a story and confirm saved list updates.
- **Payments:** Start a Paystack checkout, complete test payment; confirm webhook processed and user premium updated.
- **Uploads:** Upload story cover or chapter media to Firebase; validate storage path and permissions.
- **Webhooks:** Send a signed webhook to `/api/webhooks/paystack` and confirm successful processing.

For each smoke test, capture logs and any failing assertions.

---

## 4. Paystack webhook testing steps
1. On local dev (optional): use `ngrok` to expose local `/api/webhooks/paystack` and set webhook in Paystack dashboard to `https://<ngrok>.ngrok.io/api/webhooks/paystack`.
2. In Paystack, create a test transaction using test card numbers.
3. Inspect Vercel (or local) server logs for incoming webhook and signature verification.
4. Confirm Convex mutation `handlePaystackCallback` (or similar) was invoked and the user record updated.

Signature verification note: the webhook handler should compute HMAC-SHA512 of the raw request body using `PAYSTACK_SECRET_KEY` and compare to the `x-paystack-signature` header.

---

## 5. Rollback plan
- If frontend issues: revert to previous commit in Git and redeploy via Vercel rollback.
- If database issues: use Convex backup/restore or revert migration, if available.
- If payments are failing: disable Paystack webhook in dashboard and revert to maintenance mode.

---

## 6. Post-deployment monitoring & checklist
- Enable Sentry or alternate error monitoring.
- Add uptime checks (Auth login, Home load, Payment checkout success).
- Monitor logs for uncaught exceptions, 5xx errors, or webhook failures.

---

## 7. Quick commands
- Build locally:

```bash
npm ci
npm run build
npm run preview
```

- Deploy Convex (example):

```bash
# from convex project dir
convex deploy
```

- Expose local server for webhook testing (optional):

```bash
npx ngrok http 3000
# then set Paystack webhook to https://<ngrok>.ngrok.io/api/webhooks/paystack
```

---

## 8. Notes & assumptions
- Assumes Vercel is used for frontend/serverless functions. Adjust steps if using another host.
- Ensure `api/webhooks/paystack.ts` is present and uses `PAYSTACK_SECRET_KEY` for verification.
- Ensure `convex/webhooks.ts` exists and exposes mutation to update payment status.

---

If you want, I can now:
- Run a local `npm run build` / `pnpm build` and surface TypeScript/build errors,
- Configure a Vercel project and prepare the exact environment variable values file,
- Or start testing Paystack webhooks locally via `ngrok`.

Tell me which next step to run and I'll proceed.
