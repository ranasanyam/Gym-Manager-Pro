import { useQuery } from "@tanstack/react-query";
import { api } from "@shared/routes";

export function useStats() {
  return useQuery({
    queryKey: [api.stats.owner.path],
    queryFn: async () => {
      const res = await fetch(api.stats.owner.path, { credentials: "include" });
      if (!res.ok) throw new Error("Failed to fetch stats");
      const data = await res.json();
      return data;
    },
  });
}

export function useUsersList() {
  return useQuery({
    queryKey: [api.members.list.path],
    queryFn: async () => {
      const res = await fetch(api.members.list.path, { credentials: "include" });
      if (!res.ok) throw new Error("Failed to fetch users");
      const data = await res.json();
      // api returns member records with a `user` field — map to users for list usage
      if (Array.isArray(data)) {
        return data.map((m: any) => m.user).filter(Boolean);
      }
      return [];
    },
  });
}
