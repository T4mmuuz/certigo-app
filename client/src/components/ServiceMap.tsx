import { MapContainer, TileLayer, Marker, Popup, useMap } from "react-leaflet";
import L from "leaflet";
import { Service, User } from "@shared/schema";
import { Button } from "@/components/ui/button";
import { Star, MapPin } from "lucide-react";
import { Link } from "wouter";
import { useEffect } from "react";

// Fix Leaflet default icon issues in React
import iconUrl from "leaflet/dist/images/marker-icon.png";
import iconRetinaUrl from "leaflet/dist/images/marker-icon-2x.png";
import shadowUrl from "leaflet/dist/images/marker-shadow.png";

const DefaultIcon = L.icon({
  iconUrl,
  iconRetinaUrl,
  shadowUrl,
  iconSize: [25, 41],
  iconAnchor: [12, 41],
  popupAnchor: [1, -34],
  tooltipAnchor: [16, -28],
  shadowSize: [41, 41],
});
L.Marker.prototype.options.icon = DefaultIcon;

// Custom marker for user location
const UserIcon = L.divIcon({
  className: "bg-transparent",
  html: `<div class="w-4 h-4 bg-primary rounded-full border-2 border-white shadow-lg ring-4 ring-primary/20 animate-pulse"></div>`,
  iconSize: [16, 16],
  iconAnchor: [8, 8],
});

interface ServiceWithProvider extends Service {
  provider: User;
}

interface ServiceMapProps {
  services: ServiceWithProvider[];
  userLocation?: [number, number]; // [lat, lng]
}

// Component to recenter map when user location changes
function RecenterMap({ center }: { center: [number, number] }) {
  const map = useMap();
  useEffect(() => {
    map.flyTo(center, 13, { duration: 2 });
  }, [center, map]);
  return null;
}

export function ServiceMap({ services, userLocation = [40.7128, -74.0060] }: ServiceMapProps) {
  return (
    <div className="w-full h-full rounded-2xl overflow-hidden border border-border/50 shadow-inner bg-muted/30">
      <MapContainer 
        center={userLocation} 
        zoom={13} 
        scrollWheelZoom={true} 
        className="w-full h-full z-0"
        zoomControl={false}
      >
        <TileLayer
          attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
          url="https://{s}.basemaps.cartocdn.com/rastertiles/voyager/{z}/{x}/{y}{r}.png"
        />
        
        <RecenterMap center={userLocation} />

        {/* User Location Marker */}
        <Marker position={userLocation} icon={UserIcon}>
          <Popup className="custom-popup">
            <div className="p-3 text-center text-sm font-medium">
              You are here
            </div>
          </Popup>
        </Marker>

        {/* Service Markers */}
        {services.map((service) => (
          <Marker 
            key={service.id} 
            position={[service.lat, service.lng]}
          >
            <Popup className="custom-popup">
              <div className="w-64 p-0">
                <div className="bg-primary/5 p-4 border-b border-border/50">
                  <div className="flex justify-between items-start mb-2">
                    <h3 className="font-display font-bold text-base truncate pr-2">{service.title}</h3>
                    <div className="flex items-center text-amber-500 text-xs font-bold bg-white px-1.5 py-0.5 rounded shadow-sm">
                      <Star className="w-3 h-3 fill-current mr-1" />
                      4.8
                    </div>
                  </div>
                  <p className="text-xs text-muted-foreground line-clamp-2 mb-2">{service.description}</p>
                  <div className="flex items-center text-xs font-medium text-primary">
                    <span className="bg-primary/10 px-2 py-0.5 rounded text-primary-foreground bg-primary mr-2">
                      ${service.price}/hr
                    </span>
                    <span className="uppercase tracking-wider text-[10px] text-muted-foreground">{service.category}</span>
                  </div>
                </div>
                <div className="p-2 bg-white">
                  <Link href={`/services/${service.id}`}>
                    <Button size="sm" className="w-full rounded-lg font-semibold text-xs h-8">
                      View Profile
                    </Button>
                  </Link>
                </div>
              </div>
            </Popup>
          </Marker>
        ))}
      </MapContainer>
    </div>
  );
}
