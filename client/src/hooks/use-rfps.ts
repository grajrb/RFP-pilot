import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { api, buildUrl, type InsertRfp, type GenerateRfpRequest, type SendRfpRequest } from "@shared/routes";

// List all RFPs
export function useRfps() {
  return useQuery({
    queryKey: [api.rfps.list.path],
    queryFn: async () => {
      const res = await fetch(api.rfps.list.path, { credentials: "include" });
      if (!res.ok) throw new Error("Failed to fetch RFPs");
      return api.rfps.list.responses[200].parse(await res.json());
    },
  });
}

// Get single RFP
export function useRfp(id: number) {
  return useQuery({
    queryKey: [api.rfps.get.path, id],
    queryFn: async () => {
      const url = buildUrl(api.rfps.get.path, { id });
      const res = await fetch(url, { credentials: "include" });
      if (res.status === 404) throw new Error("RFP not found");
      if (!res.ok) throw new Error("Failed to fetch RFP");
      return api.rfps.get.responses[200].parse(await res.json());
    },
    enabled: !!id,
  });
}

// Create new RFP
export function useCreateRfp() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async (data: InsertRfp) => {
      const validated = api.rfps.create.input.parse(data);
      const res = await fetch(api.rfps.create.path, {
        method: api.rfps.create.method,
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(validated),
        credentials: "include",
      });

      if (!res.ok) {
        if (res.status === 400) {
          const error = api.rfps.create.responses[400].parse(await res.json());
          throw new Error(error.message);
        }
        throw new Error("Failed to create RFP");
      }
      return api.rfps.create.responses[201].parse(await res.json());
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: [api.rfps.list.path] });
    },
  });
}

// Update RFP
export function useUpdateRfp() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async ({ id, data }: { id: number; data: Partial<InsertRfp> }) => {
      const url = buildUrl(api.rfps.update.path, { id });
      const validated = api.rfps.update.input.parse(data);
      const res = await fetch(url, {
        method: api.rfps.update.method,
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(validated),
        credentials: "include",
      });

      if (!res.ok) throw new Error("Failed to update RFP");
      return api.rfps.update.responses[200].parse(await res.json());
    },
    onSuccess: (_, { id }) => {
      queryClient.invalidateQueries({ queryKey: [api.rfps.list.path] });
      queryClient.invalidateQueries({ queryKey: [api.rfps.get.path, id] });
    },
  });
}

// Generate Structured Requirements (AI)
export function useGenerateRfp() {
  return useMutation({
    mutationFn: async (data: GenerateRfpRequest) => {
      const validated = api.rfps.generate.input.parse(data);
      const res = await fetch(api.rfps.generate.path, {
        method: api.rfps.generate.method,
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(validated),
        credentials: "include",
      });

      if (!res.ok) throw new Error("AI Generation failed");
      return api.rfps.generate.responses[200].parse(await res.json());
    },
  });
}

// Send RFP to Vendors
export function useSendRfp() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async ({ id, vendorIds }: { id: number } & SendRfpRequest) => {
      const url = buildUrl(api.rfps.send.path, { id });
      const validated = api.rfps.send.input.parse({ vendorIds });
      const res = await fetch(url, {
        method: api.rfps.send.method,
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(validated),
        credentials: "include",
      });

      if (!res.ok) throw new Error("Failed to send RFP");
      return api.rfps.send.responses[200].parse(await res.json());
    },
    onSuccess: (_, { id }) => {
      queryClient.invalidateQueries({ queryKey: [api.rfps.get.path, id] });
    },
  });
}
