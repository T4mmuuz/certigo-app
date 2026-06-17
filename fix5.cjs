const fs = require('fs');
let c = fs.readFileSync('client/src/pages/Profile.tsx', 'utf8');

// Add new imports
c = c.replace(
  'import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";',
  'import { useMutation, useQueryClient } from "@tanstack/react-query";'
);
c = c.replace(
  'import { Plus, Settings, Camera, Gift, Copy, Check, Wallet, ExternalLink, Loader2 } from "lucide-react";',
  'import { Plus, Settings, Camera, Check, Loader2, Pencil } from "lucide-react";'
);

// Add state after isUploading
c = c.replace(
  'const [isUploading, setIsUploading] = useState(false);',
  'const [isUploading, setIsUploading] = useState(false);\n  const [isEditProfileOpen, setIsEditProfileOpen] = useState(false);\n  const [newName, setNewName] = useState("");'
);

// Add updateProfile mutation before if (!user)
c = c.replace(
  'if (!user) return <Redirect to="/login" />;',
  'const updateProfile = useMutation({\n    mutationFn: async (name) => {\n      const res = await apiRequest("PATCH", "/api/users/profile", { name });\n      return res.json();\n    },\n    onSuccess: () => {\n      queryClient.invalidateQueries({ queryKey: ["/api/auth/me"] });\n      toast({ title: "Profile updated!" });\n      setIsEditProfileOpen(false);\n    },\n    onError: () => {\n      toast({ title: "Failed to update profile", variant: "destructive" });\n    },\n  });\n\n  if (!user) return <Redirect to="/login" />;'
);

fs.writeFileSync('client/src/pages/Profile.tsx', c, 'utf8');
console.log('done');
