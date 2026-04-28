import { useQuery, useMutation } from "convex/react";
import { api } from "../../convex/_generated/api";
import { useCallback, useEffect, useState } from "react";
import { getAuth, onAuthStateChanged } from "firebase/auth";

/**
 * Custom React hooks for API calls
 */

// Hook for authentication
export const useCurrentUser = () => {
  const auth = getAuth();
  const [firebaseUid, setFirebaseUid] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, (user) => {
      setFirebaseUid(user?.uid || null);
      setIsLoading(false);
    });

    return unsubscribe;
  }, [auth]);

  const user = useQuery(
    api.auth_api.getCurrentUser,
    firebaseUid ? { firebaseUid } : "skip"
  );

  return { user, isLoading, firebaseUid };
};

// Hook for stories
export const useStories = (creatorId?: string) => {
  const stories = creatorId
    ? useQuery(api.stories_api.getStoriesByCreator, { creatorId })
    : useQuery(api.stories_api.getTrendingStories, {});

  return stories;
};

// Hook for searching stories
export const useSearchStories = (query: string, genre?: string) => {
  const results = useQuery(
    query ? api.stories_api.searchStories : "skip",
    query ? { query, genre } : "skip"
  );

  return results;
};

// Hook for story details
export const useStoryById = (storyId: string) => {
  const story = useQuery(api.stories_api.getStoryById, { storyId });
  return story;
};

// Hook for payments
export const usePaymentHistory = (userId: string) => {
  const payments = useQuery(api.payments_api.getPaymentHistory, { userId });
  return payments;
};

// Hook for wallet balance
export const useWalletBalance = (userId: string) => {
  const balance = useQuery(
    userId ? api.payments_api.getWalletBalance : "skip",
    userId ? { userId } : "skip"
  );

  return balance;
};

// Hook for creating a payment
export const useCreatePayment = () => {
  const mutation = useMutation(api.payments_api.createPaymentIntent);

  return useCallback(
    (args: Parameters<typeof mutation>[0]) => {
      return mutation(args);
    },
    [mutation]
  );
};

// Hook for verifying payment
export const useVerifyPayment = () => {
  const mutation = useMutation(api.payments_api.verifyPayment);

  return useCallback(
    (args: Parameters<typeof mutation>[0]) => {
      return mutation(args);
    },
    [mutation]
  );
};

// Hook for following/unfollowing
export const useFollowCreator = () => {
  const followMutation = useMutation(api.auth_api.followCreator);
  const unfollowMutation = useMutation(api.auth_api.unfollowCreator);

  return {
    follow: useCallback(
      (userId: string, creatorId: string) =>
        followMutation({ userId, creatorId }),
      [followMutation]
    ),
    unfollow: useCallback(
      (userId: string, creatorId: string) =>
        unfollowMutation({ userId, creatorId }),
      [unfollowMutation]
    ),
  };
};

// Hook for saving/unsaving stories
export const useSaveStory = () => {
  const saveMutation = useMutation(api.auth_api.saveStory);
  const unsaveMutation = useMutation(api.auth_api.unsaveStory);

  return {
    save: useCallback(
      (userId: string, storyId: string) =>
        saveMutation({ userId, storyId }),
      [saveMutation]
    ),
    unsave: useCallback(
      (userId: string, storyId: string) =>
        unsaveMutation({ userId, storyId }),
      [unsaveMutation]
    ),
  };
};

// Hook for getting saved stories
export const useSavedStories = (userId: string) => {
  const stories = useQuery(
    userId ? api.auth_api.getSavedStories : "skip",
    userId ? { userId } : "skip"
  );

  return stories;
};

// Hook for getting followed creators
export const useFollowedCreators = (userId: string) => {
  const creators = useQuery(
    userId ? api.auth_api.getFollowedCreators : "skip",
    userId ? { userId } : "skip"
  );

  return creators;
};

// Hook for registering user
export const useRegisterUser = () => {
  const mutation = useMutation(api.auth_api.registerUser);

  return useCallback(
    (args: Parameters<typeof mutation>[0]) => {
      return mutation(args);
    },
    [mutation]
  );
};

// Hook for updating user profile
export const useUpdateUserProfile = () => {
  const mutation = useMutation(api.auth_api.updateUserProfile);

  return useCallback(
    (args: Parameters<typeof mutation>[0]) => {
      return mutation(args);
    },
    [mutation]
  );
};

// Hook for applying for creator access
export const useApplyForCreatorAccess = () => {
  const mutation = useMutation(api.auth_api.applyForCreatorAccess);

  return useCallback(
    (args: Parameters<typeof mutation>[0]) => {
      return mutation(args);
    },
    [mutation]
  );
};

// Hook for creating a story
export const useCreateStory = () => {
  const mutation = useMutation(api.stories_api.createStory);

  return useCallback(
    (args: Parameters<typeof mutation>[0]) => {
      return mutation(args);
    },
    [mutation]
  );
};

// Hook for updating a story
export const useUpdateStory = () => {
  const mutation = useMutation(api.stories_api.updateStory);

  return useCallback(
    (args: Parameters<typeof mutation>[0]) => {
      return mutation(args);
    },
    [mutation]
  );
};

// Hook for publishing a story
export const usePublishStory = () => {
  const mutation = useMutation(api.stories_api.publishStory);

  return useCallback(
    (args: Parameters<typeof mutation>[0]) => {
      return mutation(args);
    },
    [mutation]
  );
};
