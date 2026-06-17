const fs=require('fs');
let b=fs.readFileSync('client/src/pages/Bookings.tsx','utf8');

// Extraer el bloque de tracking
const trackingStart=b.indexOf('\n  // Provider location tracking');
const trackingEnd=b.indexOf('\n  const getStatusColor');
const trackingCode=b.slice(trackingStart,trackingEnd);

// Quitarlo de donde está
b=b.slice(0,trackingStart)+b.slice(trackingEnd);

// Insertarlo DESPUÉS de const isProvider
const insertAfter=b.indexOf('const isProvider = user?.role === "provider";')+('const isProvider = user?.role === "provider";').length;
b=b.slice(0,insertAfter)+'\n'+trackingCode+b.slice(insertAfter);

fs.writeFileSync('client/src/pages/Bookings.tsx',b);
console.log(b.includes('Provider location tracking')?'OK':'FALTA');
