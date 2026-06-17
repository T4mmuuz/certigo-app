const fs = require('fs');
let lines = fs.readFileSync('client/src/pages/Profile.tsx', 'utf8').split('\n');
lines[134] = '';
fs.writeFileSync('client/src/pages/Profile.tsx', lines.join('\n'), 'utf8');
console.log('done');
