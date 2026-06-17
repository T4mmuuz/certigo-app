const fs = require('fs');
let lines = fs.readFileSync('server/storage.ts', 'utf8').split('\n');
let result = [];
for (let i = 0; i < lines.length; i++) {
  if (lines[i].includes('return updated;') && lines[i+1] && lines[i+1].includes('async updateBookingPausedReason')) {
    result.push(lines[i]);
    result.push('  }');
    i++;
    result.push(lines[i]);
  } else if (lines[i].trim() === '}' && lines[i+1] && lines[i+1].trim() === '}' && lines[i+2] && lines[i+2].includes('async updateUserPremium')) {
    result.push(lines[i]);
    i++;
  } else {
    result.push(lines[i]);
  }
}
fs.writeFileSync('server/storage.ts', result.join('\n'));
console.log('Listo');
