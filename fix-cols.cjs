const{Pool}=require('pg');
const p=new Pool({connectionString:process.env.DATABASE_URL});
Promise.all([
  p.query("ALTER TABLE bookings ADD COLUMN IF NOT EXISTS paused_reason text"),
  p.query("ALTER TABLE bookings ADD COLUMN IF NOT EXISTS cancel_reason text"),
]).then(()=>{console.log('done');p.end()}).catch(e=>{console.error(e.message);p.end()});
