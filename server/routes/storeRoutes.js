const express = require('express');
const router = express.Router();
const axios = require('axios');

const KARNATAKA_STORES = {
  Bengaluru: [
    { name: 'Krishik Sarige Agri Solutions', type: 'agricultural_supplies', lat: 12.9716, lon: 77.5946, phone: '080-23456789', address: 'MG Road, Bengaluru' },
    { name: 'NFL Fertilizer Depot', type: 'fertilizer', lat: 12.9352, lon: 77.6245, phone: '080-25678901', address: 'JC Road, Bengaluru' },
    { name: 'Rasi Seeds Store', type: 'agricultural_supplies', lat: 12.9551, lon: 77.6423, phone: '080-27890123', address: 'Koramangala, Bengaluru' },
    { name: 'Bayer CropScience', type: 'pesticide', lat: 12.9856, lon: 77.6645, phone: '080-29012345', address: 'Whitefield, Bengaluru' },
    { name: 'Gromax Agri Equipments', type: 'agrarian', lat: 12.9166, lon: 77.6055, phone: '080-21234567', address: 'BTM Layout, Bengaluru' },
    { name: 'Sabari Fertilizers', type: 'fertilizer', lat: 12.9045, lon: 77.5856, phone: '080-23456780', address: 'Jayanagar, Bengaluru' },
    { name: 'Amruth Agri Clinic', type: 'agricultural_supplies', lat: 12.9345, lon: 77.5654, phone: '080-25678902', address: 'Basavanagudi, Bengaluru' },
    { name: 'UAS Seed Store', type: 'agricultural_supplies', lat: 13.0213, lon: 77.5831, phone: '080-27890124', address: 'Hebbal, Bengaluru' },
  ],
  Gulbarga: [
    { name: 'Gulbarga Agro Centre', type: 'agricultural_supplies', lat: 17.3297, lon: 76.8343, phone: '08472-256789', address: 'Station Road, Gulbarga' },
    { name: 'Basaveshwar Fertilizers', type: 'fertilizer', lat: 17.3356, lon: 76.8456, phone: '08472-234567', address: 'S B Temple Road, Gulbarga' },
    { name: 'Shree Renuka Pesticides', type: 'pesticide', lat: 17.3421, lon: 76.8567, phone: '08472-212345', address: 'M G Road, Gulbarga' },
    { name: 'KVK Agri Supply', type: 'agricultural_supplies', lat: 17.3567, lon: 76.8234, phone: '08472-290123', address: 'Jail Road, Gulbarga' },
  ],
  Davangere: [
    { name: 'Davangere Fertilizer Mart', type: 'fertilizer', lat: 14.4644, lon: 75.9742, phone: '08192-256789', address: 'P B Road, Davangere' },
    { name: 'Bhadra Agri Stores', type: 'agricultural_supplies', lat: 14.4723, lon: 75.9845, phone: '08192-234567', address: 'Bypass Road, Davangere' },
  ],
  Mysuru: [
    { name: 'Mysore Agri Inputs', type: 'agricultural_supplies', lat: 12.2958, lon: 76.6394, phone: '0821-256789', address: 'K R Mohalla, Mysuru' },
    { name: 'Cauvery Fertilizer Centre', type: 'fertilizer', lat: 12.3123, lon: 76.6456, phone: '0821-234567', address: 'Hunsur Road, Mysuru' },
  ],
  Hubballi: [
    { name: 'KLE Agri Store', type: 'agricultural_supplies', lat: 15.3567, lon: 75.1345, phone: '0836-256789', address: 'Gokul Road, Hubballi' },
    { name: 'North Karnataka Fertilizers', type: 'fertilizer', lat: 15.3678, lon: 75.1456, phone: '0836-234567', address: 'PB Road, Hubballi' },
  ],
};

const CITY_COORDS = {
  Bengaluru: { lat: 12.9716, lon: 77.5946 },
  Gulbarga: { lat: 17.3297, lon: 76.8343 },
  Davangere: { lat: 14.4644, lon: 75.9742 },
  Mysuru: { lat: 12.2958, lon: 76.6394 },
  Hubballi: { lat: 15.3647, lon: 75.1239 },
};

function findNearestCity(lat, lon) {
  const R = 6371;
  let minDist = Infinity;
  let nearest = 'Bengaluru';
  for (const [city, coords] of Object.entries(CITY_COORDS)) {
    const dLat = (coords.lat - lat) * Math.PI / 180;
    const dLon = (coords.lon - lon) * Math.PI / 180;
    const a = Math.sin(dLat/2)**2 + Math.cos(lat * Math.PI / 180) * Math.cos(coords.lat * Math.PI / 180) * Math.sin(dLon/2)**2;
    const dist = R * 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1-a));
    if (dist < minDist) { minDist = dist; nearest = city; }
  }
  return { city: nearest, dist: minDist };
}

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
        node["shop"="seeds"](around:${radius},${lat},${lon});
        node["shop"="farm"](around:${radius},${lat},${lon});
        node["shop"="agrochemicals"](around:${radius},${lat},${lon});
        way["shop"="agricultural_supplies"](around:${radius},${lat},${lon});
        way["shop"="agrarian"](around:${radius},${lat},${lon});
      );
      out body;
    `;

    let stores = [];

    try {
      const r = await axios.post('https://overpass-api.de/api/interpreter', `data=${encodeURIComponent(query)}`, {
        headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
        timeout: 8000,
      });
      stores = (r.data.elements || []).map(el => ({
        id: `osm-${el.id}`,
        name: el.tags?.name || `${el.tags?.shop || 'Agri'} Store`,
        lat: el.lat || el.center?.lat,
        lon: el.lon || el.center?.lon,
        type: el.tags?.shop || 'agricultural_supplies',
        address: el.tags?.['addr:full'] || el.tags?.address || '',
        phone: el.tags?.phone || '',
        openingHours: el.tags?.opening_hours || '',
      }));
    } catch {}

    const nearest = findNearestCity(Number(lat), Number(lon));
    if (nearest.dist < 300) {
      const localStores = (KARNATAKA_STORES[nearest.city] || []).map((s, i) => ({
        id: `local-${nearest.city}-${i}`,
        ...s,
      }));
      const existingIds = new Set(stores.map(s => s.name.toLowerCase()));
      localStores.forEach(s => { if (!existingIds.has(s.name.toLowerCase())) stores.push(s); });
    }

    stores = stores.slice(0, 50);

    res.json({ stores, count: stores.length, radius: Number(radius), region: nearest.dist < 300 ? nearest.city : null });
  } catch (err) {
    console.error('Failed to fetch nearby stores:', err.message);
    res.status(500).json({ error: 'Failed to fetch nearby stores', detail: err.message });
  }
});

module.exports = router;
