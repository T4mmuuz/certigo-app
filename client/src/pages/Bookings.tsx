import { Navbar } from "@/components/Navbar";
import { useBookings } from "@/hooks/use-bookings";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { format } from "date-fns";
import { Calendar, Clock, MapPin, Loader2 } from "lucide-react";

export default function Bookings() {
  const { data: bookings, isLoading } = useBookings();

  const getStatusColor = (status: string) => {
    switch(status) {
      case 'accepted': return 'bg-green-100 text-green-700 hover:bg-green-100';
      case 'completed': return 'bg-blue-100 text-blue-700 hover:bg-blue-100';
      case 'cancelled': return 'bg-red-100 text-red-700 hover:bg-red-100';
      default: return 'bg-amber-100 text-amber-700 hover:bg-amber-100';
    }
  };

  return (
    <div className="min-h-screen bg-background">
      <Navbar />
      
      <main className="container mx-auto px-4 py-8 max-w-4xl">
        <h1 className="text-3xl font-display font-bold mb-8">My Bookings</h1>

        {isLoading ? (
          <div className="flex justify-center py-12">
            <Loader2 className="w-8 h-8 animate-spin text-primary" />
          </div>
        ) : !bookings || bookings.length === 0 ? (
          <div className="text-center py-12 bg-secondary/30 rounded-2xl border border-dashed border-border">
            <Calendar className="w-12 h-12 text-muted-foreground mx-auto mb-4" />
            <h3 className="text-lg font-medium">No bookings yet</h3>
            <p className="text-muted-foreground">Find a professional and schedule your first service!</p>
          </div>
        ) : (
          <div className="grid gap-4">
            {bookings.map((booking) => (
              <Card key={booking.id} className="overflow-hidden hover:shadow-md transition-shadow">
                <CardContent className="p-0 flex flex-col sm:flex-row">
                  {/* Status Strip */}
                  <div className={`w-full sm:w-2 ${getStatusColor(booking.status).replace('text-', 'bg-').split(' ')[0]}`} />
                  
                  <div className="p-6 flex-1">
                    <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 mb-4">
                       <div>
                         <h3 className="text-lg font-bold">{booking.service.title}</h3>
                         <p className="text-sm text-muted-foreground">Booking #{booking.id}</p>
                       </div>
                       <Badge className={`${getStatusColor(booking.status)} border-none capitalize`}>
                         {booking.status}
                       </Badge>
                    </div>
                    
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-sm">
                      <div className="flex items-center gap-2 text-muted-foreground">
                        <Calendar className="w-4 h-4 text-primary" />
                        <span className="font-medium text-foreground">{format(new Date(booking.date), 'MMMM d, yyyy')}</span>
                      </div>
                      <div className="flex items-center gap-2 text-muted-foreground">
                        <Clock className="w-4 h-4 text-primary" />
                        <span className="font-medium text-foreground">{format(new Date(booking.date), 'h:mm a')}</span>
                      </div>
                      <div className="flex items-center gap-2 text-muted-foreground">
                        <MapPin className="w-4 h-4 text-primary" />
                        <span>Service Location</span>
                      </div>
                    </div>
                  </div>

                  <div className="bg-secondary/20 p-6 flex flex-col justify-center items-end min-w-[150px] border-t sm:border-t-0 sm:border-l">
                    <span className="text-xs text-muted-foreground uppercase font-bold">Total</span>
                    <span className="text-2xl font-bold text-primary">${booking.service.price}</span>
                    {booking.depositPaid && (
                      <span className="text-xs text-green-600 font-medium mt-1 flex items-center">
                        Deposit Paid
                      </span>
                    )}
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        )}
      </main>
    </div>
  );
}
