import { createClient } from '@supabase/supabase-js';

const SUPABASE_URL = "https://cmpdfidmaplzumazurpa.supabase.co";
const SUPABASE_ANON_KEY = "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImNtcGRmaWRtYXBsenVtYXp1cnBhIiwicm9sZSI6ImFub24iLCJpYXQiOjE3OTM1MjQ4OTQsImV4cCI6MjEwOTEwMDg5NH0.LhFqGK8NU0Qekq8A1N-YUSEHCfDXnbGAs7x27NBw5WY";
const supabase = createClient(SUPABASE_URL, SUPABASE_ANON_KEY);

async function fixAllUsers() {
  // সব user এর তথ্য নিয়ে আসো
  const { data: users } = await supabase
    .from('users')
    .select('id, username, uid, balance, current_turnover, required_turnover, total_deposited')
    .order('created_at', { ascending: false });

  console.log(`মোট ${users?.length || 0} জন ইউজার পাওয়া গেছে\n`);

  for (const u of (users || [])) {
    const reqT = Number(u.required_turnover || 0);
    const curT = Number(u.current_turnover || 0);
    const deposit = Number(u.total_deposited || 0);

    // নতুন নিয়ম: required_turnover = deposit * 1x (আগে 3.5x ছিল)
    const correctRequired = parseFloat((deposit * 1.0).toFixed(2));

    // যদি required_turnover বেশি থাকে, ঠিক করো
    const needsReqFix = reqT > correctRequired && correctRequired > 0;
    // যদি user balance 0 হয় কিন্তু turnover 0 হয় → ধরে নাও সব বেট হয়েছে
    const shouldSetTurnoverDone = u.balance === 0 && curT === 0 && deposit > 0;

    if (needsReqFix || shouldSetTurnoverDone) {
      const newRequired = correctRequired > 0 ? correctRequired : reqT;
      const newCurrent = shouldSetTurnoverDone ? newRequired : curT; // balance 0 হলে turnover পূর্ণ করে দাও

      const { error } = await supabase.from('users').update({
        required_turnover: newRequired,
        current_turnover: newCurrent,
      }).eq('id', u.id);

      console.log(`✅ ${u.username} (${u.uid}):
   ব্যালেন্স: ৳${u.balance}
   required_turnover: ৳${reqT} → ৳${newRequired}
   current_turnover: ৳${curT} → ৳${newCurrent}
   আপডেট: ${error ? '❌ ' + error.message : 'সম্পন্ন'}
`);
    }
  }

  console.log('✅ সব ইউজারের টার্নওভার ঠিক করা হয়েছে!');
}

fixAllUsers();

