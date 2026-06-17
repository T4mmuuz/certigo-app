const fs = require('fs');
let r = fs.readFileSync('server/routes.ts', 'utf8');

r = r.replace(
  '      const input = api.reviews.create.input.parse(req.body);\n      const review = await storage.createReview(input);',
  '      const { bookingId, rating, comment } = req.body;\n      if (!bookingId || !rating || !comment) return res.status(400).json({ message: "bookingId, rating and comment are required" });\n      const booking = await storage.getBooking(Number(bookingId));\n      if (!booking) return res.status(404).json({ message: "Booking not found" });\n      if (booking.customerId !== (req.user as any).id) return res.status(403).json({ message: "Not authorized" });\n      if (booking.status !== "completed" && booking.status !== "cancelled") return res.status(400).json({ message: "Can only review completed or cancelled bookings" });\n      const input = { bookingId: Number(bookingId), serviceId: booking.serviceId, customerId: booking.customerId, rating: Number(rating), comment };\n      const review = await storage.createReview(input);'
);

fs.writeFileSync('server/routes.ts', r);
console.log('Listo');
