const fs = require('fs');

// --- storage.ts ---
let s = fs.readFileSync('server/storage.ts', 'utf8');

s = s.replace(
  'cancelBooking(id: number, cancelledBy: string): Promise<Booking>;',
  'cancelBooking(id: number, cancelledBy: string, cancelReason?: string): Promise<Booking>;'
);

s = s.replace(
  'async cancelBooking(id: number, cancelledBy: string): Promise<Booking> {\n    const [updated] = await db.update(bookings).set({\n      status: \'cancelled\',\n      cancelledBy: cancelledBy as any,\n      cancelledAt: new Date(),\n    })',
  'async cancelBooking(id: number, cancelledBy: string, cancelReason?: string): Promise<Booking> {\n    const [updated] = await db.update(bookings).set({\n      status: \'cancelled\',\n      cancelledBy: cancelledBy as any,\n      cancelledAt: new Date(),\n      cancelReason: cancelReason || null,\n    })'
);

fs.writeFileSync('server/storage.ts', s);

// --- routes.ts ---
let r = fs.readFileSync('server/routes.ts', 'utf8');

r = r.replace(
  'const { cancelledBy } = req.body;',
  'const { cancelledBy, cancelReason } = req.body;'
);

r = r.replace(
  'await storage.cancelBooking(bookingId, cancelledBy || (isProvider ? "provider" : "customer"));',
  'await storage.cancelBooking(bookingId, cancelledBy || (isProvider ? "provider" : "customer"), cancelReason);'
);

fs.writeFileSync('server/routes.ts', r);
console.log('Listo');
