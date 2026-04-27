import { ConvexReactClient } from 'convex/react';

const convexUrl = import.meta.env.VITE_CONVEX_URL;

if (!convexUrl) {
  console.warn('VITE_CONVEX_URL environment variable is not set; Convex is disabled until configured.');
}

export const convex = convexUrl ? new ConvexReactClient(convexUrl) : null;

export default convex;
