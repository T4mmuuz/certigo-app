const fs=require('fs');
const p=fs.readFileSync('client/src/pages/Profile.tsx','utf8');
const lines=p.split('\n');
console.log(lines.slice(221,226).join('\n'));
