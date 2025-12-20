import { Navbar } from "@/components/Navbar";
import { ServiceMap } from "@/components/ServiceMap";
import { useServices } from "@/hooks/use-services";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Search, MapPin, Star } from "lucide-react";
import { useState, useMemo, useEffect } from "react";
import { Link } from "wouter";

export default function Home() {
  const [searchTerm, setSearchTerm] = useState("");
  const [activeCategory, setActiveCategory] = useState<string | undefined>();
  const [userLocation, setUserLocation] = useState<[number, number]>([40.7128, -74.0060]);
  const [locationLoading, setLocationLoading] = useState(true);
  
  // Get user's actual location
  useEffect(() => {
    if (navigator.geolocation) {
      navigator.geolocation.getCurrentPosition(
        (position) => {
          setUserLocation([position.coords.latitude, position.coords.longitude]);
          setLocationLoading(false);
        },
        (error) => {
          console.log("Geolocation error:", error.message);
          setLocationLoading(false);
        },
        { enableHighAccuracy: true, timeout: 10000 }
      );
    } else {
      setLocationLoading(false);
    }
  }, []);
  
  // URL params logic could be added here for sharing searches
  const { data: services = [], isLoading } = useServices({ 
    search: searchTerm, 
    category: activeCategory 
  });

  // Dynamically extract unique categories from services
  const categories = useMemo(() => {
    const uniqueCats = new Set(services.map(s => s.category));
    return Array.from(uniqueCats).sort();
  }, [services]);

  return (
    <div className="h-screen flex flex-col bg-background overflow-hidden">
      <Navbar />
      
      <main className="flex-1 flex flex-col md:flex-row h-[calc(100vh-64px)] overflow-hidden relative">
        
        {/* Sidebar List - Mobile: Bottom sheet or hidden, Desktop: Left sidebar */}
        <aside className="w-full md:w-[400px] lg:w-[450px] flex flex-col bg-white dark:bg-card border-r z-10 shadow-xl md:shadow-none h-1/2 md:h-full order-2 md:order-1">
          <div className="p-4 border-b space-y-4 bg-white/50 dark:bg-card/50 backdrop-blur-sm sticky top-0 z-10">
            <div>
              <h1 className="text-xl font-display font-bold text-foreground">Find Professionals</h1>
              <p className="text-sm text-muted-foreground">Experts nearby ready to help.</p>
            </div>
            
            <div className="relative">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
              <Input 
                placeholder="What do you need help with?" 
                className="pl-9 bg-secondary/30 border-border/50 focus:bg-white transition-all"
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
              />
            </div>

            <div className="flex gap-2 overflow-x-auto pb-2 scrollbar-none mask-fade-right">
              <Button 
                variant={!activeCategory ? "default" : "outline"} 
                size="sm"
                className="rounded-full flex-shrink-0"
                onClick={() => setActiveCategory(undefined)}
              >
                All
              </Button>
              {categories.map(cat => (
                <Button 
                  key={cat}
                  variant={activeCategory === cat ? "default" : "outline"} 
                  size="sm"
                  className="rounded-full flex-shrink-0"
                  onClick={() => setActiveCategory(activeCategory === cat ? undefined : cat)}
                >
                  <span className="capitalize">{cat}</span>
                </Button>
              ))}
            </div>
          </div>

          <div className="flex-1 overflow-y-auto p-4 space-y-4 bg-secondary/10">
            {isLoading ? (
              <div className="flex flex-col items-center justify-center h-40 text-muted-foreground space-y-3">
                <div className="w-6 h-6 border-2 border-primary border-t-transparent rounded-full animate-spin" />
                <p className="text-sm">Finding experts nearby...</p>
              </div>
            ) : services.length === 0 ? (
              <div className="text-center py-10 px-4">
                <div className="w-12 h-12 bg-muted rounded-full flex items-center justify-center mx-auto mb-3">
                  <MapPin className="w-6 h-6 text-muted-foreground/50" />
                </div>
                <h3 className="font-semibold text-foreground">No services found</h3>
                <p className="text-sm text-muted-foreground mt-1">Try adjusting your search or filters.</p>
              </div>
            ) : (
              services.map((service) => (
                <Link key={service.id} href={`/services/${service.id}`} className="block group">
                  <Card className="overflow-hidden border-border/50 hover:border-primary/30 hover:shadow-md transition-all duration-300 group-hover:-translate-y-0.5 bg-white">
                    <CardContent className="p-4">
                      <div className="flex justify-between items-start">
                        <div>
                          <h3 className="font-bold text-foreground group-hover:text-primary transition-colors">{service.title}</h3>
                          <p className="text-sm text-muted-foreground mt-0.5 line-clamp-1">{service.description}</p>
                        </div>
                        <div className="text-right">
                          <span className="block font-bold text-primary text-lg">${service.price}</span>
                          <span className="text-[10px] text-muted-foreground uppercase font-medium">per hour</span>
                        </div>
                      </div>
                      
                      <div className="mt-4 flex items-center justify-between text-xs text-muted-foreground">
                        <div className="flex items-center gap-2">
                          <div className="w-5 h-5 rounded-full bg-gradient-to-br from-blue-100 to-indigo-100 flex items-center justify-center text-[10px] font-bold text-primary">
                            {service.provider.name.charAt(0)}
                          </div>
                          <span className="font-medium">{service.provider.name}</span>
                        </div>
                        <div className="flex items-center gap-3">
                          <span className="flex items-center text-amber-500 font-bold bg-amber-50 px-1.5 py-0.5 rounded">
                            <Star className="w-3 h-3 fill-current mr-1" />
                            4.8
                          </span>
                          <span className="px-2 py-0.5 bg-secondary rounded-full font-medium capitalize">
                            {service.category}
                          </span>
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                </Link>
              ))
            )}
          </div>
        </aside>

        {/* Map Area */}
        <div className="flex-1 relative h-1/2 md:h-full order-1 md:order-2">
          <ServiceMap services={services} userLocation={userLocation} />
          
          {/* Overlay gradient for mobile transition */}
          <div className="absolute bottom-0 left-0 right-0 h-12 bg-gradient-to-t from-background to-transparent md:hidden pointer-events-none z-[400]" />
        </div>
      </main>
    </div>
  );
}
