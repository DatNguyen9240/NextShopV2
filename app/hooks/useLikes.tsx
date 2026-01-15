"use client";
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import * as likeService from '@/app/services/productLikeService';
import { useAuth } from '@/app/providers/AuthProvider';
import { useRouter } from 'next/navigation';
import toast from 'react-hot-toast';

export const useLikes = () => {
  const { user } = useAuth();
  const userId = user?.id;
  const router = useRouter();
  const queryClient = useQueryClient();
  const queryKey = ['likes', userId];

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
      // optimistic update without complex typing
      await (queryClient.cancelQueries as any)(queryKey);
      const previous = (queryClient.getQueryData<string[]>(queryKey as any) as string[] | undefined) ?? [];
      const exists = previous.includes(productId);
      const next = exists ? previous.filter((id) => id !== productId) : [...previous, productId];
      queryClient.setQueryData(queryKey as any, next);
      return { previous };
    },
    onError(_err: unknown, _productId: string | undefined, context: any) {
      if (context?.previous) queryClient.setQueryData(queryKey as any, context.previous);
    },
    onSettled() {
      (queryClient.invalidateQueries as any)(queryKey);
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
    } catch (err: any) {
      if (err?.message === 'not-auth') {
        router.push('/auth/login');
      } else {
        toast.error('Thao tác thất bại');
      }
    }
  };

  return { likedIds, isLoading, isLiked, toggle };
};
