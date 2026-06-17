const{Pool}=require('pg');
const p=new Pool({connectionString:process.env.DATABASE_URL});
Promise.all([
  p.query("DELETE FROM session"),
  p.query("DELETE FROM reviews"),
  p.query("DELETE FROM bookings"),
  p.query("DELETE FROM services"),
  p.query("DELETE FROM users"),
]).then(()=>{console.log('done');p.end()}).catch(e=>{console.error(e.message);p.end()});
