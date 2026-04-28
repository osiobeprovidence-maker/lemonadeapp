# Testing Checklist & Validation Guide

## 🚀 Quick Start - Local Testing

### Prerequisites
```bash
# 1. Ensure Convex dev environment is running
npx convex dev

# 2. Start React development server (in new terminal)
npm run dev

# 3. Verify environment variables are set
echo $VITE_CONVEX_URL
echo $VITE_FIREBASE_API_KEY
```

### Expected Output
- Convex dev server: `Dashboard running at http://localhost:3210`
- React dev server: `Local: http://localhost:3001`
- Console: No critical errors, only warnings

---

## ✅ Authentication Flow Testing

### Test 1: New User Registration
**Steps:**
1. Navigate to `http://localhost:3001/auth?mode=signup`
2. Fill in: Name, Username, Email, Password
3. Click "Sign Up"
4. Select "Continue as Reader"

**Expected Results:**
- [ ] Firebase user created with email/password
- [ ] Convex user record created with user data
- [ ] Navigation to `/home`
- [ ] Console: No auth errors
- [ ] Convex dashboard: User appears in `users` table

**Validation Query:**
```bash
# In Convex dashboard, run query:
db.query("users").filter(q => q.eq(q.field("email"), "test@example.com")).take(1)
```

---

### Test 2: User Sign In
**Steps:**
1. Register user (use Test 1)
2. Sign out
3. Navigate to `http://localhost:3001/auth?mode=signin`
4. Enter email/password
5. Click "Sign In"

**Expected Results:**
- [ ] Firebase authenticates user
- [ ] User data loads from Convex
- [ ] Navigation to `/home`
- [ ] User profile picture displays (if set)

---

### Test 3: Google OAuth
**Steps:**
1. Click "Continue with Google" on auth page
2. Complete Google sign-in flow
3. Select role (Reader/Creator)

**Expected Results:**
- [ ] Google popup appears
- [ ] User data synced to Convex
- [ ] Navigate to appropriate screen
- [ ] No Firebase/Convex errors

---

### Test 4: Profile Picture Upload
**Steps:**
1. Sign in with user account
2. Navigate to Settings → Account → Profile Info
3. Click on avatar image
4. Select an image file (< 5MB)
5. Wait for upload to complete

**Expected Results:**
- [ ] File picker opens
- [ ] Upload starts (spinner shows)
- [ ] Image compresses automatically
- [ ] Firebase Storage uploads file
- [ ] Convex user record updates with new avatar URL
- [ ] Avatar displays immediately
- [ ] Success message shows
- [ ] No console errors

**Validation:**
- Check Firebase Storage: `gs://project.appspot.com/profile-pictures/userId/`
- Check Convex: `users` table `avatar` field updated

---

## 📖 Story Management Testing

### Test 5: View Story List (Home Page)
**Steps:**
1. Sign in
2. Navigate to Home (`/home`)
3. Scroll through story sections

**Expected Results:**
- [ ] Featured story displays (hero section)
- [ ] Story sections load (Trending, Originals, by Genre)
- [ ] Each story card shows: cover image, title, creator
- [ ] Click story → navigates to story detail page
- [ ] No loading spinners (or brief loading then disappears)

**Debugging if stories don't load:**
```typescript
// Check Convex query in browser console
// Should return array of stories
```

---

### Test 6: Search Stories
**Steps:**
1. Navigate to `/search`
2. Type story title/author name
3. Review results

**Expected Results:**
- [ ] Search input works
- [ ] Results appear in real-time
- [ ] Matches story titles and creator names
- [ ] Click result → navigates to story detail

---

### Test 7: Save Story
**Steps:**
1. On home page, click "Save" on any story card
2. Navigate to Library (`/library`)

**Expected Results:**
- [ ] "Save" button changes state (e.g., becomes filled)
- [ ] Story appears in Library
- [ ] Click "Unsave" → story removed from Library
- [ ] Convex: `users.savedStories` array updates

---

