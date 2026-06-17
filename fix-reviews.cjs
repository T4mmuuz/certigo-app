const fs=require('fs');
let r=fs.readFileSync('server/routes.ts','utf8');
const bad=`"SELECT * FROM reviews WHERE customer_id =   app.post(api.reviews.create.path ORDER BY created_at DESC"`;
const good=`"SELECT * FROM reviews WHERE customer_id = $1 ORDER BY created_at DESC"`;
r=r.replace(bad,good);
fs.writeFileSync('server/routes.ts',r);
console.log(r.includes(good)?'OK':'FALTA');
