const fs = require('fs');
let a = fs.readFileSync('client/src/pages/Auth.tsx', 'utf8');

a = a.replace(
  /(<\/div>\s+)data-testid="button-create-account"\s+>/,
  [
    '</div>',
    '                  <Button',
    '                    type="submit"',
    '                    className="w-full h-12 text-base font-semibold"',
    '                    disabled={isRegistering}',
    '                    data-testid="button-create-account"',
    '                  >',
  ].join('\n')
);

fs.writeFileSync('client/src/pages/Auth.tsx', a);
console.log('Listo');
