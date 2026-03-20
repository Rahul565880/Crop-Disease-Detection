const { sequelize, User, Disease, Treatment, Scan } = require('../models');
const { hashPassword } = require('../utils/password');

async function setupDatabase() {
  try {
    console.log('Connecting to database...');
    await sequelize.authenticate();
    console.log('Database connected');

    console.log('Syncing models...');
    await sequelize.sync({ force: true });
    console.log('Models synced');

    await seedInitialData();

    console.log('\nDatabase setup completed successfully!');
  } catch (error) {
    console.error('Database setup failed:', error);
    throw error;
  }
}

async function seedInitialData() {
  console.log('Seeding initial data...');

  const diseases = [
    { name: 'Healthy', code: 'healthy', crop: 'General', description: 'Plant appears healthy with no visible disease symptoms.', symptoms: 'None - leaves are green and normal', severity: 'low' },
    { name: 'Early Blight', code: 'early_blight', crop: 'Tomato/Potato', description: 'Fungal disease causing dark spots on leaves with concentric rings.', symptoms: 'Dark brown spots with concentric rings, lower leaves affected first', severity: 'medium' },
    { name: 'Late Blight', code: 'late_blight', crop: 'Tomato/Potato', description: 'Serious fungal disease that spreads rapidly in cool, wet conditions.', symptoms: 'Water-soaked lesions, white mold on leaf undersides', severity: 'high' },
    { name: 'Leaf Mold', code: 'leaf_mold', crop: 'Tomato', description: 'Fungal disease affecting leaves in humid conditions.', symptoms: 'Yellow spots on upper leaf surface, olive-green to brown mold on undersides', severity: 'medium' },
    { name: 'Septoria Leaf Spot', code: 'septoria', crop: 'Tomato', description: 'Fungal disease causing numerous small dark spots on leaves.', symptoms: 'Many small dark spots with light centers, often with dark borders', severity: 'medium' },
    { name: 'Spider Mites', code: 'spider_mites', crop: 'Tomato', description: 'Tiny arachnids that suck sap from leaves causing stippling.', symptoms: 'Fine stippling or bronzing of leaves, fine webbing', severity: 'medium' },
    { name: 'Target Spot', code: 'target_spot', crop: 'Tomato', description: 'Fungal disease causing circular lesions with concentric rings.', symptoms: 'Circular brown lesions with target-like concentric rings', severity: 'medium' },
    { name: 'Mosaic Virus', code: 'mosaic_virus', crop: 'Tomato', description: 'Viral disease causing mottled leaf coloring.', symptoms: 'Mottled green and yellow leaf pattern, curling, stunted growth', severity: 'high' },
    { name: 'Leaf Curl Virus', code: 'leaf_curl', crop: 'Tomato', description: 'Viral disease transmitted by whiteflies.', symptoms: 'Upward leaf curling, yellowing, stunted plant growth', severity: 'high' },
    { name: 'Northern Leaf Blight', code: 'northern_leaf_blight', crop: 'Corn', description: 'Fungal disease common in corn producing long elliptical lesions.', symptoms: 'Long elliptical gray-green lesions on leaves', severity: 'medium' },
    { name: 'Common Rust', code: 'common_rust', crop: 'Corn', description: 'Fungal disease producing rust-colored pustules.', symptoms: 'Small circular orange-brown pustules on leaves', severity: 'medium' },
    { name: 'Gray Leaf Spot', code: 'gray_leaf_spot', crop: 'Corn', description: 'Fungal disease causing rectangular gray lesions.', symptoms: 'Long narrow rectangular lesions, gray to tan color', severity: 'medium' },
    { name: 'Apple Scab', code: 'apple_scab', crop: 'Apple', description: 'Fungal disease affecting apples causing scab-like lesions.', symptoms: 'Olive-green to brown velvety spots on leaves and fruit', severity: 'high' },
    { name: 'Black Rot', code: 'black_rot', crop: 'Apple', description: 'Fungal disease causing leaf spots and fruit rot.', symptoms: 'Purple-brown spots with concentric rings, fruit decay', severity: 'high' },
    { name: 'Cedar Apple Rust', code: 'cedar_rust', crop: 'Apple', description: 'Fungal disease requiring cedar trees as alternate host.', symptoms: 'Orange rust spots on leaves and fruit, gelatinous horns', severity: 'medium' }
  ];

  for (const disease of diseases) {
    const createdDisease = await Disease.create({
      disease_name: disease.name,
      disease_code: disease.code,
      crop_type: disease.crop,
      description: disease.description,
      symptoms: disease.symptoms,
      severity: disease.severity
    });

    const treatments = getTreatmentsForDisease(disease.code);
    await Treatment.create({
      disease_id: createdDisease.disease_id,
      chemical_solution: treatments[0],
      organic_solution: treatments[1],
      prevention_methods: treatments[2],
      dosage_instructions: 'Follow label instructions for all chemical applications. Consult local experts.'
    });
  }

  const adminPassword = await hashPassword('admin123');
  await User.create({
    name: 'Admin',
    email: 'admin@example.com',
    password_hash: adminPassword,
    role: 'admin',
    language: 'en'
  });

  console.log('Created admin user: admin@example.com / admin123');
  console.log('Initial diseases and treatments seeded');
}

