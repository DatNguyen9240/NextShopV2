"use client";
import { useQuery } from "@tanstack/react-query";
import { Advertisement, fetchGroupedAdvertisements } from "@/app/services/advertisementService";

export function useAdvertisements(type?: string) {
  // Fetch grouped data once and share it between components
  const { data: grouped, isLoading, error, refetch } = useQuery<Record<string, Advertisement[]>, Error>({
    queryKey: ["advertisements", "grouped"],
    queryFn: () => fetchGroupedAdvertisements(),
  });

  const ads = type ? (grouped?.[type] ?? []) : ([] as Advertisement[]);

  return {
    advertisements: type ? (ads ?? null) : grouped ?? null,
    images: type ? ads.map((b) => b.imageUrl) : Object.values(grouped ?? {}).flat().map((b) => b.imageUrl),
    loading: isLoading,
    error,
    refetch,
  };
}
