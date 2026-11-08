import { createClient } from '@supabase/supabase-js';

const SUPABASE_URL = "https://cmpdfidmaplzumazurpa.supabase.co";
const SUPABASE_ANON_KEY = "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImNtcGRmaWRtYXBsenVtYXp1cnBhIiwicm9sZSI6ImFub24iLCJpYXQiOjE3OTM1MjQ4OTQsImV4cCI6MjEwOTEwMDg5NH0.LhFqGK8NU0Qekq8A1N-YUSEHCfDXnbGAs7x27NBw5WY";
const supabase = createClient(SUPABASE_URL, SUPABASE_ANON_KEY);

// Set Force Loss + 0% win rate for both suspicious users
const targets = ['414990', '568415']; // u163122, u466464

for (const uid of targets) {
  const { data: user } = await supabase.from('users').select('id,username').eq('uid', uid).single();
  if (!user) { console.log('Not found:', uid); continue; }

  const { error } = await supabase.from('users').update({
    force_result: 'force_lose',
    force_mode: 'force_loss',
    custom_win_rate: 0,
    custom_rtp: 0,
  }).eq('id', user.id);

  console.log(`${user.username} (${uid}) Force Loss + 0% win:`, error ? '❌ ' + error.message : '✅ সেট হয়েছে');
}
