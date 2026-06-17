const fs=require('fs');
let p=fs.readFileSync('client/src/pages/Profile.tsx','utf8');
const start=p.indexOf('setIsUploading(true);');
const end=p.indexOf('toast({ title: "Profile picture updated!" });', start)+('toast({ title: "Profile picture updated!" });').length;
const newBlock=`setIsUploading(true);
    const reader = new FileReader();
    reader.onload = async () => {
      try {
        const base64 = reader.result;
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
    reader.readAsDataURL(file);`;
p=p.slice(0,start)+newBlock+p.slice(end);
fs.writeFileSync('client/src/pages/Profile.tsx',p);
console.log(p.includes('profile-picture-upload')?'OK':'FALTA');
