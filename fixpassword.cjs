const fs = require('fs');
let c = fs.readFileSync('client/src/pages/Auth.tsx', 'utf8');

if (c.includes('showLoginPassword')) {
  console.log('ya existe');
  process.exit(0);
}

c = c.replace(
  'import { Eye, EyeOff } from "lucide-react";',
  ''
);

const firstImport = c.indexOf('import ');
c = c.slice(0, firstImport) + 'import { Eye, EyeOff } from "lucide-react";\n' + c.slice(firstImport);

c = c.replace(
  'const [activeTab, setActiveTab] = useState("login");',
  'const [activeTab, setActiveTab] = useState("login");\n  const [showLoginPassword, setShowLoginPassword] = useState(false);\n  const [showRegPassword, setShowRegPassword] = useState(false);\n  const [showRegConfirmPassword, setShowRegConfirmPassword] = useState(false);'
);

c = c.replace(
  'type="password"\n                  placeholder={t("auth.password")}',
  'type={showLoginPassword ? "text" : "password"}\n                  placeholder={t("auth.password")}'
);

fs.writeFileSync('client/src/pages/Auth.tsx', c, 'utf8');
console.log('done');
