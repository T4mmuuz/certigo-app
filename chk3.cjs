const fs=require('fs');
const r=fs.readFileSync('server/routes.ts','utf8');
const s=fs.readFileSync('server/storage.ts','utf8');
console.log('updateService en storage:', s.includes('updateService') ? 'OK' : 'FALTA');
console.log('reviews/my endpoint:', r.includes('reviews/my') ? 'OK' : 'FALTA');
