import { createClient } from '@supabase/supabase-js';

const SUPABASE_URL = "https://cmpdfidmaplzumazurpa.supabase.co";
const SUPABASE_ANON_KEY = "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImNtcGRmaWRtYXBsenVtYXp1cnBhIiwicm9sZSI6ImFub24iLCJpYXQiOjE3OTM1MjQ4OTQsImV4cCI6MjEwOTEwMDg5NH0.LhFqGK8NU0Qekq8A1N-YUSEHCfDXnbGAs7x27NBw5WY";
const supabase = createClient(SUPABASE_URL, SUPABASE_ANON_KEY);

async function checkUser() {
  // Get user details
  const { data: user } = await supabase
    .from('users')
    .select('*')
    .or('username.eq.u466464,uid.eq.568415')
    .single();

  if (!user) { console.log('❌ ইউজার পাওয়া যায়নি'); return; }

  console.log('=== U466464 (UID: 568415) এর বিস্তারিত ===');
  console.log('  ID:', user.id);
  console.log('  ব্যালেন্স: ৳', user.balance);
  console.log('  বোনাস ব্যালেন্স: ৳', user.bonus_balance);
  console.log('  মোট ডিপোজিট: ৳', user.total_deposited);
  console.log('  মোট উইথড্রো: ৳', user.total_withdrawn);
  console.log('  VIP লেভেল:', user.vip_level);
  console.log('  force_result:', user.force_result);
  console.log('  force_mode:', user.force_mode);
  console.log('  custom_win_rate:', user.custom_win_rate);
  console.log('  টার্নওভার (current):', user.current_turnover);
  console.log('  টার্নওভার (required):', user.required_turnover);
  console.log('  total_spins:', user.total_spins);

  // Get deposit history
  console.log('\n=== ডিপোজিট হিস্টরি ===');
  const { data: deposits } = await supabase
    .from('transactions')
    .select('*')
    .or(`user_id.eq.${user.id},uid.eq.568415`)
    .eq('type', 'deposit')
    .order('created_at', { ascending: false })
    .limit(10);

  if (deposits?.length) {
    deposits.forEach(d => {
      console.log(`  ৳${d.amount} | ${d.status} | ${d.created_at}`);
    });
  } else {
    console.log('  কোনো ডিপোজিট রেকর্ড নেই');
  }

  // Check all transactions
  console.log('\n=== সব ট্রানজেকশন (শেষ ১৫টি) ===');
  const { data: txns } = await supabase
    .from('transactions')
    .select('*')
    .or(`user_id.eq.${user.id},uid.eq.568415,username.eq.u466464`)
    .order('created_at', { ascending: false })
    .limit(15);

  if (txns?.length) {
    txns.forEach(t => {
      console.log(`  [${t.type}] ৳${t.amount} | ${t.status} | ${new Date(t.created_at).toLocaleString('bn-BD')}`);
    });
  } else {
    // Try game_history
    console.log('  transactions টেবিলে নেই, game_history চেক করছি...');
    const { data: gh } = await supabase
      .from('game_history')
      .select('*')
      .or(`user_id.eq.${user.id},username.eq.u466464`)
      .order('created_at', { ascending: false })
      .limit(10);
    
    if (gh?.length) {
      let totalWon = 0;
      gh.forEach(g => {
        const profit = g.win_amount - g.bet_amount;
        totalWon += profit;
        console.log(`  বেট: ৳${g.bet_amount} | জিতেছে: ৳${g.win_amount} | লাভ: ৳${profit.toFixed(2)} | ${g.game_name || g.game_id}`);
      });
      console.log(`\n  মোট গেমে লাভ: ৳${totalWon.toFixed(2)}`);
    } else {
      console.log('  game_history তেও কিছু নেই');
    }
  }

  // Check all users with high balance
  console.log('\n=== সব হাই ব্যালেন্স ইউজার (৳500 এর বেশি) ===');
  const { data: highBal } = await supabase
    .from('users')
    .select('username, uid, balance, total_deposited, force_result, force_mode')
    .gt('balance', 500)
    .order('balance', { ascending: false })
    .limit(10);

  if (highBal?.length) {
    highBal.forEach(u => {
      console.log(`  ${u.username} (UID:${u.uid}) | ব্যালেন্স: ৳${u.balance} | ডিপোজিট: ৳${u.total_deposited} | force: ${u.force_result || 'normal'}`);
    });
  }
}

checkUser();

