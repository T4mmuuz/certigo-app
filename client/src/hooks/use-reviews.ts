import { useMutation, useQueryClient } from "@tanstack/react-query";
import { api, type InsertReview, buildUrl } from "@shared/routes";
import { useToast } from "@/hooks/use-toast";

export function useCreateReview() {
  const queryClient = useQueryClient();
  const { toast } = useToast();

  return useMutation({
    mutationFn: async (data: InsertReview) => {
      const validated = api.reviews.create.input.parse(data);
      const res = await fetch(api.reviews.create.path, {
        method: api.reviews.create.method,
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(validated),
      });

      if (!res.ok) {
        throw new Error("Failed to post review");
      }
      return api.reviews.create.responses[201].parse(await res.json());
    },
    onSuccess: (data) => {
      // Invalidate the specific service where this review belongs
      const url = buildUrl(api.services.get.path, { id: data.serviceId });
      queryClient.invalidateQueries({ queryKey: [url, data.serviceId] });
      queryClient.invalidateQueries({ queryKey: [api.services.get.path, data.serviceId] });
      
      toast({ title: "Review Added", description: "Thanks for your feedback!" });
    },
    onError: (err) => {
      toast({ title: "Error", description: err.message, variant: "destructive" });
    },
  });
}
