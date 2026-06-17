const fs = require('fs');
let c = fs.readFileSync('client/src/pages/Settings.tsx', 'utf8');
c = c.replace(
  'onClick={() => window.open("/terms", "_blank")}',
  'onClick={() => window.open("https://t4mmuuz.github.io/certigo-app/terms.html", "_blank")}'
);
c = c.replace(
  'onClick={() => window.open("/privacy", "_blank")}',
  'onClick={() => window.open("https://t4mmuuz.github.io/certigo-app/privacy.html", "_blank")}'
);
fs.writeFileSync('client/src/pages/Settings.tsx', c, 'utf8');
console.log('done');
