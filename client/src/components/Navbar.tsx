import { Link, useLocation } from "wouter";
import { useAuth } from "@/hooks/use-auth";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { 
  DropdownMenu, 
  DropdownMenuContent, 
  DropdownMenuItem, 
  DropdownMenuLabel, 
  DropdownMenuSeparator, 
  DropdownMenuTrigger 
} from "@/components/ui/dropdown-menu";
import { Search, MapPin, User, LogOut, Briefcase, Calendar } from "lucide-react";
import { useState } from "react";

export function Navbar() {
  const { user, logout } = useAuth();
  const [location, setLocation] = useLocation();
  const [search, setSearch] = useState("");

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    if (search.trim()) {
      // Simple query param navigation (could be more robust)
      window.location.href = `/?search=${encodeURIComponent(search)}`;
    }
  };

  return (
    <nav className="sticky top-0 z-50 w-full border-b bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
      <div className="container mx-auto px-4 h-16 flex items-center justify-between gap-4">
        {/* Logo */}
        <Link href="/" className="flex items-center gap-2 font-display text-2xl font-bold text-primary hover:opacity-90 transition-opacity">
          <div className="bg-primary text-primary-foreground p-1.5 rounded-lg">
            <MapPin className="w-5 h-5" />
          </div>
          <span className="hidden sm:inline">CertiGo</span>
        </Link>

        {/* Search Bar - Hidden on very small screens if needed, or collapsed */}
        <form onSubmit={handleSearch} className="flex-1 max-w-md relative hidden md:block">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
          <Input 
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Search for plumbers, electricians..." 
            className="pl-9 bg-secondary/50 border-transparent focus:bg-background transition-all rounded-full"
          />
        </form>

        {/* Auth Actions */}
        <div className="flex items-center gap-2">
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
              <DropdownMenuContent align="end" className="w-56 rounded-xl p-2">
                <DropdownMenuLabel>My Account</DropdownMenuLabel>
                <DropdownMenuSeparator />
                <DropdownMenuItem onClick={() => setLocation("/profile")} className="cursor-pointer rounded-lg">
                  <User className="w-4 h-4 mr-2" /> Profile
                </DropdownMenuItem>
                <DropdownMenuItem onClick={() => setLocation("/bookings")} className="cursor-pointer rounded-lg">
                  <Calendar className="w-4 h-4 mr-2" /> My Bookings
                </DropdownMenuItem>
                {user.role === 'provider' && (
                  <DropdownMenuItem onClick={() => setLocation("/profile")} className="cursor-pointer rounded-lg text-primary font-medium">
                    <Briefcase className="w-4 h-4 mr-2" /> My Services
                  </DropdownMenuItem>
                )}
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
