const fs=require('fs');
const p=fs.readFileSync('client/src/pages/Profile.tsx','utf8');
console.log('Dialog edit service:', p.includes('Edit Service') ? 'OK' : 'FALTA');
console.log('fragment abierto:', p.includes('<>') ? 'OK' : 'FALTA');
