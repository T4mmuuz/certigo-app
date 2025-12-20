import { Link } from "wouter";
import { Navbar } from "@/components/Navbar";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { XCircle, Home, ArrowLeft } from "lucide-react";

export default function PaymentCancel() {
  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-orange-50 to-red-50">
      <Navbar />

      <main className="container mx-auto px-4 py-16 flex items-center justify-center">
        <Card className="max-w-md w-full p-8 text-center shadow-xl">
          <div className="space-y-6">
            <div className="w-20 h-20 bg-orange-100 rounded-full flex items-center justify-center mx-auto">
              <XCircle className="w-10 h-10 text-orange-600" />
            </div>
            <h2 className="text-2xl font-bold text-foreground">Payment Cancelled</h2>
            <p className="text-muted-foreground">
              Your payment was cancelled. No charges were made to your account. You can try booking again whenever you're ready.
            </p>
            <div className="flex flex-col gap-3 pt-4">
              <Button onClick={() => window.history.back()} className="w-full gap-2">
                <ArrowLeft className="w-4 h-4" />
                Go Back
              </Button>
              <Link href="/">
                <Button variant="outline" className="w-full gap-2">
                  <Home className="w-4 h-4" />
                  Back to Home
                </Button>
              </Link>
            </div>
          </div>
        </Card>
      </main>
    </div>
  );
}
