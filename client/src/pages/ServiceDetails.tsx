import { useRoute } from "wouter";
import { useService } from "@/hooks/use-services";
import { useCreateBooking } from "@/hooks/use-bookings";
import { Navbar } from "@/components/Navbar";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { Calendar } from "@/components/ui/calendar";
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Separator } from "@/components/ui/separator";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Star, MapPin, CheckCircle2, ShieldCheck, Clock, Calendar as CalendarIcon, Loader2, CreditCard } from "lucide-react";
import { useState } from "react";
import { useAuth } from "@/hooks/use-auth";
import { useToast } from "@/hooks/use-toast";
import { apiRequest } from "@/lib/queryClient";

export default function ServiceDetails() {
  const [match, params] = useRoute("/services/:id");
  const id = parseInt(params?.id || "0");
  const { data: service, isLoading } = useService(id);
  const { mutateAsync: createBooking, isPending } = useCreateBooking();
  const { user } = useAuth();
  const { toast } = useToast();

  const [date, setDate] = useState<Date | undefined>(new Date());
  const [hours, setHours] = useState(1);
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [step, setStep] = useState<"date" | "payment" | "success">("date");
  const [isProcessing, setIsProcessing] = useState(false);

  if (isLoading) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <Loader2 className="w-8 h-8 animate-spin text-primary" />
      </div>
    );
  }

  if (!service) return <div>Not found</div>;

  const handleBook = async () => {
    if (!user) {
      toast({ title: "Please log in", description: "You need an account to book services.", variant: "destructive" });
      return;
    }
    if (!date) return;
    
    setIsProcessing(true);
    try {
      // Create checkout session with Stripe
      const response = await apiRequest("POST", "/api/checkout", {
        serviceId: service.id,
        hours,
      });
      const data = await response.json();
      
      if (data.url) {
        // Redirect to Stripe checkout
        window.location.href = data.url;
      } else {
        throw new Error("No checkout URL received");
      }
    } catch (error) {
      console.error("Checkout error:", error);
      toast({ 
        title: "Payment Error", 
        description: "Could not start checkout. Please try again.", 
        variant: "destructive" 
      });
      setIsProcessing(false);
    }
  };

  return (
    <div className="min-h-screen bg-secondary/20 font-sans">
      <Navbar />
      
      <main className="container mx-auto px-4 py-8">
        <div className="max-w-6xl mx-auto grid grid-cols-1 lg:grid-cols-3 gap-8">
          
          {/* Main Content */}
          <div className="lg:col-span-2 space-y-6">
            {/* Header Card */}
            <Card className="p-0 overflow-hidden border-none shadow-lg">
              <div className="h-32 bg-gradient-to-r from-primary to-blue-600 relative">
                <div className="absolute -bottom-10 left-8">
                  <Avatar className="w-24 h-24 border-4 border-white shadow-md">
                    <AvatarFallback className="bg-orange-100 text-orange-600 text-2xl font-bold">
                      {service.provider.name.charAt(0)}
                    </AvatarFallback>
                  </Avatar>
                </div>
              </div>
              <div className="pt-12 pb-6 px-8">
                <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
                  <div>
                    <h1 className="text-3xl font-display font-bold text-foreground">{service.title}</h1>
                    <div className="flex items-center text-muted-foreground mt-1 gap-4 text-sm">
                      <span className="flex items-center"><MapPin className="w-4 h-4 mr-1" /> {service.lat.toFixed(3)}, {service.lng.toFixed(3)} (Approx)</span>
                      <span className="flex items-center"><ShieldCheck className="w-4 h-4 mr-1 text-green-600" /> Verified Pro</span>
                    </div>
                  </div>
                  <div className="flex flex-col items-end">
                     <div className="flex items-center bg-amber-50 px-3 py-1 rounded-full border border-amber-100">
                        <Star className="w-5 h-5 fill-amber-500 text-amber-500 mr-1.5" />
                        <span className="font-bold text-lg text-amber-700">4.8</span>
                        <span className="text-amber-600/60 text-sm ml-1">(124 reviews)</span>
                     </div>
                  </div>
                </div>
              </div>
            </Card>

            {/* Description */}
            <Card className="p-8 shadow-sm border-border/60">
              <h2 className="text-xl font-bold mb-4">About this service</h2>
              <p className="text-muted-foreground leading-relaxed whitespace-pre-wrap">
                {service.description}
              </p>
              
              <div className="mt-8 grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="flex items-start gap-3 p-4 rounded-xl bg-secondary/50">
                  <div className="bg-white p-2 rounded-lg shadow-sm text-primary"><CheckCircle2 className="w-5 h-5" /></div>
                  <div>
                    <h4 className="font-bold text-sm">Satisfaction Guarantee</h4>
                    <p className="text-xs text-muted-foreground mt-1">If you aren't happy, we'll make it right.</p>
                  </div>
                </div>
                <div className="flex items-start gap-3 p-4 rounded-xl bg-secondary/50">
                   <div className="bg-white p-2 rounded-lg shadow-sm text-primary"><Clock className="w-5 h-5" /></div>
                   <div>
                    <h4 className="font-bold text-sm">Quick Response</h4>
                    <p className="text-xs text-muted-foreground mt-1">Usually responds within 1 hour.</p>
                  </div>
                </div>
              </div>
            </Card>

            {/* Reviews */}
            <div className="space-y-4">
              <h3 className="text-xl font-bold px-1">Recent Reviews</h3>
              {service.reviews && service.reviews.length > 0 ? (
                service.reviews.map((review) => (
                  <Card key={review.id} className="p-6">
                    <div className="flex items-center justify-between mb-3">
                      <div className="flex items-center gap-2">
                        <div className="w-8 h-8 rounded-full bg-secondary flex items-center justify-center font-bold text-xs">C</div>
                        <span className="font-semibold text-sm">Customer #{review.customerId}</span>
                      </div>
                      <div className="flex text-amber-500">
                        {[...Array(5)].map((_, i) => (
                          <Star key={i} className={`w-3 h-3 ${i < review.rating ? 'fill-current' : 'text-gray-200'}`} />
                        ))}
                      </div>
                    </div>
                    <p className="text-muted-foreground text-sm">{review.comment}</p>
                  </Card>
                ))
              ) : (
                <div className="text-center p-8 bg-muted/20 rounded-xl border border-dashed border-border">
                  <p className="text-muted-foreground">No reviews yet. Be the first!</p>
                </div>
              )}
            </div>
          </div>

          {/* Booking Sidebar */}
          <div className="lg:col-span-1">
             <div className="sticky top-24">
               <Card className="p-6 shadow-xl border-primary/10 ring-1 ring-primary/5">
                 <div className="flex justify-between items-baseline mb-6 pb-6 border-b border-dashed">
                   <span className="text-muted-foreground font-medium">Price</span>
                   <div className="text-right">
                     <span className="text-3xl font-bold text-primary">${service.price}</span>
                     <span className="text-sm text-muted-foreground"> / hour</span>
                   </div>
                 </div>

                 <div className="space-y-4">
                   <div className="flex items-center justify-between text-sm">
                     <span className="text-muted-foreground">Category</span>
                     <span className="font-medium capitalize px-2 py-0.5 bg-secondary rounded text-foreground">{service.category}</span>
                   </div>
                   <div className="flex items-center justify-between text-sm">
                     <span className="text-muted-foreground">Provider</span>
                     <span className="font-medium">{service.provider.name}</span>
                   </div>
                 </div>

                 <Dialog open={isDialogOpen} onOpenChange={(open) => {
                   setIsDialogOpen(open);
                   if(!open) setTimeout(() => setStep("date"), 300); // Reset after close
                 }}>
                   <DialogTrigger asChild>
                    <Button className="w-full mt-8 h-12 text-lg shadow-lg shadow-primary/25 hover:shadow-xl hover:shadow-primary/40 transition-all hover:-translate-y-0.5">
                      Book Now
                    </Button>
                   </DialogTrigger>
                   <DialogContent className="sm:max-w-[425px]">
                     <DialogHeader>
                       <DialogTitle>{step === 'success' ? 'Booking Confirmed!' : 'Book Appointment'}</DialogTitle>
                       <DialogDescription>
                         {step === 'date' && "Select a date for your service."}
                         {step === 'payment' && "Processing deposit..."}
                         {step === 'success' && "Your pro will be in touch shortly."}
                       </DialogDescription>
                     </DialogHeader>
                     
                     {step === 'date' && (
                       <div className="space-y-4 py-4">
                         <div className="flex justify-center">
                           <Calendar
                             mode="single"
                             selected={date}
                             onSelect={setDate}
                             className="rounded-md border shadow-sm"
                             disabled={(date) => date < new Date()}
                           />
                         </div>
                         <div className="space-y-2 px-4">
                           <Label htmlFor="hours">Number of Hours</Label>
                           <Input 
                             id="hours"
                             type="number" 
                             min={1} 
                             max={8} 
                             value={hours} 
                             onChange={(e) => setHours(Math.max(1, parseInt(e.target.value) || 1))}
                             className="border-red-300 focus:border-red-500"
                           />
                           <div className="flex justify-between text-sm pt-2 border-t mt-4">
                             <span className="text-muted-foreground">Service Cost:</span>
                             <span className="font-bold">${service.price} x {hours} hr = ${service.price * hours}</span>
                           </div>
                           <div className="flex justify-between text-xs text-muted-foreground">
                             <span>Platform fee (15%):</span>
                             <span>${(service.price * hours * 0.15).toFixed(2)}</span>
                           </div>
                         </div>
                       </div>
                     )}

                     {step === 'payment' && (
                        <div className="flex flex-col items-center justify-center py-12 space-y-4">
                          <div className="w-16 h-16 border-4 border-primary border-t-transparent rounded-full animate-spin" />
                          <p className="text-muted-foreground font-medium animate-pulse">Confirming availability...</p>
                        </div>
                     )}

                     {step === 'success' && (
                        <div className="flex flex-col items-center justify-center py-8 space-y-4 text-center">
                          <div className="w-20 h-20 bg-green-100 text-green-600 rounded-full flex items-center justify-center mb-2">
                             <CheckCircle2 className="w-10 h-10" />
                          </div>
                          <h3 className="text-xl font-bold text-foreground">You're all set!</h3>
                          <p className="text-muted-foreground text-sm max-w-[260px]">
                            A confirmation email has been sent. The provider will contact you to confirm exact time.
                          </p>
                        </div>
                     )}

                     <DialogFooter>
                       {step === 'date' && (
                         <Button onClick={handleBook} className="w-full gap-2" disabled={!date || isProcessing}>
                           {isProcessing ? (
                             <>
                               <Loader2 className="w-4 h-4 animate-spin" />
                               Processing...
                             </>
                           ) : (
                             <>
                               <CreditCard className="w-4 h-4" />
                               Pay ${service.price * hours} with Stripe
                             </>
                           )}
                         </Button>
                       )}
                       {step === 'success' && (
                         <Button onClick={() => setIsDialogOpen(false)} className="w-full">
                           Done
                         </Button>
                       )}
                     </DialogFooter>
                   </DialogContent>
                 </Dialog>
                 
                 <p className="text-xs text-center text-muted-foreground mt-4">
                   You won't be charged until you confirm the appointment time.
                 </p>
               </Card>
             </div>
          </div>

        </div>
      </main>
    </div>
  );
}
