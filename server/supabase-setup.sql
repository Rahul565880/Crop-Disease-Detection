-- =============================================
-- CROP DISEASE DETECTION APP - DATABASE SETUP
-- Run this in Supabase SQL Editor
-- =============================================

-- 1. Create Users Table
CREATE TABLE IF NOT EXISTS users (
    user_id SERIAL PRIMARY KEY,
    name VARCHAR(100) NOT NULL,
    email VARCHAR(255) NOT NULL UNIQUE,
    password_hash VARCHAR(255) NOT NULL,
    role VARCHAR(20) DEFAULT 'user',
    language VARCHAR(10) DEFAULT 'en',
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- 2. Create Diseases Table
CREATE TABLE IF NOT EXISTS diseases (
    disease_id SERIAL PRIMARY KEY,
    disease_name VARCHAR(100) NOT NULL,
    disease_code VARCHAR(50) NOT NULL UNIQUE,
    crop_type VARCHAR(50) NOT NULL,
    description TEXT,
    symptoms TEXT,
    severity VARCHAR(20) DEFAULT 'medium',
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- 3. Create Treatments Table
CREATE TABLE IF NOT EXISTS treatments (
    treatment_id SERIAL PRIMARY KEY,
    disease_id INTEGER NOT NULL REFERENCES diseases(disease_id) ON DELETE CASCADE,
    chemical_solution TEXT,
    organic_solution TEXT,
    prevention_methods TEXT,
    dosage_instructions TEXT,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- 4. Create Scans Table
CREATE TABLE IF NOT EXISTS scans (
    scan_id SERIAL PRIMARY KEY,
    user_id INTEGER NOT NULL REFERENCES users(user_id) ON DELETE CASCADE,
    image_url VARCHAR(500) NOT NULL,
    disease_name VARCHAR(100),
    confidence_score DECIMAL(5, 2),
    treatment_id INTEGER REFERENCES treatments(treatment_id),
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- 5. Enable Row Level Security (RLS)
ALTER TABLE users ENABLE ROW LEVEL SECURITY;
ALTER TABLE diseases ENABLE ROW LEVEL SECURITY;
ALTER TABLE treatments ENABLE ROW LEVEL SECURITY;
ALTER TABLE scans ENABLE ROW LEVEL SECURITY;

-- 6. Create RLS Policies
-- Users can only see their own data
CREATE POLICY "Users can view own data" ON users
    FOR SELECT USING (true);

CREATE POLICY "Users can update own data" ON users
    FOR UPDATE USING (true);

-- Diseases and treatments are public read
CREATE POLICY "Diseases are viewable by all" ON diseases
    FOR SELECT USING (true);

CREATE POLICY "Treatments are viewable by all" ON treatments
    FOR SELECT USING (true);

-- Users can only see their own scans
CREATE POLICY "Users can view own scans" ON scans
    FOR SELECT USING (true);

CREATE POLICY "Users can insert own scans" ON scans
    FOR INSERT WITH CHECK (true);

CREATE POLICY "Users can delete own scans" ON scans
    FOR DELETE USING (true);

-- 7. Create Indexes for better performance
CREATE INDEX IF NOT EXISTS idx_scans_user_id ON scans(user_id);
CREATE INDEX IF NOT EXISTS idx_scans_created_at ON scans(created_at);
CREATE INDEX IF NOT EXISTS idx_diseases_disease_code ON diseases(disease_code);

-- =============================================
-- SEED DATA - Admin User
-- =============================================

-- Insert admin user (password: admin123)
INSERT INTO users (name, email, password_hash, role) 
VALUES ('Admin', 'admin@example.com', '$2a$10$rQXKxGx7gLv7Hv7vZv7v/.7Hv7vZv7Hv7vZv7Hv7vZv7Hv7vZv7vHu', 'admin')
ON CONFLICT (email) DO NOTHING;

-- =============================================
-- SEED DATA - Diseases
-- =============================================

INSERT INTO diseases (disease_name, disease_code, crop_type, description, symptoms, severity) VALUES
('Healthy', 'healthy', 'General', 'Plant appears healthy with no visible disease symptoms.', 'None - leaves are green and normal', 'low'),
('Early Blight', 'early_blight', 'Tomato/Potato', 'Fungal disease causing dark spots on leaves with concentric rings.', 'Dark brown spots with concentric rings, lower leaves affected first', 'medium'),
('Late Blight', 'late_blight', 'Tomato/Potato', 'Serious fungal disease that spreads rapidly in cool, wet conditions.', 'Water-soaked lesions, white mold on leaf undersides', 'high'),
('Leaf Mold', 'leaf_mold', 'Tomato', 'Fungal disease affecting leaves in humid conditions.', 'Yellow spots on upper leaf surface, olive-green to brown mold on undersides', 'medium'),
('Septoria Leaf Spot', 'septoria', 'Tomato', 'Fungal disease causing numerous small dark spots on leaves.', 'Many small dark spots with light centers, often with dark borders', 'medium'),
('Spider Mites', 'spider_mites', 'Tomato', 'Tiny arachnids that suck sap from leaves causing stippling.', 'Fine stippling or bronzing of leaves, fine webbing', 'medium'),
('Target Spot', 'target_spot', 'Tomato', 'Fungal disease causing circular lesions with concentric rings.', 'Circular brown lesions with target-like concentric rings', 'medium'),
('Bacterial Spot', 'bacterial_spot', 'Tomato', 'Bacterial disease causing small dark spots on leaves and fruit.', 'Small dark spots that may have yellow halos', 'high'),
('Bacterial Wilt', 'bacterial_wilt', 'Tomato', 'Bacterial disease causing rapid wilting and death.', 'Sudden wilting, brown vascular tissue when stem is cut', 'high'),
('Leaf Curl Virus', 'leaf_curl', 'Tomato', 'Viral disease transmitted by whiteflies.', 'Upward leaf curling, yellowing, stunted plant growth', 'high'),
('Northern Leaf Blight', 'northern_leaf_blight', 'Corn', 'Fungal disease common in corn producing long elliptical lesions.', 'Long elliptical gray-green lesions on leaves', 'medium'),
('Common Rust', 'common_rust', 'Corn', 'Fungal disease producing rust-colored pustules.', 'Small circular orange-brown pustules on leaves', 'medium'),
('Gray Leaf Spot', 'gray_leaf_spot', 'Corn', 'Fungal disease causing rectangular gray lesions.', 'Long narrow rectangular lesions, gray to tan color', 'medium'),
('Corn Smut', 'corn_smut', 'Corn', 'Fungal disease producing large galls on ears and tassels.', 'Large grayish galls that replace kernels', 'high'),
('Southern Corn Blight', 'corn_blight', 'Corn', 'Fungal disease causing lesions on leaves.', 'Large oval lesions with tan centers and brown borders', 'medium'),
('Cotton Leaf Curl Virus', 'cotton_leaf_curl', 'Cotton', 'Viral disease transmitted by whiteflies.', 'Upward curling of leaves, thickening of veins', 'high'),
('Bacterial Blight', 'cotton_bacterial_blight', 'Cotton', 'Bacterial disease causing angular leaf spots.', 'Angular brown lesions with red borders', 'high'),
('Boll Rot', 'cotton_boll_rot', 'Cotton', 'Fungal disease causing boll rot.', 'Brown discoloration and rotting of cotton bolls', 'medium'),
('Anthracnose', 'chilli_anthracnose', 'Chilli', 'Fungal disease causing dark sunken lesions.', 'Dark sunken lesions on fruit with pink spore masses', 'high'),
('Powdery Mildew', 'chilli_powdery_mildew', 'Chilli', 'Fungal disease causing white powdery coating.', 'White powdery coating on leaves and stems', 'medium')
ON CONFLICT (disease_code) DO NOTHING;

-- =============================================
-- SEED DATA - Treatments
-- =============================================

-- Get disease IDs and insert treatments
INSERT INTO treatments (disease_id, chemical_solution, organic_solution, prevention_methods)
SELECT disease_id, 
    'Continue current care routine. Ensure proper watering and nutrition.',
    'Maintain organic fertilization, regular watering, and monitor plants regularly.',
    'Regular monitoring, proper spacing, crop rotation.'
FROM diseases WHERE disease_code = 'healthy'
ON CONFLICT DO NOTHING;

INSERT INTO treatments (disease_id, chemical_solution, organic_solution, prevention_methods)
SELECT disease_id,
    'Apply chlorothalonil or copper-based fungicides. Remove affected leaves. Improve air circulation.',
    'Apply neem oil spray weekly. Use baking soda solution (1 tbsp per gallon). Remove lower infected leaves.',
    'Rotate crops every 2-3 years. Mulch around plants. Avoid overhead watering.'
FROM diseases WHERE disease_code = 'early_blight'
ON CONFLICT DO NOTHING;

INSERT INTO treatments (disease_id, chemical_solution, organic_solution, prevention_methods)
SELECT disease_id,
    'Apply mancozeb or copper fungicide immediately. Remove and destroy infected plants.',
    'Remove infected plants immediately. Apply copper spray as preventive. Improve drainage.',
    'Use resistant varieties. Ensure good air circulation. Avoid wet foliage.'
FROM diseases WHERE disease_code = 'late_blight'
ON CONFLICT DO NOTHING;

INSERT INTO treatments (disease_id, chemical_solution, organic_solution, prevention_methods)
SELECT disease_id,
    'Apply sulfur-based fungicides. Improve ventilation. Reduce humidity.',
    'Spray with compost tea. Improve air circulation. Remove affected leaves.',
    'Keep leaves dry. Space plants properly. Use resistant varieties.'
FROM diseases WHERE disease_code = 'leaf_mold'
ON CONFLICT DO NOTHING;

INSERT INTO treatments (disease_id, chemical_solution, organic_solution, prevention_methods)
SELECT disease_id,
    'Apply copper fungicide. Remove infected leaves. Avoid overhead watering.',
    'Apply baking soda spray. Remove infected plant debris.',
    'Rotate crops. Mulch heavily. Remove plant debris at season end.'
FROM diseases WHERE disease_code = 'septoria'
ON CONFLICT DO NOTHING;

INSERT INTO treatments (disease_id, chemical_solution, organic_solution, prevention_methods)
SELECT disease_id,
    'Apply triazole or strobilurin fungicides at first sign of symptoms.',
    'Apply neem oil. Remove infected leaves. Ensure good air circulation.',
    'Use resistant hybrids. Rotate crops. Plow under crop residue.'
FROM diseases WHERE disease_code = 'common_rust'
ON CONFLICT DO NOTHING;

INSERT INTO treatments (disease_id, chemical_solution, organic_solution, prevention_methods)
SELECT disease_id,
    'No cure for infected plants. Remove and destroy infected plants. Control aphid vectors.',
    'No organic cure. Remove infected plants. Use reflective mulch to deter aphids.',
    'Use virus-free seeds. Control aphid populations. Remove weed hosts.'
FROM diseases WHERE disease_code = 'leaf_curl'
ON CONFLICT DO NOTHING;

INSERT INTO treatments (disease_id, chemical_solution, organic_solution, prevention_methods)
SELECT disease_id,
    'No cure available. Remove and destroy infected plants. Control insect vectors.',
    'Remove infected plants. Use yellow sticky traps. Introduce beneficial insects.',
    'Use resistant varieties. Control whiteflies. Remove infected plants immediately.'
FROM diseases WHERE disease_code = 'cotton_leaf_curl'
ON CONFLICT DO NOTHING;

-- =============================================
-- VERIFICATION
-- =============================================

SELECT 'Setup Complete!' as status;
SELECT 'Users:' as table_name, COUNT(*) as count FROM users;
SELECT 'Diseases:' as table_name, COUNT(*) as count FROM diseases;
SELECT 'Treatments:' as table_name, COUNT(*) as count FROM treatments;
