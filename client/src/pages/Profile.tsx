import { Navbar } from "@/components/Navbar";
import { useAuth } from "@/hooks/use-auth";
import { useCreateService, useServices } from "@/hooks/use-services";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { Plus, Settings, User as UserIcon } from "lucide-react";
import { useState } from "react";
import { Redirect } from "wouter";

export default function Profile() {
  const { user, logout } = useAuth();
  const { data: services } = useServices(); // This fetches all services, ideally filter by providerId in real app
  const { mutateAsync: createService, isPending } = useCreateService();
  const [isDialogOpen, setIsDialogOpen] = useState(false);

  // New Service State
  const [title, setTitle] = useState("");
  const [desc, setDesc] = useState("");
  const [cat, setCat] = useState("plumbing");
  const [price, setPrice] = useState("50");

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
      // Reset form
      setTitle("");
      setDesc("");
    } catch (e) {
      // handled
    }
  };

  return (
    <div className="min-h-screen bg-background">
      <Navbar />
      
      <main className="container mx-auto px-4 py-8 max-w-5xl">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          
          {/* Sidebar Profile Card */}
          <div className="md:col-span-1 space-y-6">
            <Card className="text-center py-8 border-t-4 border-t-primary">
              <div className="flex justify-center mb-4">
                <Avatar className="w-24 h-24 border-4 border-secondary">
                   <AvatarFallback className="text-3xl bg-primary text-primary-foreground font-display">
                     {user.username.slice(0, 2).toUpperCase()}
                   </AvatarFallback>
                </Avatar>
              </div>
              <h2 className="text-xl font-bold">{user.name}</h2>
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
                <Button variant="outline" className="w-full" onClick={() => logout()}>
                  Sign Out
                </Button>
              </div>
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

          {/* Main Content */}
          <div className="md:col-span-2 space-y-8">
            
            {/* Provider Section: My Services */}
            {user.role === 'provider' && (
              <div className="space-y-4">
                <div className="flex items-center justify-between">
                  <h2 className="text-2xl font-display font-bold">My Services</h2>
                  
                  <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
                    <DialogTrigger asChild>
                      <Button className="gap-2 shadow-lg shadow-primary/20">
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
                          <Input value={title} onChange={e => setTitle(e.target.value)} placeholder="e.g. Expert Plumbing Repair" />
                        </div>
                        <div className="grid grid-cols-2 gap-4">
                          <div className="space-y-2">
                            <Label>Category</Label>
                            <Select value={cat} onValueChange={setCat}>
                              <SelectTrigger>
                                <SelectValue />
                              </SelectTrigger>
                              <SelectContent>
                                <SelectItem value="plumbing">Plumbing</SelectItem>
                                <SelectItem value="electrical">Electrical</SelectItem>
                                <SelectItem value="cleaning">Cleaning</SelectItem>
                                <SelectItem value="moving">Moving</SelectItem>
                              </SelectContent>
                            </Select>
                          </div>
                          <div className="space-y-2">
                            <Label>Hourly Rate ($)</Label>
                            <Input type="number" value={price} onChange={e => setPrice(e.target.value)} />
                          </div>
                        </div>
                        <div className="space-y-2">
                          <Label>Description</Label>
                          <Textarea value={desc} onChange={e => setDesc(e.target.value)} placeholder="Describe what you offer..." />
                        </div>
                      </div>

                      <DialogFooter>
                        <Button onClick={handleCreateService} disabled={isPending}>
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
                      <Card key={service.id} className="p-4 flex justify-between items-center group hover:border-primary/50 transition-colors">
                        <div>
                          <h3 className="font-bold">{service.title}</h3>
                          <div className="flex gap-2 text-sm text-muted-foreground mt-1">
                            <span className="capitalize bg-secondary px-2 py-0.5 rounded text-foreground font-medium">{service.category}</span>
                            <span>${service.price}/hr</span>
                          </div>
                        </div>
                        <Button variant="outline" size="sm" className="opacity-0 group-hover:opacity-100 transition-opacity">Edit</Button>
                      </Card>
                    ))}
                  </div>
                )}
              </div>
            )}

            {/* General Section */}
            <div className="space-y-4">
              <h2 className="text-2xl font-display font-bold">Account Overview</h2>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <Card className="p-6 bg-gradient-to-br from-blue-50 to-indigo-50 border-none">
                  <h3 className="font-bold text-lg text-primary mb-1">Total Spent</h3>
                  <p className="text-3xl font-display font-bold">$0.00</p>
                  <p className="text-xs text-muted-foreground mt-2">Lifetime spending on services</p>
                </Card>
                <Card className="p-6 bg-gradient-to-br from-amber-50 to-orange-50 border-none">
                  <h3 className="font-bold text-lg text-amber-600 mb-1">Reviews Given</h3>
                  <p className="text-3xl font-display font-bold text-amber-900">0</p>
                  <p className="text-xs text-amber-800/60 mt-2">Help the community by reviewing</p>
                </Card>
              </div>
            </div>

          </div>
        </div>
      </main>
    </div>
  );
}
