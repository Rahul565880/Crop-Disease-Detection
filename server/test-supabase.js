const { createClient } = require('@supabase/supabase-js');
require('dotenv').config();

async function testConnection() {
  const supabaseUrl = process.env.SUPABASE_URL;
  const supabaseKey = process.env.SUPABASE_ANON_KEY;

  console.log('🔄 Connecting to Supabase...');
  console.log('URL:', supabaseUrl);

  const supabase = createClient(supabaseUrl, supabaseKey);

  try {
    // Test connection
    const { data, error } = await supabase.from('users').select('*').limit(1);
    
    if (error) {
      console.log('❌ Connection test failed!');
      console.log('Error:', error.message);
      
      if (error.code === '42P01') {
        console.log('\n📋 Table "users" does not exist.');
        console.log('Please run the supabase-setup.sql in Supabase SQL Editor first.');
      }
    } else {
      console.log('✅ Connected to Supabase successfully!');
      console.log('Current users in DB:', data);
    }
  } catch (err) {
    console.log('❌ Connection failed!');
    console.log('Error:', err.message);
  }
}

testConnection();
