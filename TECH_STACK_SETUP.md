# Tech Stack Integration Setup Guide

This guide covers the setup and integration of your tech stack with the Lemonade app:
- **Vercel** - Deployment & Hosting
- **Firebase** - Authentication & Storage
- **Convex** - Backend/Database
- **Mux** - Video Processing & Streaming
- **Paystack** - Payment Processing

## 1. Firebase Setup

### Install Firebase
```bash
npm install firebase
```

### Configure Firebase
1. Go to [Firebase Console](https://console.firebase.google.com/)
2. Create a new project or select existing
3. Copy your Firebase config and add to `.env.local`:

```env
VITE_FIREBASE_API_KEY=your_api_key
VITE_FIREBASE_AUTH_DOMAIN=your_project.firebaseapp.com
VITE_FIREBASE_PROJECT_ID=your_project_id
VITE_FIREBASE_STORAGE_BUCKET=your_project.appspot.com
VITE_FIREBASE_MESSAGING_SENDER_ID=your_sender_id
VITE_FIREBASE_APP_ID=your_app_id
```

### Usage in Components
```typescript
import { auth, db, storage } from '@/lib/firebase';
import { signInWithEmail, createUserWithEmail } from 'firebase/auth';
```

## 2. Convex Setup

### Install Convex
```bash
npm install convex
npx convex dev  # Initialize Convex project
```

### Configure Convex
1. Go to [Convex Dashboard](https://dashboard.convex.dev/)
2. Create a project and copy the deployment URL
3. Add to `.env.local`:

```env
VITE_CONVEX_URL=https://your-team.convex.cloud
```

### File Structure
Create a `convex/` folder at project root for backend functions:
```
convex/
  ├── _generated/
  ├── http.ts
  └── users.ts  # Your backend functions
```

## 3. Mux Video Setup

### Install Mux
```bash
npm install @mux/mux-player-react
```

### Configure Mux
1. Go to [Mux Dashboard](https://dashboard.mux.com/)
2. Create access tokens
3. Add to `.env.local`:

```env
VITE_MUX_TOKEN_ID=your_token_id
VITE_MUX_TOKEN_SECRET=your_token_secret
```

### Usage for Video Upload
```typescript
import { createMuxDirectUploadUrl } from '@/lib/mux';

const uploadUrl = await createMuxDirectUploadUrl('video.mp4');
```

### Usage for Video Playback
```typescript
import MuxPlayer from '@mux/mux-player-react';

<MuxPlayer
  playbackId="your_playback_id"
  metadata={{
    video_id: 'story_id',
    video_title: 'Story Title',
  }}
/>
```

## 4. Paystack Setup

### Install Paystack Script
The Paystack library is loaded via CDN - no npm install needed

### Configure Paystack
1. Go to [Paystack Dashboard](https://dashboard.paystack.com/)
2. Copy your API keys
3. Add to `.env.local`:

```env
VITE_PAYSTACK_PUBLIC_KEY=your_public_key
VITE_PAYSTACK_SECRET_KEY=your_secret_key
```

### Usage for Payment
```typescript
import { initializePayment, verifyPayment, naiiraToKobo } from '@/lib/paystack';

// Initialize payment
const response = await initializePayment({
  email: 'user@example.com',
  amount: naiiraToKobo(5000), // 5000 Naira
  metadata: {
    userId: 'user_id',
    type: 'premium_subscription',
  },
});

// Redirect to payment page
window.location.href = response.data.authorization_url;

// Verify payment after redirect
const verification = await verifyPayment(reference);
if (verification.data.status === 'success') {
  // Handle successful payment
}
```

## 5. Vercel Deployment

### Install Vercel CLI
```bash
npm install -g vercel
```

### Deploy to Vercel
```bash
# First deployment
vercel

# Subsequent deployments
vercel --prod
```

### Configure Environment Variables
1. Go to [Vercel Dashboard](https://vercel.com/)
2. Select your project
3. Go to Settings → Environment Variables
4. Add all your `.env.local` variables

### Domain Setup
1. In Vercel dashboard, go to Settings → Domains
2. Add your custom domain
3. Update DNS records as instructed

### Add to `.env.local`:
```env
VITE_VERCEL_URL=your-app.vercel.app
VITE_ENVIRONMENT=production
```

## Integration Testing

Run the integration status check in your app:
```typescript
import { initializeIntegrations } from '@/lib/integrations';

const status = await initializeIntegrations();
console.log('Integration Status:', status);
```

## Environment Variables Summary

Create `.env.local` with all these variables:

```env
# Firebase
VITE_FIREBASE_API_KEY=
VITE_FIREBASE_AUTH_DOMAIN=
VITE_FIREBASE_PROJECT_ID=
VITE_FIREBASE_STORAGE_BUCKET=
VITE_FIREBASE_MESSAGING_SENDER_ID=
VITE_FIREBASE_APP_ID=

# Convex
VITE_CONVEX_URL=

# Mux
VITE_MUX_TOKEN_ID=
VITE_MUX_TOKEN_SECRET=

# Paystack
VITE_PAYSTACK_PUBLIC_KEY=
VITE_PAYSTACK_SECRET_KEY=

# Vercel
VITE_VERCEL_URL=
VITE_ENVIRONMENT=production
```

## Troubleshooting

### Firebase not connecting
- Verify all Firebase config values are correct
- Check that Firebase project is active
- In development, Firebase emulators will attempt to connect

### Convex not working
- Run `npx convex dev` to start the development server
- Verify `VITE_CONVEX_URL` matches your Convex project

### Mux video not uploading
- Verify token ID and secret are correct
- Check Mux dashboard for API usage
- Ensure CORS is configured in Mux settings

### Paystack payment failing
- Verify public and secret keys are correct
- Test with Paystack test API keys first
- Check for CORS issues

### Vercel deployment issues
- Ensure all environment variables are set in Vercel dashboard
- Check build logs in Vercel dashboard
- Verify Node version compatibility

## Resources

- [Firebase Docs](https://firebase.google.com/docs)
- [Convex Docs](https://docs.convex.dev/)
- [Mux Docs](https://docs.mux.com/)
- [Paystack Docs](https://paystack.com/developers)
- [Vercel Docs](https://vercel.com/docs)
