const fs = require('fs');
let c = fs.readFileSync('server/routes.ts', 'utf8');
c = c.replace(
  'import { pool } from "./db";',
  'import { pool, db } from "./db";\nimport { eq } from "drizzle-orm";'
);
fs.writeFileSync('server/routes.ts', c, 'utf8');
console.log('done');
