const fs = require('fs');
let s = fs.readFileSync('server/storage.ts', 'utf8');

s = s.replace(
  /async cancelBooking\(id: number, cancelledBy: string\): Promise<Booking> \{\s+const \[updated\] = await db\.update\(bookings\)\.set\(\{\s+status: 'cancelled',\s+cancelledBy: cancelledBy as any,\s+cancelledAt: new Date\(\),\s+\}\)/,
  "async cancelBooking(id: number, cancelledBy: string, cancelReason?: string): Promise<Booking> {\n    const [updated] = await db.update(bookings).set({\n      status: 'cancelled',\n      cancelledBy: cancelledBy as any,\n      cancelledAt: new Date(),\n      cancelReason: cancelReason || null,\n    })"
);

fs.writeFileSync('server/storage.ts', s);
console.log('Listo');
