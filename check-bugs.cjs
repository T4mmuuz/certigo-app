const fs = require('fs');
const b = fs.readFileSync('client/src/pages/Bookings.tsx', 'utf8');
const h = fs.readFileSync('client/src/pages/Home.tsx', 'utf8');

// Reviews given
const lines_b = b.split('\n');
lines_b.forEach((l, i) => {
  if (l.includes('reviews') && l.includes('given') || l.includes('reviewsGiven') || l.includes('Reviews Given')) console.log('BOOKINGS', i + ':', l);
});

// Ciudad en servicio
const lines_h = h.split('\n');
lines_h.forEach((l, i) => {
  if (l.includes('city') || l.includes('location') || l.includes('provider')) console.log('HOME', i + ':', l);
});
