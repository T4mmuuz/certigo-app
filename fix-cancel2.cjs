const fs = require('fs');
let b = fs.readFileSync('client/src/pages/Bookings.tsx', 'utf8');

// 1. Pasar cancelReason al mutation
b = b.replace(
  /cancelledBy: user\?\.role === "provider" \? "provider" : "customer"\s+\}\);/,
  'cancelledBy: user?.role === "provider" ? "provider" : "customer",\n        cancelReason\n      });'
);

// 2. Agregar Textarea antes del AlertDialogFooter
b = b.replace(
  /(<\/AlertDialogDescription>\s+<\/AlertDialogHeader>\s+<AlertDialogFooter>)/,
  [
    '                                  {isProvider && (',
    '                                    <Textarea',
    '                                      className="mt-2"',
    '                                      placeholder="Reason for cancelling..."',
    '                                      value={cancelReason}',
    '                                      onChange={(e) => setCancelReason(e.target.value)}',
    '                                    />',
    '                                  )}',
    '                                </AlertDialogDescription>',
    '                              </AlertDialogHeader>',
    '                              <AlertDialogFooter>',
  ].join('\n')
);

fs.writeFileSync('client/src/pages/Bookings.tsx', b);
console.log('Listo');