function getTreatmentsForDisease(code) {
  const treatments = {
    healthy: [
      'Continue current care routine. Ensure proper watering and nutrition.',
      'Maintain organic fertilization, regular watering, and monitor plants regularly.',
      'Regular monitoring, proper spacing, crop rotation.'
    ],
    early_blight: [
      'Apply chlorothalonil or copper-based fungicides. Remove affected leaves. Improve air circulation.',
      'Apply neem oil spray weekly. Use baking soda solution (1 tbsp per gallon). Remove lower infected leaves.',
      'Rotate crops every 2-3 years. Mulch around plants. Avoid overhead watering.'
    ],
    late_blight: [
      'Apply mancozeb or copper fungicide immediately. Remove and destroy infected plants. Do not compost diseased material.',
      'Remove infected plants immediately. Apply copper spray as preventive. Improve drainage.',
      'Use resistant varieties. Ensure good air circulation. Avoid wet foliage.'
    ],
    leaf_mold: [
      'Apply sulfur-based fungicides. Improve ventilation. Reduce humidity around plants.',
      'Spray with compost tea. Improve air circulation. Remove affected leaves.',
      'Keep leaves dry. Space plants properly. Use resistant varieties.'
    ],
    septoria: [
      'Apply copper fungicide or chlorothalonil. Remove infected leaves. Avoid overhead watering.',
      'Apply baking soda spray (1 tbsp baking soda, 1 tbsp vegetable oil, 1 gallon water).',
      'Rotate crops. Mulch heavily. Remove plant debris at season end.'
    ],
    spider_mites: [
      'Apply insecticidal soap or miticide. Increase humidity around plants.',
      'Spray with strong water jet. Apply neem oil. Increase humidity.',
      'Keep plants well-watered. Avoid dusty conditions. Inspect new plants before adding.'
    ],
    target_spot: [
      'Apply broad-spectrum fungicide. Improve drainage. Remove infected material.',
      'Apply compost tea. Remove lower leaves. Improve air circulation.',
      'Rotate crops. Avoid overhead irrigation. Use mulch.'
    ],
    mosaic_virus: [
      'No cure available. Remove and destroy infected plants. Control aphid vectors.',
      'No organic cure. Remove infected plants. Use reflective mulch to deter aphids.',
      'Use virus-free seeds. Control aphid populations. Remove weed hosts.'
    ],
    leaf_curl: [
      'No cure for infected plants. Remove them. Control whitefly population with insecticides.',
      'Remove infected plants. Use yellow sticky traps. Introduce beneficial insects.',
      'Use resistant varieties. Control whiteflies. Remove infected plants immediately.'
    ],
    northern_leaf_blight: [
      'Apply triazole or strobilurin fungicides. Ensure proper nitrogen fertilization.',
      'Apply neem oil. Remove infected leaves. Improve air circulation.',
      'Use resistant hybrids. Rotate crops. Plow under crop residue.'
    ],
    common_rust: [
      'Apply triazole or strobilurin fungicides at first sign of symptoms.',
      'Apply sulfur dust. Remove infected leaves. Ensure good air circulation.',
      'Use resistant varieties. Plant early. Monitor fields regularly.'
    ],
    gray_leaf_spot: [
      'Apply strobilurin or triazole fungicides. Manage nitrogen levels.',
      'Apply compost tea. Remove infected leaves. Improve drainage.',
      'Use resistant varieties. Rotate crops. Remove crop residue.'
    ],
    apple_scab: [
      'Apply fungicides (captan or sulfur) at green tip stage. Continue through petal fall.',
      'Apply neem oil. Apply sulfur-based sprays. Remove infected leaves.',
      'Use resistant varieties. Prune for air circulation. Remove fallen leaves.'
    ],
    black_rot: [
      'Apply copper fungicides. Remove infected fruit and cankers. Prune infected branches.',
      'Apply baking soda spray. Remove infected plant parts. Improve air circulation.',
      'Prune properly. Remove mummified fruit. Avoid wounding trees.'
    ],
    cedar_rust: [
      'Apply myclobutanil or propiconazole fungicides. Remove cedar galls within 2 miles.',
      'Apply neem oil. Remove orange galls from cedars. Use reflective mulch.',
      'Remove alternate hosts (cedars) near orchard. Use resistant varieties.'
    ]
  };

  const defaultTreatment = [
    'Consult local agricultural extension for specific recommendations.',
    'Maintain plant health with proper care. Monitor regularly.',
    'Practice good garden hygiene. Rotate crops annually.'
  ];

  return treatments[code] || defaultTreatment;
}

if (require.main === module) {
  setupDatabase()
    .then(() => process.exit(0))
    .catch(() => process.exit(1));
}

module.exports = { setupDatabase };
