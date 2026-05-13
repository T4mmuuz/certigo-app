import { useRoute } from "wouter";
import { useService } from "@/hooks/use-services";
import { useCreateBooking } from "@/hooks/use-bookings";
import { Navbar } from "@/components/Navbar";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Calendar } from "@/components/ui/calendar";
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Separator } from "@/components/ui/separator";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Star, MapPin, CheckCircle2, ShieldCheck, Clock, Loader2, DollarSign, Zap, Briefcase, Users, Timer, BadgeCheck, Crown, MessageSquare } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { useState } from "react";
import { useAuth } from "@/hooks/use-auth";
import { useToast } from "@/hooks/use-toast";
import { apiRequest } from "@/lib/queryClient";

const PRICING_TYPE_LABELS: Record<string, { label: string; color: string }> = {
  fixed: { label: "Fixed Price", color: "bg-blue-100 text-blue-700 dark:bg-blue-900/40 dark:text-blue-300" },
  negotiable: { label: "Negotiable", color: "bg-amber-100 text-amber-700 dark:bg-amber-900/40 dark:text-amber-300" },
  hourly: { label: "Hourly Rate", color: "bg-purple-100 text-purple-700 dark:bg-purple-900/40 dark:text-purple-300" },
  free_estimate: { label: "Free Estimate", color: "bg-green-100 text-green-700 dark:bg-green-900/40 dark:text-green-300" },
};

const JOB_SIZE_OPTIONS = [
  { value: "small", label: "Small Job", desc: "Quick fix, under 1 hour" },
  { value: "medium", label: "Medium Job", desc: "Half day or standard task" },
  { value: "large", label: "Large Job", desc: "Full day or complex project" },
  { value: "emergency", label: "Emergency / ASAP", desc: "Urgent, needs immediate help" },
];

const URGENCY_OPTIONS = [
  { value: "flexible", label: "Flexible — Any time works" },
  { value: "today", label: "Today" },
  { value: "asap", label: "ASAP — Within hours" },
  { value: "emergency", label: "Emergency — Right now" },
];

const DURATION_OPTIONS = [
  { value: "under_1hr", label: "Less than 1 hour" },
  { value: "1_3hrs", label: "1–3 hours" },
  { value: "half_day", label: "Half day" },
  { value: "full_day", label: "Full day" },
  { value: "multi_day", label: "Multi-day" },
];

