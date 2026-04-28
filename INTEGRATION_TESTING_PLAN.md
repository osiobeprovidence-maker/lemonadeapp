# Integration & Testing Plan - Lemonade Platform

## Phase 1: Backend Hooks Integration

### Critical Screens (Blocks Deployment)

#### 1. **Auth.tsx** - Authentication Flow
**Current State:** Mock authentication with Firebase only
**Integration Needed:**
- `useCurrentUser()` - Get logged-in user after auth
- `useRegisterUser()` - Create user in Convex on signup
- `useCreatePayment()` - (Optional) for premium signup

**Changes:**
```typescript
// After Firebase signUp/signIn, call:
await registerUser({ firebaseUid, email, name, username });
const user = await getCurrentUser({ firebaseUid });
```

**Testing:**
- [ ] Register new user flows to Convex
- [ ] Sign in retrieves Convex user data
- [ ] User role selection saves to database
- [ ] Navigate to correct screen post-auth

---

#### 2. **Home.tsx** - Story Discovery Feed
**Current State:** Uses mock data from `data/mock.ts`
**Integration Needed:**
- `useStories()` - Fetch all published stories
- `useTrendingStories()` - Fetch trending stories
- `useLikeStory()` - Like story interaction
- `useSaveStory()` - Save story to library

**Changes:**
```typescript
const trending = useStories(); // Replace MOCK_STORIES
const featured = trending?.[0]; // First story as hero
```

**Testing:**
- [ ] Stories load on page mount
- [ ] "Continue Reading" shows user's recent stories
- [ ] "Trending Now" loads and sorts by views
- [ ] Genre sections filter correctly
- [ ] Save/Like buttons update user profile

---

#### 3. **CreatorDashboard.tsx** - Creator Hub
**Current State:** Empty dashboard, needs backend connection
**Integration Needed:**
- `useStories(creatorId)` - Get creator's stories
- `useCurrentUser()` - Get creator profile
- `useCreateStory()` - Create new story
- `usePublishStory()` - Publish draft story

**Testing:**
- [ ] Load creator's stories on mount
- [ ] Create story saves as draft
- [ ] Publish story changes status
- [ ] View counts update in real-time

---

#### 4. **Premium.tsx** - Premium Subscription
**Current State:** UI only, no payment flow
**Integration Needed:**
- `useCreatePayment()` - Initiate Paystack payment
- `useVerifyPayment()` - Verify payment after redirect
- `useCurrentUser()` - Update premiumStatus

**Changes:**
```typescript
const { mutate: createPayment } = useCreatePayment();
const handleUpgrade = async () => {
  const { reference } = await createPayment({
    userId, amount: 4999, // ₦4,999
  });
  // Redirect to Paystack
};
```

**Testing:**
- [ ] Payment initialization works
- [ ] Paystack redirect works
- [ ] Webhook receives payment confirmation
- [ ] User's premiumStatus updates

---

#### 5. **Wallet.tsx** - User Wallet
**Current State:** Doesn't exist yet
**Integration Needed:**
- `useWalletBalance()` - Get current balance
- `usePaymentHistory()` - Get transactions
- `useCreatePayment()` - Top-up wallet

**Testing:**
- [ ] Balance loads correctly
- [ ] Transaction history displays
- [ ] Top-up initiates payment flow

---

### Secondary Screens (Nice-to-Have)

#### 6. **CreatorProfile.tsx**
- [ ] `useFollowCreator()` - Follow/unfollow
- [ ] `useStories(creatorId)` - Show creator's works

#### 7. **Settings/SettingsAccountProfile.tsx**
- [x] `useCurrentUser()` - Already integrated!
- [x] `useUpdateUserProfile()` - Already integrated!

#### 8. **StoryDetail.tsx**
- [ ] `useStoryById()` - Load story with chapters
- [ ] `incrementStoryViews()` - Track view
- [ ] `useSaveStory()` - Add to library

---

## Phase 2: Testing & Validation

### Unit Tests (Functions)
```bash
npm install --save-dev vitest @testing-library/react
```

**Test Files to Create:**
- `tests/hooks/useConvex.test.ts` - Test all custom hooks
- `tests/lib/imageUpload.test.ts` - Test image validation
- `tests/lib/firebase.test.ts` - Test Firebase integration

**Key Tests:**
```typescript
// Example: Test useCurrentUser hook
describe('useCurrentUser', () => {
  it('should fetch user from Convex after Firebase auth', () => {
    // Mock Firebase auth
    // Assert user data loads
  });
});
```

---

### Integration Tests (Screen-Level)
**Test Files:**
- `tests/screens/Auth.test.tsx` - Register → Convex flow
- `tests/screens/Home.test.tsx` - Load stories → Render
- `tests/screens/Premium.test.tsx` - Payment flow

**Key Scenarios:**
- New user registration → Convex user created
- Story load → Firebase Storage works
- Payment → Paystack integration works

---

