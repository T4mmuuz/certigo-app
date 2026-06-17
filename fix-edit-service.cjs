const fs = require('fs');
let p = fs.readFileSync('client/src/pages/Profile.tsx', 'utf8');

// 1. Agregar estados para editar servicio
p = p.replace(
  '  const { data: services } = useServices();',
  '  const { data: services } = useServices();\n  const [editingService, setEditingService] = useState<any>(null);\n  const [editTitle, setEditTitle] = useState("");\n  const [editDesc, setEditDesc] = useState("");\n  const [editPrice, setEditPrice] = useState("");\n  const [editCategory, setEditCategory] = useState("");\n  const [isSavingService, setIsSavingService] = useState(false);'
);

// 2. Agregar funcion handleEditService
p = p.replace(
  '  const handleCreateService = async () => {',
  '  const handleEditService = async () => {\n    if (!editingService) return;\n    setIsSavingService(true);\n    try {\n      const res = await fetch("/api/services/" + editingService.id, {\n        method: "PATCH",\n        headers: { "Content-Type": "application/json" },\n        body: JSON.stringify({ title: editTitle, description: editDesc, price: editPrice, category: editCategory }),\n      });\n      if (!res.ok) throw new Error("Failed to update service");\n      queryClient.invalidateQueries({ queryKey: ["/api/services"] });\n      setEditingService(null);\n      toast({ title: "Service updated!" });\n    } catch (e: any) {\n      toast({ title: "Error", description: e.message, variant: "destructive" });\n    } finally {\n      setIsSavingService(false);\n    }\n  };\n  const handleCreateService = async () => {'
);

// 3. Reemplazar boton Edit con Dialog
p = p.replace(
  '                        <Button variant="outline" size="sm" className="opacity-0 group-hover:opacity-100 transition-opacity invisible group-hover:visible">Edit</Button>',
  [
    '                        <Button variant="outline" size="sm" onClick={() => { setEditingService(service); setEditTitle(service.title); setEditDesc(service.description); setEditPrice(String(service.price)); setEditCategory(service.category); }}>Edit</Button>',
  ].join('\n')
);

// 4. Agregar Dialog de edicion antes del cierre del componente
p = p.replace(
  '  return (\n    <div',
  '  return (\n    <>\n    <Dialog open={!!editingService} onOpenChange={(o) => { if (!o) setEditingService(null); }}>\n      <DialogContent>\n        <DialogHeader><DialogTitle>Edit Service</DialogTitle></DialogHeader>\n        <div className="space-y-4 py-4">\n          <div className="space-y-2"><Label>Title</Label><Input value={editTitle} onChange={e => setEditTitle(e.target.value)} /></div>\n          <div className="space-y-2"><Label>Description</Label><Textarea value={editDesc} onChange={e => setEditDesc(e.target.value)} /></div>\n          <div className="space-y-2"><Label>Price ($/hr)</Label><Input type="number" value={editPrice} onChange={e => setEditPrice(e.target.value)} /></div>\n          <div className="space-y-2"><Label>Category</Label><Input value={editCategory} onChange={e => setEditCategory(e.target.value)} /></div>\n        </div>\n        <DialogFooter>\n          <Button variant="outline" onClick={() => setEditingService(null)}>Cancel</Button>\n          <Button onClick={handleEditService} disabled={isSavingService}>{isSavingService ? "Saving..." : "Save Changes"}</Button>\n        </DialogFooter>\n      </DialogContent>\n    </Dialog>\n    <div'
);

// cerrar el fragment
p = p.replace(
  /(\s+)<\/div>\s*\);\s*}$/,
  '\n    </div>\n    </>\n  );\n}'
);

fs.writeFileSync('client/src/pages/Profile.tsx', p);
console.log('Listo');
