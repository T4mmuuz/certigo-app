const fs=require('fs');
let r=fs.readFileSync('server/routes.ts','utf8');
const newEndpoint=`
  // Upload profile picture via Cloudinary
  app.post('/api/users/profile-picture-upload', async (req, res) => {
    if (!req.isAuthenticated()) return res.status(401).json({ message: 'Unauthorized' });
    try {
      const { base64 } = req.body;
      if (!base64) return res.status(400).json({ message: 'No image provided' });
      const result = await cloudinary.uploader.upload(base64, {
        folder: 'certigo/profiles',
        public_id: 'profile_' + (req.user as any).id + '_' + Date.now(),
        transformation: [{ width: 300, height: 300, crop: 'fill', quality: 'auto' }],
      });
      const updatedUser = await storage.updateUserProfilePicture((req.user as any).id, result.secure_url);
      res.json(updatedUser);
    } catch (err) { res.status(500).json({ message: err.message || 'Upload failed' }); }
  });
`;
const marker='\n  // Upload service photos (max 5)';
r=r.replace(marker, newEndpoint+marker);
fs.writeFileSync('server/routes.ts',r);
console.log(r.includes('profile-picture-upload')?'OK':'FALTA');
