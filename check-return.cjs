const fs=require('fs');
const p=fs.readFileSync('client/src/pages/Profile.tsx','utf8');
const lines=p.split('\n');
lines.forEach((l,i)=>{ if(l.includes('return (')) console.log(i+1+':',l); });
