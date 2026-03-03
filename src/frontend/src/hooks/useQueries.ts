import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import type { Message, Video } from "../backend.d";
import { useActor } from "./useActor";

export function useAllFeaturedVideos() {
  const { actor, isFetching } = useActor();
  return useQuery<Video[]>({
    queryKey: ["videos", "featured"],
    queryFn: async () => {
      if (!actor) return [];
      return actor.getAllFeaturedVideos();
    },
    enabled: !!actor && !isFetching,
  });
}

export function useVideosByCategory(category: string) {
  const { actor, isFetching } = useActor();
  return useQuery<Video[]>({
    queryKey: ["videos", "category", category],
    queryFn: async () => {
      if (!actor) return [];
      return actor.getVideosByCategory(category);
    },
    enabled: !!actor && !isFetching,
  });
}

export function useSearchVideos(keyword: string) {
  const { actor, isFetching } = useActor();
  return useQuery<Video[]>({
    queryKey: ["videos", "search", keyword],
    queryFn: async () => {
      if (!actor) return [];
      if (!keyword.trim()) return actor.getAllFeaturedVideos();
      return actor.searchVideosByKeyword(keyword);
    },
    enabled: !!actor && !isFetching,
  });
}

export type { Video, Message };

// ─── Chat Queries ─────────────────────────────────────────────────────────────

export function useChatHistory() {
  const { actor, isFetching } = useActor();
  return useQuery<Message[]>({
    queryKey: ["chat", "history"],
    queryFn: async () => {
      if (!actor) return [];
      return actor.getChatHistory();
    },
    enabled: !!actor && !isFetching,
  });
}

export function useSendMessage() {
  const { actor } = useActor();
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async (text: string) => {
      if (!actor) throw new Error("No actor available");
      return actor.sendMessage(text);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["chat", "history"] });
    },
  });
}

export function useClearChatHistory() {
  const { actor } = useActor();
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async () => {
      if (!actor) throw new Error("No actor available");
      return actor.clearChatHistory();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["chat", "history"] });
    },
  });
}
