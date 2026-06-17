const fs = require('fs');
let c = fs.readFileSync('server/routes.ts', 'utf8');
c = c.replace(
  'app.patch("/api/users/profile", async (req, res) => {\n    if (!req.user) return res.status(401).json({ message: "Unauthorized" });\n    const { name } = req.body;\n    if (!name || !name.trim()) return res.status(400).json({ message: "Name is required" });\n    const [updated] = await db.update(users).set({ name: name.trim() }).where(eq(users.id, (req.user as any).id)).returning();\n    res.json(updated);\n  });',
  'app.patch("/api/users/profile", async (req, res) => {\n    if (!req.isAuthenticated()) return res.status(401).json({ message: "Unauthorized" });\n    try {\n      const { name } = req.body;\n      if (!name || !name.trim()) return res.status(400).json({ message: "Name is required" });\n      const [updated] = await db.update(users).set({ name: name.trim() }).where(eq(users.id, (req.user as any).id)).returning();\n      res.json(updated);\n    } catch (e: any) {\n      res.status(500).json({ message: e.message });\n    }\n  });'
);
fs.writeFileSync('server/routes.ts', c, 'utf8');
console.log('done');
