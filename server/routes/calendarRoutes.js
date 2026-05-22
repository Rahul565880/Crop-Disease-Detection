const express = require('express');
const router = express.Router();

const cropCalendar = {
  Tomato: { sow: 'Jun-Jul', transplant: 'Jul-Aug', harvest: 'Oct-Dec', fertilizer: 'NPK 60:30:30' },
  Potato: { sow: 'Oct-Nov', transplant: null, harvest: 'Jan-Feb', fertilizer: 'NPK 120:80:100' },
  Corn: { sow: 'Jun-Jul', transplant: null, harvest: 'Sep-Oct', fertilizer: 'NPK 80:40:40' },
  Cotton: { sow: 'Apr-May', transplant: null, harvest: 'Nov-Dec', fertilizer: 'NPK 100:50:50' },
  Chilli: { sow: 'Jul-Aug', transplant: 'Sep-Oct', harvest: 'Dec-Mar', fertilizer: 'NPK 60:30:30' },
  Rice: { sow: 'Jun-Jul', transplant: 'Jul-Aug', harvest: 'Oct-Nov', fertilizer: 'NPK 120:60:60' },
  Wheat: { sow: 'Oct-Nov', transplant: null, harvest: 'Mar-Apr', fertilizer: 'NPK 100:50:50' },
  Sugarcane: { sow: 'Jan-Mar', transplant: null, harvest: 'Nov-Feb', fertilizer: 'NPK 150:60:60' },
  Turmeric: { sow: 'Apr-May', transplant: null, harvest: 'Dec-Jan', fertilizer: 'NPK 60:30:60' },
  Banana: { sow: 'Jun-Jul', transplant: null, harvest: '12-14 months', fertilizer: 'NPK 200:60:300' },
  Grape: { sow: 'Jan-Feb', transplant: null, harvest: 'May-Jun', fertilizer: 'NPK 80:40:80' },
  Apple: { sow: 'Feb-Mar', transplant: null, harvest: 'Aug-Oct', fertilizer: 'NPK 70:35:70' },
  Mango: { sow: 'Jun-Jul', transplant: null, harvest: 'May-Jul', fertilizer: 'NPK 100:50:100' },
  Groundnut: { sow: 'Jun-Jul', transplant: null, harvest: 'Sep-Oct', fertilizer: 'NPK 20:60:40' },
  Soybean: { sow: 'Jun-Jul', transplant: null, harvest: 'Sep-Oct', fertilizer: 'NPK 30:60:40' }
};

router.get('/', (req, res) => {
  res.json({ crops: cropCalendar });
});

router.get('/:crop', (req, res) => {
  const crop = req.params.crop;
  const info = cropCalendar[crop];
  if (!info) return res.status(404).json({ error: 'Crop not found' });
  res.json({ crop, ...info });
});

module.exports = router;
