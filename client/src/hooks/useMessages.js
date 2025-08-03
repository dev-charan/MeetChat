import { useQuery } from "@tanstack/react-query";
import { fetchMessages } from "../lib/messageapi";
import useAuthUser from "./useAuthUser"; // Import your existing auth hook

export function useMessages(otherUserId, { page = 1, limit = 50 } = {}) {
  const { authUser, isLoading: isAuthLoading } = useAuthUser();
  const currentUserId = authUser?._id;

  return useQuery({
    queryKey: ["messages", otherUserId, page],
    queryFn: async () => {
      if (!otherUserId) return [];

      try {
        const response = await fetchMessages(otherUserId, { page, limit });
        const messages = response.data.data?.messages || [];

        return messages.map((message) => ({
          ...message,
          isOwn: message.sender === currentUserId,
          senderProfilePic:
            message.profilePic || "https://avatar.iran.liara.run/public/1.png",
        }));
      } catch (error) {
        console.error("Error fetching messages:", error);
        return [];
      }
    },
    enabled: !!otherUserId && !!currentUserId && !isAuthLoading, // Wait for auth to load and get currentUserId
    staleTime: 1000 * 60 * 5, // 5 minutes
    refetchOnWindowFocus: false,
  });
}
