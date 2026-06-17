const{Pool}=require('pg');
const p=new Pool({connectionString:process.env.DATABASE_URL});
p.query("DELETE FROM session").then(()=>
  p.query("DELETE FROM users")
).then(r=>{
  console.log('Borrados:',r.rowCount);
  p.end();
});
