import { useQuery } from "@tanstack/react-query";
import { api, buildUrl } from "@shared/routes";

export function useProposals(rfpId: number) {
  return useQuery({
    queryKey: [api.proposals.list.path, rfpId],
    queryFn: async () => {
      const url = buildUrl(api.proposals.list.path, { id: rfpId });
      const res = await fetch(url, { credentials: "include" });
      if (!res.ok) throw new Error("Failed to fetch proposals");
      return api.proposals.list.responses[200].parse(await res.json());
    },
    enabled: !!rfpId,
  });
}
