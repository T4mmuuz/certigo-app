import { useEffect, useState } from "react";
import { Link } from "wouter";
import { Navbar } from "@/components/Navbar";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Crown, Loader2, Home, User } from "lucide-react";
import { apiRequest } from "@/lib/queryClient";
import { queryClient } from "@/lib/queryClient";

export default function PremiumSuccess() {
  const [status, setStatus] = useState<"loading" | "success" | "error">("loading");

  useEffect(() => {
    const confirmSubscription = async () => {
      const params = new URLSearchParams(window.location.search);
      const sessionId = params.get("session_id");

      if (!sessionId) {
        setStatus("error");
        return;
      }

      try {
        const response = await apiRequest("POST", "/api/premium/confirm", { sessionId });
        const data = await response.json();

        if (data.success) {
          setStatus("success");
          queryClient.invalidateQueries({ queryKey: ["/api/user"] });
          queryClient.invalidateQueries({ queryKey: ["/api/premium/status"] });
        } else {
          setStatus("error");
        }
      } catch (error) {
        console.error("Subscription confirmation error:", error);
        setStatus("error");
      }
    };

    confirmSubscription();
  }, []);

  return (
    <div className="min-h-screen bg-gradient-to-br from-amber-50 via-yellow-50 to-orange-50 dark:from-gray-900 dark:via-gray-900 dark:to-gray-800">
      <Navbar />

      <main className="container mx-auto px-4 py-16 flex items-center justify-center">
        <Card className="max-w-md w-full p-8 text-center shadow-xl">
          {status === "loading" && (
            <div className="space-y-4">
              <Loader2 className="w-16 h-16 mx-auto animate-spin text-yellow-500" />
              <h2 className="text-xl font-bold">Activating your Premium subscription...</h2>
              <p className="text-muted-foreground">Please wait while we set up your account.</p>
            </div>
          )}

          {status === "success" && (
            <div className="space-y-6">
              <div className="w-20 h-20 bg-yellow-100 rounded-full flex items-center justify-center mx-auto">
                <Crown className="w-10 h-10 text-yellow-500" />
              </div>
              <h2 className="text-2xl font-bold text-foreground">Welcome to Premium!</h2>
              <p className="text-muted-foreground">
                Congratulations! You're now a CertiGo Premium provider. Enjoy higher visibility, the Verified Pro badge, and all premium benefits.
              </p>
              <div className="bg-yellow-50 dark:bg-yellow-900/20 border border-yellow-200 dark:border-yellow-800 rounded-lg p-4 text-sm text-yellow-800 dark:text-yellow-200">
                Your profile now displays the Verified Pro badge!
              </div>
              <div className="flex flex-col gap-3 pt-4">
                <Link href="/profile">
                  <Button className="w-full gap-2 bg-yellow-500 hover:bg-yellow-600">
                    <User className="w-4 h-4" />
                    View My Profile
                  </Button>
                </Link>
                <Link href="/">
                  <Button variant="outline" className="w-full gap-2">
                    <Home className="w-4 h-4" />
                    Back to Home
                  </Button>
                </Link>
              </div>
            </div>
          )}

          {status === "error" && (
            <div className="space-y-6">
              <div className="w-20 h-20 bg-red-100 rounded-full flex items-center justify-center mx-auto">
                <span className="text-3xl text-red-600">!</span>
              </div>
              <h2 className="text-2xl font-bold text-foreground">Something went wrong</h2>
              <p className="text-muted-foreground">
                We couldn't activate your subscription. Please contact support if the issue persists.
              </p>
              <div className="flex flex-col gap-3 pt-4">
                <Link href="/premium">
                  <Button className="w-full">Try Again</Button>
                </Link>
                <Link href="/">
                  <Button variant="outline" className="w-full">Back to Home</Button>
                </Link>
              </div>
            </div>
          )}
        </Card>
      </main>
    </div>
  );
}
