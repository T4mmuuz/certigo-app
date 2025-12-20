import { useEffect, useState } from "react";
import { useLocation, Link } from "wouter";
import { Navbar } from "@/components/Navbar";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { CheckCircle2, Loader2, Home, Calendar } from "lucide-react";
import { apiRequest } from "@/lib/queryClient";

export default function PaymentSuccess() {
  const [, setLocation] = useLocation();
  const [status, setStatus] = useState<"loading" | "success" | "error">("loading");

  useEffect(() => {
    const confirmPayment = async () => {
      const params = new URLSearchParams(window.location.search);
      const sessionId = params.get("session_id");

      if (!sessionId) {
        setStatus("error");
        return;
      }

      try {
        const response = await apiRequest("POST", "/api/payment/confirm", { sessionId });
        const data = await response.json();

        if (data.success) {
          setStatus("success");
        } else {
          setStatus("error");
        }
      } catch (error) {
        console.error("Payment confirmation error:", error);
        setStatus("error");
      }
    };

    confirmPayment();
  }, []);

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-green-50 to-emerald-50 dark:from-black dark:via-black dark:to-gray-950">
      <Navbar />

      <main className="container mx-auto px-4 py-16 flex items-center justify-center">
        <Card className="max-w-md w-full p-8 text-center shadow-xl">
          {status === "loading" && (
            <div className="space-y-4">
              <Loader2 className="w-16 h-16 mx-auto animate-spin text-primary" />
              <h2 className="text-xl font-bold">Confirming your payment...</h2>
              <p className="text-muted-foreground">Please wait while we verify your transaction.</p>
            </div>
          )}

          {status === "success" && (
            <div className="space-y-6">
              <div className="w-20 h-20 bg-green-100 rounded-full flex items-center justify-center mx-auto">
                <CheckCircle2 className="w-10 h-10 text-green-600" />
              </div>
              <h2 className="text-2xl font-bold text-foreground">Payment Successful!</h2>
              <p className="text-muted-foreground">
                Thank you for your booking. The service provider has been notified and will contact you shortly to confirm the appointment details.
              </p>
              <div className="bg-green-50 border border-green-200 rounded-lg p-4 text-sm text-green-800">
                A confirmation email has been sent to your registered email address.
              </div>
              <div className="flex flex-col gap-3 pt-4">
                <Link href="/bookings">
                  <Button className="w-full gap-2">
                    <Calendar className="w-4 h-4" />
                    View My Bookings
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
                We couldn't confirm your payment. Please check your bookings or contact support if the issue persists.
              </p>
              <div className="flex flex-col gap-3 pt-4">
                <Link href="/bookings">
                  <Button className="w-full">View My Bookings</Button>
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
