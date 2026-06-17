const fs = require('fs');
let p = fs.readFileSync('client/src/pages/Profile.tsx', 'utf8');

// 1. Agregar estado editCity
p = p.replace(
  '  const [editUsername, setEditUsername] = useState("");',
  '  const [editUsername, setEditUsername] = useState("");\n  const [editCity, setEditCity] = useState("");'
);

// 2. Actualizar tipo de mutationFn
p = p.replace(
  'mutationFn: async (data: { name: string; username: string }) => {',
  'mutationFn: async (data: { name: string; username: string; city?: string }) => {'
);

// 3. Actualizar el mutate call
p = p.replace(
  'onClick={() => updateProfile.mutate({ name: editName, username: editUsername })}',
  'onClick={() => updateProfile.mutate({ name: editName, username: editUsername, city: editCity })}'
);

// 4. Agregar campo city en el dialog JSX
const cityInput = [
  '      <div className="space-y-2">',
  '        <Label>City</Label>',
  '        <Input value={editCity} onChange={e => setEditCity(e.target.value)} placeholder="e.g. Houston, TX" />',
  '      </div>',
].join('\n');

p = p.replace(
  '    </div>\n    <DialogFooter>',
  '    ' + cityInput + '\n    </div>\n    <DialogFooter>'
);

fs.writeFileSync('client/src/pages/Profile.tsx', p);
console.log('Listo');
