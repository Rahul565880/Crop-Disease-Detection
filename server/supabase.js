const { createClient } = require('@supabase/supabase-js');
require('dotenv').config();

// Create Supabase client with optimized settings
const supabaseUrl = process.env.SUPABASE_URL;
const supabaseKey = process.env.SUPABASE_ANON_KEY;

// Create client with better configuration
const supabase = createClient(supabaseUrl, supabaseKey, {
  auth: {
    persistSession: false,
    autoRefreshToken: false,
  },
  realtime: {
    enabled: false,
  },
});

module.exports = supabase;
