const fs = require('fs');
let lines = fs.readFileSync('shared/schema.ts', 'utf8').split('\n');
let result = [];
for (let i = 0; i < lines.length; i++) {
  result.push(lines[i]);
  if (lines[i].includes('lng: real("lng"),') && !lines[i].includes('notNull')) {
    result.push('  city: text("city"),');
  }
  if (lines[i].includes('lng: real("lng").notNull()')) {
    result.push('  city: text("city"),');
  }
  if (lines[i].includes('jobDescription: text("job_description")')) {
    result.push('  pausedReason: text("paused_reason"),');
    result.push('  cancelReason: text("cancel_reason"),');
  }
}
fs.writeFileSync('shared/schema.ts', result.join('\n'));
console.log('Listo');
