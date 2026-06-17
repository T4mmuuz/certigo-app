const fs = require('fs');
let s = fs.readFileSync('server/storage.ts', 'utf8');

// Interfaz
s = s.replace(
  'updateUser(userId: number, data: { name?: string; username?: string; password?: string }): Promise<User>;',
  'updateUser(userId: number, data: { name?: string; username?: string; password?: string; city?: string }): Promise<User>;'
);

// Implementacion
s = s.replace(
  'async updateUser(userId: number, data: { name?: string; username?: string; password?: string }): Promise<User>',
  'async updateUser(userId: number, data: { name?: string; username?: string; password?: string; city?: string }): Promise<User>'
);

fs.writeFileSync('server/storage.ts', s);
console.log('Listo');
