# Development & Testing Environment Setup

## 🏗️ Architecture Overview

```
┌─────────────────────────────────────────────────────────────────┐
│                        LEMONADE PLATFORM                        │
├─────────────────────────────────────────────────────────────────┤
│                                                                 │
│  Frontend (React + TypeScript)                                  │
│  ├─ src/screens/ - 35+ pages                                   │
│  ├─ src/components/ - 74 reusable components                   │
│  ├─ src/hooks/useConvex.ts - 25+ custom hooks                 │
│  └─ src/lib/ - Utilities (Firebase, Convex, Mux, Paystack)    │
│                                                                 │
├─────────────────────────────────────────────────────────────────┤
│                                                                 │
│  Backend (Convex - Serverless)                                 │
│  ├─ convex/auth_api.ts - User & authentication (200+ lines)   │
│  ├─ convex/stories_api.ts - Story CRUD (230+ lines)           │
│  ├─ convex/payments_api.ts - Payments & wallet (180+ lines)   │
│  └─ convex/schema.ts - Database schema with indices           │
│                                                                 │
├─────────────────────────────────────────────────────────────────┤
│                                                                 │
│  Infrastructure                                                │
│  ├─ Firebase - Auth, Storage, Firestore                       │
│  ├─ Convex - Database & serverless functions                  │
│  ├─ Mux - Video upload & streaming                            │
│  ├─ Paystack - Payment processing                             │
│  └─ Vercel - Deployment & hosting                             │
│                                                                 │
└─────────────────────────────────────────────────────────────────┘
```

---

## 🚀 Quick Start (5 minutes)

### Step 1: Install Dependencies
```bash
cd lemonade
npm install --no-audit --no-fund
```

### Step 2: Setup Environment Variables
Create `.env.local` in project root:
```env
# Firebase
VITE_FIREBASE_API_KEY=your_api_key
VITE_FIREBASE_AUTH_DOMAIN=your_project.firebaseapp.com
VITE_FIREBASE_PROJECT_ID=your_project_id
VITE_FIREBASE_STORAGE_BUCKET=your_project.appspot.com
VITE_FIREBASE_MESSAGING_SENDER_ID=your_sender_id
VITE_FIREBASE_APP_ID=your_app_id

# Convex
VITE_CONVEX_URL=https://your-deployment.convex.cloud

# Mux
VITE_MUX_TOKEN_ID=your_mux_token_id
VITE_MUX_TOKEN_SECRET=your_mux_token_secret

# Paystack
VITE_PAYSTACK_PUBLIC_KEY=pk_test_xxxxx

# Vercel
VITE_VERCEL_URL=your_vercel_domain.vercel.app
```

### Step 3: Start Development Servers

**Terminal 1 - React Dev Server:**
```bash
npm run dev
# Output: VITE v6.2.0 ready in 123 ms
# ➜  Local:   http://localhost:3001
```

**Terminal 2 - Convex Dev Environment:**
```bash
npx convex dev
# Output: Dashboard running at http://localhost:3210
```

**Terminal 3 (Optional) - Firebase Emulators:**
```bash
firebase emulators:start
```

### Step 4: Open in Browser
- App: `http://localhost:3001`
- Convex Dashboard: `http://localhost:3210`
- Firebase Emulator: `http://localhost:4000` (if running)

---

## 🧪 Testing Workflow

### Running Tests

**Unit Tests:**
```bash
npm run test
# Watch mode:
npm run test -- --watch
```

**E2E Tests (Playwright):**
```bash
npm run test:e2e
# Debug mode:
npm run test:e2e -- --debug
```

**Build Verification:**
```bash
npm run build
# Check bundle size and compile errors
```

### Manual Testing Flow

1. **Auth Testing:**
   - [ ] Register new user
   - [ ] Sign in existing user
   - [ ] Sign out
   - [ ] Verify Convex user record created

2. **Story Testing:**
   - [ ] Load home feed
   - [ ] View trending stories
   - [ ] Search for story
   - [ ] Save/unsave story
   - [ ] Like/unlike story

3. **Payment Testing:**
   - [ ] Initiate payment
   - [ ] Complete Paystack payment
   - [ ] Verify user status updates
   - [ ] Check wallet balance

4. **Profile Testing:**
   - [ ] Update profile info
   - [ ] Upload profile picture
   - [ ] Verify image in Firebase Storage
   - [ ] Check avatar displays

---

## 🔍 Debugging Guide

### Check Frontend Console
```javascript
// In browser console (F12 → Console tab):

// Check current user
firebase.auth().currentUser

// Check Convex connection
window.__CONVEX__

// Check environment
import.meta.env
```

### Check Convex Dashboard
1. Open `http://localhost:3210`
2. Select "users" table
3. Review user records created
4. Check API call logs