### E2E Tests (Playwright)
```bash
npm install --save-dev @playwright/test
```

**Test Suite:**
1. **Auth Flow:**
   - [ ] Register with email → Navigate home
   - [ ] Sign in → User data loads
   - [ ] Google OAuth → Works end-to-end

2. **Story Flow:**
   - [ ] Browse stories on home
   - [ ] Save story → Appears in Library
   - [ ] Open story → Chapter loads
   - [ ] Like story → Updates count

3. **Payment Flow:**
   - [ ] Click Premium → Payment modal
   - [ ] Complete payment → Redirect to success
   - [ ] Verify webhook → Status updates

4. **Creator Flow:**
   - [ ] Create story → Appears in dashboard
   - [ ] Publish story → Visible on platform
   - [ ] Upload cover → Uses image from Firebase

5. **Profile Flow:**
   - [ ] Update profile → Changes save
   - [ ] Upload picture → Avatar updates

---

### Manual Testing Checklist

#### Environment Setup
- [ ] Convex dev environment running: `npx convex dev`
- [ ] Firebase emulators running (optional)
- [ ] Local dev server: `npm run dev`
- [ ] Environment variables set correctly

#### Authentication Testing
- [ ] Register new account
- [ ] Sign in with existing account
- [ ] Sign in with Google
- [ ] Password reset flow
- [ ] Access protected routes

#### Data Flow Testing
- [ ] Create story → Saves to Convex
- [ ] View story → Increments view count
- [ ] Like story → Updates in database
- [ ] Save story → Appears in Library tab
- [ ] Follow creator → Appears in followed list

#### Payment Testing
- [ ] Initiate payment → Paystack redirects
- [ ] Complete test payment → Success page
- [ ] Webhook callback → Updates user status
- [ ] Premium features → Unlocked for premium users

#### Media Testing
- [ ] Upload profile picture → Firebase Storage
- [ ] Upload story cover → Firebase Storage
- [ ] Upload video → Mux integration
- [ ] Image compression → Works before upload
- [ ] Video playback → HLS stream works

#### UI/UX Testing
- [ ] Loading states show during API calls
- [ ] Error messages display on failures
- [ ] Success toasts confirm actions
- [ ] Forms validate inputs
- [ ] Mobile responsive on all screens

---

## Phase 3: Critical Issues to Resolve

### 🔴 Blocking Issues
1. **Paystack Webhook Not Tested**
   - Need to set up Vercel serverless function
   - Test with Paystack test mode
   - Verify payment status updates

2. **Convex Functions Not Deployed**
   - Run: `npx convex deploy`
   - Environment variables set in Convex dashboard

3. **Firebase Storage Permissions**
   - Verify rules allow uploads
   - Test profile picture upload end-to-end

### 🟡 High-Priority Issues
1. Error handling in hooks needs enhancement
2. Loading states missing in some components
3. Form validation needs strengthening
4. Image compression optimization
5. Video playback edge cases

### 🟢 Nice-to-Have Improvements
1. Add retry logic for failed API calls
2. Implement exponential backoff
3. Add analytics tracking
4. Create error boundary components
5. Add toast notification system

---

## Phase 4: Deployment Checklist

Before deploying to production:

### Backend
- [ ] Deploy Convex: `npx convex deploy`
- [ ] Verify all environment variables
- [ ] Test webhook endpoint
- [ ] Configure Paystack webhook URL

### Frontend
- [ ] Build passes: `npm run build`
- [ ] No console errors/warnings
- [ ] All hooks properly imported
- [ ] Environment variables in Vercel dashboard
- [ ] Deploy to Vercel

### Post-Deployment
- [ ] Smoke test all critical flows
- [ ] Monitor error logs
- [ ] Check Vercel analytics
- [ ] Verify Convex usage

---

## Quick Reference: Hook Usage

### Authentication
```typescript
const { user, firebaseUid } = useCurrentUser();
const registerUser = useRegisterUser();
await registerUser({ firebaseUid, email, name, username });
```

### Stories
```typescript
const stories = useStories(); // All stories
const trending = useTrendingStories();
const storyDetail = useStoryById({ storyId });
const createStory = useCreateStory();
```

### User Actions
```typescript
const { save, unsave } = useSaveStory();
const { like, unlike } = useLikeStory();
const { follow, unfollow } = useFollowCreator();
```

### Payments
```typescript
const createPayment = useCreatePayment();
const { reference } = await createPayment({ userId, amount });
const verifyPayment = useVerifyPayment();
```

---

## Timeline Estimate

| Phase | Duration | Priority |
|-------|----------|----------|
| Integrate Auth + Home | 2-3 hours | CRITICAL |
| Integrate Premium + Wallet | 2-3 hours | HIGH |
| Add unit tests | 3-4 hours | MEDIUM |
| Add E2E tests | 4-5 hours | MEDIUM |
| Deploy & verify | 1-2 hours | CRITICAL |

**Total:** ~13-17 hours to full production readiness
