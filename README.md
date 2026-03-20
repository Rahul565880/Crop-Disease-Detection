# 🌾 Crop Disease Detection Application

[![Live Demo](https://img.shields.io/badge/Live%20Demo-Vercel-black?style=flat&logo=vercel)](https://crop-disease-detection-phi.vercel.app)
[![API](https://img.shields.io/badge/API-Render-blue?style=flat&logo=render)](https://crop-disease-detection-98fp.onrender.com)

A full-stack web application that allows farmers to upload images of crop leaves and detect diseases using AI/ML. The system analyzes images and returns disease name, confidence score, severity, and treatment suggestions.

## ✨ New Features
* 📱 **Share to WhatsApp**: Easily share scan reports and disease details.
* 🖼️ **Multi-Image Upload**: Analyze multiple crop leaves at once.
* 🛒 **Medicine Shop**: Buy recommended treatments directly from Amazon/Flipkart.
* 🌦️ **Weather Alerts**: Real-time disease risk alerts based on local weather conditions.
* 🌍 **Multi-language**: Supports English, Hindi, Kannada, and Telugu.

## 📋 Features
### User Features
- User registration and login (JWT authentication)
- Upload crop images (camera or gallery)
- Get disease prediction results with confidence score
- View treatment suggestions (chemical + organic)
- View previous scan history
- Multi-language support

### Admin Features
- Manage disease database (CRUD operations)
- Update treatment details
- Monitor system usage

## 🏗️ Tech Stack
- **Frontend:** React.js with Vite
- **Backend:** Node.js with Express
- **Database:** **Supabase (PostgreSQL)**
- **AI/ML:** TensorFlow/Keras with FastAPI
- **Authentication:** JWT

## 📂 Project Structure
```
crop-disease-detection/
├── client/                 # React Frontend
│   ├── src/
│   │   ├── components/    # Reusable components
│   │   ├── pages/        # Page components
│   │   ├── context/      # React Context
│   │   ├── services/    # API services
│   │   ├── locales/      # i18n translations
│   │   └── styles/       # CSS styles
│   └── package.json
│
├── server/                # Node.js Backend
│   ├── controllers/    # Route controllers
│   ├── middleware/      # Auth middleware
│   ├── routes/         # API routes
│   ├── services/       # Supabase services
│   ├── utils/          # Utility functions
│   └── package.json
│
└── ml-service/           # Python AI Service
    ├── models/          # Trained model
    ├── train.py        # Training script
    ├── app.py          # FastAPI server
    └── requirements.txt
```

## 🚀 Getting Started

### Prerequisites
- Node.js (v18+)
- Python (v3.9+)
- Supabase Account (for Database)

### Backend Setup

1. Navigate to the server directory:
```bash
cd server
```

2. Install dependencies:
```bash
npm install
```

3. Create `.env` file:
```env
PORT=10000
NODE_ENV=development

# Supabase Configuration
SUPABASE_URL=https://your-project.supabase.co
SUPABASE_ANON_KEY=your-anon-key

JWT_SECRET=your-secret-key
JWT_EXPIRES_IN=7d

ML_SERVICE_URL=http://localhost:8000
```

4. Setup Database (Supabase):
- Create a project on Supabase.
- Run the SQL setup script (available in `server/supabase-setup.sql`) to create tables.

5. Start the server:
```bash
npm run dev
```

### ML Service Setup

1. Navigate to the ml-service directory:
```bash
cd ml-service
```

2. Create virtual environment and install dependencies:
```bash
python -m venv venv
pip install -r requirements.txt
```

3. Start the ML service:
```bash
python app.py
```

### Frontend Setup

1. Navigate to the client directory:
```bash
cd client
```

2. Install dependencies:
```bash
npm install
```

3. Create `.env` file:
```env
VITE_API_URL=http://localhost:10000/api
```

4. Start the development server:
```bash
npm run dev
```

## 🔌 API Endpoints

### Authentication
| Method | Endpoint | Description |
|--------|----------|-------------|
| POST | /api/auth/register | Register new user |
| POST | /api/auth/login | Login user |
| GET | /api/auth/profile | Get user profile |

### Scans
| Method | Endpoint | Description |
|--------|----------|-------------|
| POST | /api/scans/upload | Upload and analyze image |
| GET | /api/scans/:id | Get scan result |
| GET | /api/scans | Get user scan history |

### Diseases
| Method | Endpoint | Description |
|--------|----------|-------------|
| GET | /api/diseases | List all diseases |

## 🤖 AI/ML Model
The application uses a CNN model based on MobileNetV2 architecture trained on the PlantVillage dataset. 

**Supported Crops:**
- **Tomato:** Healthy, Early Blight, Late Blight
- **Potato:** Healthy, Early Blight, Late Blight
- **Corn:** Healthy, Common Rust, Northern Leaf Blight
- **Apple:** Healthy, Apple Scab, Cedar Apple Rust
- **Rice:** Healthy, Blast, Brown Spot
- **Wheat:** Healthy, Powdery Mildew, Rust
- **Grape:** Healthy, Black Rot, Leaf Blight
- **Banana:** Healthy, Sigatoka, Panama Disease
- **Cotton, Chilli, Turmeric, Sugarcane, Soybean**

## 📝 Environment Variables

### Server (.env)
```
PORT=10000
SUPABASE_URL=https://your-project.supabase.co
SUPABASE_ANON_KEY=your-key
JWT_SECRET=your-secret
```

### Frontend (.env)
```
VITE_API_URL=https://your-api.onrender.com/api
```

## 📦 Deployment

### Frontend
- **Platform:** Vercel
- **Live:** [crop-disease-detection-phi.vercel.app](https://crop-disease-detection-phi.vercel.app)

### Backend
- **Platform:** Render
- **Live:** [crop-disease-detection-98fp.onrender.com](https://crop-disease-detection-98fp.onrender.com)

### Database
- **Platform:** Supabase (PostgreSQL Cloud)

## 📄 License
This project is for educational purposes.

## 🙏 Acknowledgments
- PlantVillage Dataset
- TensorFlow/Keras
- React.js
