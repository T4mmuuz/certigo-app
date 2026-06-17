const fs = require('fs');
let p = fs.readFileSync('client/src/pages/Profile.tsx', 'utf8');

const dialogLines = [
  '    <Dialog open={!!editingService} onOpenChange={(o) => { if (!o) setEditingService(null); }}>',
  '      <DialogContent>',
  '        <DialogHeader><DialogTitle>Edit Service</DialogTitle></DialogHeader>',
  '        <div className="space-y-4 py-4">',
  '          <div className="space-y-2"><Label>Title</Label><Input value={editTitle} onChange={e => setEditTitle(e.target.value)} /></div>',
  '          <div className="space-y-2"><Label>Description</Label><Textarea value={editDesc} onChange={e => setEditDesc(e.target.value)} /></div>',
  '          <div className="space-y-2"><Label>Price</Label><Input type="number" value={editPrice} onChange={e => setEditPrice(e.target.value)} /></div>',
  '          <div className="space-y-2"><Label>Category</Label><Input value={editCategory} onChange={e => setEditCategory(e.target.value)} /></div>',
  '        </div>',
  '        <DialogFooter>',
  '          <Button variant="outline" onClick={() => setEditingService(null)}>Cancel</Button>',
  '          <Button onClick={handleEditService} disabled={isSavingService}>{isSavingService ? "Saving..." : "Save Changes"}</Button>',
  '        </DialogFooter>',
  '      </DialogContent>',
  '    </Dialog>',
  '    <div className="min-h-screen bg-background">',
].join('\n');

p = p.replace(
  /return \(\s+<div className="min-h-screen bg-background">/,
  'return (\n    <>\n' + dialogLines
);

// cerrar fragment antes del ultimo cierre
p = p.replace(/(\s*<\/div>\s*\);\s*})\s*$/, '\n    </>\n  );\n}');

fs.writeFileSync('client/src/pages/Profile.tsx', p);
console.log('Listo - Edit Service:', p.includes('Edit Service') ? 'OK' : 'FALTA');
