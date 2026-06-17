const fs = require('fs');
let b = fs.readFileSync('client/src/pages/Bookings.tsx', 'utf8');

const jobDetails = [
  '                      {isProvider && (booking.jobDescription || booking.urgencyLevel || booking.estimatedBudget) && (',
  '                        <div className="bg-muted/40 rounded-lg p-3 mb-4 space-y-1 text-sm">',
  '                          <p className="font-semibold text-xs text-muted-foreground uppercase tracking-wide mb-2">Job Details</p>',
  '                          {booking.jobDescription && <p><span className="font-medium">Description:</span> {booking.jobDescription}</p>}',
  '                          {booking.urgencyLevel && <p><span className="font-medium">Urgency:</span> <span className="capitalize">{booking.urgencyLevel}</span></p>}',
  '                          {booking.estimatedBudget && <p><span className="font-medium">Budget:</span> </p>}',
  '                          {booking.jobSize && <p><span className="font-medium">Job Size:</span> <span className="capitalize">{booking.jobSize}</span></p>}',
  '                        </div>',
  '                      )}',
].join('\n');

b = b.replace(
  '                      <div className="flex items-center gap-2 flex-wrap">',
  jobDetails + '\n                      <div className="flex items-center gap-2 flex-wrap">'
);

fs.writeFileSync('client/src/pages/Bookings.tsx', b);
console.log('Listo');