### Check Firebase Console
1. Go to `https://console.firebase.google.com`
2. Select project
3. View:
   - Authentication → Users tab
   - Storage → Files uploaded
   - Firestore → Documents (if using)

### Monitor Network Requests
```bash
# DevTools → Network tab:
# Look for:
# - /convex/* requests (API calls)
# - /v1/auth/* (Firebase auth)
# - storage.googleapis.com (file uploads)
```

---

## 📊 Verification Checklist

### After Starting Dev Server

- [ ] React app loads at `http://localhost:3001`
- [ ] No critical console errors
- [ ] Convex connection established
- [ ] Firebase initialized
- [ ] Can navigate to all main pages
- [ ] Can sign in/out

### After Code Changes

- [ ] `npm run build` succeeds
- [ ] No TypeScript errors
- [ ] No ESLint warnings
- [ ] Tests pass (if applicable)
- [ ] Feature works as expected

---

## 🛠️ Common Issues & Solutions

### Issue: "VITE_CONVEX_URL is missing"
**Solution:**
```bash
# Ensure .env.local has:
VITE_CONVEX_URL=https://your-deployment.convex.cloud

# Or for local testing:
VITE_CONVEX_URL=http://localhost:3210
```

### Issue: "Cannot find module 'convex/react'"
**Solution:**
```bash
npm install convex
npx convex dev
```

### Issue: "Firebase initialization failed"
**Solution:**
```bash
# Verify all Firebase env vars are set
echo $VITE_FIREBASE_API_KEY
echo $VITE_FIREBASE_PROJECT_ID
# Should not be empty
```

### Issue: "Paystack payment not working"
**Solution:**
```bash
# Use test keys for development
VITE_PAYSTACK_PUBLIC_KEY=pk_test_xxxxx

# Use test card: 5399 8343 1165 1005
# Valid till: 05/25, CVV: 566
```

### Issue: "Profile picture upload fails"
**Solution:**
```
1. Check Firebase Storage rules allow uploads
2. Verify CORS is configured
3. Check file size < 5MB
4. Check image format is supported
```

---

## 📈 Performance Monitoring

### Track Bundle Size
```bash
npm run build
du -sh dist/
# Should be < 500KB gzipped

# Detailed breakdown:
npx vite-plugin-visualizer
```

### Monitor API Calls
```javascript
// Add to AppContext.tsx:
window.convexCalls = [];
// Then check how many API calls made
```

### Check Memory Usage
```bash
# Chrome DevTools → Memory tab:
# Take heap snapshot after various actions
# Look for memory leaks
```

---

## 🚢 Deployment Checklist

Before deploying to production:

### Frontend (Vercel)
```bash
# 1. Build succeeds
npm run build

# 2. No console errors
# 3. All env vars set in Vercel dashboard
# 4. Deploy:
git push origin main
# Vercel auto-deploys from GitHub
```

### Backend (Convex)
```bash
# 1. Deploy Convex functions
npx convex deploy

# 2. Set production env vars:
# - Database name
# - API keys
# - Webhook URLs

# 3. Verify deployment
curl https://your-deployment.convex.cloud
```

### Database (Convex)
```bash
# 1. Schema deployed correctly
npx convex dev
# Check tables exist

# 2. Indices created
# 3. Migrations run successfully
```

### Payment (Paystack)
```bash
# 1. Switch from test to live keys
VITE_PAYSTACK_PUBLIC_KEY=pk_live_xxxxx
PAYSTACK_SECRET_KEY=sk_live_xxxxx

# 2. Configure webhook URL:
# https://your-domain.com/api/webhooks/paystack
```

### Monitoring
```bash
# 1. Setup error tracking (e.g., Sentry)
# 2. Monitor Convex dashboard for errors
# 3. Check Firebase logs for auth issues
# 4. Monitor Paystack for payment errors
# 5. Setup alerts for critical errors
```

---

## 📚 Documentation Links

- **React**: https://react.dev
- **TypeScript**: https://www.typescriptlang.org
- **Vite**: https://vitejs.dev
- **Convex**: https://docs.convex.dev
- **Firebase**: https://firebase.google.com/docs
- **Mux**: https://docs.mux.com
- **Paystack**: https://paystack.com/docs
- **Tailwind**: https://tailwindcss.com/docs

---

## 🤝 Getting Help

1. **Check error message** - Often self-explanatory
2. **Check console.log** - Add debugging logs
3. **Search GitHub issues** - Others may have solved it
4. **Read documentation** - Official docs are authoritative
5. **Ask in community** - Discord, Reddit, Stack Overflow

---

## ✅ Next Steps

1. Complete setup steps above
2. Verify all checks pass
3. Run manual testing from TESTING_CHECKLIST.md
4. Fix any issues found
5. Commit and push changes
6. Deploy to staging
7. Re-test on staging
8. Deploy to production

**Estimated time:** 2-3 hours to full testing completion