### Test 8: Like Story
**Steps:**
1. View story detail page (`/story/:id`)
2. Click heart icon to like story
3. Observe like count

**Expected Results:**
- [ ] Like button fills/unfills
- [ ] Like count increments/decrements
- [ ] Like persists on page reload
- [ ] Convex: Story `likes` array updates

---

## 💳 Payment Flow Testing

### Prerequisites for Payment Testing
```bash
# Set Paystack test keys in .env
VITE_PAYSTACK_PUBLIC_KEY=pk_test_xxxxx
VITE_PAYSTACK_SECRET_KEY=sk_test_xxxxx
```

### Test 9: Initiate Payment (Premium Upgrade)
**Steps:**
1. Sign in
2. Navigate to Premium (`/premium`)
3. Click "Upgrade" on a plan
4. Review payment details

**Expected Results:**
- [ ] Payment modal shows amount in Naira
- [ ] Exchange rate calculates correctly
- [ ] "Pay" button enabled
- [ ] No validation errors

---

### Test 10: Complete Payment
**Steps:**
1. From Test 9, click "Pay"
2. Redirects to Paystack
3. Use test card: `5399 8343 1165 1005` / `05/25` / `566`
4. Complete payment

**Expected Results:**
- [ ] Paystack modal opens
- [ ] Card accepted
- [ ] Redirect to success page
- [ ] Success message displays
- [ ] User's `premiumStatus` updates to "premium"
- [ ] Premium features unlock

**Validation:**
```typescript
// Check user record:
// user.premiumStatus === "premium"
// user.premiumExpiresAt is set
```

---

### Test 11: Wallet Top-Up
**Steps:**
1. Navigate to Wallet (`/wallet`)
2. Click "Top Up"
3. Enter amount (e.g., ₦5,000)
4. Complete payment

**Expected Results:**
- [ ] Payment initiated correctly
- [ ] Amount converts to Kobo correctly
- [ ] After payment, balance updates
- [ ] Transaction appears in history

**Validation Query:**
```typescript
// Check walletBalance updated
// Check walletTransactions table has entry
```

---

## 🔍 Admin Dashboard Testing

### Test 12: Admin Login
**Steps:**
1. Navigate to `/admin`
2. Enter admin credentials
3. Click "Sign In"

**Expected Results:**
- [ ] Admin interface loads
- [ ] Sidebar shows admin options
- [ ] No permission errors

---

### Test 13: View Users
**Steps:**
1. Logged in as admin
2. Click "Users" in sidebar
3. Review user list

**Expected Results:**
- [ ] All users display with data
- [ ] Can search/filter users
- [ ] Click user → detail page
- [ ] Shows user stats (stories, followers, etc.)

---

### Test 14: View Stories
**Steps:**
1. Logged in as admin
2. Click "Stories" in sidebar
3. Review story list

**Expected Results:**
- [ ] All stories display
- [ ] Can filter by status (draft, published, flagged)
- [ ] Can sort by date, views, likes
- [ ] Click story → detail page with moderation options

---

## 📊 Data Integrity Testing

### Test 15: Cross-Check Convex & Firebase
**Steps:**
1. Create user in auth flow
2. Check Firebase Console → Users
3. Check Convex Dashboard → users table

**Expected Results:**
- [ ] Firebase user exists
- [ ] Convex user record exists
- [ ] firebaseUid matches
- [ ] Email matches
- [ ] timestamps are current

---

### Test 16: Verify Image Storage
**Steps:**
1. Upload profile picture
2. Check Firebase Storage

**Expected Results:**
- [ ] File exists at: `gs://project.appspot.com/profile-pictures/{userId}/*`
- [ ] File type is image (jpeg/png/webp)
- [ ] File size < 5MB
- [ ] Metadata shows uploadedAt timestamp

---

## 🐛 Error Handling Tests

### Test 17: Invalid Email Registration
**Steps:**
1. Navigate to signup
2. Enter invalid email: `notanemail`
3. Click "Sign Up"

**Expected Results:**
- [ ] Error message displays
- [ ] No user created
- [ ] User can retry

---

