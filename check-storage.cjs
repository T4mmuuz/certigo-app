const fs=require('fs');
const s=fs.readFileSync('server/storage.ts','utf8');
console.log('updateService en storage:', s.includes('updateService') ? 'OK' : 'FALTA');
