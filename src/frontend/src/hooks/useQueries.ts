import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import type { ChatMessage } from "../backend.d";
import { useActor } from "./useActor";

// ─── Frontend-only types ──────────────────────────────────────────────────────

export interface Video {
  id: string;
  videoId: string;
  title: string;
  channelName: string;
  category: string;
}

// Re-export ChatMessage as Message for compatibility
export type Message = ChatMessage;

// ─── Static video data (no backend needed for videos) ─────────────────────────

const FEATURED_VIDEOS: Video[] = [
  {
    id: "1",
    videoId: "dQw4w9WgXcQ",
    title: "Never Gonna Give You Up",
    channelName: "Rick Astley",
    category: "Music",
  },
  {
    id: "2",
    videoId: "9bZkp7q19f0",
    title: "PSY - GANGNAM STYLE",
    channelName: "officialpsy",
    category: "Music",
  },
  {
    id: "3",
    videoId: "kJQP7kiw5Fk",
    title: "Despacito",
    channelName: "Luis Fonsi",
    category: "Music",
  },
  {
    id: "4",
    videoId: "JGwWNGJdvx8",
    title: "Shape of You",
    channelName: "Ed Sheeran",
    category: "Music",
  },
  {
    id: "5",
    videoId: "hT_nvWreIhg",
    title: "Counting Stars",
    channelName: "OneRepublic",
    category: "Music",
  },
  {
    id: "6",
    videoId: "60ItHLz5WEA",
    title: "Alan Walker - Faded",
    channelName: "Alan Walker",
    category: "Music",
  },
  {
    id: "7",
    videoId: "RgKAFK5djSk",
    title: "Wiz Khalifa - See You Again",
    channelName: "Wiz Khalifa",
    category: "Music",
  },
  {
    id: "8",
    videoId: "OPf0YbXqDm0",
    title: "Mark Ronson - Uptown Funk",
    channelName: "Mark Ronson ft. Bruno Mars",
    category: "Music",
  },
];

export function useAllFeaturedVideos() {
  return useQuery<Video[]>({
    queryKey: ["videos", "featured"],
    queryFn: async () => FEATURED_VIDEOS,
    staleTime: Number.POSITIVE_INFINITY,
  });
}

export function useSearchVideos(keyword: string) {
  return useQuery<Video[]>({
    queryKey: ["videos", "search", keyword],
    queryFn: async () => {
      if (!keyword.trim()) return FEATURED_VIDEOS;
      const kw = keyword.toLowerCase();
      return FEATURED_VIDEOS.filter(
        (v) =>
          v.title.toLowerCase().includes(kw) ||
          v.channelName.toLowerCase().includes(kw) ||
          v.category.toLowerCase().includes(kw),
      );
    },
    staleTime: Number.POSITIVE_INFINITY,
  });
}

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

export function useToggleLikePost() {
  const { actor } = useActor();
  return useMutation({
    mutationFn: async (postId: bigint) => {
      if (!actor) throw new Error("No actor available");
      return actor.toggleLikePost(postId);
    },
  });
}