export default function ServiceDetails() {
  const [match, params] = useRoute("/services/:id");
  const id = parseInt(params?.id || "0");
  const { data: service, isLoading } = useService(id);
  const { mutateAsync: createBooking, isPending } = useCreateBooking();
  const { user } = useAuth();
  const { toast } = useToast();

  const [date, setDate] = useState<Date | undefined>(new Date());
  const [jobDescription, setJobDescription] = useState("");
  const [estimatedBudget, setEstimatedBudget] = useState("");
  const [jobSize, setJobSize] = useState<string>("");
  const [estimatedDuration, setEstimatedDuration] = useState<string>("");
  const [urgencyLevel, setUrgencyLevel] = useState<string>("flexible");
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [step, setStep] = useState<"form" | "success">("form");
  const [isProcessing, setIsProcessing] = useState(false);

  if (isLoading) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <Loader2 className="w-8 h-8 animate-spin text-primary" />
      </div>
    );
  }

  if (!service) return <div>Service not found</div>;

  const pricingInfo = PRICING_TYPE_LABELS[(service as any).pricingType || "negotiable"];

  const handleSubmitRequest = async () => {
    if (!user) {
      toast({ title: "Please log in", description: "You need an account to book services.", variant: "destructive" });
      return;
    }
    if (!date) {
      toast({ title: "Select a date", description: "Please pick a preferred date.", variant: "destructive" });
      return;
    }
    if (!jobSize) {
      toast({ title: "Select job size", description: "Please indicate how big the job is.", variant: "destructive" });
      return;
    }

    setIsProcessing(true);
    try {
      await createBooking({
        serviceId: service.id,
        customerId: user.id,
        date,
        status: "pending",
        paymentMethod: "cash",
        jobDescription: jobDescription || undefined,
        estimatedBudget: estimatedBudget || undefined,
        jobSize: jobSize as any,
        estimatedDuration: estimatedDuration || undefined,
        urgencyLevel: urgencyLevel as any,
      } as any);
      setStep("success");
      toast({
        title: "Request Sent!",
        description: "The provider will review your request and reach out soon.",
      });
    } catch (error) {
      toast({ title: "Error", description: "Could not send your request. Please try again.", variant: "destructive" });
    }
    setIsProcessing(false);
  };

  return (
    <div className="min-h-screen bg-background font-sans">
      <Navbar />

      <main className="container mx-auto px-4 py-8">
        <div className="max-w-6xl mx-auto grid grid-cols-1 lg:grid-cols-3 gap-8">

          {/* Main Content */}
          <div className="lg:col-span-2 space-y-6">
            {/* Header Card */}
            <Card className="p-0 overflow-hidden border-none shadow-lg">
              <div className="h-32 bg-gradient-to-r from-primary to-primary/60 relative" />
              <div className="absolute -mt-10 ml-8">
                <Avatar className="w-24 h-24 border-4 border-background shadow-md">
                  {(service.provider as any).profilePicture ? (
                    <AvatarImage src={(service.provider as any).profilePicture} alt={service.provider.name} />
                  ) : null}
                  <AvatarFallback className="bg-primary/10 text-primary text-2xl font-bold">
                    {service.provider.name.charAt(0)}
                  </AvatarFallback>
                </Avatar>
              </div>
              <div className="pt-14 pb-6 px-8">
                <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
                  <div>
                    <div className="flex items-center gap-2 flex-wrap mb-1">
                      <h1 className="text-3xl font-bold text-foreground">{service.title}</h1>
                      {(service.provider as any).isPremium && (
                        <Badge className="bg-amber-100 text-amber-700 dark:bg-amber-900/40 dark:text-amber-300 gap-1">
                          <Crown className="w-3 h-3" /> Pro
                        </Badge>
                      )}
                    </div>
                    <div className="flex items-center text-muted-foreground mt-1 gap-4 text-sm flex-wrap">
                      <span className="flex items-center gap-1">
                        <MapPin className="w-4 h-4" /> Approx. area only
                      </span>
                      <span className="flex items-center gap-1 text-green-600 dark:text-green-400">
                        <ShieldCheck className="w-4 h-4" /> Verified Pro
                      </span>
                    </div>
                  </div>
                  <div className="flex flex-col items-end gap-2">
                    <div className="flex items-center bg-amber-50 dark:bg-amber-900/20 px-3 py-1 rounded-full border border-amber-100 dark:border-amber-800">
                      <Star className="w-5 h-5 fill-amber-500 text-amber-500 mr-1.5" />
                      <span className="font-bold text-lg text-amber-700 dark:text-amber-400">4.8</span>
                      <span className="text-amber-600/60 dark:text-amber-500/60 text-sm ml-1">(124 reviews)</span>
                    </div>
                    <Badge className={pricingInfo.color}>
                      {pricingInfo.label}
                    </Badge>
                  </div>
                </div>
              </div>
            </Card>

            {/* Trust Badges */}
            <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
              <div className="bg-card border border-border rounded-xl p-3 text-center">
                <Briefcase className="w-5 h-5 mx-auto mb-1 text-primary" />
                <p className="text-lg font-bold">47+</p>
                <p className="text-xs text-muted-foreground">Jobs done</p>
              </div>
              <div className="bg-card border border-border rounded-xl p-3 text-center">
                <Clock className="w-5 h-5 mx-auto mb-1 text-primary" />
                <p className="text-lg font-bold">&lt; 1hr</p>
                <p className="text-xs text-muted-foreground">Response time</p>
              </div>
              <div className="bg-card border border-border rounded-xl p-3 text-center">
                <Users className="w-5 h-5 mx-auto mb-1 text-primary" />
                <p className="text-lg font-bold">68%</p>
                <p className="text-xs text-muted-foreground">Repeat customers</p>
              </div>
              <div className="bg-card border border-border rounded-xl p-3 text-center">
                <Timer className="w-5 h-5 mx-auto mb-1 text-primary" />
                <p className="text-lg font-bold">~30min</p>
                <p className="text-xs text-muted-foreground">Est. arrival</p>
              </div>
            </div>

            {/* Description */}
            <Card className="p-8 shadow-sm border-border/60">
              <h2 className="text-xl font-bold mb-4">About this service</h2>
              <p className="text-muted-foreground leading-relaxed whitespace-pre-wrap">
                {service.description}
              </p>

              <div className="mt-8 grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="flex items-start gap-3 p-4 rounded-xl bg-muted/40">
                  <div className="bg-background p-2 rounded-lg shadow-sm text-primary"><CheckCircle2 className="w-5 h-5" /></div>
                  <div>
                    <h4 className="font-bold text-sm">Satisfaction Guarantee</h4>
                    <p className="text-xs text-muted-foreground mt-1">If you aren't happy, we'll make it right.</p>
                  </div>
                </div>
                <div className="flex items-start gap-3 p-4 rounded-xl bg-muted/40">
                  <div className="bg-background p-2 rounded-lg shadow-sm text-primary"><BadgeCheck className="w-5 h-5" /></div>
                  <div>
                    <h4 className="font-bold text-sm">Background Checked</h4>
                    <p className="text-xs text-muted-foreground mt-1">Identity verified through CertiGo.</p>
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
                        <div className="w-8 h-8 rounded-full bg-muted flex items-center justify-center font-bold text-xs">C</div>
                        <span className="font-semibold text-sm">Customer #{review.customerId}</span>
                      </div>
                      <div className="flex text-amber-500">
                        {[...Array(5)].map((_, i) => (
                          <Star key={i} className={`w-3 h-3 ${i < review.rating ? 'fill-current' : 'text-gray-300 dark:text-gray-600'}`} />
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
                <div className="flex justify-between items-baseline mb-6 pb-4 border-b border-dashed">
                  <div>
                    <span className="text-2xl font-bold text-primary">${service.price}</span>
                    <span className="text-sm text-muted-foreground ml-1">starting</span>
                  </div>
                  <Badge className={pricingInfo.color + " text-xs"}>
                    {pricingInfo.label}
                  </Badge>
                </div>

                <div className="space-y-3 mb-6">
                  <div className="flex items-center justify-between text-sm">
                    <span className="text-muted-foreground">Category</span>
                    <span className="font-medium capitalize px-2 py-0.5 bg-muted rounded text-foreground">{service.category}</span>
                  </div>
                  <div className="flex items-center justify-between text-sm">
                    <span className="text-muted-foreground">Provider</span>
                    <span className="font-medium">{service.provider.name}</span>
                  </div>
                  <div className="flex items-center justify-between text-sm">
                    <span className="text-muted-foreground">Response</span>
                    <span className="font-medium text-green-600 dark:text-green-400">Usually &lt; 1 hr</span>
                  </div>
                </div>

                <Dialog open={isDialogOpen} onOpenChange={(open) => {
                  setIsDialogOpen(open);
                  if (!open) setTimeout(() => setStep("form"), 300);
                }}>
                  <DialogTrigger asChild>
                    <Button
                      data-testid="button-book-now"
                      className="w-full h-12 text-base font-semibold shadow-lg shadow-primary/20 hover:shadow-xl hover:shadow-primary/30 transition-all hover:-translate-y-0.5"
                    >
                      Request This Service
                    </Button>
                  </DialogTrigger>

                  <DialogContent className="sm:max-w-[500px] max-h-[90vh] overflow-y-auto">
                    <DialogHeader>
                      <DialogTitle>
                        {step === "success" ? "Request Sent!" : "Request Service"}
                      </DialogTitle>
                      <DialogDescription>
                        {step === "form" && "Tell the provider about your job — no payment required upfront."}
                        {step === "success" && "Your request is on its way."}
                      </DialogDescription>
                    </DialogHeader>

                    {step === "form" && (
                      <div className="space-y-5 py-2">
                        {/* Job Description */}
                        <div className="space-y-2">
                          <Label htmlFor="job-desc" className="font-semibold">
                            Describe your job <span className="text-muted-foreground font-normal">(optional)</span>
                          </Label>
                          <Textarea
                            id="job-desc"
                            data-testid="input-job-description"
                            placeholder="E.g. Leaking pipe under the kitchen sink, needs to be replaced. Water is dripping slowly..."
                            value={jobDescription}
                            onChange={(e) => setJobDescription(e.target.value)}
                            rows={4}
                            className="resize-none text-base"
                          />
                        </div>

                        {/* Job Size - Required */}
                        <div className="space-y-2">
                          <Label className="font-semibold">Job Size <span className="text-destructive">*</span></Label>
                          <div className="grid grid-cols-2 gap-2">
                            {JOB_SIZE_OPTIONS.map((opt) => (
                              <button
                                key={opt.value}
                                data-testid={`button-job-size-${opt.value}`}
                                type="button"
                                onClick={() => setJobSize(opt.value)}
                                className={`text-left p-3 rounded-xl border-2 transition-all ${
                                  jobSize === opt.value
                                    ? "border-primary bg-primary/5"
                                    : "border-border hover:border-primary/40"
                                }`}
                              >
                                <p className="font-semibold text-sm">{opt.label}</p>
                                <p className="text-xs text-muted-foreground mt-0.5">{opt.desc}</p>
                              </button>
                            ))}
                          </div>
                        </div>

                        {/* Urgency */}
                        <div className="space-y-2">
                          <Label className="font-semibold">Urgency</Label>
                          <div className="grid grid-cols-2 gap-2">
                            {URGENCY_OPTIONS.map((opt) => (
                              <button
                                key={opt.value}
                                data-testid={`button-urgency-${opt.value}`}
                                type="button"
                                onClick={() => setUrgencyLevel(opt.value)}
                                className={`text-left p-2.5 rounded-xl border-2 transition-all text-sm ${
                                  urgencyLevel === opt.value
                                    ? "border-primary bg-primary/5 font-semibold"
                                    : "border-border hover:border-primary/40"
                                }`}
                              >
                                {opt.label}
                              </button>
                            ))}
                          </div>
                        </div>

                        {/* Preferred Date */}
                        <div className="space-y-2">
                          <Label className="font-semibold">Preferred Date</Label>
                          <div className="flex justify-center">
                            <Calendar
                              mode="single"
                              selected={date}
                              onSelect={setDate}
                              className="rounded-xl border shadow-sm"
                              disabled={(d) => d < new Date(new Date().setHours(0, 0, 0, 0))}
                            />
                          </div>
                        </div>

                        {/* Estimated Budget */}
                        <div className="space-y-2">
                          <Label htmlFor="budget" className="font-semibold">
                            Estimated Budget <span className="text-muted-foreground font-normal">(optional)</span>
                          </Label>
                          <div className="relative">
                            <DollarSign className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                            <Input
                              id="budget"
                              data-testid="input-estimated-budget"
                              placeholder="e.g. 80-150 or 200"
                              value={estimatedBudget}
                              onChange={(e) => setEstimatedBudget(e.target.value)}
                              className="pl-9"
                            />
                          </div>
                          <p className="text-xs text-muted-foreground">Helps the provider understand your expectations</p>
                        </div>

                        {/* Estimated Duration (optional) */}
                        <div className="space-y-2">
                          <Label className="font-semibold">
                            Estimated Duration <span className="text-muted-foreground font-normal">(optional)</span>
                          </Label>
                          <Select value={estimatedDuration} onValueChange={setEstimatedDuration}>
                            <SelectTrigger data-testid="select-estimated-duration">
                              <SelectValue placeholder="How long do you expect the job to take?" />
                            </SelectTrigger>
                            <SelectContent>
                              {DURATION_OPTIONS.map((opt) => (
                                <SelectItem key={opt.value} value={opt.value}>{opt.label}</SelectItem>
                              ))}
                            </SelectContent>
                          </Select>
                        </div>
                      </div>
                    )}

                    {step === "success" && (
                      <div className="flex flex-col items-center justify-center py-8 space-y-4 text-center">
                        <div className="w-20 h-20 bg-green-100 dark:bg-green-900/30 text-green-600 dark:text-green-400 rounded-full flex items-center justify-center mb-2">
                          <CheckCircle2 className="w-10 h-10" />
                        </div>
                        <h3 className="text-xl font-bold text-foreground">Request Submitted!</h3>
                        <p className="text-muted-foreground text-sm max-w-[260px]">
                          The provider will review your request and reach out to confirm details and pricing.
                        </p>
                        <div className="flex items-center gap-2 text-sm text-muted-foreground bg-muted/40 px-4 py-2 rounded-full">
                          <MessageSquare className="w-4 h-4" />
                          You can chat with them in My Bookings
                        </div>
                      </div>
                    )}

                    <DialogFooter>
                      {step === "form" && (
                        <Button
                          data-testid="button-submit-request"
                          onClick={handleSubmitRequest}
                          className="w-full h-12 text-base gap-2"
                          disabled={!date || !jobSize || isProcessing}
                        >
                          {isProcessing ? (
                            <>
                              <Loader2 className="w-4 h-4 animate-spin" />
                              Sending Request...
                            </>
                          ) : (
                            <>
                              <Zap className="w-4 h-4" />
                              Send Request — Free
                            </>
                          )}
                        </Button>
                      )}
                      {step === "success" && (
                        <Button
                          data-testid="button-done"
                          onClick={() => setIsDialogOpen(false)}
                          className="w-full h-12"
                        >
                          Done
                        </Button>
                      )}
                    </DialogFooter>
                  </DialogContent>
                </Dialog>

                <p className="text-xs text-center text-muted-foreground mt-4">
                  Free to request — agree on price with provider before work begins.
                </p>
              </Card>
            </div>
          </div>

        </div>
      </main>
    </div>
  );
}
