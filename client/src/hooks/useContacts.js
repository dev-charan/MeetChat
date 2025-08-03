import { useQuery } from "@tanstack/react-query";
import { fetchContacts } from "../lib/messageapi";

export function useContacts() {
  return useQuery({
    queryKey: ["contacts"],
    queryFn: fetchContacts,
    select: (res) => res.data.data,
  });
}
