const fs = require('fs');
let r = fs.readFileSync('server/routes.ts', 'utf8');

r = r.replace(
  'const { name, username } = req.body;',
  'const { name, username, city } = req.body;'
);

r = r.replace(
  'const updated = await storage.updateUser((req.user as any).id, { name, username });',
  'const updated = await storage.updateUser((req.user as any).id, { name, username, city });'
);

fs.writeFileSync('server/routes.ts', r);
console.log('Listo');
