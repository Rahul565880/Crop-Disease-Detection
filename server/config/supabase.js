const { createClient } = require('@supabase/supabase-js');

const supabaseUrl = 'https://uqkyjkixzljyamnszbko.supabase.co';
const supabaseKey = process.env.SUPABASE_ANON_KEY || 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InVxa3lqa2l4emxqeWFtbnN6YmtvIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NDAwMDAwMDAsImV4cCI6MjAwNTU3NjAwMH0-placeholder';

const supabase = createClient(supabaseUrl, supabaseKey);

module.exports = supabase;
