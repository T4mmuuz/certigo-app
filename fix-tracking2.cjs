const fs=require('fs');
let b=fs.readFileSync('client/src/pages/Bookings.tsx','utf8');
const idx=b.indexOf('<span>Service Location</span>');
const insertAfter=idx+('<span>Service Location</span>').length;
const snippet=`
                        {!isProvider && booking.status === 'accepted' && providerLocations[booking.id] && (
                          <div className="flex items-center gap-2 text-green-600 dark:text-green-400 text-xs font-medium mt-1">
                            <div className="w-2 h-2 bg-green-500 rounded-full animate-pulse" />
                            <a href={'https://www.google.com/maps?q='+providerLocations[booking.id].lat+','+providerLocations[booking.id].lng} target="_blank" rel="noopener noreferrer" className="underline">
                              Provider is on the way — View on Maps
                            </a>
                          </div>
                        )}`;
b=b.slice(0,insertAfter)+snippet+b.slice(insertAfter);
fs.writeFileSync('client/src/pages/Bookings.tsx',b);
console.log(b.includes('Provider is on the way')?'OK':'FALTA');
