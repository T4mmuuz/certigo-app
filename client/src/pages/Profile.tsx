import { Navbar } from "@/components/Navbar";
import { useAuth } from "@/hooks/use-auth";
import { useCreateService, useServices } from "@/hooks/use-services";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Plus, Settings, Camera, Gift, Copy, Check } from "lucide-react";
import { useState, useRef } from "react";
import { Redirect } from "wouter";
import { useToast } from "@/hooks/use-toast";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { apiRequest } from "@/lib/queryClient";

export default function Profile() {
  const { user, logout } = useAuth();
  const { data: services } = useServices();
  const { mutateAsync: createService, isPending } = useCreateService();
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [isUploading, setIsUploading] = useState(false);
  const [codeCopied, setCodeCopied] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const { toast } = useToast();
  const queryClient = useQueryClient();

  const [title, setTitle] = useState("");
  const [desc, setDesc] = useState("");
  const [cat, setCat] = useState("plumbing");
  const [price, setPrice] = useState("50");

  const { data: referralStats } = useQuery<{
    totalReferrals: number;
    completedReferrals: number;
    pendingReferrals: number;
    totalRewardsEarned: number;
  }>({
    queryKey: ["/api/users/referral-stats"],
    enabled: !!user,
  });

  const generateReferralCode = useMutation({
    mutationFn: () => apiRequest("POST", "/api/users/generate-referral-code"),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/auth/me"] });
    },
  });

  if (!user) return <Redirect to="/login" />;

  const myServices = services?.filter(s => s.providerId === user.id) || [];

  const handleCreateService = async () => {
    try {
      await createService({
        providerId: user.id,
        title,
        description: desc,
        category: cat,
        price: parseInt(price),
        lat: user.lat || 40.7128,
        lng: user.lng || -74.0060,
      });
      setIsDialogOpen(false);
      setTitle("");
      setDesc("");
    } catch (e) {
    }
  };

  const handleFileSelect = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;

    if (!file.type.startsWith("image/")) {
      toast({ title: "Invalid file type", description: "Please select an image file", variant: "destructive" });
      return;
    }

    if (file.size > 5 * 1024 * 1024) {
      toast({ title: "File too large", description: "Please select an image under 5MB", variant: "destructive" });
      return;
    }

    setIsUploading(true);
    try {
      const urlResponse = await fetch("/api/uploads/request-url", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          name: file.name,
          size: file.size,
          contentType: file.type,
        }),
      });

      if (!urlResponse.ok) throw new Error("Failed to get upload URL");
      const { uploadURL, objectPath } = await urlResponse.json();

      await fetch(uploadURL, {
        method: "PUT",
        body: file,
        headers: { "Content-Type": file.type },
      });

      const updateResponse = await apiRequest("PATCH", "/api/users/profile-picture", { objectPath });
      
      queryClient.invalidateQueries({ queryKey: ["/api/auth/me"] });
      toast({ title: "Profile picture updated!" });
    } catch (error) {
      console.error("Upload error:", error);
      toast({ title: "Upload failed", description: "Please try again", variant: "destructive" });
    } finally {
      setIsUploading(false);
      if (fileInputRef.current) fileInputRef.current.value = "";
    }
  };

  const copyReferralCode = () => {
    if (user.referralCode) {
      navigator.clipboard.writeText(user.referralCode);
      setCodeCopied(true);
      setTimeout(() => setCodeCopied(false), 2000);
      toast({ title: "Referral code copied!" });
    }
  };

  return (
    <div className="min-h-screen bg-background">
      <Navbar />
      
      <main className="container mx-auto px-4 py-8 max-w-5xl">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          
          <div className="md:col-span-1 space-y-6">
            <Card className="text-center py-8 border-t-4 border-t-primary">
              <div className="flex justify-center mb-4 relative">
                <Avatar className="w-24 h-24 border-4 border-secondary">
                  {user.profilePicture ? (
                    <AvatarImage src={user.profilePicture} alt={user.name} />
                  ) : null}
                  <AvatarFallback className="text-3xl bg-primary text-primary-foreground font-display">
                    {user.username.slice(0, 2).toUpperCase()}
                  </AvatarFallback>
                </Avatar>
                <input
                  type="file"
                  ref={fileInputRef}
                  onChange={handleFileSelect}
                  accept="image/*"
                  className="hidden"
                  data-testid="input-profile-picture"
                />
                <Button 
                  size="icon" 
                  variant="secondary"
                  className="absolute bottom-0 right-1/2 translate-x-12 translate-y-1 rounded-full"
                  onClick={() => fileInputRef.current?.click()}
                  disabled={isUploading}
                  data-testid="button-upload-picture"
                >
                  <Camera className="w-4 h-4" />
                </Button>
              </div>
              <h2 className="text-xl font-bold" data-testid="text-user-name">{user.name}</h2>
              <p className="text-sm text-muted-foreground mt-1">@{user.username}</p>
              <div className="mt-2 inline-block px-3 py-1 bg-secondary rounded-full text-xs font-medium uppercase tracking-wide">
                {user.role} Account
              </div>
              
              <div className="mt-8 px-6 text-left space-y-2">
                <div className="flex items-center justify-between text-sm py-2 border-b">
                   <span className="text-muted-foreground">Joined</span>
                   <span className="font-medium">Oct 2023</span>
                </div>
                <div className="flex items-center justify-between text-sm py-2 border-b">
                   <span className="text-muted-foreground">Location</span>
                   <span className="font-medium">New York, NY</span>
                </div>
              </div>

              <div className="mt-8 px-6">
                <Button variant="outline" className="w-full" onClick={() => logout()} data-testid="button-sign-out">
                  Sign Out
                </Button>
              </div>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle className="text-base flex items-center gap-2">
                  <Gift className="w-4 h-4" /> Referral Program
                </CardTitle>
                <CardDescription>Earn $5 for each friend who completes a booking</CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                {user.referralCode ? (
                  <div className="space-y-3">
                    <div className="flex items-center gap-2">
                      <Input 
                        value={user.referralCode} 
                        readOnly 
                        className="font-mono text-center"
                        data-testid="input-referral-code"
                      />
                      <Button 
                        size="icon" 
                        variant="outline" 
                        onClick={copyReferralCode}
                        data-testid="button-copy-code"
                      >
                        {codeCopied ? <Check className="w-4 h-4" /> : <Copy className="w-4 h-4" />}
                      </Button>
                    </div>
                    {referralStats && (
                      <div className="grid grid-cols-2 gap-2 text-center">
                        <div className="p-2 bg-muted rounded-md">
                          <p className="text-lg font-bold" data-testid="text-total-referrals">{referralStats.totalReferrals}</p>
                          <p className="text-xs text-muted-foreground">Referrals</p>
                        </div>
                        <div className="p-2 bg-muted rounded-md">
                          <p className="text-lg font-bold text-green-600" data-testid="text-rewards-earned">
                            ${((referralStats.totalRewardsEarned || 0) / 100).toFixed(2)}
                          </p>
                          <p className="text-xs text-muted-foreground">Earned</p>
                        </div>
                      </div>
                    )}
                  </div>
                ) : (
                  <Button 
                    className="w-full" 
                    onClick={() => generateReferralCode.mutate()}
                    disabled={generateReferralCode.isPending}
                    data-testid="button-generate-code"
                  >
                    {generateReferralCode.isPending ? "Generating..." : "Get My Referral Code"}
                  </Button>
                )}
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle className="text-base flex items-center gap-2">
                  <Settings className="w-4 h-4" /> Settings
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-2">
                 <Button variant="ghost" className="w-full justify-start text-sm h-9">Edit Profile</Button>
                 <Button variant="ghost" className="w-full justify-start text-sm h-9">Notifications</Button>
                 <Button variant="ghost" className="w-full justify-start text-sm h-9">Privacy</Button>
              </CardContent>
            </Card>
          </div>

          <div className="md:col-span-2 space-y-8">
            
            {user.role === 'provider' && (
              <div className="space-y-4">
                <div className="flex items-center justify-between">
                  <h2 className="text-2xl font-display font-bold">My Services</h2>
                  
                  <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
                    <DialogTrigger asChild>
                      <Button className="gap-2 shadow-lg shadow-primary/20" data-testid="button-add-service">
                        <Plus className="w-4 h-4" /> Add Service
                      </Button>
                    </DialogTrigger>
                    <DialogContent>
                      <DialogHeader>
                        <DialogTitle>Offer a New Service</DialogTitle>
                        <DialogDescription>Create a listing for customers to find you.</DialogDescription>
                      </DialogHeader>
                      
                      <div className="space-y-4 py-4">
                        <div className="space-y-2">
                          <Label>Service Title</Label>
                          <Input value={title} onChange={e => setTitle(e.target.value)} placeholder="e.g. Expert Plumbing Repair" data-testid="input-service-title" />
                        </div>
                        <div className="grid grid-cols-2 gap-4">
                          <div className="space-y-2">
                            <Label>Category</Label>
                            <Input 
                              value={cat} 
                              onChange={e => setCat(e.target.value)} 
                              placeholder="e.g. Plumbing, Welding, Gardening"
                              data-testid="input-service-category"
                            />
                          </div>
                          <div className="space-y-2">
                            <Label>Hourly Rate ($)</Label>
                            <Input type="number" value={price} onChange={e => setPrice(e.target.value)} data-testid="input-service-price" />
                          </div>
                        </div>
                        <div className="space-y-2">
                          <Label>Description</Label>
                          <Textarea value={desc} onChange={e => setDesc(e.target.value)} placeholder="Describe what you offer..." data-testid="input-service-description" />
                        </div>
                      </div>

                      <DialogFooter>
                        <Button onClick={handleCreateService} disabled={isPending} data-testid="button-publish-service">
                          {isPending ? "Creating..." : "Publish Service"}
                        </Button>
                      </DialogFooter>
                    </DialogContent>
                  </Dialog>
                </div>

                {myServices.length === 0 ? (
                  <div className="bg-muted/30 border border-dashed rounded-xl p-8 text-center">
                    <p className="text-muted-foreground">You haven't listed any services yet.</p>
                  </div>
                ) : (
                  <div className="grid gap-4">
                    {myServices.map(service => (
                      <Card key={service.id} className="p-4 flex justify-between items-center group" data-testid={`card-service-${service.id}`}>
                        <div>
                          <h3 className="font-bold">{service.title}</h3>
                          <div className="flex gap-2 text-sm text-muted-foreground mt-1 flex-wrap">
                            <span className="capitalize bg-secondary px-2 py-0.5 rounded text-foreground font-medium">{service.category}</span>
                            <span>${service.price}/hr</span>
                          </div>
                        </div>
                        <Button variant="outline" size="sm" className="opacity-0 group-hover:opacity-100 transition-opacity invisible group-hover:visible">Edit</Button>
                      </Card>
                    ))}
                  </div>
                )}
              </div>
            )}

            <div className="space-y-4">
              <h2 className="text-2xl font-display font-bold">Account Overview</h2>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <Card className="p-6 bg-gradient-to-br from-blue-50 to-indigo-50 dark:from-blue-900/30 dark:to-indigo-900/30 border-none">
                  <h3 className="font-bold text-lg text-primary mb-1">Total Spent</h3>
                  <p className="text-3xl font-display font-bold text-foreground">$0.00</p>
                  <p className="text-xs text-muted-foreground mt-2">Lifetime spending on services</p>
                </Card>
                <Card className="p-6 bg-gradient-to-br from-amber-50 to-orange-50 dark:from-amber-900/30 dark:to-orange-900/30 border-none">
                  <h3 className="font-bold text-lg text-amber-600 dark:text-amber-400 mb-1">Reviews Given</h3>
                  <p className="text-3xl font-display font-bold text-amber-900 dark:text-amber-300">0</p>
                  <p className="text-xs text-amber-800/60 dark:text-amber-400/60 mt-2">Help the community by reviewing</p>
                </Card>
              </div>
            </div>

          </div>
        </div>
      </main>
    </div>
  );
}
