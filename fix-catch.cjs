const fs=require('fs');
let p=fs.readFileSync('client/src/pages/Profile.tsx','utf8');
const lines=p.split('\n');
// Buscar y eliminar el bloque catch huerfano (lineas 199-205 aprox)
const badStart=lines.findIndex(l=>l.includes('} catch (error) {') && lines[lines.indexOf(l)+1]?.includes('Upload error'));
if(badStart===-1){console.log('No encontrado');process.exit(1);}
// Eliminar desde el catch hasta el finally closing brace
let badEnd=badStart;
while(badEnd<lines.length && !lines[badEnd].includes('fileInputRef.current')){badEnd++;}
badEnd+=2; // incluir las llaves de cierre
lines.splice(badStart,badEnd-badStart);
fs.writeFileSync('client/src/pages/Profile.tsx',lines.join('\n'));
console.log('OK - eliminadas lineas '+badStart+' a '+badEnd);
