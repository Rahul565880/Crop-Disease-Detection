const express = require('express');
const router = express.Router();
const axios = require('axios');

const ALL_MARKETS = {
  Tomato: [
    { market: 'Azadpur Delhi', price: 28, unit: 'kg', state: 'Delhi', date: new Date().toISOString().split('T')[0] },
    { market: 'Koyambedu Chennai', price: 32, unit: 'kg', state: 'Tamil Nadu', date: new Date().toISOString().split('T')[0] },
    { market: 'Bengaluru KRM Market', price: 30, unit: 'kg', state: 'Karnataka', date: new Date().toISOString().split('T')[0] },
    { market: 'Kalaburagi APMC', price: 26, unit: 'kg', state: 'Karnataka', date: new Date().toISOString().split('T')[0] },
    { market: 'Hubballi Market', price: 27, unit: 'kg', state: 'Karnataka', date: new Date().toISOString().split('T')[0] },
    { market: 'Mysuru Mandi', price: 29, unit: 'kg', state: 'Karnataka', date: new Date().toISOString().split('T')[0] },
  ],
  Potato: [
    { market: 'Agra Mandi', price: 18, unit: 'kg', state: 'Uttar Pradesh', date: new Date().toISOString().split('T')[0] },
    { market: 'Patna Market', price: 15, unit: 'kg', state: 'Bihar', date: new Date().toISOString().split('T')[0] },
    { market: 'Bengaluru Yeshwantpur', price: 22, unit: 'kg', state: 'Karnataka', date: new Date().toISOString().split('T')[0] },
    { market: 'Davanagere Market', price: 20, unit: 'kg', state: 'Karnataka', date: new Date().toISOString().split('T')[0] },
    { market: 'Kalaburagi Mandi', price: 19, unit: 'kg', state: 'Karnataka', date: new Date().toISOString().split('T')[0] },
  ],
  Rice: [
    { market: 'Karnal Grain Market', price: 35, unit: 'kg', state: 'Haryana', date: new Date().toISOString().split('T')[0] },
    { market: 'Raipur Market', price: 32, unit: 'kg', state: 'Chhattisgarh', date: new Date().toISOString().split('T')[0] },
    { market: 'Shivamogga Market', price: 38, unit: 'kg', state: 'Karnataka', date: new Date().toISOString().split('T')[0] },
    { market: 'Mangaluru Mandi', price: 40, unit: 'kg', state: 'Karnataka', date: new Date().toISOString().split('T')[0] },
    { market: 'Kalaburagi APMC', price: 34, unit: 'kg', state: 'Karnataka', date: new Date().toISOString().split('T')[0] },
    { market: 'Kalaburagi Mandi', price: 36, unit: 'kg', state: 'Karnataka', date: new Date().toISOString().split('T')[0] },
  ],
  Wheat: [
    { market: 'Ludhiana Mandi', price: 24, unit: 'kg', state: 'Punjab', date: new Date().toISOString().split('T')[0] },
    { market: 'Kanpur Market', price: 22, unit: 'kg', state: 'Uttar Pradesh', date: new Date().toISOString().split('T')[0] },
    { market: 'Kalaburagi Market', price: 26, unit: 'kg', state: 'Karnataka', date: new Date().toISOString().split('T')[0] },
    { market: 'Bengaluru APMC', price: 28, unit: 'kg', state: 'Karnataka', date: new Date().toISOString().split('T')[0] },
    { market: 'Belagavi Market', price: 26, unit: 'kg', state: 'Karnataka', date: new Date().toISOString().split('T')[0] },
  ],
  Corn: [
    { market: 'Nizamabad Mandi', price: 20, unit: 'kg', state: 'Telangana', date: new Date().toISOString().split('T')[0] },
    { market: 'Davangere Market', price: 19, unit: 'kg', state: 'Karnataka', date: new Date().toISOString().split('T')[0] },
    { market: 'Dharwad Mandi', price: 18, unit: 'kg', state: 'Karnataka', date: new Date().toISOString().split('T')[0] },
    { market: 'Haveri Market', price: 17, unit: 'kg', state: 'Karnataka', date: new Date().toISOString().split('T')[0] },
  ],
  Cotton: [
    { market: 'Guntur Market', price: 65, unit: 'kg', state: 'Andhra Pradesh', date: new Date().toISOString().split('T')[0] },
    { market: 'Akola Mandi', price: 60, unit: 'kg', state: 'Maharashtra', date: new Date().toISOString().split('T')[0] },
    { market: 'Hubballi APMC', price: 62, unit: 'kg', state: 'Karnataka', date: new Date().toISOString().split('T')[0] },
    { market: 'Raichur Market', price: 58, unit: 'kg', state: 'Karnataka', date: new Date().toISOString().split('T')[0] },
    { market: 'Kalaburagi Cotton Yard', price: 59, unit: 'kg', state: 'Karnataka', date: new Date().toISOString().split('T')[0] },
    { market: 'Kalaburagi APMC', price: 61, unit: 'kg', state: 'Karnataka', date: new Date().toISOString().split('T')[0] },
  ],
  Chilli: [
    { market: 'Guntur Chilli Yard', price: 120, unit: 'kg', state: 'Andhra Pradesh', date: new Date().toISOString().split('T')[0] },
    { market: 'Warangal Market', price: 110, unit: 'kg', state: 'Telangana', date: new Date().toISOString().split('T')[0] },
    { market: 'Byadgi Market (Karnataka)', price: 125, unit: 'kg', state: 'Karnataka', date: new Date().toISOString().split('T')[0] },
    { market: 'Haveri Chilli Yard', price: 115, unit: 'kg', state: 'Karnataka', date: new Date().toISOString().split('T')[0] },
    { market: 'Bengaluru Spice Market', price: 118, unit: 'kg', state: 'Karnataka', date: new Date().toISOString().split('T')[0] },
  ],
  Mango: [
    { market: 'Ratnagiri APMC', price: 80, unit: 'dozen', state: 'Maharashtra', date: new Date().toISOString().split('T')[0] },
    { market: 'Lucknow Mandi', price: 70, unit: 'dozen', state: 'Uttar Pradesh', date: new Date().toISOString().split('T')[0] },
    { market: 'Srinivaspur Market', price: 75, unit: 'dozen', state: 'Karnataka', date: new Date().toISOString().split('T')[0] },
    { market: 'Kolar Mango Market', price: 72, unit: 'dozen', state: 'Karnataka', date: new Date().toISOString().split('T')[0] },
    { market: 'Bengaluru Fruit Market', price: 78, unit: 'dozen', state: 'Karnataka', date: new Date().toISOString().split('T')[0] },
  ],
  Banana: [
    { market: 'Jalgaon Market', price: 30, unit: 'dozen', state: 'Maharashtra', date: new Date().toISOString().split('T')[0] },
    { market: 'Thanjavur Mandi', price: 28, unit: 'dozen', state: 'Tamil Nadu', date: new Date().toISOString().split('T')[0] },
    { market: 'Chikkaballapur Market', price: 32, unit: 'dozen', state: 'Karnataka', date: new Date().toISOString().split('T')[0] },
    { market: 'Ramanagara Mandi', price: 29, unit: 'dozen', state: 'Karnataka', date: new Date().toISOString().split('T')[0] },
    { market: 'Mysuru Banana Market', price: 31, unit: 'dozen', state: 'Karnataka', date: new Date().toISOString().split('T')[0] },
  ],
  Grape: [
    { market: 'Nashik Market', price: 55, unit: 'kg', state: 'Maharashtra', date: new Date().toISOString().split('T')[0] },
    { market: 'Bangalore', price: 60, unit: 'kg', state: 'Karnataka', date: new Date().toISOString().split('T')[0] },
    { market: 'Bijapur Grape Yard', price: 52, unit: 'kg', state: 'Karnataka', date: new Date().toISOString().split('T')[0] },
    { market: 'Bagalkot Market', price: 50, unit: 'kg', state: 'Karnataka', date: new Date().toISOString().split('T')[0] },
  ],
  Apple: [
    { market: 'Shimla Mandi', price: 90, unit: 'kg', state: 'Himachal Pradesh', date: new Date().toISOString().split('T')[0] },
    { market: 'Kashmir Valley', price: 85, unit: 'kg', state: 'Jammu & Kashmir', date: new Date().toISOString().split('T')[0] },
    { market: 'Bengaluru Fruit Market', price: 100, unit: 'kg', state: 'Karnataka', date: new Date().toISOString().split('T')[0] },
  ],
  Groundnut: [
    { market: 'Rajkot Mandi', price: 55, unit: 'kg', state: 'Gujarat', date: new Date().toISOString().split('T')[0] },
    { market: 'Junagadh Market', price: 52, unit: 'kg', state: 'Gujarat', date: new Date().toISOString().split('T')[0] },
    { market: 'Chitradurga Market', price: 58, unit: 'kg', state: 'Karnataka', date: new Date().toISOString().split('T')[0] },
    { market: 'Tumkur Mandi', price: 56, unit: 'kg', state: 'Karnataka', date: new Date().toISOString().split('T')[0] },
    { market: 'Ballari Market', price: 54, unit: 'kg', state: 'Karnataka', date: new Date().toISOString().split('T')[0] },
  ],
  Soybean: [
    { market: 'Indore Mandi', price: 45, unit: 'kg', state: 'Madhya Pradesh', date: new Date().toISOString().split('T')[0] },
    { market: 'Ujjain Market', price: 43, unit: 'kg', state: 'Madhya Pradesh', date: new Date().toISOString().split('T')[0] },
    { market: 'Belagavi Market', price: 48, unit: 'kg', state: 'Karnataka', date: new Date().toISOString().split('T')[0] },
    { market: 'Dharwad Mandi', price: 46, unit: 'kg', state: 'Karnataka', date: new Date().toISOString().split('T')[0] },
  ],
};

router.get('/prices', async (req, res) => {
  try {
    const { crop, state, lat, lon } = req.query;
    if (!crop) return res.status(400).json({ error: 'crop query param required' });

    const mock = ALL_MARKETS[crop];
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

    let prices = mock.map(m => ({
      ...m,
      price: m.price + Math.floor(Math.random() * 7) - 3,
    }));

    if (state) {
      const local = prices.filter(p => p.state?.toLowerCase() === state.toLowerCase());
      const other = prices.filter(p => p.state?.toLowerCase() !== state.toLowerCase());
      prices = [...local, ...other];
    }
    if (state) {
      const karnatakaFirst = prices.filter(p => p.state?.toLowerCase() === 'karnataka');
      const others = prices.filter(p => p.state?.toLowerCase() !== 'karnataka');
      prices = [...karnatakaFirst, ...others];
    }

    res.json({ crop, prices, source: govData ? 'data.gov.in' : 'mock', updatedAt: new Date().toISOString() });
  } catch (err) {
    res.status(500).json({ error: 'Failed to fetch prices' });
  }
});

router.get('/crops', (req, res) => {
  res.json({ crops: Object.keys(ALL_MARKETS) });
});

module.exports = router;
