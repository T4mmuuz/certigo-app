const fs = require('fs');
let content = fs.readFileSync('client/src/pages/ServiceDetails.tsx', 'utf8');

// Agregar estado paymentMethod despues de isProcessing
content = content.replace(
  '  const [isProcessing, setIsProcessing] = useState(false);',
  '  const [isProcessing, setIsProcessing] = useState(false);\n  const [paymentMethod, setPaymentMethod] = useState("cash");\n  const [showPaymentDialog, setShowPaymentDialog] = useState(false);'
);

// Agregar paymentMethod al resetWizard
content = content.replace(
  '    setEstimatedDuration("");\n  };',
  '    setEstimatedDuration("");\n    setPaymentMethod("cash");\n  };'
);

// Cambiar el boton de enviar para mostrar primero el dialog de pago
content = content.replace(
  '            <Button\n                              onClick={handleSubmitRequest}\n                              className="flex-1 gap-1"\n                              disabled={isProcessing}\n                              data-testid="button-send-request"',
  '            <Button\n                              onClick={() => setShowPaymentDialog(true)}\n                              className="flex-1 gap-1"\n                              disabled={isProcessing}\n                              data-testid="button-send-request"'
);

// Agregar PaymentOptionsDialog antes del cierre del Dialog principal
content = content.replace(
  '                </Dialog>',
  '                </Dialog>\n\n      <PaymentOptionsDialog\n        open={showPaymentDialog}\n        onOpenChange={setShowPaymentDialog}\n        serviceName={service.title}\n        totalAmount={service.price}\n        onSelectPayment={(method) => {\n          setPaymentMethod(method);\n          setShowPaymentDialog(false);\n          handleSubmitRequest();\n        }}\n      />'
);

// Usar el paymentMethod seleccionado al crear booking
content = content.replace(
  '        paymentMethod: "cash",',
  '        paymentMethod: paymentMethod as any,'
);

fs.writeFileSync('client/src/pages/ServiceDetails.tsx', content);
console.log('Listo');
