const fs = require('fs');
let b = fs.readFileSync('client/src/pages/Bookings.tsx', 'utf8');

// 1. Agregar estado cancelReason
b = b.replace(
  '  const [cancellingBookingId, setCancellingBookingId] = useState<number | null>(null);',
  '  const [cancellingBookingId, setCancellingBookingId] = useState<number | null>(null);\n  const [cancelReason, setCancelReason] = useState("");'
);

// 2. Pasar cancelReason al mutation
b = b.replace(
  '      const response = await apiRequest("POST", /api/bookings//cancel, {\n        cancelledBy: user?.role === "provider" ? "provider" : "customer"\n      });',
  '      const response = await apiRequest("POST", /api/bookings//cancel, {\n        cancelledBy: user?.role === "provider" ? "provider" : "customer",\n        cancelReason\n      });'
);

// 3. Agregar Textarea para razon en el dialog (solo para proveedores)
b = b.replace(
  '                                </AlertDialogDescription>\n                              </AlertDialogHeader>\n                              <AlertDialogFooter>',
  '                                  {isProvider && (\n                                    <Textarea\n                                      className="mt-2"\n                                      placeholder="Reason for cancelling..."\n                                      value={cancelReason}\n                                      onChange={(e) => setCancelReason(e.target.value)}\n                                    />\n                                  )}\n                                </AlertDialogDescription>\n                              </AlertDialogHeader>\n                              <AlertDialogFooter>'
);

fs.writeFileSync('client/src/pages/Bookings.tsx', b);
console.log('Listo');
