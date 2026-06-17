const fs = require('fs');
let lines = fs.readFileSync('client/src/pages/ServiceDetails.tsx', 'utf8').split('\n');
let result = [];
for (let i = 0; i < lines.length; i++) {
  result.push(lines[i]);
  if (lines[i].includes('import { PaymentOptionsDialog }')) {
    // ya existe, no agregar
  }
  if (lines[i].includes("import { useState } from") && !lines.join('\n').includes('PaymentOptionsDialog')) {
    result.push('import { PaymentOptionsDialog } from "@/components/PaymentOptionsDialog";');
  }
}
fs.writeFileSync('client/src/pages/ServiceDetails.tsx', result.join('\n'));
console.log('Listo');
