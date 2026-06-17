const fs = require('fs');
let c = fs.readFileSync('client/src/pages/Profile.tsx', 'utf8');
c = c.replace(
  '              <p className="text-sm text-muted-foreground mt-1">@{user.username}</p>\n',
  ''
);
fs.writeFileSync('client/src/pages/Profile.tsx', c, 'utf8');
console.log('done');
