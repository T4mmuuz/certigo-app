import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { CreditCard, Banknote, Info } from "lucide-react";
import { Badge } from "@/components/ui/badge";

interface PaymentOptionsDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onSelectPayment: (method: "app" | "cash") => void;
  serviceName: string;
  totalAmount: number;
}

export function PaymentOptionsDialog({
  open,
  onOpenChange,
  onSelectPayment,
  serviceName,
  totalAmount,
}: PaymentOptionsDialogProps) {
  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-md">
        <DialogHeader>
          <DialogTitle className="text-xl">Choose Payment Method</DialogTitle>
          <DialogDescription>
            How would you like to pay for {serviceName}?
          </DialogDescription>
        </DialogHeader>

        <div className="bg-blue-50 dark:bg-blue-950 border border-blue-200 dark:border-blue-800 rounded-lg p-4 mb-4">
          <div className="flex items-start gap-3">
            <Info className="w-5 h-5 text-blue-600 mt-0.5 flex-shrink-0" />
            <div className="text-sm text-blue-800 dark:text-blue-200">
              <p className="font-medium mb-1">You can pay in the app or with cash</p>
              <p className="text-blue-600 dark:text-blue-300">
                Just like food delivery apps, you have the flexibility to pay securely through the app or pay the provider directly in cash when they arrive.
              </p>
            </div>
          </div>
        </div>

        <div className="space-y-3">
          <Button
            variant="outline"
            className="w-full h-auto py-4 flex items-center justify-between gap-4 border-2 hover:border-primary"
            onClick={() => onSelectPayment("app")}
            data-testid="button-pay-app"
          >
            <div className="flex items-center gap-3">
              <div className="w-12 h-12 bg-primary/10 rounded-full flex items-center justify-center">
                <CreditCard className="w-6 h-6 text-primary" />
              </div>
              <div className="text-left">
                <p className="font-semibold text-foreground">Pay in App</p>
                <p className="text-sm text-muted-foreground">Secure payment via Stripe</p>
              </div>
            </div>
            <Badge variant="secondary" className="text-green-700 bg-green-100">
              Protected
            </Badge>
          </Button>

          <Button
            variant="outline"
            className="w-full h-auto py-4 flex items-center justify-between gap-4 border-2 hover:border-primary"
            onClick={() => onSelectPayment("cash")}
            data-testid="button-pay-cash"
          >
            <div className="flex items-center gap-3">
              <div className="w-12 h-12 bg-green-100 dark:bg-green-900 rounded-full flex items-center justify-center">
                <Banknote className="w-6 h-6 text-green-600" />
              </div>
              <div className="text-left">
                <p className="font-semibold text-foreground">Pay with Cash</p>
                <p className="text-sm text-muted-foreground">Pay provider when they arrive</p>
              </div>
            </div>
          </Button>
        </div>

        <div className="text-center pt-4 border-t mt-4">
          <p className="text-lg font-bold text-foreground">Total: ${totalAmount}</p>
          <p className="text-xs text-muted-foreground mt-1">
            Full refund if provider cancels or doesn't show up
          </p>
        </div>
      </DialogContent>
    </Dialog>
  );
}
