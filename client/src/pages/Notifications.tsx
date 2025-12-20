import { useAuth } from "@/hooks/use-auth";
import { Navbar } from "@/components/Navbar";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Skeleton } from "@/components/ui/skeleton";
import { Bell, Check, Calendar, Star, DollarSign, MapPin, MessageSquare, ChevronRight } from "lucide-react";
import { useQuery, useMutation } from "@tanstack/react-query";
import { apiRequest, queryClient } from "@/lib/queryClient";
import { useLocation } from "wouter";
import { formatDistanceToNow } from "date-fns";

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

const notificationIcons: Record<string, any> = {
  booking_new: Calendar,
  booking_confirmed: Calendar,
  booking_cancelled: Calendar,
  provider_arriving: MapPin,
  provider_arrived: MapPin,
  payment_received: DollarSign,
  review_received: Star,
  new_message: MessageSquare,
};

export default function Notifications() {
  const { user } = useAuth();
  const [, setLocation] = useLocation();

  const { data: notificationData, isLoading } = useQuery<{ notifications: Notification[]; unreadCount: number }>({
    queryKey: ["/api/notifications"],
    enabled: !!user,
  });

  const markReadMutation = useMutation({
    mutationFn: async (id: number) => {
      await apiRequest("POST", `/api/notifications/${id}/read`, {});
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/notifications"] });
    },
  });

  const markAllReadMutation = useMutation({
    mutationFn: async () => {
      await apiRequest("POST", "/api/notifications/read-all", {});
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/notifications"] });
    },
  });

  const notifications = notificationData?.notifications || [];
  const unreadCount = notificationData?.unreadCount || 0;

  const getNotificationDestination = (notif: Notification): string | null => {
    if (!notif.metadata) return null;
    
    try {
      const meta = JSON.parse(notif.metadata);
      
      switch (notif.type) {
        case "new_message":
          if (meta.conversationId) {
            return `/chat/${meta.conversationId}`;
          }
          return "/messages";
          
        case "booking_new":
        case "booking_confirmed":
        case "booking_cancelled":
        case "provider_arriving":
        case "provider_arrived":
          return "/bookings";
          
        case "payment_received":
          if (user?.role === "provider") {
            return "/earnings";
          }
          return "/bookings";
          
        case "review_received":
          if (meta.serviceId) {
            return `/services/${meta.serviceId}`;
          }
          return "/profile";
          
        default:
          if (meta.conversationId) {
            return `/chat/${meta.conversationId}`;
          }
          if (meta.bookingId) {
            return "/bookings";
          }
          if (meta.serviceId) {
            return `/services/${meta.serviceId}`;
          }
          return null;
      }
    } catch {
      return null;
    }
  };

  const handleNotificationClick = (notif: Notification) => {
    if (!notif.readAt) {
      markReadMutation.mutate(notif.id);
    }
    
    const destination = getNotificationDestination(notif);
    if (destination) {
      setLocation(destination);
    }
  };

  if (!user) {
    return (
      <div className="min-h-screen bg-background">
        <Navbar />
        <div className="container mx-auto px-4 py-8 text-center">
          <p className="text-muted-foreground">Please log in to view notifications.</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background">
      <Navbar />
      <div className="container mx-auto px-4 py-8 max-w-2xl">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between gap-4">
            <div className="flex items-center gap-3">
              <CardTitle className="flex items-center gap-2">
                <Bell className="w-5 h-5" />
                Notifications
              </CardTitle>
              {unreadCount > 0 && (
                <Badge variant="destructive" className="text-xs">
                  {unreadCount} new
                </Badge>
              )}
            </div>
            {unreadCount > 0 && (
              <Button 
                variant="outline" 
                size="sm"
                onClick={() => markAllReadMutation.mutate()}
                disabled={markAllReadMutation.isPending}
              >
                <Check className="w-4 h-4 mr-2" />
                Mark all as read
              </Button>
            )}
          </CardHeader>
          <CardContent>
            {isLoading ? (
              <div className="space-y-3">
                {[1, 2, 3].map((i) => (
                  <div key={i} className="flex items-start gap-3 p-3">
                    <Skeleton className="w-10 h-10 rounded-full" />
                    <div className="flex-1 space-y-2">
                      <Skeleton className="h-4 w-3/4" />
                      <Skeleton className="h-3 w-1/2" />
                    </div>
                  </div>
                ))}
              </div>
            ) : notifications.length === 0 ? (
              <div className="py-12 text-center">
                <Bell className="w-12 h-12 mx-auto mb-4 text-muted-foreground/30" />
                <p className="text-muted-foreground">No notifications yet</p>
                <p className="text-sm text-muted-foreground/70 mt-1">
                  You'll see booking updates, messages, and reviews here
                </p>
              </div>
            ) : (
              <ScrollArea className="h-[500px]">
                <div className="space-y-1">
                  {notifications.map((notif) => {
                    const IconComponent = notificationIcons[notif.type] || Bell;
                    const hasDestination = !!getNotificationDestination(notif);
                    return (
                      <div
                        key={notif.id}
                        onClick={() => handleNotificationClick(notif)}
                        className={`flex items-start gap-3 p-4 rounded-lg cursor-pointer hover-elevate transition-colors ${
                          !notif.readAt ? 'bg-primary/5' : ''
                        }`}
                        data-testid={`notification-item-${notif.id}`}
                      >
                        <div className={`w-10 h-10 rounded-full flex items-center justify-center flex-shrink-0 ${
                          !notif.readAt ? 'bg-primary/10 text-primary' : 'bg-muted text-muted-foreground'
                        }`}>
                          <IconComponent className="w-5 h-5" />
                        </div>
                        <div className="flex-1 min-w-0">
                          <div className="flex items-center gap-2">
                            <span className={`font-medium ${!notif.readAt ? 'text-foreground' : 'text-muted-foreground'}`}>
                              {notif.title}
                            </span>
                            {!notif.readAt && (
                              <span className="w-2 h-2 bg-primary rounded-full flex-shrink-0" />
                            )}
                          </div>
                          <p className="text-sm text-muted-foreground mt-0.5 line-clamp-2">
                            {notif.body}
                          </p>
                          <p className="text-xs text-muted-foreground/70 mt-1">
                            {formatDistanceToNow(new Date(notif.createdAt), { addSuffix: true })}
                          </p>
                        </div>
                        {hasDestination && (
                          <ChevronRight className="w-5 h-5 text-muted-foreground/50 flex-shrink-0 mt-2" />
                        )}
                      </div>
                    );
                  })}
                </div>
              </ScrollArea>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
