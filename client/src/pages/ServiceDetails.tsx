import { useRoute, useLocation } from "wouter";
import { useService } from "@/hooks/use-services";
import { useCreateBooking } from "@/hooks/use-bookings";
import { Navbar } from "@/components/Navbar";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Calendar } from "@/components/ui/calendar";
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Progress } from "@/components/ui/progress";
import { Star, MapPin, CheckCircle2, ShieldCheck, Clock, Loader2, DollarSign, Zap, Briefcase, Users, Timer, BadgeCheck, Crown, MessageSquare, ChevronLeft } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { useState } from "react";
import { useAuth } from "@/hooks/use-auth";
import { useToast } from "@/hooks/use-toast";
import { useLanguage } from "@/contexts/LanguageContext";

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
  const [, setLocation] = useLocation();
  const id = parseInt(params?.id || "0");
  const { data: service, isLoading } = useService(id);
  const { mutateAsync: createBooking } = useCreateBooking();
  const { user } = useAuth();
  const { toast } = useToast();
  const { t } = useLanguage();

  // Booking wizard state
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [wizardStep, setWizardStep] = useState(1);
  const [isSuccess, setIsSuccess] = useState(false);
  const [isProcessing, setIsProcessing] = useState(false);

  // Form state
  const [jobDescription, setJobDescription] = useState("");
  const [jobSize, setJobSize] = useState("");
  const [urgencyLevel, setUrgencyLevel] = useState("flexible");
  const [date, setDate] = useState<Date | undefined>(new Date());
  const [estimatedBudget, setEstimatedBudget] = useState("");
  const [estimatedDuration, setEstimatedDuration] = useState("");

  const TOTAL_STEPS = 3;
  const progressPercent = (wizardStep / TOTAL_STEPS) * 100;

  const resetWizard = () => {
    setWizardStep(1);
    setIsSuccess(false);
    setJobDescription("");
    setJobSize("");
    setUrgencyLevel("flexible");
    setDate(new Date());
    setEstimatedBudget("");
    setEstimatedDuration("");
  };

  if (isLoading) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <Loader2 className="w-8 h-8 animate-spin text-primary" />
      </div>
    );
  }

  if (!service) return <div className="p-8 text-center text-muted-foreground">Service not found</div>;

  const pricingInfo = PRICING_TYPE_LABELS[(service as any).pricingType || "negotiable"];

  const handleNext = () => {
    if (wizardStep === 1 && !jobSize) {
      toast({ title: "Select job size", description: "Please choose how big the job is.", variant: "destructive" });
      return;
    }
    setWizardStep((s) => Math.min(s + 1, TOTAL_STEPS));
  };

  const handleBack = () => setWizardStep((s) => Math.max(s - 1, 1));

  const handleSubmitRequest = async () => {
    if (!user) {
      toast({ title: "Please log in", variant: "destructive" });
      return;
    }
    if (!date) {
      toast({ title: "Select a date", variant: "destructive" });
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
      setIsSuccess(true);
    } catch {
      toast({ title: "Error", description: "Could not send your request. Please try again.", variant: "destructive" });
    }
    setIsProcessing(false);
  };

  return (
    <div className="min-h-screen bg-background font-sans overflow-x-hidden">
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
                    <div className="flex items-center gap-2 flex-wrap mb-0.5">
                      <h1 className="text-3xl font-bold text-foreground">{service.provider.name}</h1>
                      {(service.provider as any).isPremium && (
                        <Badge className="bg-amber-100 text-amber-700 dark:bg-amber-900/40 dark:text-amber-300 gap-1">
                          <Crown className="w-3 h-3" /> Pro
                        </Badge>
                      )}
                    </div>
                    <p className="text-sm font-medium text-primary capitalize">{service.category}</p>
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
                    <Badge className={pricingInfo.color}>{pricingInfo.label}</Badge>
                  </div>
                </div>
              </div>
            </Card>

            {/* Trust Badges */}
            <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
              {[
                { icon: Briefcase, value: "47+", label: "Jobs done" },
                { icon: Clock, value: "< 1hr", label: "Response time" },
                { icon: Users, value: "68%", label: "Repeat customers" },
                { icon: Timer, value: "~30min", label: "Est. arrival" },
              ].map(({ icon: Icon, value, label }) => (
                <div key={label} className="bg-card border border-border rounded-xl p-3 text-center">
                  <Icon className="w-5 h-5 mx-auto mb-1 text-primary" />
                  <p className="text-lg font-bold text-foreground">{value}</p>
                  <p className="text-xs text-muted-foreground">{label}</p>
                </div>
              ))}
            </div>

            {/* Description */}
            <Card className="p-8 shadow-sm border-border/60">
              <h2 className="text-xl font-bold mb-2">{service.title}</h2>
              <p className="text-muted-foreground leading-relaxed whitespace-pre-wrap">{service.description}</p>
              <div className="mt-6 grid grid-cols-1 md:grid-cols-2 gap-4">
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
                          <Star key={i} className={`w-3 h-3 ${i < review.rating ? "fill-current" : "text-muted-foreground/30"}`} />
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
                <div className="flex justify-between items-baseline mb-5 pb-4 border-b border-dashed">
                  <div>
                    <span className="text-2xl font-bold text-primary">${service.price}</span>
                    <span className="text-sm text-muted-foreground ml-1">starting</span>
                  </div>
                  <Badge className={pricingInfo.color + " text-xs"}>{pricingInfo.label}</Badge>
                </div>

                <div className="space-y-2.5 mb-6">
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
                  if (!open) setTimeout(resetWizard, 300);
                }}>
                  <DialogTrigger asChild>
                    <Button
                      data-testid="button-request-service"
                      className="w-full h-12 text-base font-semibold shadow-lg shadow-primary/20 hover:shadow-xl hover:shadow-primary/30 transition-all hover:-translate-y-0.5"
                    >
                      {t("service.requestService")}
                    </Button>
                  </DialogTrigger>

                  <DialogContent className="sm:max-w-[500px] max-h-[90vh] overflow-y-auto">
                    {!isSuccess ? (
                      <>
                        <DialogHeader>
                          <DialogTitle>Request Service</DialogTitle>
                          <DialogDescription>
                            {t("service.step")} {wizardStep} {t("service.of")} {TOTAL_STEPS}
                          </DialogDescription>
                        </DialogHeader>

                        {/* Progress Bar */}
                        <div className="space-y-1.5">
                          <div className="flex justify-between text-xs text-muted-foreground">
                            <span>{t("service.step")} {wizardStep} {t("service.of")} {TOTAL_STEPS}</span>
                            <span>{Math.round(progressPercent)}%</span>
                          </div>
                          <Progress value={progressPercent} className="h-2" />
                          <div className="flex justify-between text-[10px] text-muted-foreground">
                            <span className={wizardStep >= 1 ? "text-primary font-medium" : ""}>Job Details</span>
                            <span className={wizardStep >= 2 ? "text-primary font-medium" : ""}>Timing</span>
                            <span className={wizardStep >= 3 ? "text-primary font-medium" : ""}>Budget</span>
                          </div>
                        </div>

                        {/* STEP 1: Job Description + Job Size */}
                        {wizardStep === 1 && (
                          <div className="space-y-5 py-2">
                            <div className="space-y-2">
                              <Label className="font-semibold">
                                {t("service.describeJob")} <span className="text-muted-foreground font-normal">(optional)</span>
                              </Label>
                              <Textarea
                                data-testid="input-job-description"
                                placeholder="E.g. Leaking pipe under the kitchen sink, needs to be replaced. Water is dripping slowly..."
                                value={jobDescription}
                                onChange={(e) => setJobDescription(e.target.value)}
                                rows={4}
                                className="resize-none text-base"
                              />
                            </div>

                            <div className="space-y-2">
                              <Label className="font-semibold">
                                {t("service.jobSize")} <span className="text-destructive">*</span>
                              </Label>
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
                                    <p className="font-semibold text-sm text-foreground">{opt.label}</p>
                                    <p className="text-xs text-muted-foreground mt-0.5">{opt.desc}</p>
                                  </button>
                                ))}
                              </div>
                            </div>
                          </div>
                        )}

                        {/* STEP 2: Urgency + Date */}
                        {wizardStep === 2 && (
                          <div className="space-y-5 py-2">
                            <div className="space-y-2">
                              <Label className="font-semibold">{t("service.urgency")}</Label>
                              <div className="grid grid-cols-2 gap-2">
                                {URGENCY_OPTIONS.map((opt) => (
                                  <button
                                    key={opt.value}
                                    data-testid={`button-urgency-${opt.value}`}
                                    type="button"
                                    onClick={() => setUrgencyLevel(opt.value)}
                                    className={`text-left p-2.5 rounded-xl border-2 transition-all text-sm ${
                                      urgencyLevel === opt.value
                                        ? "border-primary bg-primary/5 font-semibold text-foreground"
                                        : "border-border hover:border-primary/40 text-foreground"
                                    }`}
                                  >
                                    {opt.label}
                                  </button>
                                ))}
                              </div>
                            </div>

                            <div className="space-y-2">
                              <Label className="font-semibold">{t("service.preferredDate")}</Label>
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
                          </div>
                        )}

                        {/* STEP 3: Budget + Duration + Submit */}
                        {wizardStep === 3 && (
                          <div className="space-y-5 py-2">
                            <div className="space-y-2">
                              <Label className="font-semibold">
                                {t("service.estimatedBudget")} <span className="text-muted-foreground font-normal">(optional)</span>
                              </Label>
                              <div className="relative">
                                <DollarSign className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                                <Input
                                  data-testid="input-estimated-budget"
                                  placeholder="e.g. 80-150 or 200"
                                  value={estimatedBudget}
                                  onChange={(e) => setEstimatedBudget(e.target.value)}
                                  className="pl-9"
                                />
                              </div>
                              <p className="text-xs text-muted-foreground">Helps the provider understand your expectations</p>
                            </div>

                            <div className="space-y-2">
                              <Label className="font-semibold">
                                {t("service.estimatedDuration")} <span className="text-muted-foreground font-normal">(optional)</span>
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

                            {/* Summary */}
                            <div className="bg-muted/30 rounded-xl p-4 space-y-2 text-sm">
                              <p className="font-semibold text-foreground">Summary</p>
                              <div className="flex justify-between text-muted-foreground">
                                <span>Job size</span>
                                <span className="font-medium text-foreground capitalize">{jobSize}</span>
                              </div>
                              <div className="flex justify-between text-muted-foreground">
                                <span>Urgency</span>
                                <span className="font-medium text-foreground capitalize">{urgencyLevel}</span>
                              </div>
                              {date && (
                                <div className="flex justify-between text-muted-foreground">
                                  <span>Date</span>
                                  <span className="font-medium text-foreground">{date.toLocaleDateString()}</span>
                                </div>
                              )}
                            </div>
                          </div>
                        )}

                        <DialogFooter className="flex gap-2 flex-row">
                          {wizardStep > 1 && (
                            <Button
                              variant="outline"
                              onClick={handleBack}
                              className="flex-1 gap-1"
                              data-testid="button-wizard-back"
                            >
                              <ChevronLeft className="w-4 h-4" />
                              {t("service.back")}
                            </Button>
                          )}
                          {wizardStep < TOTAL_STEPS ? (
                            <Button
                              onClick={handleNext}
                              className="flex-1 gap-1"
                              data-testid="button-wizard-next"
                            >
                              {t("service.next")}
                            </Button>
                          ) : (
                            <Button
                              onClick={handleSubmitRequest}
                              className="flex-1 gap-1"
                              disabled={isProcessing}
                              data-testid="button-send-request"
                            >
                              {isProcessing ? (
                                <><Loader2 className="w-4 h-4 animate-spin" /> Sending...</>
                              ) : (
                                <><Zap className="w-4 h-4" /> {t("service.sendRequest")}</>
                              )}
                            </Button>
                          )}
                        </DialogFooter>
                      </>
                    ) : (
                      /* SUCCESS SCREEN */
                      <>
                        <DialogHeader>
                          <DialogTitle>{t("service.requestSent")}</DialogTitle>
                        </DialogHeader>
                        <div className="flex flex-col items-center justify-center py-8 space-y-4 text-center">
                          <div className="w-24 h-24 bg-green-100 dark:bg-green-900/30 text-green-600 dark:text-green-400 rounded-full flex items-center justify-center">
                            <CheckCircle2 className="w-12 h-12" />
                          </div>
                          <h3 className="text-2xl font-bold text-foreground">{t("service.requestSent")}</h3>
                          <p className="text-muted-foreground text-sm max-w-[300px]">
                            {t("service.providerResponse")} <strong>{service.provider.name}</strong>. {t("service.requestSentDesc")}
                          </p>
                          <div className="flex items-center gap-2 text-sm text-muted-foreground bg-muted/40 px-4 py-2 rounded-full">
                            <MessageSquare className="w-4 h-4" />
                            Chat with them in My Bookings
                          </div>
                        </div>
                        <DialogFooter className="flex gap-2 flex-col sm:flex-row">
                          <Button
                            variant="outline"
                            onClick={() => setLocation("/")}
                            className="flex-1"
                            data-testid="button-back-to-home"
                          >
                            {t("service.backToHome")}
                          </Button>
                          <Button
                            onClick={() => setIsDialogOpen(false)}
                            className="flex-1"
                            data-testid="button-done"
                          >
                            {t("common.done")}
                          </Button>
                        </DialogFooter>
                      </>
                    )}
                  </DialogContent>
                </Dialog>

                <p className="text-xs text-center text-muted-foreground mt-4">
                  {t("service.free")} — agree on price with provider before work begins.
                </p>
              </Card>
            </div>
          </div>

        </div>
      </main>
    </div>
  );
}
