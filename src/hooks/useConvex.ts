import { useCallback } from 'react';
import { useApp } from '../contexts/AppContext';
import { generateReference, initializePayment } from '../lib/paystack';
import { auth } from '../lib/firebase';

export const useCurrentUser = () => {
  const { user } = useApp();
  return {
    user: user ? ({ ...user, _id: user.id, followers: user.followedCreators } as any) : null,
    isLoading: false,
    firebaseUid: auth.currentUser?.uid || null,
  };
};

export const useStories = (creatorId?: string) => {
  const { stories, user } = useApp();

  if (!creatorId) {
    return stories;
  }

  const username = user?.username;
  return username ? stories.filter((story) => story.creator.username === username) : stories;
};

export const useTrendingStories = () => {
  const { stories } = useApp();
  return [...stories].sort((a, b) => (b.views || 0) - (a.views || 0)).slice(0, 6);
};

export const useSearchStories = (query: string, genre?: string) => {
  const { stories } = useApp();
  const normalizedQuery = query.trim().toLowerCase();

  return stories.filter((story) => {
    const matchesQuery =
      !normalizedQuery ||
      story.title.toLowerCase().includes(normalizedQuery) ||
      story.creator.name.toLowerCase().includes(normalizedQuery) ||
      story.tags.some((tag) => tag.toLowerCase().includes(normalizedQuery));

    const matchesGenre = !genre || story.genre === genre;
    return matchesQuery && matchesGenre;
  });
};

export const useStoryById = (storyId: string) => {
  const { stories } = useApp();
  return stories.find((story) => story.id === storyId) || stories[0] || null;
};

export const usePaymentHistory = (_userId: string) => [];
export const useWalletBalance = (_userId: string) => null;

export const useCreatePayment = () => {
  return useCallback(
    async (args: { amount: number; userId: string; planType: string; billingCycle: string }) => {
      const email = auth.currentUser?.email;
      if (!email) {
        throw new Error('Please sign in before starting a payment.');
      }

      // Determine plan code for recurring subscriptions
      let plan = undefined;
      if (args.planType === 'premium') {
        plan = args.billingCycle === 'monthly' 
          ? import.meta.env.VITE_PAYSTACK_PLAN_MONTHLY 
          : import.meta.env.VITE_PAYSTACK_PLAN_YEARLY;
      } else if (args.planType === 'patron') {
        plan = args.billingCycle === 'monthly'
          ? import.meta.env.VITE_PAYSTACK_PLAN_PATRON_MONTHLY
          : import.meta.env.VITE_PAYSTACK_PLAN_PATRON_YEARLY;
      }

      const reference = generateReference();
      const response = await initializePayment({
        email,
        amount: plan ? 0 : Math.round(args.amount * 100), // Convert Naira to Kobo if no plan
        reference,
        plan: plan || undefined, // Ensure it's undefined if empty string
        metadata: {
          userId: args.userId,
          planType: args.planType,
          billingCycle: args.billingCycle,
          product: 'premium',
        },
      });

      return {
        reference,
        authorizationUrl: response?.data?.authorization_url,
      };
    },
    [],
  );
};

export const useVerifyPayment = () => {
  return useCallback(async () => null, []);
};

export const useFollowCreator = () => {
  const { followCreator, unfollowCreator } = useApp();
  return {
    follow: useCallback((_userId: string, creatorId: string) => followCreator(creatorId), [followCreator]),
    unfollow: useCallback((_userId: string, creatorId: string) => unfollowCreator(creatorId), [unfollowCreator]),
  };
};

export const useSaveStory = () => {
  const { saveStory, unsaveStory } = useApp();
  return {
    save: useCallback((_userId: string, storyId: string) => saveStory(storyId), [saveStory]),
    unsave: useCallback((_userId: string, storyId: string) => unsaveStory(storyId), [unsaveStory]),
  };
};

export const useSavedStories = (_userId?: string) => {
  const { user, stories } = useApp();
  if (!user || user.isGuest) return [];
  return stories.filter((story) => user.savedStories.includes(story.id));
};

export const useFollowedCreators = (_userId?: string) => {
  const { user, creators } = useApp();
  if (!user || user.isGuest) return [];
  return (Object.values(creators) as any[]).filter((creator) => user.followedCreators.includes(creator.username));
};

export const useRegisterUser = () => {
  return useCallback(async () => null, []);
};

export const useUpdateUserProfile = () => {
  return useCallback(async (args: any) => {
    return await convex.mutation(api.users.updateProfile, args);
  }, []);
};

export const useApplyForCreatorAccess = () => {
  return useCallback(async (args: any) => {
    return await convex.mutation(api.users.submitCreatorApplication, args);
  }, []);
};

export const useCreateStory = () => {
  return useCallback(async (args: any) => {
    return await convex.mutation(api.stories.create, args);
  }, []);
};

export const useUpdateStory = () => {
  return useCallback(async (args: any) => {
    return await convex.mutation(api.stories.update, args);
  }, []);
};

export const usePublishStory = () => {
  return useCallback(async (args: any) => {
    return await convex.mutation(api.stories.publish, args);
  }, []);
};
