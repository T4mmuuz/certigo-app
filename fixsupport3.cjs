const fs = require('fs');
let c = fs.readFileSync('client/src/pages/Settings.tsx', 'utf8');
c = c.replace(
  'onClick={() => window.open("mailto:bash.tammuz@gmail.com?subject=Help Center / FAQ - CertiGo&body=Hi, I need help with...", "_blank")})}',
  'onClick={() => window.open("mailto:bash.tammuz@gmail.com?subject=Help Center / FAQ - CertiGo&body=Hi, I need help with...", "_blank")}'
);
fs.writeFileSync('client/src/pages/Settings.tsx', c, 'utf8');
console.log('done');
