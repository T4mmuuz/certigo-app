const fs=require('fs');
const p=fs.readFileSync('client/src/pages/Profile.tsx','utf8');
console.log('editingService estado:', p.includes('editingService') ? 'OK' : 'FALTA');
console.log('handleEditService:', p.includes('handleEditService') ? 'OK' : 'FALTA');
console.log('Dialog edit service:', p.includes('Edit Service') ? 'OK' : 'FALTA');
