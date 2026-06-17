const fs = require('fs');
let content = fs.readFileSync('client/src/pages/ServiceDetails.tsx', 'utf8');

// Buscar el boton que llama handleSubmitRequest y cambiarlo
content = content.replace(
  /onClick=\{handleSubmitRequest\}(\s+className="flex-1 gap-1"\s+disabled=\{isProcessing\}\s+data-testid="button-send-request")/,
  'onClick={() => setShowPaymentDialog(true)}'
);

fs.writeFileSync('client/src/pages/ServiceDetails.tsx', content);
console.log('Listo');
