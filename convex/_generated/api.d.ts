/* eslint-disable */
/**
 * Generated `api` utility.
 *
 * THIS CODE IS AUTOMATICALLY GENERATED.
 *
 * To regenerate, run `npx convex dev`.
 * @module
 */

import type * as admin from "../admin.js";
import type * as ads from "../ads.js";
import type * as anilist from "../anilist.js";
import type * as applications from "../applications.js";
import type * as contentRequests from "../contentRequests.js";
import type * as creatorPremium from "../creatorPremium.js";
import type * as creatorQuests from "../creatorQuests.js";
import type * as creators from "../creators.js";
import type * as externalContent from "../externalContent.js";
import type * as files from "../files.js";
import type * as gamification from "../gamification.js";
import type * as imports from "../imports.js";
import type * as interactions from "../interactions.js";
import type * as migrate from "../migrate.js";
import type * as payments from "../payments.js";
import type * as paystack from "../paystack.js";
import type * as ratings from "../ratings.js";
import type * as seed from "../seed.js";
import type * as settings from "../settings.js";
import type * as stories from "../stories.js";
import type * as users from "../users.js";
import type * as webhooks from "../webhooks.js";

import type {
  ApiFromModules,
  FilterApi,
  FunctionReference,
} from "convex/server";

declare const fullApi: ApiFromModules<{
  admin: typeof admin;
  ads: typeof ads;
  anilist: typeof anilist;
  applications: typeof applications;
  contentRequests: typeof contentRequests;
  creatorPremium: typeof creatorPremium;
  creatorQuests: typeof creatorQuests;
  creators: typeof creators;
  externalContent: typeof externalContent;
  files: typeof files;
  gamification: typeof gamification;
  imports: typeof imports;
  interactions: typeof interactions;
  migrate: typeof migrate;
  payments: typeof payments;
  paystack: typeof paystack;
  ratings: typeof ratings;
  seed: typeof seed;
  settings: typeof settings;
  stories: typeof stories;
  users: typeof users;
  webhooks: typeof webhooks;
}>;

/**
 * A utility for referencing Convex functions in your app's public API.
 *
 * Usage:
 * ```js
 * const myFunctionReference = api.myModule.myFunction;
 * ```
 */
export declare const api: FilterApi<
  typeof fullApi,
  FunctionReference<any, "public">
>;

/**
 * A utility for referencing Convex functions in your app's internal API.
 *
 * Usage:
 * ```js
 * const myFunctionReference = internal.myModule.myFunction;
 * ```
 */
export declare const internal: FilterApi<
  typeof fullApi,
  FunctionReference<any, "internal">
>;

export declare const components: {};
