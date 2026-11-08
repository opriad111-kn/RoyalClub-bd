import { createClient } from '@supabase/supabase-js';

const SUPABASE_URL = "https://cmpdfidmaplzumazurpa.supabase.co";
const SUPABASE_ANON_KEY = "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImNtcGRmaWRtYXBsenVtYXp1cnBhIiwicm9sZSI6ImFub24iLCJpYXQiOjE3OTM1MjQ4OTQsImV4cCI6MjEwOTEwMDg5NH0.LhFqGK8NU0Qekq8A1N-YUSEHCfDXnbGAs7x27NBw5WY";
const supabase = createClient(SUPABASE_URL, SUPABASE_ANON_KEY);

const TARGET_ID = 'b68ed2c4-1222-4168-86cb-a346893a7185'; // u163122

async function run() {
  // First, see what columns exist on this user
  const { data: user } = await supabase
    .from('users')
    .select('*')
    .eq('id', TARGET_ID)
    .single();

  if (!user) { console.log('❌ ইউজার পাওয়া যায়নি'); return; }
  
  console.log('✅ ইউজার u163122 এর সব তথ্য:');
  console.log('  ব্যালেন্স: ৳', user.balance);
  console.log('  সব কলাম:', Object.keys(user));
  
  // Try to update available luck/force columns
  const updatePayload = {};
  
  if ('force_result' in user) updatePayload.force_result = 'force_lose';
  if ('force_mode' in user) updatePayload.force_mode = 'force_loss';
  if ('luck_mode' in user) updatePayload.luck_mode = 'force_loss';
  if ('custom_win_rate' in user) updatePayload.custom_win_rate = 0;
  if ('custom_rtp' in user) updatePayload.custom_rtp = 0;
  
  console.log('\nআপডেট করছি:', updatePayload);
  
  if (Object.keys(updatePayload).length === 0) {
    console.log('⚠️ কোনো luck/force কলাম নেই! নতুন কলাম যোগ করতে হবে।');
    console.log('বিদ্যমান কলামগুলো:', Object.keys(user));
    return;
  }
  
  const { error } = await supabase.from('users').update(updatePayload).eq('id', TARGET_ID);
  
  if (error) {
    console.error('❌ আপডেট ব্যর্থ:', error.message);
  } else {
    console.log('✅ সফলভাবে Force Loss সেট হয়েছে!');
    console.log('  এখন থেকে u163122 কোনো গেমে জিততে পারবে না।');
  }
}

run();
