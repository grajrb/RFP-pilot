import { useMutation } from "@tanstack/react-query";
import { api, type InboundEmailRequest } from "@shared/routes";

export function useSimulateEmail() {
  return useMutation({
    mutationFn: async (data: InboundEmailRequest) => {
      const validated = api.webhooks.email.input.parse(data);
      const res = await fetch(api.webhooks.email.path, {
        method: api.webhooks.email.method,
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(validated),
        credentials: "include",
      });

      if (!res.ok) throw new Error("Failed to simulate email");
      return api.webhooks.email.responses[200].parse(await res.json());
    },
  });
}
