import { useQuery } from "@tanstack/react-query";
import { api } from "@shared/routes";

export function useStats() {
  return useQuery({
    queryKey: [api.users.stats.path],
    queryFn: async () => {
      const res = await fetch(api.users.stats.path, { credentials: "include" });
      if (!res.ok) throw new Error("Failed to fetch stats");
      return api.users.stats.responses[200].parse(await res.json());
    },
  });
}

export function useUsersList() {
  return useQuery({
    queryKey: [api.users.list.path],
    queryFn: async () => {
      const res = await fetch(api.users.list.path, { credentials: "include" });
      if (!res.ok) throw new Error("Failed to fetch users");
      return api.users.list.responses[200].parse(await res.json());
    },
  });
}
