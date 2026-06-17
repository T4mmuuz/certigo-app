const fs=require('fs');
const p=fs.readFileSync('client/src/pages/Profile.tsx','utf8');
console.log('Edit Service dialog:', p.includes('Edit Service') ? 'OK' : 'FALTA');
