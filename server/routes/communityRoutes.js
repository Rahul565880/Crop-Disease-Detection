const express = require('express');
const router = express.Router();
const { createClient } = require('@supabase/supabase-js');
const { authenticate } = require('../middleware/auth');

const supabase = createClient(process.env.SUPABASE_URL, process.env.SUPABASE_ANON_KEY);

router.get('/posts', async (req, res) => {
  try {
    const { page = 1, limit = 20, crop } = req.query;
    const offset = (page - 1) * limit;

    let query = supabase
      .from('community_posts')
      .select('*', { count: 'exact' })
      .order('created_at', { ascending: false })
      .range(offset, offset + Number(limit) - 1);

    if (crop) query = query.eq('crop_type', crop);

    const { data: posts, count, error } = await query;
    if (error) throw error;

    res.json({ posts: posts || [], pagination: { total: count, page: Number(page), limit: Number(limit) } });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

router.post('/posts', authenticate, async (req, res) => {
  try {
    const { title, description, crop_type, disease_name, image_url } = req.body;
    if (!title || !description) return res.status(400).json({ error: 'title and description required' });

    const { data, error } = await supabase.from('community_posts').insert({
      user_id: req.user.id,
      user_name: req.user.name || 'Anonymous',
      title,
      description,
      crop_type: crop_type || null,
      disease_name: disease_name || null,
      image_url: image_url || null,
    }).select().single();

    if (error) throw error;
    res.status(201).json({ post: data });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

router.post('/posts/:id/like', authenticate, async (req, res) => {
  try {
    const { id } = req.params;
    const { data: post } = await supabase.from('community_posts').select('likes').eq('post_id', id).single();
    const newLikes = (post?.likes || 0) + 1;
    await supabase.from('community_posts').update({ likes: newLikes }).eq('post_id', id);
    res.json({ likes: newLikes });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

router.post('/posts/:id/comments', authenticate, async (req, res) => {
  try {
    const { id } = req.params;
    const { text } = req.body;
    if (!text) return res.status(400).json({ error: 'text required' });

    const { data: comment, error } = await supabase.from('community_comments').insert({
      post_id: id,
      user_id: req.user.id,
      user_name: req.user.name || 'Anonymous',
      text,
    }).select().single();

    if (error) throw error;
    const { data: post } = await supabase.from('community_posts').select('comments_count').eq('post_id', id).single();
    await supabase.from('community_posts').update({ comments_count: (post?.comments_count || 0) + 1 }).eq('post_id', id);

    res.status(201).json({ comment });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

router.get('/posts/:id/comments', async (req, res) => {
  try {
    const { id } = req.params;
    const { data: comments, error } = await supabase
      .from('community_comments')
      .select('*')
      .eq('post_id', id)
      .order('created_at', { ascending: true });
    if (error) throw error;
    res.json({ comments: comments || [] });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

module.exports = router;
