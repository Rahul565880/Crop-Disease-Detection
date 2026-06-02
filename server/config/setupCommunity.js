require('dotenv').config({ path: require('path').join(__dirname, '..', '.env') });
const { createClient } = require('@supabase/supabase-js');

const supabase = createClient(process.env.SUPABASE_URL, process.env.SUPABASE_SERVICE_ROLE_KEY);

async function setupCommunityTables() {
  try {
    console.log('Creating community_posts table...');
    const { error: e1 } = await supabase.rpc('exec_sql', {
      sql: `
        CREATE TABLE IF NOT EXISTS community_posts (
          post_id SERIAL PRIMARY KEY,
          user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
          user_name VARCHAR(255) DEFAULT 'Anonymous',
          title VARCHAR(500) NOT NULL,
          description TEXT NOT NULL,
          crop_type VARCHAR(100),
          disease_name VARCHAR(255),
          image_url TEXT,
          likes INTEGER DEFAULT 0,
          comments_count INTEGER DEFAULT 0,
          created_at TIMESTAMPTZ DEFAULT NOW()
        );
        ALTER TABLE community_posts ENABLE ROW LEVEL SECURITY;
        DROP POLICY IF EXISTS "Anyone can read posts" ON community_posts;
        CREATE POLICY "Anyone can read posts" ON community_posts FOR SELECT USING (true);
        DROP POLICY IF EXISTS "Authenticated users can insert" ON community_posts;
        CREATE POLICY "Authenticated users can insert" ON community_posts FOR INSERT WITH CHECK (auth.role() = 'authenticated');
      `
    });
    if (e1) console.log('Note (community_posts):', e1.message);

    console.log('Creating community_comments table...');
    const { error: e2 } = await supabase.rpc('exec_sql', {
      sql: `
        CREATE TABLE IF NOT EXISTS community_comments (
          id SERIAL PRIMARY KEY,
          post_id INTEGER REFERENCES community_posts(post_id) ON DELETE CASCADE,
          user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
          user_name VARCHAR(255) DEFAULT 'Anonymous',
          text TEXT NOT NULL,
          created_at TIMESTAMPTZ DEFAULT NOW()
        );
        ALTER TABLE community_comments ENABLE ROW LEVEL SECURITY;
        DROP POLICY IF EXISTS "Anyone can read comments" ON community_comments;
        CREATE POLICY "Anyone can read comments" ON community_comments FOR SELECT USING (true);
        DROP POLICY IF EXISTS "Authenticated users can insert comments" ON community_comments;
        CREATE POLICY "Authenticated users can insert comments" ON community_comments FOR INSERT WITH CHECK (auth.role() = 'authenticated');
      `
    });
    if (e2) console.log('Note (community_comments):', e2.message);

    console.log('Community tables setup complete!');
  } catch (err) {
    console.error('Setup error:', err.message);
    console.log('\nAlternative: Run this SQL in Supabase SQL Editor:');
    console.log(`
CREATE TABLE IF NOT EXISTS community_posts (
  post_id SERIAL PRIMARY KEY,
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
  user_name VARCHAR(255) DEFAULT 'Anonymous',
  title VARCHAR(500) NOT NULL,
  description TEXT NOT NULL,
  crop_type VARCHAR(100),
  disease_name VARCHAR(255),
  image_url TEXT,
  likes INTEGER DEFAULT 0,
  comments_count INTEGER DEFAULT 0,
  created_at TIMESTAMPTZ DEFAULT NOW()
);
ALTER TABLE community_posts ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Anyone can read posts" ON community_posts FOR SELECT USING (true);
CREATE POLICY "Authenticated users can insert" ON community_posts FOR INSERT WITH CHECK (auth.role() = 'authenticated');

CREATE TABLE IF NOT EXISTS community_comments (
  id SERIAL PRIMARY KEY,
  post_id INTEGER REFERENCES community_posts(post_id) ON DELETE CASCADE,
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
  user_name VARCHAR(255) DEFAULT 'Anonymous',
  text TEXT NOT NULL,
  created_at TIMESTAMPTZ DEFAULT NOW()
);
ALTER TABLE community_comments ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Anyone can read comments" ON community_comments FOR SELECT USING (true);
CREATE POLICY "Authenticated users can insert comments" ON community_comments FOR INSERT WITH CHECK (auth.role() = 'authenticated');
    `);
  }
};

setupCommunityTables();
