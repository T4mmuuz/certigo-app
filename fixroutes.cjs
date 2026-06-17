const fs = require('fs');
let c = fs.readFileSync('server/routes.ts', 'utf8');
const googleStrategy = [
  '  passport.use(new GoogleStrategy({',
  "    clientID: process.env.GOOGLE_CLIENT_ID,",
  "    clientSecret: process.env.GOOGLE_CLIENT_SECRET,",
  "    callbackURL: process.env.NODE_ENV === 'production'",
  "      ? 'https://certigo-app-production.up.railway.app/auth/google/callback'",
  "      : 'http://localhost:5000/auth/google/callback',",
  '  }, async (accessToken, refreshToken, profile, done) => {',
  '    try {',
  "      const email = profile.emails?.[0]?.value;",
  "      if (!email) return done(new Error('No email from Google'));",
  '      let [user] = await db.select().from(users).where(eq(users.username, email));',
  '      if (!user) {',
  '        const [newUser] = await db.insert(users).values({',
  '          username: email,',
  "          password: 'google-oauth',",
  '          name: profile.displayName || email,',
  "          role: 'customer',",
  "          bio: '',",
  '          lat: 29.7604,',
  '          lng: -95.3698,',
  '        }).returning();',
  '        user = newUser;',
  '      }',
  '      return done(null, user);',
  '    } catch (err) {',
  '      return done(err);',
  '    }',
  '  }));',
  '',
  "  app.get('/auth/google', passport.authenticate('google', { scope: ['profile', 'email'] }));",
  '',
  "  app.get('/auth/google/callback',",
  "    passport.authenticate('google', { failureRedirect: '/login' }),",
  '    (req, res) => { res.redirect("/"); }',
  '  );',
].join('\n');
const insertPoint = c.indexOf('  app.post(api.auth.login.path');
if (insertPoint === -1) { console.log('ERROR: insert point not found'); process.exit(1); }
c = c.slice(0, insertPoint) + googleStrategy + '\n\n' + c.slice(insertPoint);
fs.writeFileSync('server/routes.ts', c, 'utf8');
console.log('done routes');
