"use client";
import { useQuery } from "@tanstack/react-query";
import { Banner, fetchBanners } from "@/app/lib/bannerService";

export function useBanners(type?: string) {
  const { data: banners, isLoading, error, refetch } = useQuery<Banner[], Error>({
    queryKey: ["banners", type],
    queryFn: () => fetchBanners(type),
  });

  return {
    banners: banners ?? null,
    images: (banners ?? []).map((b) => b.imageUrl),
    loading: isLoading,
    error,
    refetch,
  };
}
