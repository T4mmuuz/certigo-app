const fs = require('fs');
let a = fs.readFileSync('client/src/pages/Auth.tsx', 'utf8');

// 1. Agregar estado regCity
a = a.replace(
  '  const [regBio, setRegBio] = useState("");',
  '  const [regBio, setRegBio] = useState("");\n  const [regCity, setRegCity] = useState("");'
);

// 2. Agregar city al register call
a = a.replace(
  '        bio: regBio,',
  '        bio: regBio,\n        city: regCity,'
);

// 3. Agregar campo city en JSX antes del boton submit
a = a.replace(
  '                  <Button\n                    type="submit"\n                    className="w-full h-12 text-base font-semibold"\n                    disabled={isRegistering}',
  '                  <div className="space-y-2">\n                    <Label htmlFor="reg-city">City</Label>\n                    <Input\n                      id="reg-city"\n                      placeholder="e.g. Houston, TX"\n                      value={regCity}\n                      onChange={(e) => setRegCity(e.target.value)}\n                      data-testid="input-reg-city"\n                    />\n                  </div>\n                  <Button\n                    type="submit"\n                    className="w-full h-12 text-base font-semibold"\n                    disabled={isRegistering}'
);

fs.writeFileSync('client/src/pages/Auth.tsx', a);
console.log('Listo');
