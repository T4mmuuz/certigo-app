const fs = require('fs');
let lines = fs.readFileSync('server/storage.ts', 'utf8').split('\n');
let result = [];
let fixed = false;
for (let i = 0; i < lines.length; i++) {
  if (!fixed && lines[i].trim() === '}' && lines[i-1] && lines[i-1].trim() === '}' && lines[i-2] && lines[i-2].includes('where(eq(bookings.id, id))')) {
    fixed = true;
  } else {
    result.push(lines[i]);
  }
}
fs.writeFileSync('server/storage.ts', result.join('\n'));
console.log('Listo - lineas: ' + result.length);
