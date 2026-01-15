"use client";
import { useQuery, useMutation, useQueryClient, type QueryKey } from '@tanstack/react-query';
import * as likeService from '@/app/services/productLikeService';
import { useAuth } from '@/app/providers/AuthProvider';
import { useRouter } from 'next/navigation';
import toast from 'react-hot-toast';

export const useLikes = () => {
  const { user } = useAuth();
  const userId = user?.id;
  const router = useRouter();
  const queryClient = useQueryClient();
  const queryKey: QueryKey = ['likes', userId];

  const { data: likedIds = [], isLoading } = useQuery<string[]>({
    queryKey: queryKey,
    queryFn: () => likeService.getLikedProductIds(userId!),
    enabled: !!userId,
    staleTime: 1000 * 60 * 5, // 5 minutes
  });

  const mutation = useMutation<string, unknown, string>({
    mutationFn: (productId: string) => likeService.toggleLike(productId),
    async onMutate(productId: string) {
      if (!userId) {
        // Not authenticated
        throw new Error('not-auth');
      }
      // optimistic update
      await queryClient.cancelQueries({ queryKey });
      const previous = (queryClient.getQueryData<string[]>(queryKey) as string[] | undefined) ?? [];
      const exists = previous.includes(productId);
      const next = exists ? previous.filter((id) => id !== productId) : [...previous, productId];
      queryClient.setQueryData(queryKey, next);
      return { previous };
    },
    onError(error, _productId, context) {
      const ctx = context as { previous?: string[] } | undefined;
      if (ctx?.previous) queryClient.setQueryData(queryKey, ctx.previous);
    },
    onSettled() {
      queryClient.invalidateQueries({ queryKey });
    },
  });

  const isLiked = (productId: string) => {
    return (likedIds ?? []).includes(productId);
  };

  const toggle = async (productId: string) => {
    if (!userId) {
      router.push('/auth/login');
      return;
    }
    try {
      await mutation.mutateAsync(productId);
    } catch (err: unknown) {
      const message = (err as { message?: string })?.message;
      if (message === 'not-auth') {
        router.push('/auth/login');
      } else {
        toast.error('Thao tác thất bại');
      }
    }
  };

  return { likedIds, isLoading, isLiked, toggle };
};
