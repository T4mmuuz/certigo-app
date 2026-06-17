const fs=require('fs');
let c=fs.readFileSync('server/routes.ts','utf8');
const idx=c.indexOf('patch("/api/users/profile"');
if(idx!==-1){console.log(JSON.stringify(c.substring(idx,idx+400)));}
