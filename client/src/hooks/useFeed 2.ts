import { useInfiniteQuery, useQuery } from '@tanstack/react-query';
import { getFeed, getFeedCoffee, getUserCoffees } from '../lib/api';

export function useFeed() {
  return useInfiniteQuery({
    queryKey: ['feed'],
    queryFn: ({ pageParam = 0 }) => getFeed(20, pageParam),
    getNextPageParam: (lastPage, allPages) => {
      // If we got a full page (20 items), there might be more
      if (lastPage.length === 20) {
        return allPages.length * 20;
      }
      return undefined;
    },
    initialPageParam: 0,
  });
}

export function useFeedCoffee(id: number) {
  return useQuery({
    queryKey: ['feed', 'coffee', id],
    queryFn: () => getFeedCoffee(id),
    enabled: !!id,
  });
}

export function useUserCoffees(userId: number) {
  return useQuery({
    queryKey: ['feed', 'user', userId],
    queryFn: () => getUserCoffees(userId),
    enabled: !!userId,
  });
}
