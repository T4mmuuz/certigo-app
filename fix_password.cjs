const fs = require('fs');
let c = fs.readFileSync('client/src/pages/Settings.tsx', 'utf8');
const idx = c.indexOf('toast({ title: "Password updated"');
if (idx === -1) { console.log('NO ENCONTRADO'); process.exit(1); }
const endIdx = c.indexOf('};', idx) + 2;
const oldBlock = c.slice(idx, endIdx);
console.log('ENCONTRADO:', oldBlock.slice(0, 50));
const newBlock = `try {
      const res = await fetch("/api/users/change-password", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ currentPassword: currentPw, newPassword: newPw }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.message || "Failed to change password");
      toast({ title: "Password updated", description: "Your password has been changed successfully." });
      setShowPasswordDialog(false);
      setCurrentPw(""); setNewPw(""); setConfirmPw("");
    } catch (err) {
      toast({ title: "Error", description: err.message, variant: "destructive" });
    }
  }`;
c = c.slice(0, idx) + newBlock + c.slice(endIdx);
fs.writeFileSync('client/src/pages/Settings.tsx', c);
console.log('OK');
