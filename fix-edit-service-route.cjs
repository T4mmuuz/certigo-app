const fs = require('fs');
let r = fs.readFileSync('server/routes.ts', 'utf8');

// Agregar endpoint PATCH /api/services/:id despues del POST /api/services
const patchService = [
  '',
  '  app.patch("/api/services/:id", async (req, res) => {',
  '    if (!req.isAuthenticated()) return res.status(401).json({ message: "Unauthorized" });',
  '    try {',
  '      const serviceId = Number(req.params.id);',
  '      const service = await storage.getService(serviceId);',
  '      if (!service) return res.status(404).json({ message: "Service not found" });',
  '      if (service.providerId !== (req.user as any).id) return res.status(403).json({ message: "Not authorized" });',
  '      const { title, description, price, category } = req.body;',
  '      const updated = await storage.updateService(serviceId, { title, description, price: Number(price), category });',
  '      res.json(updated);',
  '    } catch (err: any) {',
  '      res.status(500).json({ message: err.message });',
  '    }',
  '  });',
].join('\n');

r = r.replace(
  /app\.post\(api\.services\.create\.path/,
  patchService + '\n\n  app.post(api.services.create.path'
);

fs.writeFileSync('server/routes.ts', r);
console.log('Listo');
