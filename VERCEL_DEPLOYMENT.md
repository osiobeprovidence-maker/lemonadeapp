# Vercel Deployment Guide

## Why You Were Getting 404 Errors

The 404 errors occur because Vercel was treating all routes as individual files rather than routes in a Single Page Application (SPA). When users visited `/explore`, `/story/:id`, or any other route, Vercel returned a 404 because no actual file existed at that path.

## The Fix

I've added the following configuration files to handle SPA routing on Vercel:

### 1. **vercel.json** - Main Configuration
This file:
- Specifies the build command and output directory
- Configures environment variables
- **Most importantly**: Sets up `rewrites` to redirect all routes to `index.html`
- Configures caching headers for optimal performance

### 2. **Updated vite.config.ts**
Added build optimization:
- Proper `dist` output directory
- Code splitting for vendor libraries
- Minification for production

### 3. **.vercelignore**
Excludes unnecessary files from deployment to reduce build size.

## How It Works

The `rewrites` section in `vercel.json` is the key:
```json
"rewrites": [
  {
    "source": "/(.*)",
    "destination": "/index.html"
  }
]
```

This tells Vercel: "For any route that doesn't match a static file, serve `/index.html`". React Router then handles the routing on the client side.

## Deployment Steps

1. **Add Environment Variables to Vercel Dashboard**
   - Go to: Project Settings → Environment Variables
   - Add all variables from `.env.local`:
     ```
     VITE_FIREBASE_API_KEY
     VITE_FIREBASE_AUTH_DOMAIN
     VITE_FIREBASE_PROJECT_ID
     VITE_FIREBASE_STORAGE_BUCKET
     VITE_FIREBASE_MESSAGING_SENDER_ID
     VITE_FIREBASE_APP_ID
     VITE_CONVEX_URL
     VITE_MUX_TOKEN_ID
     VITE_MUX_TOKEN_SECRET
     VITE_PAYSTACK_PUBLIC_KEY
     VITE_PAYSTACK_SECRET_KEY
     VITE_VERCEL_URL
     ```

2. **Deploy**
   ```bash
   vercel deploy --prod
   ```

3. **Verify Deployment**
   - Visit your domain
   - Test multiple routes like:
     - `/home`
     - `/explore`
     - `/story/123`
     - Refresh each page to ensure no 404s

## Common Vercel 404 Issues & Solutions

| Issue | Solution |
|-------|----------|
| 404 on all routes | Check `vercel.json` rewrites config |
| 404 on dynamic routes (e.g., `/story/:id`) | Rewrites should handle this - ensure they're in `vercel.json` |
| 404 on first load but works after refresh | Missing environment variables - add to Vercel dashboard |
| Build fails | Check build logs in Vercel dashboard - usually missing env vars |
| Missing assets/styles | Clear Vercel cache and rebuild |

## Clear Cache & Rebuild (if needed)

If you still see 404s after deploying:
1. Go to Vercel Dashboard → Project Settings
2. Under "Deployments", find your failed deployment
3. Click the three dots → "Redeploy"
4. Or: Delete the `.vercel` folder locally and redeploy

## Testing Locally

Before deploying to Vercel, test the build locally:
```bash
npm run build
npm run preview
```

This builds your app and serves it locally. Test that all routes work.

## Next Steps

1. Commit these changes:
   ```bash
   git add vercel.json .vercelignore vite.config.ts
   git commit -m "fix: Configure Vercel SPA routing and deployment"
   git push
   ```

2. Set environment variables in Vercel dashboard

3. Deploy:
   ```bash
   vercel deploy --prod
   ```

That's it! Your 404 errors should be fixed.
