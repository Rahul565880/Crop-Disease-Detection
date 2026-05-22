const express = require('express');
const router = express.Router();

const recommendations = {
  Tomato: {
    deficiency: { N: 'Urea 50kg/acre', P: 'SSP 100kg/acre', K: 'MOP 40kg/acre' },
    general: 'Apply FYM 10t/acre + NPK 60:30:30 kg/acre. Top dress Urea at 30 days.',
    disease_based: {
      early_blight: 'Reduce nitrogen. Apply potassium 10% above normal.',
      late_blight: 'Stop nitrogen. Foliar spray KNO3 1%.',
      leaf_mold: 'Increase calcium. Apply lime 200kg/acre.',
      bacterial_spot: 'Spray copper oxychloride + balanced NPK.'
    }
  },
  Rice: {
    deficiency: { N: 'Urea 60kg/acre', P: 'SSP 75kg/acre', K: 'MOP 30kg/acre' },
    general: 'Apply FYM 5t/acre + NPK 120:60:60 kg/acre. Split nitrogen application.',
    disease_based: {
      rice_blast: 'Reduce nitrogen. Apply potassium 50kg/acre.',
      brown_spot: 'Spray MnSO4 0.5%. Apply balanced NPK.',
      bacterial_blight: 'Stop nitrogen. Foliar KNO3.'
    }
  },
  Wheat: {
    deficiency: { N: 'Urea 55kg/acre', P: 'DAP 55kg/acre', K: 'MOP 25kg/acre' },
    general: 'Apply NPK 100:50:50 kg/acre. Half nitrogen at sowing, half at first irrigation.',
    disease_based: {
      wheat_rust: 'Increase potassium. Foliar spray K2SO4 1%.',
      powdery_mildew: 'Reduce nitrogen. Apply sulfur 20kg/acre.'
    }
  },
  Corn: {
    deficiency: { N: 'Urea 65kg/acre', P: 'SSP 80kg/acre', K: 'MOP 20kg/acre' },
    general: 'Apply NPK 80:40:40 kg/acre. Zinc sulfate 10kg/acre at sowing.',
    disease_based: {
      common_rust: 'Foliar spray ZnSO4 + KNO3.',
      northern_leaf_blight: 'Reduce N. Apply K 20% extra.',
      gray_leaf_spot: 'Balanced NPK with micronutrients.'
    }
  },
  Cotton: {
    deficiency: { N: 'Urea 50kg/acre', P: 'DAP 40kg/acre', K: 'MOP 35kg/acre' },
    general: 'Apply FYM 5t/acre + NPK 100:50:50 kg/acre.',
    disease_based: {
      cotton_leaf_curl: 'Stop nitrogen. Foliar KNO3 + ZnSO4.',
      boll_rot: 'Reduce N. Spray calcium nitrate 1%.',
      bacterial_blight: 'Copper spray + balanced NPK.'
    }
  },
  Mango: {
    deficiency: { N: 'Urea 1kg/tree', P: 'SSP 2kg/tree', K: 'MOP 1.5kg/tree' },
    general: 'FYM 20kg/tree + NPK 100:50:100 g/tree/year. Apply after harvest.',
    disease_based: {
      anthracnose: 'Spray copper fungicide. Reduce nitrogen.',
      powdery_mildew: 'Sulfur dust + increase potassium.',
      mango_malformation: 'Prune affected parts. Balanced NPK with Zn.'
    }
  },
  Groundnut: {
    deficiency: { N: 'Urea 15kg/acre', P: 'SSP 100kg/acre', K: 'MOP 20kg/acre' },
    general: 'Apply NPK 20:60:40 kg/acre. Gypsum 200kg/acre at flowering.',
    disease_based: {
      leaf_spot: 'Spray mancozeb. Maintain potassium.',
      stem_rot: 'Reduce nitrogen. Apply CaNO3 1%.',
      rust: 'Foliar KNO3 + sulfur 2kg/acre.'
    }
  },
  Soybean: {
    deficiency: { N: 'Urea 10kg/acre (starter only)', P: 'SSP 80kg/acre', K: 'MOP 20kg/acre' },
    general: 'Apply NPK 30:60:40 kg/acre. Rhizobium culture 500g/acre. No top N needed.',
    disease_based: {
      leaf_spot: 'Foliar KNO3 + copper spray.',
      rust: 'Sulfur dust + increase K.',
      bacterial_blight: 'Copper oxychloride spray. Balanced NPK.'
    }
  }
};

router.get('/', (req, res) => {
  const { crop, disease } = req.query;
  if (!crop) return res.json({ crops: Object.keys(recommendations) });

  const info = recommendations[crop];
  if (!info) return res.status(404).json({ error: 'Crop not supported' });

  const result = { crop, general: info.general, deficiency: info.deficiency };
  if (disease && info.disease_based && info.disease_based[disease]) {
    result.disease_recommendation = info.disease_based[disease];
  }
  res.json(result);
});

module.exports = router;
