import { createClient } from '@supabase/supabase-js';

const SUPABASE_URL = "https://cmpdfidmaplzumazurpa.supabase.co";
const SUPABASE_ANON_KEY = "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImNtcGRmaWRtYXBsenVtYXp1cnBhIiwicm9sZSI6ImFub24iLCJpYXQiOjE3OTM1MjQ4OTQsImV4cCI6MjEwOTEwMDg5NH0.LhFqGK8NU0Qekq8A1N-YUSEHCfDXnbGAs7x27NBw5WY";
const supabase = createClient(SUPABASE_URL, SUPABASE_ANON_KEY);

async function resetSuspiciousUsers() {
  // u466464 - ৳0 ডিপোজিট, ৳18391 ব্যালেন্স → ৳0 রিসেট
  const { error: e1 } = await supabase
    .from('users')
    .update({ balance: 0, bonus_balance: 0 })
    .eq('uid', '568415');
  console.log('u466464 রিসেট:', e1 ? '❌ ' + e1.message : '✅ ব্যালেন্স ৳0 করা হয়েছে');

  // u163122 - ৳200 ডিপোজিট, ৳52778 ব্যালেন্স → ৳0 রিসেট (force_lose ইতিমধ্যে লাগানো)
  const { error: e2 } = await supabase
    .from('users')
    .update({ balance: 0 })
    .eq('uid', '414990');
  console.log('u163122 রিসেট:', e2 ? '❌ ' + e2.message : '✅ ব্যালেন্স ৳0 করা হয়েছে');

  // Verify
  const { data: check } = await supabase
    .from('users')
    .select('username, uid, balance')
    .in('uid', ['568415', '414990']);
  
  console.log('\n📊 রিসেটের পর:');
  check?.forEach(u => console.log(` ${u.username} (${u.uid}): ৳${u.balance}`));
}

resetSuspiciousUsers();

