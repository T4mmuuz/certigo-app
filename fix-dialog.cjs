const fs = require('fs');
let p = fs.readFileSync('client/src/pages/Profile.tsx', 'utf8');

const dialogJSX = [
  '  return (',
  '    <>',
  '    <Dialog open={!!editingService} onOpenChange={(o) => { if (!o) setEditingService(null); }}>',
  '      <DialogContent>',
  '        <DialogHeader><DialogTitle>Edit Service</DialogTitle></DialogHeader>',
  '        <div className="space-y-4 py-4">',
  '          <div className="space-y-2"><Label>Title</Label><Input value={editTitle} onChange={e => setEditTitle(e.target.value)} /></div>',
  '          <div className="space-y-2"><Label>Description</Label><Textarea value={editDesc} onChange={e => setEditDesc(e.target.value)} /></div>',
  '          <div className="space-y-2"><Label>Price ($/hr)</Label><Input type="number" value={editPrice} onChange={e => setEditPrice(e.target.value)} /></div>',
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
  '  return (\n    <div className="min-h-screen bg-background">',
  dialogJSX
);

// Cerrar el fragment al final
p = p.replace(/(<\/div>\s*\);\s*}\s*)$/, '</div>\n    </>\n  );\n}\n');

fs.writeFileSync('client/src/pages/Profile.tsx', p);
console.log('Listo');
