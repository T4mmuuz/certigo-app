const fs = require('fs');
const a = fs.readFileSync('client/src/pages/Auth.tsx', 'utf8');
const p = fs.readFileSync('client/src/pages/Profile.tsx', 'utf8');
const h = fs.readFileSync('client/src/pages/Home.tsx', 'utf8');
const b = fs.readFileSync('client/src/pages/Bookings.tsx', 'utf8');
const sd = fs.readFileSync('client/src/pages/ServiceDetails.tsx', 'utf8');
const r = fs.readFileSync('server/routes.ts', 'utf8');
const s = fs.readFileSync('server/storage.ts', 'utf8');
const schema = fs.readFileSync('shared/schema.ts', 'utf8');

console.log('=== AUTH ===');
console.log('regCity estado:', a.includes('regCity') ? 'OK' : 'FALTA');
console.log('city en register:', a.includes('city: regCity') ? 'OK' : 'FALTA');
console.log('campo city JSX:', a.includes('reg-city') ? 'OK' : 'FALTA');

console.log('=== PROFILE ===');
console.log('editCity estado:', p.includes('editCity') ? 'OK' : 'FALTA');
console.log('city en mutate:', p.includes('city: editCity') ? 'OK' : 'FALTA');
console.log('campo city JSX:', p.includes('e.g. Houston, TX') ? 'OK' : 'FALTA');

console.log('=== HOME ===');
console.log('useAuth import:', h.includes('useAuth') ? 'OK' : 'FALTA');
console.log('filtro por ciudad:', h.includes('user?.city') ? 'OK' : 'FALTA');
console.log('rawServices:', h.includes('rawServices') ? 'OK' : 'FALTA');

console.log('=== BOOKINGS ===');
console.log('job details:', b.includes('jobDescription') ? 'OK' : 'FALTA');
console.log('cancelReason estado:', b.includes('cancelReason, setCancelReason') ? 'OK' : 'FALTA');
console.log('Textarea cancel:', b.includes('Reason for cancelling') ? 'OK' : 'FALTA');
console.log('Accept Job:', b.includes('Accept Job') ? 'OK' : 'FALTA');
console.log('Pause Job:', b.includes('Pause Job') ? 'OK' : 'FALTA');
console.log('Leave Review:', b.includes('Leave Review') ? 'OK' : 'FALTA');

console.log('=== SERVICE DETAILS ===');
console.log('showPaymentDialog:', sd.includes('showPaymentDialog') ? 'OK' : 'FALTA');
console.log('PaymentOptionsDialog:', sd.includes('PaymentOptionsDialog') ? 'OK' : 'FALTA');

console.log('=== ROUTES ===');
console.log('city en PATCH profile:', r.includes('{ name, username, city }') ? 'OK' : 'FALTA');
console.log('cancelReason en cancel:', r.includes('cancelReason') ? 'OK' : 'FALTA');
console.log('reviews con bookingId:', r.includes('getBooking(Number(bookingId))') ? 'OK' : 'FALTA');
console.log('change-password:', r.includes('change-password') ? 'OK' : 'FALTA');

console.log('=== STORAGE ===');
console.log('city en updateUser:', s.includes('city?: string') ? 'OK' : 'FALTA');
console.log('cancelReason en cancelBooking:', s.includes('cancelReason?: string') ? 'OK' : 'FALTA');

console.log('=== SCHEMA ===');
console.log('bookingId en reviews:', schema.includes('booking_id') ? 'OK' : 'FALTA');
