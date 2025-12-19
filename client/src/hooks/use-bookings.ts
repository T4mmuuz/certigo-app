import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { api, type InsertBooking } from "@shared/routes";
import { useToast } from "@/hooks/use-toast";

export function useBookings() {
  return useQuery({
    queryKey: [api.bookings.list.path],
    queryFn: async () => {
      const res = await fetch(api.bookings.list.path);
      if (!res.ok) throw new Error("Failed to fetch bookings");
      return api.bookings.list.responses[200].parse(await res.json());
    },
  });
}

export function useCreateBooking() {
  const queryClient = useQueryClient();
  const { toast } = useToast();

  return useMutation({
    mutationFn: async (data: InsertBooking) => {
      // JSON dates are strings, ensure we send proper format if needed, but Zod coerce handles it usually
      // However, schema expects Date object for timestamp. Zod coercion handles date strings.
      // We need to ensure we serialize correctly.
      const payload = {
        ...data,
        // Ensure date is ISO string for JSON
        date: new Date(data.date).toISOString() as any
      };
      
      const res = await fetch(api.bookings.create.path, {
        method: api.bookings.create.method,
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });

      if (!res.ok) {
        throw new Error("Failed to create booking");
      }
      return api.bookings.create.responses[201].parse(await res.json());
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: [api.bookings.list.path] });
      toast({ title: "Booking Confirmed!", description: "Your appointment is scheduled." });
    },
    onError: (err) => {
      toast({ title: "Booking Failed", description: err.message, variant: "destructive" });
    },
  });
}
