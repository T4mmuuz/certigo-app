import { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { Navbar } from "@/components/Navbar";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { 
  Crown, 
  TrendingUp, 
  Eye, 
  ShieldCheck, 
  Calendar, 
  BarChart3, 
  Zap, 
  Check,
  Loader2 
} from "lucide-react";
import { useAuth } from "@/hooks/use-auth";
import { Link, Redirect } from "wouter";
import { apiRequest } from "@/lib/queryClient";

const PREMIUM_FEATURES = [
  {
    icon: TrendingUp,
    title: "Higher Search Ranking",
    description: "Appear at the top of search results when customers look for services",
  },
  {
    icon: Eye,
    title: "More Profile Visibility",
    description: "Get featured on the homepage and category pages",
  },
  {
    icon: ShieldCheck,
    title: "Verified Pro Badge",
    description: "Show customers you're a trusted, verified professional",
  },
  {
    icon: Calendar,
    title: "More Bookings Per Month",
    description: "No limits on the number of bookings you can accept",
  },
  {
    icon: BarChart3,
    title: "Advanced Analytics",
    description: "Track your performance with detailed insights and reports",
  },
  {
    icon: Zap,
    title: "Faster Response",
    description: "Respond to booking requests before non-premium providers",
  },
];

export default function Premium() {
  const { user } = useAuth();
  const [isLoading, setIsLoading] = useState(false);

  const { data: premiumStatus } = useQuery<{ isPremium: boolean; premiumExpiresAt: string | null }>({
    queryKey: ["/api/premium/status"],
    enabled: !!user,
  });

  if (!user) {
    return <Redirect to="/login" />;
  }

  if (user.role !== "provider") {
    return (
      <div className="min-h-screen bg-background">
        <Navbar />
        <main className="container mx-auto px-4 py-16 text-center">
          <h1 className="text-2xl font-bold mb-4">Premium is for Providers</h1>
          <p className="text-muted-foreground mb-8">
            Only service providers can subscribe to CertiGo Premium.
          </p>
          <Link href="/">
            <Button>Go Home</Button>
          </Link>
        </main>
      </div>
    );
  }

  const handleSubscribe = async () => {
    setIsLoading(true);
    try {
      const response = await apiRequest("POST", "/api/premium/subscribe");
      const data = await response.json();
      if (data.url) {
        window.location.href = data.url;
      }
    } catch (error) {
      console.error("Subscription error:", error);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-amber-50 via-yellow-50 to-orange-50 dark:from-gray-900 dark:via-gray-900 dark:to-gray-800">
      <Navbar />

      <main className="container mx-auto px-4 py-12 max-w-5xl">
        <div className="text-center mb-12">
          <div className="inline-flex items-center gap-2 mb-4">
            <Crown className="w-10 h-10 text-yellow-500" />
            <h1 className="text-4xl font-display font-bold text-foreground">CertiGo Premium</h1>
          </div>
          <p className="text-xl text-muted-foreground max-w-2xl mx-auto">
            Stand out from the competition and grow your business with premium features designed for serious professionals.
          </p>
        </div>

        {premiumStatus?.isPremium ? (
          <Card className="max-w-md mx-auto mb-12 border-yellow-300 bg-gradient-to-br from-yellow-50 to-amber-50 dark:from-yellow-900/20 dark:to-amber-900/20">
            <CardContent className="p-6 text-center">
              <Badge className="bg-yellow-500 text-white mb-4">
                <Crown className="w-3 h-3 mr-1" />
                Active Premium Member
              </Badge>
              <h3 className="text-xl font-bold mb-2">You're a Premium Provider!</h3>
              <p className="text-muted-foreground mb-4">
                Your premium subscription is active until{" "}
                {premiumStatus.premiumExpiresAt 
                  ? new Date(premiumStatus.premiumExpiresAt).toLocaleDateString()
                  : "N/A"
                }
              </p>
              <Link href="/profile">
                <Button variant="outline">Manage Profile</Button>
              </Link>
            </CardContent>
          </Card>
        ) : (
          <Card className="max-w-md mx-auto mb-12 border-2 border-yellow-400 shadow-xl">
            <CardHeader className="text-center pb-4">
              <Badge className="w-fit mx-auto bg-yellow-500 text-white mb-2">Most Popular</Badge>
              <CardTitle className="text-2xl">Premium Plan</CardTitle>
              <CardDescription>Everything you need to grow your business</CardDescription>
            </CardHeader>
            <CardContent className="text-center">
              <div className="mb-6">
                <span className="text-5xl font-bold">$15</span>
                <span className="text-muted-foreground">/month</span>
              </div>
              <Button 
                size="lg" 
                className="w-full gap-2 bg-yellow-500 hover:bg-yellow-600 text-white"
                onClick={handleSubscribe}
                disabled={isLoading}
                data-testid="button-subscribe-premium"
              >
                {isLoading ? (
                  <>
                    <Loader2 className="w-5 h-5 animate-spin" />
                    Processing...
                  </>
                ) : (
                  <>
                    <Crown className="w-5 h-5" />
                    Upgrade to Premium
                  </>
                )}
              </Button>
              <p className="text-xs text-muted-foreground mt-3">
                Cancel anytime. No long-term commitment.
              </p>
            </CardContent>
          </Card>
        )}

        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
          {PREMIUM_FEATURES.map((feature, index) => (
            <Card key={index} className="hover-elevate">
              <CardContent className="p-6">
                <div className="w-12 h-12 bg-yellow-100 dark:bg-yellow-900/30 rounded-lg flex items-center justify-center mb-4">
                  <feature.icon className="w-6 h-6 text-yellow-600" />
                </div>
                <h3 className="font-semibold text-lg mb-2">{feature.title}</h3>
                <p className="text-muted-foreground text-sm">{feature.description}</p>
              </CardContent>
            </Card>
          ))}
        </div>

        <div className="mt-12 text-center">
          <h3 className="text-xl font-semibold mb-6">What Premium Providers Get</h3>
          <div className="inline-flex flex-col items-start gap-3 text-left">
            {[
              "Priority placement in search results",
              "Verified Pro badge on your profile",
              "Featured on homepage carousel",
              "Unlimited booking capacity",
              "Detailed earnings analytics",
              "First access to customer requests",
              "Priority customer support",
            ].map((item, i) => (
              <div key={i} className="flex items-center gap-2">
                <Check className="w-5 h-5 text-green-500" />
                <span>{item}</span>
              </div>
            ))}
          </div>
        </div>
      </main>
    </div>
  );
}
