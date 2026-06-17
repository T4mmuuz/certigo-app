const fs = require('fs');
let lines = fs.readFileSync('server/storage.ts', 'utf8').split('\n');
let result = [];
for (let i = 0; i < lines.length; i++) {
  result.push(lines[i]);
  if (lines[i].includes('updateBookingStatus(id: number, status: string): Promise<Booking>;')) {
    result.push('  updateBookingPausedReason(id: number, reason: string): Promise<void>;');
  }
}
fs.writeFileSync('server/storage.ts', result.join('\n'));
console.log('Listo');
