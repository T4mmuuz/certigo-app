import { useQuery } from "@tanstack/react-query";
import { Navbar } from "@/components/Navbar";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { DollarSign, TrendingUp, CreditCard, Loader2, ArrowUpRight, Calendar } from "lucide-react";
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

interface PlatformEarnings {
  totalEarnings: number;
  totalTransactions: number;
  commissionRate: number;
  recentTransactions: Transaction[];
}

export default function Earnings() {
  const { user } = useAuth();

  const { data: earnings, isLoading } = useQuery<PlatformEarnings>({
    queryKey: ["/api/admin/earnings"],
  });

  if (!user) {
    return <Redirect to="/login" />;
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-emerald-50 to-green-50">
      <Navbar />

      <main className="container mx-auto px-4 py-8 max-w-6xl">
        <div className="mb-8">
          <h1 className="text-3xl font-display font-bold text-foreground">Platform Earnings</h1>
          <p className="text-muted-foreground mt-1">Track your commission and transaction history</p>
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
                    Total Earnings
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <p className="text-4xl font-bold">${earnings?.totalEarnings.toFixed(2) || "0.00"}</p>
                  <p className="text-green-200 text-sm mt-1">From {earnings?.commissionRate || 15}% commission</p>
                </CardContent>
              </Card>

              <Card className="bg-gradient-to-br from-blue-500 to-indigo-600 text-white border-none shadow-lg">
                <CardHeader className="pb-2">
                  <CardTitle className="text-lg font-medium text-blue-100 flex items-center gap-2">
                    <CreditCard className="w-5 h-5" />
                    Total Transactions
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <p className="text-4xl font-bold">{earnings?.totalTransactions || 0}</p>
                  <p className="text-blue-200 text-sm mt-1">Completed payments</p>
                </CardContent>
              </Card>

              <Card className="bg-gradient-to-br from-purple-500 to-pink-600 text-white border-none shadow-lg">
                <CardHeader className="pb-2">
                  <CardTitle className="text-lg font-medium text-purple-100 flex items-center gap-2">
                    <TrendingUp className="w-5 h-5" />
                    Commission Rate
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <p className="text-4xl font-bold">{earnings?.commissionRate || 15}%</p>
                  <p className="text-purple-200 text-sm mt-1">Per transaction</p>
                </CardContent>
              </Card>
            </div>

            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Calendar className="w-5 h-5" />
                  Recent Transactions
                </CardTitle>
                <CardDescription>Your latest commission earnings from service bookings</CardDescription>
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
                          <div className="w-10 h-10 bg-green-100 rounded-full flex items-center justify-center">
                            <ArrowUpRight className="w-5 h-5 text-green-600" />
                          </div>
                          <div>
                            <p className="font-medium">Booking #{transaction.bookingId}</p>
                            <p className="text-sm text-muted-foreground">
                              {new Date(transaction.createdAt).toLocaleDateString()}
                            </p>
                          </div>
                        </div>
                        <div className="text-right">
                          <div className="flex items-center gap-2">
                            <span className="text-sm text-muted-foreground">Total: ${transaction.amount.toFixed(2)}</span>
                            <Badge variant="secondary" className="capitalize">
                              {transaction.status}
                            </Badge>
                          </div>
                          <p className="text-lg font-bold text-green-600">+${transaction.platformFee.toFixed(2)}</p>
                        </div>
                      </div>
                    ))}
                  </div>
                ) : (
                  <div className="text-center py-12 bg-muted/20 rounded-xl border border-dashed">
                    <DollarSign className="w-12 h-12 mx-auto text-muted-foreground/50 mb-4" />
                    <h3 className="font-semibold text-foreground">No transactions yet</h3>
                    <p className="text-sm text-muted-foreground mt-1">
                      Earnings will appear here when customers book services
                    </p>
                    <Link href="/">
                      <Button variant="outline" className="mt-4">
                        Browse Services
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
