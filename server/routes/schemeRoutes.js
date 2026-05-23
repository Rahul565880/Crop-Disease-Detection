const express = require('express');
const router = express.Router();

const SCHEMES = [
  {
    id: 'pm-kisan',
    name: 'PM-KISAN Samman Nidhi',
    type: 'direct_benefit',
    benefit: '₹6,000/year in 3 equal installments',
    eligibility: ['All farmer families with landholding'],
    howToApply: 'Visit PM-KISAN portal (pmkisan.gov.in) or nearest Common Service Centre',
    icon: '💰',
    ministry: 'Ministry of Agriculture',
  },
  {
    id: 'pmfby',
    name: 'Pradhan Mantri Fasal Bima Yojana (PMFBY)',
    type: 'insurance',
    benefit: 'Crop insurance at nominal premium (2% kharif, 1.5% rabi)',
    eligibility: ['All farmers growing notified crops', 'Loanee and non-loanee farmers'],
    howToApply: 'Through your bank branch or nearest agriculture office',
    icon: '🛡️',
    ministry: 'Ministry of Agriculture',
  },
  {
    id: 'kcc',
    name: 'Kisan Credit Card (KCC)',
    type: 'credit',
    benefit: 'Short-term crop loans up to ₹3 lakh at 7% interest (4% prompt repayment rebate)',
    eligibility: ['All farmers', 'Sharecroppers', 'Tenant farmers'],
    howToApply: 'Visit any nationalized bank or regional rural bank branch',
    icon: '💳',
    ministry: 'Ministry of Finance',
  },
  {
    id: 'soil-health',
    name: 'Soil Health Card Scheme',
    type: 'advisory',
    benefit: 'Free soil testing and nutrient recommendations every 3 years',
    eligibility: ['All farmers'],
    howToApply: 'Visit your nearest Krishi Vigyan Kendra or agriculture department',
    icon: '🧪',
    ministry: 'Ministry of Agriculture',
  },
  {
    id: 'pmksy',
    name: 'Pradhan Mantri Krishi Sinchayee Yojana',
    type: 'subsidy',
    benefit: 'Subsidy on micro-irrigation (drip/sprinkler) up to 55%',
    eligibility: ['Small and marginal farmers', 'All farmers for certain components'],
    howToApply: 'Apply through state agriculture department or online portal',
    icon: '💧',
    ministry: 'Ministry of Agriculture',
  },
  {
    id: 'neem-coating',
    name: 'Neem Coated Urea Scheme',
    type: 'subsidy',
    benefit: 'Subsidized neem-coated urea at controlled rates',
    eligibility: ['All farmers'],
    howToApply: 'Available at authorized fertilizer retailers with valid KCC',
    icon: '🧴',
    ministry: 'Ministry of Chemicals and Fertilizers',
  },
  {
    id: 'pmfme',
    name: 'PM Formalisation of Micro Food Processing Enterprises',
    type: 'subsidy',
    benefit: 'Credit-linked subsidy up to 35% for food processing units',
    eligibility: ['Individual farmers', 'FPOs', 'Self-help groups'],
    howToApply: 'Apply through state nodal agency or PMFME portal',
    icon: '🏭',
    ministry: 'Ministry of Food Processing Industries',
  },
  {
    id: 'agri-infra',
    name: 'Agriculture Infrastructure Fund',
    type: 'credit',
    benefit: 'Low-interest loans up to ₹2 crore for post-harvest infrastructure',
    eligibility: ['Farmers', 'FPOs', 'Agri-entrepreneurs', 'Startups'],
    howToApply: 'Apply through eligible lending institutions or online portal',
    icon: '🏗️',
    ministry: 'Ministry of Agriculture',
  },
  {
    id: 'paramparagat',
    name: 'Paramparagat Krishi Vikas Yojana (PKVY)',
    type: 'subsidy',
    benefit: '₹50,000/ha over 3 years for organic farming clusters',
    eligibility: ['Groups of farmers forming clusters', 'Certified organic farms'],
    howToApply: 'Through state agriculture department or Soil Health Management division',
    icon: '🌿',
    ministry: 'Ministry of Agriculture',
  },
  {
    id: 'mgnrega',
    name: 'MGNREGA for Farmers',
    type: 'employment',
    benefit: '100 days guaranteed wage employment for farm-related work',
    eligibility: ['Adult rural household members willing to do unskilled work'],
    howToApply: 'Apply at Gram Panchayat office or through job card',
    icon: '🔧',
    ministry: 'Ministry of Rural Development',
  },
  {
    id: 'e-NAM',
    name: 'e-National Agriculture Market (e-NAM)',
    type: 'market',
    benefit: 'Online trading platform for better price discovery',
    eligibility: ['All farmers registered with APMC'],
    howToApply: 'Register at nearest e-NAM mandi or online at enam.gov.in',
    icon: '📈',
    ministry: 'Ministry of Agriculture',
  },
  {
    id: 'crop-insurance',
    name: 'Restructured Weather Based Crop Insurance Scheme (RWBCIS)',
    type: 'insurance',
    benefit: 'Weather-index based insurance coverage',
    eligibility: ['All farmers in notified areas', 'Both loanee and non-loanee'],
    howToApply: 'Through designated banks or insurance company branches',
    icon: '🌤️',
    ministry: 'Ministry of Agriculture',
  },
];

router.get('/', (req, res) => {
  try {
    const { type, search } = req.query;
    let filtered = [...SCHEMES];

    if (type) filtered = filtered.filter(s => s.type === type);
    if (search) {
      const q = search.toLowerCase();
      filtered = filtered.filter(s => s.name.toLowerCase().includes(q) || s.benefit.toLowerCase().includes(q) || s.ministry.toLowerCase().includes(q));
    }

    res.json({ schemes: filtered, total: filtered.length });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

router.get('/types', (req, res) => {
  const types = [...new Set(SCHEMES.map(s => s.type))];
  res.json({ types });
});

module.exports = router;
