import { Navbar } from "@/components/Navbar";
import { useBookings } from "@/hooks/use-bookings";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { format } from "date-fns";
import { Calendar, Clock, MapPin, Loader2, MessageSquare } from "lucide-react";
import { useMutation } from "@tanstack/react-query";
import { apiRequest } from "@/lib/queryClient";
import { useLocation } from "wouter";

export default function Bookings() {
  const { data: bookings, isLoading } = useBookings();
  const [, setLocation] = useLocation();

  const startChatMutation = useMutation({
    mutationFn: async (bookingId: number) => {
      const response = await apiRequest("POST", `/api/bookings/${bookingId}/chat`, {});
      return response.json();
    },
    onSuccess: (conversation) => {
      setLocation(`/chat/${conversation.id}`);
    },
  });

  const getStatusColor = (status: string) => {
    switch(status) {
      case 'accepted': return 'bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-400 hover:bg-green-100 dark:hover:bg-green-900/40';
      case 'completed': return 'bg-blue-100 text-blue-700 dark:bg-blue-900/30 dark:text-blue-400 hover:bg-blue-100 dark:hover:bg-blue-900/40';
      case 'cancelled': return 'bg-red-100 text-red-700 dark:bg-red-900/30 dark:text-red-400 hover:bg-red-100 dark:hover:bg-red-900/40';
      case 'provider_noshow':
      case 'customer_noshow': return 'bg-orange-100 text-orange-700 dark:bg-orange-900/30 dark:text-orange-400 hover:bg-orange-100 dark:hover:bg-orange-900/40';
      default: return 'bg-amber-100 text-amber-700 dark:bg-amber-900/30 dark:text-amber-400 hover:bg-amber-100 dark:hover:bg-amber-900/40';
    }
  };

  const getStatusBgClass = (status: string) => {
    switch(status) {
      case 'accepted': return 'bg-green-500';
      case 'completed': return 'bg-blue-500';
      case 'cancelled': return 'bg-red-500';
      case 'provider_noshow':
      case 'customer_noshow': return 'bg-orange-500';
      default: return 'bg-amber-500';
    }
  };

  return (
    <div className="min-h-screen bg-background">
      <Navbar />
      
      <main className="container mx-auto px-4 py-8 max-w-4xl">
        <h1 className="text-3xl font-display font-bold mb-8">My Bookings</h1>

        {isLoading ? (
          <div className="flex justify-center py-12">
            <Loader2 className="w-8 h-8 animate-spin text-primary" />
          </div>
        ) : !bookings || bookings.length === 0 ? (
          <div className="text-center py-12 bg-secondary/30 rounded-2xl border border-dashed border-border">
            <Calendar className="w-12 h-12 text-muted-foreground mx-auto mb-4" />
            <h3 className="text-lg font-medium">No bookings yet</h3>
            <p className="text-muted-foreground">Find a professional and schedule your first service!</p>
          </div>
        ) : (
          <div className="grid gap-4">
            {bookings.map((booking) => (
              <Card key={booking.id} className="overflow-hidden hover:shadow-md transition-shadow" data-testid={`booking-card-${booking.id}`}>
                <CardContent className="p-0 flex flex-col sm:flex-row">
                  <div className={`w-full h-1 sm:w-2 sm:h-auto ${getStatusBgClass(booking.status)}`} />
                  
                  <div className="p-6 flex-1">
                    <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 mb-4">
                       <div>
                         <h3 className="text-lg font-bold">{booking.service.title}</h3>
                         <p className="text-sm text-muted-foreground">Booking #{booking.id}</p>
                       </div>
                       <div className="flex items-center gap-2 flex-wrap">
                         <Badge className={`${getStatusColor(booking.status)} border-none capitalize`}>
                           {booking.status.replace('_', ' ')}
                         </Badge>
                         {booking.paymentMethod === 'cash' && (
                           <Badge variant="outline" className="text-xs">
                             Cash Payment
                           </Badge>
                         )}
                       </div>
                    </div>
                    
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-sm mb-4">
                      <div className="flex items-center gap-2 text-muted-foreground">
                        <Calendar className="w-4 h-4 text-primary" />
                        <span className="font-medium text-foreground">{format(new Date(booking.date), 'MMMM d, yyyy')}</span>
                      </div>
                      <div className="flex items-center gap-2 text-muted-foreground">
                        <Clock className="w-4 h-4 text-primary" />
                        <span className="font-medium text-foreground">{format(new Date(booking.date), 'h:mm a')}</span>
                      </div>
                      <div className="flex items-center gap-2 text-muted-foreground">
                        <MapPin className="w-4 h-4 text-primary" />
                        <span>Service Location</span>
                      </div>
                    </div>

                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => startChatMutation.mutate(booking.id)}
                      disabled={startChatMutation.isPending}
                      data-testid={`button-chat-${booking.id}`}
                    >
                      <MessageSquare className="w-4 h-4 mr-2" />
                      {startChatMutation.isPending ? "Opening..." : "Chat"}
                    </Button>
                  </div>

                  <div className="bg-secondary/20 p-6 flex flex-col justify-center items-end min-w-[150px] border-t sm:border-t-0 sm:border-l">
                    <span className="text-xs text-muted-foreground uppercase font-bold">Total</span>
                    <span className="text-2xl font-bold text-primary">${booking.service.price}</span>
                    {booking.depositPaid && (
                      <span className="text-xs text-green-600 dark:text-green-400 font-medium mt-1 flex items-center">
                        Deposit Paid
                      </span>
                    )}
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        )}
      </main>
    </div>
  );
}
