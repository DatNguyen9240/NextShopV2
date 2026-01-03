"use client";
import { useQuery } from "@tanstack/react-query";
import { Advertisement, fetchAdvertisements } from "@/app/services/advertisementService";

export function useAdvertisements(type?: string) {
  const { data: advertisements, isLoading, error, refetch } = useQuery<Advertisement[], Error>({
    queryKey: ["advertisements", type],
    queryFn: () => fetchAdvertisements(type),
  });

  return {
    advertisements: advertisements ?? null,
    images: (advertisements ?? []).map((b) => b.imageUrl),
    loading: isLoading,
    error,
    refetch,
  };
}
