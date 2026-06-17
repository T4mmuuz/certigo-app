const fs = require('fs');
let s = fs.readFileSync('shared/schema.ts', 'utf8');

s = s.replace(
  '  lng: real("lng"),\n',
  '  lng: real("lng"),\n  city: text("city"),\n'
);

s = s.replace(
  '  lng: real("lng").notNull(),\n',
  '  lng: real("lng").notNull(),\n  city: text("city"),\n'
);

s = s.replace(
  '  jobDescription: text("job_description"), // Customer\'s description of the problem\n});',
  '  jobDescription: text("job_description"),\n  pausedReason: text("paused_reason"),\n  cancelReason: text("cancel_reason"),\n});'
);

fs.writeFileSync('shared/schema.ts', s);
console.log('Listo');
