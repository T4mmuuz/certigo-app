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
import { Plus, Settings, Camera, Gift, Copy, Check, Wallet, ExternalLink, Loader2 } from "lucide-react";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { useState, useRef } from "react";
import { Redirect } from "wouter";
import { useToast } from "@/hooks/use-toast";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { apiRequest } from "@/lib/queryClient";

export default function Profile() {
  const { user, logout } = useAuth();
  const { data: services } = useServices();
  const [editingService, setEditingService] = useState<any>(null);
  const [editTitle, setEditTitle] = useState("");
  const [editDesc, setEditDesc] = useState("");
  const [editPrice, setEditPrice] = useState("");
  const [editCategory, setEditCategory] = useState("");
  const [isSavingService, setIsSavingService] = useState(false);
  const { data: myReviews = [] } = useQuery({ queryKey: ["/api/reviews/my"], queryFn: async () => { const res = await fetch("/api/reviews/my"); if (!res.ok) return []; return res.json(); } });
  const { mutateAsync: createService, isPending } = useCreateService();
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [isUploading, setIsUploading] = useState(false);
  const [codeCopied, setCodeCopied] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const { toast } = useToast();
  const queryClient = useQueryClient();

  const [isEditProfileOpen, setIsEditProfileOpen] = useState(false);
  const [editName, setEditName] = useState("");
  const [editUsername, setEditUsername] = useState("");
  const [editCity, setEditCity] = useState("");

  const updateProfile = useMutation({
    mutationFn: async (data: { name: string; username: string; city?: string }) => {
      const res = await apiRequest("PATCH", "/api/users/profile", data);
      return res.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/auth/me"] });
        queryClient.refetchQueries({ queryKey: ["/api/auth/me"] });
      setIsEditProfileOpen(false);
      toast({ title: "Profile updated!" });
    },
    onError: (err: any) => {
      toast({ title: "Error", description: err.message || "Failed to update profile", variant: "destructive" });
    },
  });

  const [title, setTitle] = useState("");
  const [desc, setDesc] = useState("");
  const [cat, setCat] = useState("plumbing");
  const [price, setPrice] = useState("50");
  const [pricingType, setPricingType] = useState<"fixed" | "negotiable" | "hourly" | "free_estimate">("negotiable");

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
        queryClient.refetchQueries({ queryKey: ["/api/auth/me"] });
    },
  });

  const { data: connectStatus, refetch: refetchConnectStatus } = useQuery<{
    connected: boolean;
    balance: number;
    payoutsEnabled: boolean;
    chargesEnabled?: boolean;
    detailsSubmitted?: boolean;
  }>({
    queryKey: ["/api/connect/status"],
    enabled: !!user,
  });

  const connectOnboard = useMutation({
    mutationFn: async () => {
      const res = await apiRequest("POST", "/api/connect/onboard");
      return res.json();
    },
    onSuccess: (data: { url: string }) => {
      window.location.href = data.url;
    },
    onError: (err: any) => {
      toast({ title: "Error", description: err.message || "Failed to start setup", variant: "destructive" });
    },
  });

  const requestPayout = useMutation({
    mutationFn: async () => {
      const res = await apiRequest("POST", "/api/payouts/request");
      return res.json();
    },
    onSuccess: (data: { message: string }) => {
      toast({ title: "Payout Requested", description: data.message });
      queryClient.invalidateQueries({ queryKey: ["/api/connect/status"] });
      queryClient.invalidateQueries({ queryKey: ["/api/users/referral-stats"] });
    },
    onError: (err: any) => {
      toast({ title: "Payout Failed", description: err.message || "Failed to request payout", variant: "destructive" });
    },
  });

  if (!user) return <Redirect to="/login" />;

  const myServices = services?.filter(s => s.providerId === user.id) || [];

  const handleEditService = async () => {
    if (!editingService) return;
    setIsSavingService(true);
    try {
      const res = await fetch("/api/services/" + editingService.id, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ title: editTitle, description: editDesc, price: editPrice, category: editCategory }),
      });
      if (!res.ok) throw new Error("Failed to update service");
      queryClient.invalidateQueries({ queryKey: ["/api/services"] });
      setEditingService(null);
      toast({ title: "Service updated!" });
    } catch (e: any) {
      toast({ title: "Error", description: e.message, variant: "destructive" });
    } finally {
      setIsSavingService(false);
    }
  };
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
        pricingType,
      } as any);
      setIsDialogOpen(false);
      setTitle("");
      setDesc("");
      setPricingType("negotiable");
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
    const reader = new FileReader();
    reader.onload = async () => {
      try {
        const base64 = reader.result;
        const res = await fetch("/api/users/profile-picture-upload", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ base64 }),
          credentials: "include",
        });
        if (!res.ok) throw new Error("Upload failed");
        queryClient.invalidateQueries({ queryKey: ["/api/auth/me"] });
        queryClient.refetchQueries({ queryKey: ["/api/auth/me"] });
        toast({ title: "Profile picture updated!" });
      } catch (e) {
        toast({ title: "Upload failed", description: "Please try again", variant: "destructive" });
      } finally {
        setIsUploading(false);
        if (fileInputRef.current) fileInputRef.current.value = "";
      }
    };
    reader.readAsDataURL(file);
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
    <>
    <Dialog open={!!editingService} onOpenChange={(o) => { if (!o) setEditingService(null); }}>
      <DialogContent>
        <DialogHeader><DialogTitle>Edit Service</DialogTitle></DialogHeader>
        <div className="space-y-4 py-4">
          <div className="space-y-2"><Label>Title</Label><Input value={editTitle} onChange={e => setEditTitle(e.target.value)} /></div>
          <div className="space-y-2"><Label>Description</Label><Textarea value={editDesc} onChange={e => setEditDesc(e.target.value)} /></div>
          <div className="space-y-2"><Label>Price</Label><Input type="number" value={editPrice} onChange={e => setEditPrice(e.target.value)} /></div>
          <div className="space-y-2"><Label>Category</Label><Input value={editCategory} onChange={e => setEditCategory(e.target.value)} /></div>
        </div>
        {/* Photo upload section */}
        {editingService && (
          <div className="space-y-2">
            <Label>Photos ({((editingService.photos || []).length)}/5)</Label>
            <div className="flex gap-2 flex-wrap">
              {(editingService.photos || []).map((url: string, i: number) => (
                <div key={i} className="relative w-20 h-20 rounded-lg overflow-hidden border">
                  <img src={url} alt="" className="w-full h-full object-cover" />
                  <button type="button" onClick={async () => {
                    const res = await fetch("/api/services/" + editingService.id + "/photos", { method: "DELETE", headers: {"Content-Type":"application/json"}, body: JSON.stringify({ url }) });
                    const data = await res.json();
                    setEditingService((s: any) => ({ ...s, photos: data.photos }));
                    queryClient.invalidateQueries({ queryKey: ["/api/services"] });
                  }} className="absolute top-0.5 right-0.5 w-5 h-5 bg-red-500 text-white rounded-full text-xs flex items-center justify-center">×</button>
                </div>
              ))}
              {(editingService.photos || []).length < 5 && (
                <label className="w-20 h-20 border-2 border-dashed rounded-lg flex flex-col items-center justify-center cursor-pointer hover:border-primary text-muted-foreground hover:text-primary transition-colors">
                  <span className="text-2xl">+</span>
                  <span className="text-[10px]">Add photo</span>
                  <input type="file" accept="image/*" className="hidden" onChange={async (e) => {
                    const file = e.target.files?.[0];
                    if (!file) return;
                    if (file.size > 5 * 1024 * 1024) { alert("Max 5MB per photo"); return; }
                    const reader = new FileReader();
                    reader.onload = async () => {
                      const base64 = reader.result as string;
                      const res = await fetch("/api/services/" + editingService.id + "/photos", { method: "POST", headers: {"Content-Type":"application/json"}, body: JSON.stringify({ base64 }) });
                      if (!res.ok) { const d = await res.json(); alert(d.message); return; }
                      const data = await res.json();
                      setEditingService((s: any) => ({ ...s, photos: data.photos }));
                      queryClient.invalidateQueries({ queryKey: ["/api/services"] });
                    };
                    reader.readAsDataURL(file);
                  }} />
                </label>
              )}
            </div>
          </div>
        )}
        <DialogFooter>
          <Button variant="outline" onClick={() => setEditingService(null)}>Cancel</Button>
          <Button onClick={handleEditService} disabled={isSavingService}>{isSavingService ? "Saving..." : "Save Changes"}</Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
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
                  <Wallet className="w-4 h-4" /> Payout Settings
                </CardTitle>
                <CardDescription>Withdraw your referral earnings</CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                {connectStatus && (
                  <>
                    <div className="p-3 bg-muted rounded-md text-center">
                      <p className="text-2xl font-bold text-green-600" data-testid="text-available-balance">
                        ${((connectStatus.balance || 0) / 100).toFixed(2)}
                      </p>
                      <p className="text-xs text-muted-foreground">Available Balance</p>
                    </div>
                    
                    {!connectStatus.connected ? (
                      <div className="space-y-2">
                        <p className="text-sm text-muted-foreground">
                          Connect your bank account to receive payouts
                        </p>
                        <Button 
                          className="w-full gap-2" 
                          onClick={() => connectOnboard.mutate()}
                          disabled={connectOnboard.isPending}
                          data-testid="button-connect-bank"
                        >
                          {connectOnboard.isPending ? (
                            <Loader2 className="w-4 h-4 animate-spin" />
                          ) : (
                            <ExternalLink className="w-4 h-4" />
                          )}
                          Connect Bank Account
                        </Button>
                      </div>
                    ) : !connectStatus.payoutsEnabled ? (
                      <div className="space-y-2">
                        <p className="text-sm text-yellow-600">
                          Your account setup is incomplete
                        </p>
                        <Button 
                          className="w-full gap-2" 
                          variant="outline"
                          onClick={() => connectOnboard.mutate()}
                          disabled={connectOnboard.isPending}
                          data-testid="button-complete-setup"
                        >
                          {connectOnboard.isPending ? (
                            <Loader2 className="w-4 h-4 animate-spin" />
                          ) : (
                            <ExternalLink className="w-4 h-4" />
                          )}
                          Complete Setup
                        </Button>
                      </div>
                    ) : (
                      <div className="space-y-2">
                        <p className="text-sm text-green-600 flex items-center gap-1">
                          <Check className="w-4 h-4" /> Bank account connected
                        </p>
                        <Button 
                          className="w-full" 
                          onClick={() => requestPayout.mutate()}
                          disabled={requestPayout.isPending || (connectStatus.balance || 0) < 500}
                          data-testid="button-request-payout"
                        >
                          {requestPayout.isPending ? (
                            <Loader2 className="w-4 h-4 animate-spin mr-2" />
                          ) : null}
                          {(connectStatus.balance || 0) < 500 
                            ? "Minimum $5 to withdraw" 
                            : `Withdraw $${((connectStatus.balance || 0) / 100).toFixed(2)}`}
                        </Button>
                      </div>
                    )}
                  </>
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
                 <Dialog open={isEditProfileOpen} onOpenChange={(open) => {
  if (open) { setEditName(user.name); setEditUsername(user.username); }
  setIsEditProfileOpen(open);
}}>
  <DialogTrigger asChild>
    <Button variant="ghost" className="w-full justify-start text-sm h-9">Edit Profile</Button>
  </DialogTrigger>
  <DialogContent>
    <DialogHeader>
      <DialogTitle>Edit Profile</DialogTitle>
      <DialogDescription>Update your display name and username.</DialogDescription>
    </DialogHeader>
    <div className="space-y-4 py-4">
      <div className="space-y-2">
        <Label>Name</Label>
        <Input value={editName} onChange={e => setEditName(e.target.value)} placeholder="Your name" />
      </div>
      <div className="space-y-2">
        <Label>Username</Label>
        <Input value={editUsername} onChange={e => setEditUsername(e.target.value)} placeholder="Your username" />
      </div>
          <div className="space-y-2">
        <Label>City</Label>
        <Input value={editCity} onChange={e => setEditCity(e.target.value)} placeholder="e.g. Houston, TX" />
      </div>
    </div>
    <DialogFooter>
      <Button
        onClick={() => updateProfile.mutate({ name: editName, username: editUsername, city: editCity })}
        disabled={updateProfile.isPending}
      >
        {updateProfile.isPending ? "Saving..." : "Save Changes"}
      </Button>
    </DialogFooter>
  </DialogContent>
</Dialog>
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
                              placeholder="e.g. Plumbing, Welding"
                              data-testid="input-service-category"
                            />
                          </div>
                          <div className="space-y-2">
                            <Label>Starting Price ($)</Label>
                            <Input type="number" value={price} onChange={e => setPrice(e.target.value)} data-testid="input-service-price" />
                          </div>
                        </div>
                        <div className="space-y-2">
                          <Label>Pricing Type</Label>
                          <Select value={pricingType} onValueChange={(v) => setPricingType(v as any)}>
                            <SelectTrigger data-testid="select-pricing-type">
                              <SelectValue placeholder="How do you charge?" />
                            </SelectTrigger>
                            <SelectContent>
                              <SelectItem value="fixed">Fixed Price â€” set rate per job</SelectItem>
                              <SelectItem value="negotiable">Negotiable â€” agree with customer</SelectItem>
                              <SelectItem value="hourly">Hourly Rate â€” charged by the hour</SelectItem>
                              <SelectItem value="free_estimate">Free Estimate â€” quote first, then decide</SelectItem>
                            </SelectContent>
                          </Select>
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
                        <Button variant="outline" size="sm" onClick={() => { setEditingService(service); setEditTitle(service.title); setEditDesc(service.description); setEditPrice(String(service.price)); setEditCategory(service.category); }}>Edit</Button>
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
                  <p className="text-3xl font-display font-bold text-amber-900 dark:text-amber-300">{myReviews.length}</p>
                  <p className="text-xs text-amber-800/60 dark:text-amber-400/60 mt-2">Help the community by reviewing</p>
                </Card>
              </div>
            </div>

          </div>
        </div>
      </main>
    </div>
    </>
  );
}

