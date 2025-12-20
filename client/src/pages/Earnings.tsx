import { useQuery } from "@tanstack/react-query";
import { Navbar } from "@/components/Navbar";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { DollarSign, TrendingUp, CreditCard, Loader2, ArrowUpRight, Calendar, Wallet } from "lucide-react";
import { useAuth } from "@/hooks/use-auth";
import { Link, Redirect } from "wouter";

interface Transaction {
  id: number;
  bookingId: number;
  customerId: number;
  providerId: number;
  serviceId: number;
  amount: number;
  platformFee: number;
  providerPayout: number;
  status: string;
  createdAt: string;
}

interface ProviderEarnings {
  totalEarnings: number;
  totalJobs: number;
  pendingPayouts: number;
  recentTransactions: Transaction[];
}

export default function Earnings() {
  const { user } = useAuth();

  const { data: earnings, isLoading } = useQuery<ProviderEarnings>({
    queryKey: ["/api/provider/earnings"],
    enabled: !!user,
  });

  if (!user) {
    return <Redirect to="/login" />;
  }

  return (
    <div className="min-h-screen bg-background">
      <Navbar />

      <main className="container mx-auto px-4 py-8 max-w-6xl">
        <div className="mb-8">
          <h1 className="text-3xl font-display font-bold text-foreground">My Earnings</h1>
          <p className="text-muted-foreground mt-1">Track your service income and payouts</p>
        </div>

        {isLoading ? (
          <div className="flex items-center justify-center py-16">
            <Loader2 className="w-8 h-8 animate-spin text-primary" />
          </div>
        ) : (
          <div className="space-y-8">
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              <Card className="bg-gradient-to-br from-green-500 to-emerald-600 text-white border-none shadow-lg">
                <CardHeader className="pb-2">
                  <CardTitle className="text-lg font-medium text-green-100 flex items-center gap-2">
                    <DollarSign className="w-5 h-5" />
                    Total Earned
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <p className="text-4xl font-bold">${earnings?.totalEarnings.toFixed(2) || "0.00"}</p>
                  <p className="text-green-200 text-sm mt-1">Your net earnings after fees</p>
                </CardContent>
              </Card>

              <Card className="bg-gradient-to-br from-blue-500 to-indigo-600 text-white border-none shadow-lg">
                <CardHeader className="pb-2">
                  <CardTitle className="text-lg font-medium text-blue-100 flex items-center gap-2">
                    <CreditCard className="w-5 h-5" />
                    Completed Jobs
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <p className="text-4xl font-bold">{earnings?.totalJobs || 0}</p>
                  <p className="text-blue-200 text-sm mt-1">Services delivered</p>
                </CardContent>
              </Card>

              <Card className="bg-gradient-to-br from-purple-500 to-pink-600 text-white border-none shadow-lg">
                <CardHeader className="pb-2">
                  <CardTitle className="text-lg font-medium text-purple-100 flex items-center gap-2">
                    <Wallet className="w-5 h-5" />
                    Pending Payouts
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <p className="text-4xl font-bold">${earnings?.pendingPayouts.toFixed(2) || "0.00"}</p>
                  <p className="text-purple-200 text-sm mt-1">Awaiting transfer</p>
                </CardContent>
              </Card>
            </div>

            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Calendar className="w-5 h-5" />
                  Recent Earnings
                </CardTitle>
                <CardDescription>Your latest completed service payments</CardDescription>
              </CardHeader>
              <CardContent>
                {earnings?.recentTransactions && earnings.recentTransactions.length > 0 ? (
                  <div className="space-y-4">
                    {earnings.recentTransactions.map((transaction) => (
                      <div
                        key={transaction.id}
                        className="flex items-center justify-between p-4 bg-secondary/30 rounded-lg"
                        data-testid={`transaction-row-${transaction.id}`}
                      >
                        <div className="flex items-center gap-4">
                          <div className="w-10 h-10 bg-green-100 dark:bg-green-900/30 rounded-full flex items-center justify-center">
                            <ArrowUpRight className="w-5 h-5 text-green-600 dark:text-green-400" />
                          </div>
                          <div>
                            <p className="font-medium text-foreground">Job #{transaction.bookingId}</p>
                            <p className="text-sm text-muted-foreground">
                              {new Date(transaction.createdAt).toLocaleDateString()}
                            </p>
                          </div>
                        </div>
                        <div className="text-right">
                          <div className="flex items-center gap-2">
                            <span className="text-sm text-muted-foreground">Service: ${transaction.amount.toFixed(2)}</span>
                            <Badge variant="secondary" className="capitalize">
                              {transaction.status}
                            </Badge>
                          </div>
                          <p className="text-lg font-bold text-green-600 dark:text-green-400">+${transaction.providerPayout.toFixed(2)}</p>
                        </div>
                      </div>
                    ))}
                  </div>
                ) : (
                  <div className="text-center py-12 bg-muted/20 rounded-xl border border-dashed">
                    <DollarSign className="w-12 h-12 mx-auto text-muted-foreground/50 mb-4" />
                    <h3 className="font-semibold text-foreground">No earnings yet</h3>
                    <p className="text-sm text-muted-foreground mt-1">
                      {user.role === 'provider' 
                        ? "Complete service jobs to start earning"
                        : "Switch to a provider account to offer services and earn money"
                      }
                    </p>
                    <Link href="/">
                      <Button variant="outline" className="mt-4">
                        {user.role === 'provider' ? "View My Services" : "Browse Services"}
                      </Button>
                    </Link>
                  </div>
                )}
              </CardContent>
            </Card>
          </div>
        )}
      </main>
    </div>
  );
}
