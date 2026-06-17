const fs = require('fs');
let h = fs.readFileSync('client/src/pages/Home.tsx', 'utf8');

// 1. Agregar import useAuth
h = h.replace(
  'import { useLanguage } from "@/contexts/LanguageContext";',
  'import { useLanguage } from "@/contexts/LanguageContext";\nimport { useAuth } from "@/hooks/use-auth";'
);

// 2. Agregar useAuth hook despues de useLanguage
h = h.replace(
  '  const { t } = useLanguage();',
  '  const { t } = useLanguage();\n  const { user } = useAuth();'
);

// 3. Filtrar servicios por ciudad despues de obtenerlos
h = h.replace(
  '  const { data: services = [], isLoading } = useServices({',
  '  const { data: rawServices = [], isLoading } = useServices({'
);

h = h.replace(
  '    search: searchTerm,\n    category: activeCategory,\n  });',
  '    search: searchTerm,\n    category: activeCategory,\n  });\n  const services = useMemo(() => {\n    if (!user?.city) return rawServices;\n    return rawServices.filter(s => !s.provider?.city || s.provider.city.toLowerCase().includes(user.city!.toLowerCase()));\n  }, [rawServices, user?.city]);'
);

fs.writeFileSync('client/src/pages/Home.tsx', h);
console.log('Listo');
