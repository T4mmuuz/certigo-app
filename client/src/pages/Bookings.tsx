import { useState } from "react";
import { Navbar } from "@/components/Navbar";
import { useBookings } from "@/hooks/use-bookings";
import { useAuth } from "@/hooks/use-auth";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from "@/components/ui/alert-dialog";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { Textarea } from "@/components/ui/textarea";
import { Checkbox } from "@/components/ui/checkbox";
import { Label } from "@/components/ui/label";
import { format } from "date-fns";
import { Calendar, Clock, MapPin, Loader2, MessageSquare, X, AlertTriangle, RotateCcw, Star, UserCheck } from "lucide-react";
import { useMutation } from "@tanstack/react-query";
import { apiRequest, queryClient } from "@/lib/queryClient";
import { useLocation } from "wouter";
import { useToast } from "@/hooks/use-toast";

export default function Bookings() {
  const { data: bookings, isLoading, refetch } = useBookings();
  const { user } = useAuth();
  const [, setLocation] = useLocation();
  const { toast } = useToast();
  const [loadingChatBookingId, setLoadingChatBookingId] = useState<number | null>(null);
  const [cancellingBookingId, setCancellingBookingId] = useState<number | null>(null);
  const [rebookingId, setRebookingId] = useState<number | null>(null);
  const [feedbackDialogOpen, setFeedbackDialogOpen] = useState<number | null>(null);
  const [feedbackRating, setFeedbackRating] = useState(5);
  const [feedbackComment, setFeedbackComment] = useState("");
  const [feedbackNoShow, setFeedbackNoShow] = useState(false);

  const startChatMutation = useMutation({
    mutationFn: async (bookingId: number) => {
      setLoadingChatBookingId(bookingId);
      const response = await apiRequest("POST", `/api/bookings/${bookingId}/chat`, {});
      return response.json();
    },
    onSuccess: (conversation) => {
      setLoadingChatBookingId(null);
      if (conversation?.id) {
        setLocation(`/chat/${conversation.id}`);
      } else {
        toast({
          title: "Unable to open chat",
          description: "Could not create conversation. Please try again.",
          variant: "destructive",
        });
      }
    },
    onError: (error: Error) => {
      setLoadingChatBookingId(null);
      toast({
        title: "Error",
        description: error.message || "Failed to start chat. Please try again.",
        variant: "destructive",
      });
    },
  });

  const cancelBookingMutation = useMutation({
    mutationFn: async (bookingId: number) => {
      setCancellingBookingId(bookingId);
      const response = await apiRequest("POST", `/api/bookings/${bookingId}/cancel`, {
        cancelledBy: user?.role === "provider" ? "provider" : "customer"
      });
      return response.json();
    },
    onSuccess: (data) => {
      setCancellingBookingId(null);
      queryClient.invalidateQueries({ queryKey: ["/api/bookings"] });
      refetch();
      toast({
        title: "Booking Cancelled",
        description: data.message || "Your booking has been cancelled.",
      });
    },
    onError: (error: Error) => {
      setCancellingBookingId(null);
      toast({
        title: "Error",
        description: error.message || "Failed to cancel booking. Please try again.",
        variant: "destructive",
      });
    },
  });

  const rebookMutation = useMutation({
    mutationFn: async ({ serviceId, hours }: { serviceId: number; hours: number }) => {
      setRebookingId(serviceId);
      const tomorrow = new Date();
      tomorrow.setDate(tomorrow.getDate() + 1);
      tomorrow.setHours(10, 0, 0, 0);
      
      const response = await apiRequest("POST", "/api/bookings", {
        serviceId,
        date: tomorrow.toISOString(),
        paymentMethod: "app",
        hours,
      });
      return response.json();
    },
    onSuccess: () => {
      setRebookingId(null);
      queryClient.invalidateQueries({ queryKey: ["/api/bookings"] });
      refetch();
      toast({
        title: "Booking Created",
        description: "Your repeat booking has been scheduled for tomorrow at 10 AM.",
      });
    },
    onError: (error: Error) => {
      setRebookingId(null);
      toast({
        title: "Error",
        description: error.message || "Failed to create booking. Please try again.",
        variant: "destructive",
      });
    },
  });

  const submitFeedbackMutation = useMutation({
    mutationFn: async ({ bookingId, rating, comment, noShow }: { bookingId: number; rating: number; comment: string; noShow: boolean }) => {
      const response = await apiRequest("POST", `/api/bookings/${bookingId}/customer-feedback`, {
        rating,
        comment: comment || null,
        noShow,
      });
      return response.json();
    },
    onSuccess: () => {
      setFeedbackDialogOpen(null);
      setFeedbackRating(5);
      setFeedbackComment("");
      setFeedbackNoShow(false);
      toast({
        title: "Feedback Submitted",
        description: "Your feedback about the customer has been recorded.",
      });
    },
    onError: (error: Error) => {
      toast({
        title: "Error",
        description: error.message || "Failed to submit feedback. Please try again.",
        variant: "destructive",
      });
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

  const canCancel = (status: string) => {
    return status === 'pending' || status === 'accepted';
  };

  const isProvider = user?.role === "provider";

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
            {bookings.map((booking) => {
              const isChatLoading = loadingChatBookingId === booking.id;
              const isCancelling = cancellingBookingId === booking.id;
              const isRebooking = rebookingId === booking.serviceId;
              const showCancelButton = canCancel(booking.status);
              const showRebookButton = booking.status === 'completed' && user?.role === 'customer';
              
              return (
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

                      <div className="flex items-center gap-2 flex-wrap">
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => startChatMutation.mutate(booking.id)}
                          disabled={isChatLoading || startChatMutation.isPending}
                          data-testid={`button-chat-${booking.id}`}
                        >
                          {isChatLoading ? (
                            <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                          ) : (
                            <MessageSquare className="w-4 h-4 mr-2" />
                          )}
                          {isChatLoading ? "Opening..." : "Chat"}
                        </Button>

                        {showRebookButton && (
                          <Button
                            variant="outline"
                            size="sm"
                            onClick={() => rebookMutation.mutate({ serviceId: booking.serviceId, hours: booking.hours })}
                            disabled={isRebooking || rebookMutation.isPending}
                            data-testid={`button-rebook-${booking.id}`}
                          >
                            {isRebooking ? (
                              <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                            ) : (
                              <RotateCcw className="w-4 h-4 mr-2" />
                            )}
                            {isRebooking ? "Booking..." : "Book Again"}
                          </Button>
                        )}

                        {/* Rate Customer button for providers on completed bookings */}
                        {isProvider && (booking.status === 'completed' || booking.status === 'customer_noshow') && (
                          <Dialog open={feedbackDialogOpen === booking.id} onOpenChange={(open) => {
                            if (open) {
                              setFeedbackDialogOpen(booking.id);
                              setFeedbackNoShow(booking.status === 'customer_noshow');
                            } else {
                              setFeedbackDialogOpen(null);
                            }
                          }}>
                            <DialogTrigger asChild>
                              <Button
                                variant="outline"
                                size="sm"
                                data-testid={`button-rate-customer-${booking.id}`}
                              >
                                <UserCheck className="w-4 h-4 mr-2" />
                                Rate Customer
                              </Button>
                            </DialogTrigger>
                            <DialogContent>
                              <DialogHeader>
                                <DialogTitle>Rate Customer</DialogTitle>
                                <DialogDescription>
                                  Share your experience working with this customer.
                                </DialogDescription>
                              </DialogHeader>
                              
                              <div className="space-y-4 py-4">
                                <div className="space-y-2">
                                  <Label>Rating</Label>
                                  <div className="flex gap-1">
                                    {[1, 2, 3, 4, 5].map((star) => (
                                      <button
                                        key={star}
                                        type="button"
                                        onClick={() => setFeedbackRating(star)}
                                        className="p-1"
                                      >
                                        <Star 
                                          className={`w-6 h-6 ${star <= feedbackRating ? 'text-amber-500 fill-amber-500' : 'text-muted-foreground'}`}
                                        />
                                      </button>
                                    ))}
                                  </div>
                                </div>
                                
                                <div className="space-y-2">
                                  <Label htmlFor="comment">Comment (optional)</Label>
                                  <Textarea
                                    id="comment"
                                    placeholder="How was your experience with this customer?"
                                    value={feedbackComment}
                                    onChange={(e) => setFeedbackComment(e.target.value)}
                                  />
                                </div>
                                
                                <div className="flex items-center space-x-2">
                                  <Checkbox 
                                    id="noshow" 
                                    checked={feedbackNoShow}
                                    onCheckedChange={(checked) => setFeedbackNoShow(checked as boolean)}
                                  />
                                  <Label htmlFor="noshow" className="text-sm font-normal">
                                    Customer was not at the location (no-show)
                                  </Label>
                                </div>
                              </div>
                              
                              <DialogFooter>
                                <Button
                                  variant="outline"
                                  onClick={() => setFeedbackDialogOpen(null)}
                                >
                                  Cancel
                                </Button>
                                <Button
                                  onClick={() => submitFeedbackMutation.mutate({
                                    bookingId: booking.id,
                                    rating: feedbackRating,
                                    comment: feedbackComment,
                                    noShow: feedbackNoShow,
                                  })}
                                  disabled={submitFeedbackMutation.isPending}
                                >
                                  {submitFeedbackMutation.isPending ? (
                                    <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                                  ) : null}
                                  Submit Feedback
                                </Button>
                              </DialogFooter>
                            </DialogContent>
                          </Dialog>
                        )}

                        {showCancelButton && (
                          <AlertDialog>
                            <AlertDialogTrigger asChild>
                              <Button
                                variant="outline"
                                size="sm"
                                className="text-destructive border-destructive/50"
                                disabled={isCancelling}
                                data-testid={`button-cancel-${booking.id}`}
                              >
                                {isCancelling ? (
                                  <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                                ) : (
                                  <X className="w-4 h-4 mr-2" />
                                )}
                                Cancel
                              </Button>
                            </AlertDialogTrigger>
                            <AlertDialogContent>
                              <AlertDialogHeader>
                                <AlertDialogTitle className="flex items-center gap-2">
                                  <AlertTriangle className="w-5 h-5 text-destructive" />
                                  Cancel Booking
                                </AlertDialogTitle>
                                <AlertDialogDescription className="space-y-3">
                                  <p>Are you sure you want to cancel this booking for <strong>{booking.service.title}</strong>?</p>
                                  
                                  <div className="bg-muted/50 p-3 rounded-md text-sm space-y-2">
                                    <p className="font-medium text-foreground">Refund Policy:</p>
                                    {isProvider ? (
                                      <p className="text-green-600 dark:text-green-400">
                                        As a provider, if you cancel, the customer will receive a full refund.
                                      </p>
                                    ) : (
                                      <p className="text-amber-600 dark:text-amber-400">
                                        Customer cancellations are not eligible for refunds. Only provider cancellations or no-shows result in refunds.
                                      </p>
                                    )}
                                  </div>
                                </AlertDialogDescription>
                              </AlertDialogHeader>
                              <AlertDialogFooter>
                                <AlertDialogCancel>Keep Booking</AlertDialogCancel>
                                <AlertDialogAction
                                  className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
                                  onClick={() => cancelBookingMutation.mutate(booking.id)}
                                >
                                  Yes, Cancel Booking
                                </AlertDialogAction>
                              </AlertDialogFooter>
                            </AlertDialogContent>
                          </AlertDialog>
                        )}
                      </div>
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
              );
            })}
          </div>
        )}
      </main>
    </div>
  );
}
