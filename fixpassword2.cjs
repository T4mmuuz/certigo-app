const fs = require('fs');
let c = fs.readFileSync('client/src/pages/Auth.tsx', 'utf8');
c = c.replace(
  'const [activeTab, setActiveTab] = useState<"login" | "register">("login");',
  'const [activeTab, setActiveTab] = useState<"login" | "register">("login");\n  const [showLoginPassword, setShowLoginPassword] = useState(false);\n  const [showRegPassword, setShowRegPassword] = useState(false);\n  const [showRegConfirmPassword, setShowRegConfirmPassword] = useState(false);'
);
fs.writeFileSync('client/src/pages/Auth.tsx', c, 'utf8');
console.log('done');