### Test 18: Password Too Short
**Steps:**
1. Navigate to signup
2. Enter password < 6 characters
3. Try to submit form

**Expected Results:**
- [ ] Form validation error
- [ ] Submit button disabled
- [ ] Error message clear

---

### Test 19: Duplicate Username
**Steps:**
1. Register user with username "testuser"
2. Try to register another user with same username
3. Check validation

**Expected Results:**
- [ ] Error message: "Username already taken"
- [ ] User not created
- [ ] Clear action to resolve

---

### Test 20: Network Error Simulation
**Steps:**
1. Open DevTools → Network tab
2. Throttle to Offline
3. Try to load stories or save profile

**Expected Results:**
- [ ] Error message displays
- [ ] "Retry" button appears
- [ ] After re-enabling network, retry works

---

## 📱 Responsive Design Testing

### Test 21: Mobile View (375px width)
**Steps:**
1. Open DevTools → Device toolbar
2. Select iPhone SE (375px)
3. Test navigation, buttons, forms

**Expected Results:**
- [ ] Content doesn't overflow
- [ ] Text readable
- [ ] Buttons easily tappable (48px min)
- [ ] No horizontal scrolling

---

### Test 22: Tablet View (768px width)
**Steps:**
1. Select iPad view
2. Test layout
3. Check image sizes

**Expected Results:**
- [ ] Layout adapts to tablet
- [ ] Hero section still impactful
- [ ] Story cards size appropriately

---

## ⚡ Performance Testing

### Test 23: Page Load Time
**Steps:**
1. Open Chrome DevTools → Lighthouse
2. Run performance audit on Home page
3. Note scores

**Expected Results:**
- [ ] Performance score > 80
- [ ] First Contentful Paint < 3s
- [ ] Largest Contentful Paint < 4s
- [ ] Cumulative Layout Shift < 0.1

---

### Test 24: Bundle Size
**Steps:**
```bash
npm run build
# Check dist/ folder size
```

**Expected Results:**
- [ ] Total bundle < 500KB gzipped
- [ ] Main JS < 200KB
- [ ] CSS < 50KB

---

## 🔄 Repeat Behavior Testing

### Test 25: Session Persistence
**Steps:**
1. Sign in
2. Refresh page
3. Check if still authenticated

**Expected Results:**
- [ ] User remains signed in
- [ ] No re-login needed
- [ ] User data reloads correctly

---

### Test 26: State After Navigation
**Steps:**
1. Save a story
2. Navigate away
3. Return to same story

**Expected Results:**
- [ ] Saved state persists
- [ ] Save button still shows as active

---

## 🧪 Batch Testing Scenarios

### Scenario A: Complete User Journey
1. Register new account
2. Complete profile (add bio, picture)
3. Explore stories
4. Save favorite story
5. Like a story
6. Upgrade to premium
7. View premium features

**Success Criteria:** All steps complete without errors

---

### Scenario B: Creator Journey
1. Sign up as new user
2. Select "Creator" role
3. Upload profile picture
4. Create story draft
5. Add story cover image
6. Publish story
7. View on home page

**Success Criteria:** Story appears in listings

---

## 📋 Issue Tracking Template

When you encounter a bug, use this format:

```
## Bug Report: [Title]

**Severity:** [Critical/High/Medium/Low]
**Test:** [Which test number or scenario]

**Steps to Reproduce:**
1. ...
2. ...

**Expected Result:**
...

**Actual Result:**
...

**Console Errors:**
```

**Fix:**
```

---

## ✨ Sign-Off Checklist

When all tests pass, mark as complete:

- [ ] All 26 unit tests pass
- [ ] All 3 scenario tests complete
- [ ] No console errors
- [ ] Performance acceptable
- [ ] Mobile responsive
- [ ] All data persists
- [ ] Ready for production

---

## Next Steps

1. Run all tests locally
2. Document any failures
3. Fix critical issues
4. Re-test fixed features
5. Deploy to staging (Firebase)
6. Run tests on staging
7. Deploy to production (Vercel)
