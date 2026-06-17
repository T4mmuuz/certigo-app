const fs = require('fs');
let a = fs.readFileSync('client/src/pages/Auth.tsx', 'utf8');

const cityField = [
  '                  <div className="space-y-2">',
  '                    <Label htmlFor="reg-city">City</Label>',
  '                    <Input',
  '                      id="reg-city"',
  '                      placeholder="e.g. Houston, TX"',
  '                      value={regCity}',
  '                      onChange={(e) => setRegCity(e.target.value)}',
  '                      data-testid="input-reg-city"',
  '                    />',
  '                  </div>',
].join('\n');

a = a.replace(
  /(<Button\s+type="submit"\s+className="w-full h-12 text-base font-semibold"\s+disabled=\{isRegistering\})/,
  cityField + '\n                  '
);

fs.writeFileSync('client/src/pages/Auth.tsx', a);
console.log('Listo');
