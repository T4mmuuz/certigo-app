import { Navbar } from "@/components/Navbar";
import { useServices } from "@/hooks/use-services";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Search, Star, MapPin, ShieldCheck, Briefcase } from "lucide-react";
import { useState, useMemo } from "react";
import { Link } from "wouter";

export default function Providers() {
  const [searchTerm, setSearchTerm] = useState("");
  const [activeCategory, setActiveCategory] = useState<string | undefined>();

  const { data: rawServices = [], isLoading } = useServices({ search: searchTerm, category: activeCategory });

  const providers = useMemo(() => {
    const map = new Map<number, { provider: any; services: any[]; avgRating: number; reviewCount: number }>();
    rawServices.forEach((s) => {
      if (!map.has(s.providerId)) {
        const reviews = s.reviews ?? [];
        const reviewCount = reviews.length;
        const avgRating = reviewCount > 0 ? reviews.reduce((sum: number, r: any) => sum + r.rating, 0) / reviewCount : 0;
        map.set(s.providerId, { provider: s.provider, services: [], avgRating, reviewCount });
      }
      map.get(s.providerId)!.services.push(s);
    });
    return Array.from(map.values());
  }, [rawServices]);

  const categories = useMemo(() => {
    const cats = new Set(rawServices.map((s) => s.category));
    return Array.from(cats).sort();
  }, [rawServices]);

  return (
    <div className="min-h-screen bg-background">
      <Navbar />
      <main className="container mx-auto px-4 py-6 max-w-6xl">
        <div className="mb-6">
          <h1 className="text-2xl font-bold text-foreground mb-1">Providers Near You</h1>
          <p className="text-sm text-muted-foreground">Browse professionals available in your area</p>
        </div>
        <div className="space-y-3 mb-6">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
            <Input placeholder="Search by name or service..." className="pl-9" value={searchTerm} onChange={(e) => setSearchTerm(e.target.value)} />
          </div>
          <div className="flex gap-2 overflow-x-auto pb-1 scrollbar-none flex-nowrap">
            <Button variant={!activeCategory ? "default" : "outline"} size="sm" className="rounded-full flex-shrink-0" onClick={() => setActiveCategory(undefined)}>All</Button>
            {categories.map((cat) => (
              <Button key={cat} variant={activeCategory === cat ? "default" : "outline"} size="sm" className="rounded-full flex-shrink-0 capitalize" onClick={() => setActiveCategory(activeCategory === cat ? undefined : cat)}>{cat}</Button>
            ))}
          </div>
        </div>
        {isLoading ? (
          <div className="flex justify-center py-20"><div className="w-6 h-6 border-2 border-primary border-t-transparent rounded-full animate-spin" /></div>
        ) : providers.length === 0 ? (
          <div className="text-center py-20 text-muted-foreground">No providers found.</div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
            {providers.map(({ provider, services, avgRating, reviewCount }) => (
              <Link key={provider.id} href={`/services/${services[0].id}`} className="block group">
                <Card className="overflow-hidden hover:shadow-lg hover:border-primary/30 transition-all duration-300 group-hover:-translate-y-0.5 h-full">
                  <div className="h-24 bg-gradient-to-br from-primary/30 to-primary/10 relative">
                    <div className="absolute -bottom-8 left-4">
                      <div className="w-16 h-16 rounded-full border-4 border-background bg-gradient-to-br from-primary/20 to-primary/50 flex items-center justify-center text-2xl font-bold text-primary shadow-md overflow-hidden">
                        {provider.profilePicture ? (<img src={provider.profilePicture} alt={provider.name} className="w-full h-full object-cover" />) : provider.name.charAt(0)}
                      </div>
                    </div>
                  </div>
                  <CardContent className="pt-10 pb-4 px-4">
                    <div className="flex items-start justify-between gap-2 mb-1">
                      <div>
                        <p className="font-bold text-foreground group-hover:text-primary transition-colors leading-tight">{provider.name}</p>
                        {provider.city && (<p className="text-xs text-muted-foreground flex items-center gap-1 mt-0.5"><MapPin className="w-3 h-3" /> {provider.city}</p>)}
                      </div>
                      <ShieldCheck className="w-4 h-4 text-green-500 flex-shrink-0 mt-0.5" />
                    </div>
                    <div className="flex flex-wrap gap-1 my-2">
                      {Array.from(new Set(services.map((s) => s.category))).slice(0, 3).map((cat) => (
                        <Badge key={cat} variant="secondary" className="text-[10px] capitalize px-2 py-0">{cat}</Badge>
                      ))}
                    </div>
                    <p className="text-xs text-muted-foreground line-clamp-2 mb-3">{services.map((s) => s.title).join(" · ")}</p>
                    <div className="flex items-center justify-between text-xs border-t pt-3">
                      <div className="flex items-center gap-1 text-muted-foreground"><Briefcase className="w-3.5 h-3.5" /><span>{reviewCount} {reviewCount === 1 ? "job" : "jobs"}</span></div>
                      {reviewCount > 0 ? (<div className="flex items-center gap-1 text-amber-500 font-bold bg-amber-50 dark:bg-amber-900/20 px-2 py-0.5 rounded-full"><Star className="w-3 h-3 fill-current" />{avgRating.toFixed(1)}</div>) : (<span className="text-muted-foreground">New</span>)}
                      <div className="text-primary font-bold">From ${Math.min(...services.map((s) => s.price))}</div>
                    </div>
                  </CardContent>
                </Card>
              </Link>
            ))}
          </div>
        )}
      </main>
    </div>
  );
}
