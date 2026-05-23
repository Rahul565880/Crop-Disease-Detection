const express = require('express');
const router = express.Router();
const axios = require('axios');

const MOCK_PRICES = {
  Tomato: [{ market: 'Azadpur Delhi', price: 28, unit: 'kg', date: new Date().toISOString().split('T')[0] }, { market: 'Koyambedu Chennai', price: 32, unit: 'kg', date: new Date().toISOString().split('T')[0] }],
  Potato: [{ market: 'Agra', price: 18, unit: 'kg', date: new Date().toISOString().split('T')[0] }, { market: 'Patna', price: 15, unit: 'kg', date: new Date().toISOString().split('T')[0] }],
  Rice: [{ market: 'Karnal', price: 35, unit: 'kg', date: new Date().toISOString().split('T')[0] }, { market: 'Raipur', price: 32, unit: 'kg', date: new Date().toISOString().split('T')[0] }],
  Wheat: [{ market: 'Ludhiana', price: 24, unit: 'kg', date: new Date().toISOString().split('T')[0] }, { market: 'Kanpur', price: 22, unit: 'kg', date: new Date().toISOString().split('T')[0] }],
  Corn: [{ market: 'Nizamabad', price: 20, unit: 'kg', date: new Date().toISOString().split('T')[0] }, { market: 'Davangere', price: 19, unit: 'kg', date: new Date().toISOString().split('T')[0] }],
  Cotton: [{ market: 'Guntur', price: 65, unit: 'kg', date: new Date().toISOString().split('T')[0] }, { market: 'Akola', price: 60, unit: 'kg', date: new Date().toISOString().split('T')[0] }],
  Chilli: [{ market: 'Guntur', price: 120, unit: 'kg', date: new Date().toISOString().split('T')[0] }, { market: 'Warangal', price: 110, unit: 'kg', date: new Date().toISOString().split('T')[0] }],
  Mango: [{ market: 'Ratnagiri', price: 80, unit: 'dozen', date: new Date().toISOString().split('T')[0] }, { market: 'Lucknow', price: 70, unit: 'dozen', date: new Date().toISOString().split('T')[0] }],
  Banana: [{ market: 'Jalgaon', price: 30, unit: 'dozen', date: new Date().toISOString().split('T')[0] }, { market: 'Thanjavur', price: 28, unit: 'dozen', date: new Date().toISOString().split('T')[0] }],
  Grape: [{ market: 'Nashik', price: 55, unit: 'kg', date: new Date().toISOString().split('T')[0] }, { market: 'Bangalore', price: 60, unit: 'kg', date: new Date().toISOString().split('T')[0] }],
  Apple: [{ market: 'Shimla', price: 90, unit: 'kg', date: new Date().toISOString().split('T')[0] }, { market: 'Kashmir', price: 85, unit: 'kg', date: new Date().toISOString().split('T')[0] }],
  Groundnut: [{ market: 'Rajkot', price: 55, unit: 'kg', date: new Date().toISOString().split('T')[0] }, { market: 'Junagadh', price: 52, unit: 'kg', date: new Date().toISOString().split('T')[0] }],
  Soybean: [{ market: 'Indore', price: 45, unit: 'kg', date: new Date().toISOString().split('T')[0] }, { market: 'Ujjain', price: 43, unit: 'kg', date: new Date().toISOString().split('T')[0] }],
};

router.get('/prices', async (req, res) => {
  try {
    const { crop, state } = req.query;
    if (!crop) return res.status(400).json({ error: 'crop query param required' });

    const mock = MOCK_PRICES[crop];
    if (!mock) return res.status(404).json({ error: `No price data for ${crop}` });

    const govApiKey = process.env.DATA_GOV_API_KEY;
    let govData = null;

    if (govApiKey) {
      try {
        const url = `https://api.data.gov.in/resource/9ef84268-d588-465a-a308-a864a43d0070?api-key=${govApiKey}&format=json&filters[commodity]=${encodeURIComponent(crop)}`;
        const r = await axios.get(url, { timeout: 5000 });
        govData = r.data;
      } catch {}
    }

    const prices = mock.map(m => ({
      ...m,
      price: m.price + Math.floor(Math.random() * 6) - 3,
    }));

    res.json({ crop, prices, source: govData ? 'data.gov.in' : 'mock', updatedAt: new Date().toISOString() });
  } catch (err) {
    res.status(500).json({ error: 'Failed to fetch prices' });
  }
});

router.get('/crops', (req, res) => {
  res.json({ crops: Object.keys(MOCK_PRICES) });
});

module.exports = router;
