const fs = require('fs');
let h = fs.readFileSync('client/src/pages/Home.tsx', 'utf8');

h = h.replace(
  /search: searchTerm,\s+category: activeCategory,\s+\}\);/,
  "search: searchTerm,\n    category: activeCategory,\n  });\n  const services = useMemo(() => {\n    if (!user?.city) return rawServices;\n    return rawServices.filter(s => !s.provider?.city || s.provider.city.toLowerCase().includes(user.city.toLowerCase()));\n  }, [rawServices, user?.city]);"
);

fs.writeFileSync('client/src/pages/Home.tsx', h);
console.log('Listo');
