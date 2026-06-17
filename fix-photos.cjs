const fs=require('fs');
let r=fs.readFileSync('server/routes.ts','utf8');
const start=r.indexOf('\n  // Upload service photos (max 5)');
const end=r.indexOf('\n  // GET /api/reviews/my');
if(start===-1||end===-1){console.log('No encontrado start:'+start+' end:'+end);process.exit(1);}
const goodBlock=`
  // Upload service photos (max 5)
  app.post('/api/services/:id/photos', async (req, res) => {
    if (!req.isAuthenticated()) return res.status(401).json({ message: 'Unauthorized' });
    try {
      const serviceId = Number(req.params.id);
      const service = await storage.getService(serviceId);
      if (!service) return res.status(404).json({ message: 'Service not found' });
      if (service.providerId !== (req.user as any).id) return res.status(403).json({ message: 'Not authorized' });
      const { base64 } = req.body;
      if (!base64) return res.status(400).json({ message: 'No image provided' });
      const currentPhotos = (service as any).photos || [];
      if (currentPhotos.length >= 5) return res.status(400).json({ message: 'Maximum 5 photos allowed' });
      const result = await cloudinary.uploader.upload(base64, { folder: 'certigo/services', transformation: [{ width: 800, height: 600, crop: 'fill', quality: 'auto' }] });
      const newPhotos = [...currentPhotos, result.secure_url];
      await pool.query('UPDATE services SET photos = $1 WHERE id = $2', [newPhotos, serviceId]);
      res.json({ url: result.secure_url, photos: newPhotos });
    } catch (err) { res.status(500).json({ message: err.message || 'Upload failed' }); }
  });

  // Delete service photo
  app.delete('/api/services/:id/photos', async (req, res) => {
    if (!req.isAuthenticated()) return res.status(401).json({ message: 'Unauthorized' });
    try {
      const serviceId = Number(req.params.id);
      const service = await storage.getService(serviceId);
      if (!service) return res.status(404).json({ message: 'Service not found' });
      if (service.providerId !== (req.user as any).id) return res.status(403).json({ message: 'Not authorized' });
      const { url } = req.body;
      const currentPhotos = (service as any).photos || [];
      const newPhotos = currentPhotos.filter((p) => p !== url);
      await pool.query('UPDATE services SET photos = $1 WHERE id = $2', [newPhotos, serviceId]);
      res.json({ photos: newPhotos });
    } catch (err) { res.status(500).json({ message: err.message || 'Delete failed' }); }
  });
`;
r=r.slice(0,start)+goodBlock+r.slice(end);
fs.writeFileSync('server/routes.ts',r);
console.log('OK - start:'+start+' end:'+end);
