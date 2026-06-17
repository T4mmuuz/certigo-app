const fs = require('fs');

// === 1. REVIEWS GIVEN — contar reviews reales del usuario ===
let p = fs.readFileSync('client/src/pages/Profile.tsx', 'utf8');

// Agregar query de reviews del usuario
p = p.replace(
  '  const { data: services } = useServices();',
  '  const { data: services } = useServices();\n  const { data: myReviews = [] } = useQuery({ queryKey: ["/api/reviews/my"], queryFn: async () => { const res = await fetch("/api/reviews/my"); if (!res.ok) return []; return res.json(); } });'
);

// Agregar import useQuery si no existe
if (!p.includes('useQuery')) {
  p = p.replace(
    'import { useCreateService, useServices } from "@/hooks/use-services";',
    'import { useCreateService, useServices } from "@/hooks/use-services";\nimport { useQuery } from "@tanstack/react-query";'
  );
}

// Reemplazar el 0 hardcodeado
p = p.replace(
  '<p className="text-3xl font-display font-bold text-amber-900 dark:text-amber-300">0</p>',
  '<p className="text-3xl font-display font-bold text-amber-900 dark:text-amber-300">{myReviews.length}</p>'
);

fs.writeFileSync('client/src/pages/Profile.tsx', p);

// === 2. CIUDAD EN TARJETA DE SERVICIO en Home.tsx ===
let h = fs.readFileSync('client/src/pages/Home.tsx', 'utf8');

h = h.replace(
  '                            <span className="font-medium">{service.title}</span>',
  '<span className="font-medium">{service.title}</span>\n                            {service.provider.city && <span className="text-muted-foreground">· {service.provider.city}</span>}'
);

fs.writeFileSync('client/src/pages/Home.tsx', h);

console.log('Listo');
