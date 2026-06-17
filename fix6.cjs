const fs = require('fs');
let c = fs.readFileSync('client/src/pages/Profile.tsx', 'utf8');

// Fix Edit Profile button
c = c.replace(
  '<Button variant="ghost" className="w-full justify-start text-sm h-9">Edit Profile</Button>',
  '<Button variant="ghost" className="w-full justify-start text-sm h-9" onClick={() => { setNewName(user.name || ""); setIsEditProfileOpen(true); }}><Pencil className="w-3 h-3 mr-2" /> Edit Profile</Button>'
);

// Add Edit Profile Dialog before last closing div
c = c.replace(
  '    </div>\n  );\n}',
  '    </div>\n\n      <Dialog open={isEditProfileOpen} onOpenChange={setIsEditProfileOpen}>\n        <DialogContent className="sm:max-w-md">\n          <DialogHeader>\n            <DialogTitle>Edit Profile</DialogTitle>\n            <DialogDescription>Update your display name.</DialogDescription>\n          </DialogHeader>\n          <div className="space-y-4 py-4">\n            <div className="space-y-2">\n              <Label htmlFor="edit-name">Display Name</Label>\n              <Input id="edit-name" value={newName} onChange={(e) => setNewName(e.target.value)} placeholder="Your name" />\n            </div>\n          </div>\n          <DialogFooter>\n            <Button variant="outline" onClick={() => setIsEditProfileOpen(false)}>Cancel</Button>\n            <Button onClick={() => updateProfile.mutate(newName)} disabled={updateProfile.isPending || !newName.trim()}>\n              {updateProfile.isPending ? <Loader2 className="w-4 h-4 animate-spin mr-2" /> : <Check className="w-4 h-4 mr-2" />}\n              Save Changes\n            </Button>\n          </DialogFooter>\n        </DialogContent>\n      </Dialog>\n  );\n}'
);

fs.writeFileSync('client/src/pages/Profile.tsx', c, 'utf8');
console.log('done');
