import { Link, useLocation } from "wouter";
import { useAuth } from "@/hooks/use-auth";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { 
  DropdownMenu, 
  DropdownMenuContent, 
  DropdownMenuItem, 
  DropdownMenuLabel, 
  DropdownMenuSeparator, 
  DropdownMenuTrigger 
} from "@/components/ui/dropdown-menu";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Search, User, LogOut, Briefcase, Calendar, DollarSign, Crown, Moon, Sun, Bell, MapPin, Check } from "lucide-react";
import { useState, useEffect } from "react";
import { useQuery, useMutation } from "@tanstack/react-query";
import { apiRequest, queryClient } from "@/lib/queryClient";
import { useToast } from "@/hooks/use-toast";
import logoImage from "@assets/generated_images/certigo_professional_marketplace_logo.png";

interface Notification {
  id: number;
  userId: number;
  type: string;
  title: string;
  body: string;
  metadata: string | null;
  readAt: string | null;
  createdAt: string;
}

export function Navbar() {
  const { user, logout } = useAuth();
  const [location, setLocation] = useLocation();
  const [search, setSearch] = useState("");
  const { toast } = useToast();
  const [isDark, setIsDark] = useState(() => {
    if (typeof window !== 'undefined') {
      return localStorage.getItem('theme') === 'dark' || 
        (!localStorage.getItem('theme') && window.matchMedia('(prefers-color-scheme: dark)').matches);
    }
    return false;
  });

  useEffect(() => {
    if (isDark) {
      document.documentElement.classList.add('dark');
      localStorage.setItem('theme', 'dark');
    } else {
      document.documentElement.classList.remove('dark');
      localStorage.setItem('theme', 'light');
    }
  }, [isDark]);

  // Request geolocation permission when user logs in
  useEffect(() => {
    if (user && navigator.geolocation) {
      const hasAskedLocation = localStorage.getItem('locationAsked');
      if (!hasAskedLocation) {
        navigator.geolocation.getCurrentPosition(
          async (position) => {
            try {
              await apiRequest("POST", "/api/user/location", {
                lat: position.coords.latitude,
                lng: position.coords.longitude,
              });
              localStorage.setItem('locationAsked', 'true');
              toast({
                title: "Location Updated",
                description: "Your location helps us show nearby services.",
              });
            } catch (err) {
              console.error('Failed to update location:', err);
            }
          },
          (error) => {
            console.log('Geolocation denied:', error.message);
            localStorage.setItem('locationAsked', 'true');
          },
          { enableHighAccuracy: true, timeout: 10000 }
        );
      }
    }
  }, [user, toast]);

  // Fetch notifications
  const { data: notificationData } = useQuery<{ notifications: Notification[]; unreadCount: number }>({
    queryKey: ["/api/notifications"],
    enabled: !!user,
    refetchInterval: 30000, // Poll every 30 seconds
  });

  const markAllReadMutation = useMutation({
    mutationFn: async () => {
      await apiRequest("POST", "/api/notifications/read-all", {});
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/notifications"] });
    },
  });

  const markReadMutation = useMutation({
    mutationFn: async (id: number) => {
      await apiRequest("POST", `/api/notifications/${id}/read`, {});
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/notifications"] });
    },
  });

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    if (search.trim()) {
      window.location.href = `/?search=${encodeURIComponent(search)}`;
    }
  };

  const notifications = notificationData?.notifications || [];
  const unreadCount = notificationData?.unreadCount || 0;

  return (
    <nav className="sticky top-0 z-50 w-full border-b bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
      <div className="container mx-auto px-4 h-16 flex items-center justify-between gap-4">
        <Link href="/" className="flex items-center gap-2 font-display text-2xl font-bold text-primary hover:opacity-90 transition-opacity">
          <img src={logoImage} alt="CertiGo Logo" className="w-12 h-12 rounded-lg" />
          <span className="hidden sm:inline">CertiGo</span>
        </Link>

        <form onSubmit={handleSearch} className="flex-1 max-w-md relative hidden md:block">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
          <Input 
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Search for plumbers, electricians..." 
            className="pl-9 bg-secondary/50 border-transparent focus:bg-background transition-all rounded-full"
          />
        </form>

        <div className="flex items-center gap-2">
          <Button 
            size="icon" 
            variant="ghost" 
            onClick={() => setIsDark(!isDark)}
            data-testid="button-theme-toggle"
          >
            {isDark ? <Sun className="w-5 h-5" /> : <Moon className="w-5 h-5" />}
          </Button>

          {user && (
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button size="icon" variant="ghost" className="relative" data-testid="button-notifications">
                  <Bell className="w-5 h-5" />
                  {unreadCount > 0 && (
                    <span className="absolute -top-1 -right-1 w-5 h-5 bg-destructive text-destructive-foreground text-xs rounded-full flex items-center justify-center font-bold">
                      {unreadCount > 9 ? '9+' : unreadCount}
                    </span>
                  )}
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end" className="w-80 bg-card border shadow-lg">
                <div className="flex items-center justify-between px-4 py-2">
                  <DropdownMenuLabel className="p-0">Notifications</DropdownMenuLabel>
                  {unreadCount > 0 && (
                    <Button 
                      variant="ghost" 
                      size="sm" 
                      className="text-xs h-7"
                      onClick={() => markAllReadMutation.mutate()}
                    >
                      <Check className="w-3 h-3 mr-1" />
                      Mark all read
                    </Button>
                  )}
                </div>
                <DropdownMenuSeparator />
                <ScrollArea className="h-72">
                  {notifications.length === 0 ? (
                    <div className="p-4 text-center text-muted-foreground text-sm">
                      <Bell className="w-8 h-8 mx-auto mb-2 opacity-50" />
                      No notifications yet
                    </div>
                  ) : (
                    notifications.map((notif) => (
                      <DropdownMenuItem 
                        key={notif.id}
                        className={`flex flex-col items-start gap-1 p-3 cursor-pointer ${!notif.readAt ? 'bg-primary/5' : ''}`}
                        onClick={() => {
                          if (!notif.readAt) markReadMutation.mutate(notif.id);
                        }}
                      >
                        <div className="flex items-center gap-2 w-full">
                          <span className="font-medium text-foreground text-sm">{notif.title}</span>
                          {!notif.readAt && (
                            <span className="w-2 h-2 bg-primary rounded-full ml-auto flex-shrink-0" />
                          )}
                        </div>
                        <span className="text-xs text-muted-foreground line-clamp-2">{notif.body}</span>
                        <span className="text-xs text-muted-foreground/70">
                          {new Date(notif.createdAt).toLocaleDateString()} at {new Date(notif.createdAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                        </span>
                      </DropdownMenuItem>
                    ))
                  )}
                </ScrollArea>
              </DropdownMenuContent>
            </DropdownMenu>
          )}

          {user ? (
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button variant="ghost" className="gap-2 rounded-full pl-2 pr-4 h-10 border border-border hover:bg-secondary/50">
                  <div className="w-8 h-8 rounded-full bg-gradient-to-br from-primary to-accent flex items-center justify-center text-primary-foreground font-bold text-xs">
                    {user.username.slice(0, 2).toUpperCase()}
                  </div>
                  <span className="hidden sm:inline-block font-medium">{user.username}</span>
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end" className="w-56 rounded-xl p-2 bg-card border shadow-lg">
                <DropdownMenuLabel>My Account</DropdownMenuLabel>
                <DropdownMenuSeparator />
                <DropdownMenuItem onClick={() => setLocation("/profile")} className="cursor-pointer rounded-lg">
                  <User className="w-4 h-4 mr-2" /> Profile
                </DropdownMenuItem>
                <DropdownMenuItem onClick={() => setLocation("/bookings")} className="cursor-pointer rounded-lg">
                  <Calendar className="w-4 h-4 mr-2" /> My Bookings
                </DropdownMenuItem>
                {user.role === 'provider' && (
                  <>
                    <DropdownMenuItem onClick={() => setLocation("/profile")} className="cursor-pointer rounded-lg text-primary font-medium">
                      <Briefcase className="w-4 h-4 mr-2" /> My Services
                    </DropdownMenuItem>
                    <DropdownMenuItem onClick={() => setLocation("/premium")} className="cursor-pointer rounded-lg text-yellow-600 dark:text-yellow-400 font-medium">
                      <Crown className="w-4 h-4 mr-2" /> Premium
                    </DropdownMenuItem>
                  </>
                )}
                <DropdownMenuItem onClick={() => setLocation("/earnings")} className="cursor-pointer rounded-lg text-green-600 dark:text-green-400 font-medium">
                  <DollarSign className="w-4 h-4 mr-2" /> Earnings
                </DropdownMenuItem>
                <DropdownMenuSeparator />
                <DropdownMenuItem onClick={() => logout()} className="cursor-pointer rounded-lg text-destructive focus:text-destructive focus:bg-destructive/10">
                  <LogOut className="w-4 h-4 mr-2" /> Log out
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
          ) : (
            <div className="flex items-center gap-2">
              <Link href="/login">
                <Button variant="ghost" className="font-medium">Log in</Button>
              </Link>
              <Link href="/register">
                <Button className="rounded-full px-6 font-semibold shadow-lg shadow-primary/25 hover:shadow-xl hover:shadow-primary/30 transition-all hover:-translate-y-0.5">
                  Sign up
                </Button>
              </Link>
            </div>
          )}
        </div>
      </div>
    </nav>
  );
}
