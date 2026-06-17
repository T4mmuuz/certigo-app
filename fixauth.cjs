const fs = require('fs');
let c = fs.readFileSync('client/src/pages/Auth.tsx', 'utf8');

c = c.replace(
  /onClick=\{[^}]*google[^}]*\}/i,
  'onClick={() => { window.location.href = "/auth/google"; }}'
);

fs.writeFileSync('client/src/pages/Auth.tsx', c, 'utf8');
console.log('done auth google');
