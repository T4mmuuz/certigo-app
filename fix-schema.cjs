const fs = require('fs');
const content = fs.readFileSync('shared/schema.ts.bak', 'utf8');

let s = content.replace(
  '  lng: real("lng"),\n  isPremium:',
  '  lng: real("lng"),\n  city: text("city"),\n  isPremium:'
);

s = s.replace(
  '  lng: real("lng").notNull(),\n  pricingType:',
  '  lng: real("lng").notNull(),\n  city: text("city"),\n  pricingType:'
);

s = s.replace(
  '"pending", "accepted", "completed", "cancelled", "provider_noshow", "customer_noshow"',
  '"pending", "accepted", "paused", "completed", "cancelled", "provider_noshow", "customer_noshow"'
);

s = s.replace(
  '"app", "cash"',
  '"app", "cash", "paypal"'
);

s = s.replace(
  '  jobDescription: text("job_description"),\n});',
  '  jobDescription: text("job_description"),\n  pausedReason: text("paused_reason"),\n  cancelReason: text("cancel_reason"),\n});'
);

s = s.replace(
  '"booking_completed", "provider_arriving"',
  '"booking_completed", "booking_accepted", "booking_paused", "provider_arriving"'
);

fs.writeFileSync('shared/schema.ts', s);
console.log('Schema actualizado correctamente');
