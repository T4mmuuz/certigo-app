import { Switch, Route } from "wouter";
import { queryClient } from "./lib/queryClient";
import { QueryClientProvider } from "@tanstack/react-query";
import { Toaster } from "@/components/ui/toaster";
import { TooltipProvider } from "@/components/ui/tooltip";
import NotFound from "@/pages/not-found";
import Home from "@/pages/Home";
import AuthPage from "@/pages/Auth";
import ServiceDetails from "@/pages/ServiceDetails";
import Bookings from "@/pages/Bookings";
import Profile from "@/pages/Profile";
import PaymentSuccess from "@/pages/PaymentSuccess";
import PaymentCancel from "@/pages/PaymentCancel";
import Earnings from "@/pages/Earnings";
import Premium from "@/pages/Premium";
import PremiumSuccess from "@/pages/PremiumSuccess";

function Router() {
  return (
    <Switch>
      <Route path="/" component={Home} />
      <Route path="/login" component={AuthPage} />
      <Route path="/register" component={AuthPage} />
      <Route path="/services/:id" component={ServiceDetails} />
      <Route path="/bookings" component={Bookings} />
      <Route path="/profile" component={Profile} />
      <Route path="/payment/success" component={PaymentSuccess} />
      <Route path="/payment/cancel" component={PaymentCancel} />
      <Route path="/earnings" component={Earnings} />
      <Route path="/premium" component={Premium} />
      <Route path="/premium/success" component={PremiumSuccess} />
      <Route path="/premium/cancel" component={Premium} />
      <Route component={NotFound} />
    </Switch>
  );
}

function App() {
  return (
    <QueryClientProvider client={queryClient}>
      <TooltipProvider>
        <Router />
        <Toaster />
      </TooltipProvider>
    </QueryClientProvider>
  );
}

export default App;
