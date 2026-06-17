const fs=require('fs');
const r=fs.readFileSync('server/routes.ts','utf8');
console.log('PATCH services:', r.includes('updateService') ? 'OK' : 'FALTA');
