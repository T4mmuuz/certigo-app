const fs = require('fs');
let lines = fs.readFileSync('server/storage.ts', 'utf8').split('\n');
let result = [];
for (let i = 0; i < lines.length; i++) {
  result.push(lines[i]);
  if (lines[i].includes('async updateBookingStatus(id: number, status: string)') && lines[i+1] && lines[i+1].includes('db.update(bookings).set({ status')) {
    result.push(lines[i+1]);
    result.push(lines[i+2]);
    result.push('  async updateBookingPausedReason(id: number, reason: string): Promise<void> {');
    result.push('    await db.update(bookings).set({ pausedReason: reason }).where(eq(bookings.id, id));');
    result.push('  }');
    i += 2;
  }
}
fs.writeFileSync('server/storage.ts', result.join('\n'));
console.log('Listo');
