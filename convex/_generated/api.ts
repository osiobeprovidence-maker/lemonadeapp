/* eslint-disable */
/**
 * Generated `api` utility.
 *
 * This file is checked in so app type-checks work before the first Convex deploy.
 * Regenerate it with `npx convex dev` or `npx convex deploy`.
 */

import type { ApiFromModules, FilterApi, FunctionReference } from "convex/server";
import { anyApi } from "convex/server";
import type * as admin from "../admin.js";
import type * as applications from "../applications.js";
import type * as creators from "../creators.js";
import type * as interactions from "../interactions.js";
import type * as payments from "../payments.js";
import type * as seed from "../seed.js";
import type * as stories from "../stories.js";
import type * as users from "../users.js";

const fullApi: ApiFromModules<{
  admin: typeof admin;
  applications: typeof applications;
  creators: typeof creators;
  interactions: typeof interactions;
  payments: typeof payments;
  seed: typeof seed;
  stories: typeof stories;
  users: typeof users;
}> = anyApi as any;

export const api: FilterApi<typeof fullApi, FunctionReference<any, "public">> = anyApi as any;
export const internal: FilterApi<typeof fullApi, FunctionReference<any, "internal">> = anyApi as any;
