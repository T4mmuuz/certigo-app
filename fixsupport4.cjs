const fs = require('fs');
let c = fs.readFileSync('client/src/pages/Settings.tsx', 'utf8');
c = c.replace(
  'onClick={() => window.open("mailto:bash.tammuz@gmail.com?subject=Report a Problem - CertiGo&body=Describe the problem you encountered:", "_blank")})}',
  'onClick={() => window.open("mailto:bash.tammuz@gmail.com?subject=Report a Problem - CertiGo&body=Describe the problem you encountered:", "_blank")}'
);
fs.writeFileSync('client/src/pages/Settings.tsx', c, 'utf8');
console.log('done');
