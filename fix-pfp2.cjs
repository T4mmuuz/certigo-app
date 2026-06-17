const fs=require('fs');
let p=fs.readFileSync('client/src/pages/Profile.tsx','utf8');
const oldHandler=`    setIsUploading(true);
    try {
      const urlResponse = await fetch("/api/uploads/request-url", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          name: file.name,
          size: file.size,
          contentType: file.type,
        }),
      });

      if (!urlResponse.ok) throw new Error("Failed to get upload URL");
      const { uploadURL, objectPath } = await urlResponse.json();

      await fetch(uploadURL, {
        method: "PUT",
        body: file,
        headers: { "Content-Type": file.type },
      });

      const updateResponse = await apiRequest("PATCH", "/api/users/profile-picture", { objectPath });
      
      queryClient.invalidateQueries({ queryKey: ["/api/auth/me"] });
        queryClient.refetchQueries({ queryKey: ["/api/auth/me"] });
      toast({ title: "Profile picture updated!" });`;

const newHandler=`    setIsUploading(true);
    try {
      const reader = new FileReader();
      reader.onload = async () => {
        try {
          const base64 = reader.result as string;
          const res = await fetch("/api/users/profile-picture-upload", {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ base64 }),
            credentials: "include",
          });
          if (!res.ok) throw new Error("Upload failed");
          queryClient.invalidateQueries({ queryKey: ["/api/auth/me"] });
          queryClient.refetchQueries({ queryKey: ["/api/auth/me"] });
          toast({ title: "Profile picture updated!" });
        } catch (e) {
          toast({ title: "Upload failed", description: "Please try again", variant: "destructive" });
        } finally {
          setIsUploading(false);
          if (fileInputRef.current) fileInputRef.current.value = "";
        }
      };
      reader.readAsDataURL(file);
      return;`;

p=p.replace(oldHandler,newHandler);
fs.writeFileSync('client/src/pages/Profile.tsx',p);
console.log(p.includes('profile-picture-upload')?'OK':'FALTA');
