const express = require('express');
const router = express.Router();
const axios = require('axios');

router.get('/nearby', async (req, res) => {
  try {
    const { lat, lon, radius = 5000 } = req.query;
    if (!lat || !lon) return res.status(400).json({ error: 'lat and lon query params required' });

    const query = `
      [out:json];
      (
        node["shop"="agrarian"](around:${radius},${lat},${lon});
        node["shop"="fertilizer"](around:${radius},${lat},${lon});
        node["shop"="pesticide"](around:${radius},${lat},${lon});
        node["shop"="agricultural_supplies"](around:${radius},${lat},${lon});
        way["shop"="agrarian"](around:${radius},${lat},${lon});
        way["shop"="agricultural_supplies"](around:${radius},${lat},${lon});
      );
      out body;
    `;

    const r = await axios.post('https://overpass-api.de/api/interpreter', `data=${encodeURIComponent(query)}`, {
      headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
      timeout: 10000,
    });

    const stores = (r.data.elements || []).map(el => ({
      id: el.id,
      name: el.tags?.name || `${el.tags?.shop || 'Agri'} Store`,
      lat: el.lat || el.center?.lat,
      lon: el.lon || el.center?.lon,
      type: el.tags?.shop || 'agricultural_supplies',
      address: el.tags?.['addr:full'] || el.tags?.address || '',
      phone: el.tags?.phone || '',
      openingHours: el.tags?.opening_hours || '',
    }));

    res.json({ stores, count: stores.length, radius: Number(radius) });
  } catch (err) {
    console.error('Failed to fetch nearby stores:', err.message);
    res.status(500).json({ error: 'Failed to fetch nearby stores', detail: err.message });
  }
});

module.exports = router;
