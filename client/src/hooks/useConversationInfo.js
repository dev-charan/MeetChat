import { useQuery } from "@tanstack/react-query";
import { fetchConversationInfo } from "../lib/messageapi";

// Hook for getting info about a specific conversation
export function useConversationInfo(otherUserId) {
  return useQuery({
    queryKey: ["conversation-info", otherUserId],
    queryFn: async () => {
      if (!otherUserId) return null;

      try {
        const response = await fetchConversationInfo(otherUserId);
        return response.data.data;
      } catch (error) {
        console.error("Error fetching conversation info:", error);
        return null;
      }
    },
    enabled: !!otherUserId,
    staleTime: 1000 * 60 * 10, // 10 minutes
  });
}

// Hook for getting all conversations (for sidebar)
export function useConversations() {
  return useQuery({
    queryKey: ["conversations"],
    queryFn: async () => {
      try {
        const response = await fetchConversations();
        return response.data.data || [];
      } catch (error) {
        console.error("Error fetching conversations:", error);
        return [];
      }
    },
    staleTime: 1000 * 60 * 5, // 5 minutes
    refetchOnWindowFocus: false,
  });
}

// Import the fetchConversations function
import { fetchConversations } from "../lib/messageapi";
