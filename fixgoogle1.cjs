const fs = require('fs');
let c = fs.readFileSync('server/routes.ts', 'utf8');
c = c.replace(
  'import { Strategy as LocalStrategy } from "passport-local";',
  'import { Strategy as LocalStrategy } from "passport-local";\nimport { Strategy as GoogleStrategy } from "passport-google-oauth20";'
);
fs.writeFileSync('server/routes.ts', c, 'utf8');
console.log('done');
