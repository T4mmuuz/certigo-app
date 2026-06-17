import { useState, useEffect, useRef } from "react";
import { Navbar } from "@/components/Navbar";
import { useBookings } from "@/hooks/use-bookings";
import { useLanguage } from "@/contexts/LanguageContext";
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
import { Calendar, Clock, MapPin, Loader2, MessageSquare, X, AlertTriangle, RotateCcw, Star, UserCheck, CheckCircle, PauseCircle, Wallet } from "lucide-react";
import { useMutation } from "@tanstack/react-query";
import { apiRequest, queryClient } from "@/lib/queryClient";
import { useLocation } from "wouter";
import { useToast } from "@/hooks/use-toast";

export default function Bookings() {
  const { data: bookings, isLoading, refetch } = useBookings();
  const { user } = useAuth();
  const { t } = useLanguage();
  const [, setLocation] = useLocation();
  const { toast } = useToast();
  const [loadingChatBookingId, setLoadingChatBookingId] = useState<number | null>(null);
  const [cancellingBookingId, setCancellingBookingId] = useState<number | null>(null);
  const [cancelReason, setCancelReason] = useState("");
  const [rebookingId, setRebookingId] = useState<number | null>(null);
  const [feedbackDialogOpen, setFeedbackDialogOpen] = useState<number | null>(null);
  const [feedbackRating, setFeedbackRating] = useState(5);
  const [feedbackComment, setFeedbackComment] = useState("");
  const [feedbackNoShow, setFeedbackNoShow] = useState(false);
  const [pauseDialogOpen, setPauseDialogOpen] = useState(null);
  const [pauseReason, setPauseReason] = useState("");
  const [reviewDialogOpen, setReviewDialogOpen] = useState(null);
  const [reviewRating, setReviewRating] = useState(5);
  const [reviewComment, setReviewComment] = useState("");

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
        cancelledBy: user?.role === "provider" ? "provider" : "customer",
        cancelReason
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

  const acceptBookingMutation = useMutation({
    mutationFn: async (bookingId) => {
      const response = await apiRequest("POST", "/api/bookings/" + bookingId + "/accept", {});
      return response.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/bookings"] });
      refetch();
      toast({ title: "Job Accepted", description: "The customer has been notified." });
    },
    onError: (error) => toast({ title: "Error", description: error.message, variant: "destructive" }),
  });

  const pauseBookingMutation = useMutation({
    mutationFn: async ({ bookingId, reason }) => {
      const response = await apiRequest("POST", "/api/bookings/" + bookingId + "/pause", { reason });
      return response.json();
    },
    onSuccess: () => {
      setPauseDialogOpen(null);
      setPauseReason("");
      queryClient.invalidateQueries({ queryKey: ["/api/bookings"] });
      refetch();
      toast({ title: "Job Paused", description: "The customer has been notified." });
    },
    onError: (error) => toast({ title: "Error", description: error.message, variant: "destructive" }),
  });

  const submitReviewMutation = useMutation({
    mutationFn: async ({ bookingId, rating, comment }) => {
      const response = await apiRequest("POST", "/api/reviews", { bookingId, rating, comment });
      return response.json();
    },
    onSuccess: () => {
      setReviewDialogOpen(null);
      setReviewRating(5);
      setReviewComment("");
      queryClient.invalidateQueries({ queryKey: ["/api/bookings"] });
      toast({ title: "Review Submitted", description: "Thank you for your feedback!" });
    },
    onError: (error) => toast({ title: "Error", description: error.message, variant: "destructive" }),
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

  // Provider location tracking — send every 5 min when has active booking
  useEffect(() => {
    if (!isProvider) return;
    const activeBooking = bookings?.find(b => b.status === 'accepted');
    if (!activeBooking) return;
    const sendLocation = () => {
      if (!navigator.geolocation) return;
      navigator.geolocation.getCurrentPosition((pos) => {
        fetch('/api/users/location', {
          method: 'PUT',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ lat: pos.coords.latitude, lng: pos.coords.longitude }),
          credentials: 'include',
        }).catch(() => {});
      });
    };
    sendLocation();
    const interval = setInterval(sendLocation, 5 * 60 * 1000);
    return () => clearInterval(interval);
  }, [isProvider, bookings]);

  // Customer — poll provider location every 30s for active bookings
  const [providerLocations, setProviderLocations] = useState<Record<number, {lat:number;lng:number}>>({});
  useEffect(() => {
    if (isProvider) return;
    const activeBookings = bookings?.filter(b => b.status === 'accepted') || [];
    if (activeBookings.length === 0) return;
    const poll = async () => {
      for (const booking of activeBookings) {
        try {
          const res = await fetch('/api/bookings/' + booking.id + '/provider-location', { credentials: 'include' });
          if (res.ok) {
            const data = await res.json();
            if (data.lat && data.lng) setProviderLocations(prev => ({ ...prev, [booking.id]: data }));
          }
        } catch {}
      }
    };
    poll();
    const interval = setInterval(poll, 30000);
    return () => clearInterval(interval);
  }, [isProvider, bookings]);


  return (
    <div className="min-h-screen bg-background">
      <Navbar />
      
      <main className="container mx-auto px-4 py-8 max-w-4xl">
        <h1 className="text-3xl font-bold mb-8">{t("nav.bookings")}</h1>

        {isLoading ? (
          <div className="flex justify-center py-12">
            <Loader2 className="w-8 h-8 animate-spin text-primary" />
          </div>
        ) : !bookings || bookings.length === 0 ? (
          <div className="text-center py-12 bg-secondary/30 rounded-2xl border border-dashed border-border">
            <Calendar className="w-12 h-12 text-muted-foreground mx-auto mb-4" />
            <h3 className="text-lg font-medium">{t("home.noServices")}</h3>
            <p className="text-muted-foreground">{t("home.expertsNearby")}</p>
          </div>
        ) : (
          <div className="grid gap-4">
            {bookings.map((booking) => {
              const isChatLoading = loadingChatBookingId === booking.id;
              const isCancelling = cancellingBookingId === booking.id;
              const isRebooking = rebookingId === booking.serviceId;
              const showCancelButton = canCancel(booking.status);
              const showRebookButton = booking.status === 'completed' && user?.role === 'customer';
              const showAcceptButton = isProvider && booking.status === 'pending';
              const showPauseButton = isProvider && booking.status === 'accepted';
              const showCompleteButton = isProvider && booking.status === 'accepted';
              const canReview = !isProvider && (booking.status === 'completed' || booking.status === 'cancelled');
              
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
                         {isProvider && (booking.jobDescription || booking.urgencyLevel || booking.estimatedBudget) && (
                        <div className="bg-muted/40 rounded-lg p-3 mb-4 space-y-1 text-sm">
                          <p className="font-semibold text-xs text-muted-foreground uppercase tracking-wide mb-2">Job Details</p>
                          {booking.jobDescription && <p><span className="font-medium">Description:</span> {booking.jobDescription}</p>}
                          {booking.urgencyLevel && <p><span className="font-medium">Urgency:</span> <span className="capitalize">{booking.urgencyLevel}</span></p>}
                          {booking.estimatedBudget && <p><span className="font-medium">Budget:</span> </p>}
                          {booking.jobSize && <p><span className="font-medium">Job Size:</span> <span className="capitalize">{booking.jobSize}</span></p>}
                        </div>
                      )}
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
                        {!isProvider && booking.status === 'accepted' && providerLocations[booking.id] && (
                          <div className="flex items-center gap-2 text-green-600 dark:text-green-400 text-xs font-medium mt-1">
                            <div className="w-2 h-2 bg-green-500 rounded-full animate-pulse" />
                            <a href={'https://www.google.com/maps?q='+providerLocations[booking.id].lat+','+providerLocations[booking.id].lng} target="_blank" rel="noopener noreferrer" className="underline">
                              Provider is on the way — View on Maps
                            </a>
                          </div>
                        )}
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
                          {isChatLoading ? t("common.loading") : t("nav.messages")}
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
                            {isRebooking ? t("common.loading") : "Book Again"}
                          </Button>
                        )}

                        {showAcceptButton && (
                          <Button size="sm" onClick={() => acceptBookingMutation.mutate(booking.id)} disabled={acceptBookingMutation.isPending}>
                            <CheckCircle className="w-4 h-4 mr-2" />
                            Accept Job
                          </Button>
                        )}

                        {showPauseButton && (
                          <Dialog open={pauseDialogOpen === booking.id} onOpenChange={(open) => { if (open) setPauseDialogOpen(booking.id); else setPauseDialogOpen(null); }}>
                            <DialogTrigger asChild>
                              <Button variant="outline" size="sm"><PauseCircle className="w-4 h-4 mr-2" />Pause Job</Button>
                            </DialogTrigger>
                            <DialogContent>
                              <DialogHeader><DialogTitle>Pause Job</DialogTitle><DialogDescription>Why are you pausing this job?</DialogDescription></DialogHeader>
                              <Textarea placeholder="Reason for pausing..." value={pauseReason} onChange={(e) => setPauseReason(e.target.value)} />
                              <DialogFooter>
                                <Button variant="outline" onClick={() => setPauseDialogOpen(null)}>Cancel</Button>
                                <Button onClick={() => pauseBookingMutation.mutate({ bookingId: booking.id, reason: pauseReason })} disabled={pauseBookingMutation.isPending}>Confirm Pause</Button>
                              </DialogFooter>
                            </DialogContent>
                          </Dialog>
                        )}

                        {showCompleteButton && (
                          <Button size="sm" className="bg-green-600 hover:bg-green-700 text-white" onClick={() => { if(confirm("Mark this job as finished?")) { apiRequest("POST", "/api/bookings/" + booking.id + "/complete", {}).then(() => { queryClient.invalidateQueries({ queryKey: ["/api/bookings"] }); refetch(); toast({ title: "Job Completed!" }); }); } }}>
                            <CheckCircle className="w-4 h-4 mr-2" />
                            Job Finished
                          </Button>
                        )}

                        {canReview && (
                          <Dialog open={reviewDialogOpen === booking.id} onOpenChange={(open) => { if (open) setReviewDialogOpen(booking.id); else setReviewDialogOpen(null); }}>
                            <DialogTrigger asChild>
                              <Button variant="outline" size="sm"><Star className="w-4 h-4 mr-2" />Leave Review</Button>
                            </DialogTrigger>
                            <DialogContent>
                              <DialogHeader><DialogTitle>Leave a Review</DialogTitle><DialogDescription>How was your experience?</DialogDescription></DialogHeader>
                              <div className="space-y-4 py-4">
                                <div className="flex gap-1">
                                  {[1,2,3,4,5].map((star) => (
                                    <button key={star} type="button" onClick={() => setReviewRating(star)}>
                                      <Star className={"w-6 h-6 " + (star <= reviewRating ? "text-amber-500 fill-amber-500" : "text-muted-foreground")} />
                                    </button>
                                  ))}
                                </div>
                                <Textarea placeholder="Share your experience..." value={reviewComment} onChange={(e) => setReviewComment(e.target.value)} />
                              </div>
                              <DialogFooter>
                                <Button variant="outline" onClick={() => setReviewDialogOpen(null)}>Cancel</Button>
                                <Button onClick={() => submitReviewMutation.mutate({ bookingId: booking.id, rating: reviewRating, comment: reviewComment })} disabled={submitReviewMutation.isPending}>Submit Review</Button>
                              </DialogFooter>
                            </DialogContent>
                          </Dialog>
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
                                                                  {isProvider && (
                                    <Textarea
                                      className="mt-2"
                                      placeholder="Reason for cancelling..."
                                      value={cancelReason}
                                      onChange={(e) => setCancelReason(e.target.value)}
                                    />
                                  )}
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

