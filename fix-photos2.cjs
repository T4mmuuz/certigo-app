const fs=require('fs');
let r=fs.readFileSync('server/routes.ts','utf8');
const corruptMarker=`\n  // GET /api/reviews/my WHERE id = $2", [newPhotos, serviceId]);`;
const reviewsMyMarker=`\n  // GET /api/reviews/my\n`;
const corruptStart=r.indexOf(corruptMarker);
const goodEnd=r.indexOf(reviewsMyMarker, corruptStart);
if(corruptStart===-1){console.log('marker no encontrado');process.exit(1);}
if(goodEnd===-1){console.log('reviews/my no encontrado');process.exit(1);}
r=r.slice(0,corruptStart)+r.slice(goodEnd);
fs.writeFileSync('server/routes.ts',r);
console.log('OK corruptStart:'+corruptStart+' goodEnd:'+goodEnd);
