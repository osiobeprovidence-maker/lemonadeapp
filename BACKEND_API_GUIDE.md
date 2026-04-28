# Backend API Implementation Guide

## Overview

You now have a fully functional backend with Convex that includes:
- User authentication and management
- Story CRUD operations and browsing
- Payment processing and wallet management
- Creator applications and management
- Social features (follow, save, like)

## Project Structure

```
convex/
├── schema.ts              # Database schema definitions
├── auth_api.ts           # Authentication & user functions
├── stories_api.ts        # Story CRUD & browsing
├── payments_api.ts       # Payment & wallet functions
├── users.ts              # User management (existing)
├── creators.ts           # Creator management (existing)
├── payments.ts           # Payment records (existing)
├── admin.ts              # Admin functions (existing)
└── _generated/           # Auto-generated Convex client

src/
└── hooks/
    └── useConvex.ts      # Custom React hooks for API calls
```

## New API Functions

### Authentication (`auth_api.ts`)
```typescript
// Register a new user from Firebase
registerUser({ firebaseUid, email, name, username, avatar })

// Get current user
getCurrentUser({ firebaseUid })

// Update user profile
updateUserProfile({ firebaseUid, name, avatar, username })

// Follow/Unfollow creators
followCreator({ userId, creatorId })
unfollowCreator({ userId, creatorId })

// Save/Unsave stories
saveStory({ userId, storyId })
unsaveStory({ userId, storyId })

// Get user's collections
getSavedStories({ userId })
getFollowedCreators({ userId })

// Creator application
applyForCreatorAccess({ userId, bio, portfolio })
```

### Stories (`stories_api.ts`)
```typescript
// Story CRUD
getStoryById({ storyId })
getStoriesByCreator({ creatorId })
createStory({ creatorId, title, description, genre, ... })
updateStory({ storyId, title, description, ... })
publishStory({ storyId })
deleteStory({ storyId })

// Discovery
searchStories({ query, genre, limit })
getTrendingStories({ limit })

// Interactions
incrementStoryViews({ storyId })
likeStory({ storyId, userId })
```

### Payments (`payments_api.ts`)
```typescript
// Payment processing
createPaymentIntent({ userId, amount, paymentType, storyId, creatorId })
verifyPayment({ reference, transactionId, status })

// Wallet management
getWalletBalance({ userId })
createWalletTransaction({ userId, amount, type, description })

// History
getPaymentHistory({ userId })
getPaymentByReference({ reference })
```

## Using the API in React Components

### Setup Provider
Wrap your app with ConvexProvider in `main.tsx`:

```typescript
import { ConvexProvider, ConvexReactClient } from "convex/react";
import { convex } from "@/lib/convex";

const client = new ConvexReactClient(convex.url);

<ConvexProvider client={client}>
  <App />
</ConvexProvider>
```

### Example: Using Hooks in Components

```typescript
import { useCurrentUser, useStories, useCreatePayment } from "@/hooks/useConvex";

function MyComponent() {
  const { user, firebaseUid } = useCurrentUser();
  const stories = useStories();
  const createPayment = useCreatePayment();

  const handlePayment = async () => {
    const payment = await createPayment({
      userId: firebaseUid!,
      amount: 50000, // 500 naira
      paymentType: "premium_subscription",
    });
    // Redirect to Paystack with payment.reference
  };

  return (
    <div>
      <h1>Welcome, {user?.name}</h1>
      <button onClick={handlePayment}>Subscribe</button>
    </div>
  );
}
```

## Database Schema

The schema includes these main tables:

### Users
- `firebaseUid` - Firebase authentication ID
- `email`, `name`, `username`
- `role` - "guest", "reader", "creator", "admin"
- `premiumStatus` - "free", "trial", "premium", "expired"
- `walletBalance` - User's wallet balance
- `followedCreators` - Array of creator IDs
- `savedStories` - Array of story IDs
- `unlockedChapters` - Purchased chapter IDs

### Stories
- `creatorId` - Creator's user ID
- `title`, `description`, `genre`
- `status` - "draft", "published"
- `reads`, `likes`, `comments` - Interaction counts
- `chapters` - Array of chapter data

### Payments
- `userId` - Payer's user ID
- `amount` - Amount in kobo (1/100th naira)
- `paymentType` - "premium_subscription", "story_unlock", etc.
- `status` - "pending", "success", "failed"
- `reference` - Paystack reference
- `transactionId` - Payment transaction ID

### Creators
- `userId` - User ID of creator
- `username`, `name`, `avatar`
- `followers` - Follower count
- `bio`, `category` - Profile info
- `totalReads`, `totalStories` - Stats

## Integrating with Paystack

### 1. Payment Flow
```typescript
// User clicks "Subscribe"
const payment = await createPayment({
  userId: user.firebaseUid,
  amount: 50000,
  paymentType: "premium_subscription",
});

// Redirect to Paystack
window.location.href = 
  `https://checkout.paystack.com/...?reference=${payment.reference}`;

// After payment, Paystack redirects back with reference
// Verify payment server-side
const verified = await verifyPayment({
  reference: params.reference,
  transactionId: response.transactionId,
  status: response.status,
});
```

### 2. Set up Paystack Webhook
In Vercel/Convex backend, create an HTTP endpoint that:
1. Receives webhook from Paystack
2. Calls `verifyPayment`
3. Returns 200 OK

## Best Practices

1. **Error Handling**
```typescript
try {
  const result = await createPayment({ ... });
} catch (error) {
  console.error("Payment failed:", error);
  // Show user-friendly error
}
```

2. **Loading States**
```typescript
const [isLoading, setIsLoading] = useState(false);

const handleAction = async () => {
  setIsLoading(true);
  try {
    await createPayment({ ... });
  } finally {
    setIsLoading(false);
  }
};
```

3. **Real-time Queries**
Use `useQuery` for data that changes:
```typescript
const stories = useStories(creatorId); // Auto-updates
```

4. **Caching**
Convex automatically caches queries, reducing API calls.

## Testing

### Test User Registration
```typescript
const user = await registerUser({
  firebaseUid: "test-uid",
  email: "test@example.com",
  name: "Test User",
  username: "testuser",
});
```

### Test Payment
```typescript
const payment = await createPaymentIntent({
  userId: user._id,
  amount: 50000,
  paymentType: "premium_subscription",
});

// Verify success
await verifyPayment({
  reference: payment.reference,
  transactionId: "PAY_12345",
  status: "success",
});
```

## Deployment

### Deploy Convex Functions
```bash
npx convex deploy
```

### Deploy to Vercel
```bash
vercel deploy --prod
```

## Troubleshooting

| Issue | Solution |
|-------|----------|
| "Convex function not found" | Run `npx convex deploy` |
| "User not found" | Check firebaseUid matches Firebase |
| "Payment verification failed" | Verify Paystack webhook configuration |
| "Query returning undefined" | Check database indexes in schema.ts |

## Next Steps

1. ✅ Backend API implemented
2. ⏳ Connect React components to APIs
3. ⏳ Set up Paystack webhooks
4. ⏳ Add error handling & validation
5. ⏳ Write tests

Ready to integrate these APIs into your screens!
