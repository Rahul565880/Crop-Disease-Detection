const express = require('express');
const router = express.Router();
const supabase = require('../supabase');
const { authenticate } = require('../middleware/auth');

router.post('/subscribe', authenticate, async (req, res) => {
  try {
    const { subscription } = req.body;
    if (!subscription) return res.status(400).json({ error: 'Subscription required' });

    const { data: existing } = await supabase
      .from('push_subscriptions')
      .select('id')
      .eq('user_id', req.userId)
      .single();

    if (existing) {
      await supabase.from('push_subscriptions').update({ subscription, updated_at: new Date() }).eq('id', existing.id);
    } else {
      await supabase.from('push_subscriptions').insert({ user_id: req.userId, subscription });
    }

    res.json({ message: 'Subscribed' });
  } catch (error) {
    console.error('Subscribe error:', error);
    res.status(500).json({ error: 'Subscription failed' });
  }
});

router.delete('/unsubscribe', authenticate, async (req, res) => {
  try {
    await supabase.from('push_subscriptions').delete().eq('user_id', req.userId);
    res.json({ message: 'Unsubscribed' });
  } catch (error) {
    res.status(500).json({ error: 'Unsubscribe failed' });
  }
});

module.exports = router;
