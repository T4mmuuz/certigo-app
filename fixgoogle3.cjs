const fs = require('fs');
let c = fs.readFileSync('client/src/pages/Auth.tsx', 'utf8');
c = c.replace(
  /window\.location\.href\s*=\s*['"]\/auth\/google['"]/,
  'window.location.href = "/auth/google"'
);
if (c.includes('window.location.href = "/auth/google"')) {
  console.log('ya estaba correcto');
} else {
  c = c.replace(
    /onClick=\{[^}]*google[^}]*\}/i,
    'onClick={() => { window.location.href = "/auth/google"; }}'
  );
}
fs.writeFileSync('client/src/pages/Auth.tsx', c, 'utf8');
console.log('done');
