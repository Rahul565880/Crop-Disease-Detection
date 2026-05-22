const express = require('express');
const router = express.Router();
const supabase = require('../supabase');
const { authenticate } = require('../middleware/auth');

router.get('/outbreaks', async (req, res) => {
  try {
    const { crop, disease, days } = req.query;
    let query = supabase.from('scans')
      .select('scan_id, disease_name, crop_type, latitude, longitude, created_at')
      .not('latitude', 'is', null)
      .not('longitude', 'is', null)
      .order('created_at', { ascending: false })
      .limit(200);

    if (crop) query = query.eq('crop_type', crop);
    if (disease) query = query.eq('disease_name', disease);
    if (days) {
      const since = new Date(Date.now() - days * 86400000).toISOString();
      query = query.gte('created_at', since);
    }

    const { data } = await query;
    res.json({ outbreaks: data || [] });
  } catch (error) {
    console.error('Map error:', error);
    res.json({ outbreaks: [] });
  }
});

router.put('/scans/:id/location', authenticate, async (req, res) => {
  try {
    const { latitude, longitude } = req.body;
    if (!latitude || !longitude) return res.status(400).json({ error: 'lat/lon required' });

    await supabase.from('scans').update({ latitude, longitude }).eq('scan_id', req.params.id).eq('user_id', req.userId);
    res.json({ message: 'Location saved' });
  } catch (error) {
    res.status(500).json({ error: 'Failed to save location' });
  }
});

module.exports = router;
