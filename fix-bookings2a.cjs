const fs = require('fs');
let lines = fs.readFileSync('client/src/pages/Bookings.tsx', 'utf8').split('\n');
let result = [];
for (let i = 0; i < lines.length; i++) {
  result.push(lines[i]);
  if (lines[i].includes('const showRebookButton = booking.status ===') && lines[i].includes("'completed'")) {
    result.push('              const showAcceptButton = isProvider && booking.status === \'pending\';');
    result.push('              const showPauseButton = isProvider && booking.status === \'accepted\';');
    result.push('              const showCompleteButton = isProvider && booking.status === \'accepted\';');
    result.push('              const canReview = !isProvider && (booking.status === \'completed\' || booking.status === \'cancelled\');');
  }
}
fs.writeFileSync('client/src/pages/Bookings.tsx', result.join('\n'));
console.log('Paso 2a listo');
