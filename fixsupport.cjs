const fs = require('fs');
let c = fs.readFileSync('client/src/pages/Settings.tsx', 'utf8');

c = c.replace(
  'onClick={() => toast({ title: "Help Center", description: "Coming soon \u2014 we\'re building the FAQ!" })}',
  'onClick={() => window.open("mailto:bash.tammuz@gmail.com?subject=Help Center / FAQ - CertiGo&body=Hi, I need help with...", "_blank")}'
);

c = c.replace(
  'onClick={() => toast({ title: "Thanks for reporting", description: "Our team has been notified." })}',
  'onClick={() => window.open("mailto:bash.tammuz@gmail.com?subject=Report a Problem - CertiGo&body=Describe the problem you encountered:", "_blank")}'
);

fs.writeFileSync('client/src/pages/Settings.tsx', c, 'utf8');
console.log('done');
