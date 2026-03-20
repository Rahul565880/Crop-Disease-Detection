# 🌾 Crop Disease Detection Application

A full-stack web application that allows farmers to upload images of crop leaves and detect diseases using AI/ML models. The system analyzes images and returns disease name, confidence score, and treatment suggestions.

## 📋 Features

### User Features
- User registration and login (JWT authentication)
- Upload crop images (camera or gallery)
- Get disease prediction results
- View confidence percentage
- Get treatment suggestions (chemical + organic)
- View previous scan history
- Multi-language support (English, Hindi, Kannada)

### Admin Features
- Manage disease database (CRUD operations)
- Update treatment details
- Monitor system usage
- Manage users

## 🏗️ Tech Stack

- **Frontend:** React.js with Vite
- **Backend:** Node.js with Express
- **Database:** MySQL with Sequelize ORM
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
│   ├── config/          # Database config
│   ├── controllers/    # Route controllers
│   ├── middleware/      # Auth middleware
│   ├── models/         # Sequelize models
│   ├── routes/         # API routes
│   ├── utils/          # Utility functions
│   └── package.json
│
└── ml-service/           # Python AI Service
    ├── models/          # Trained model
    ├── train.py        # Training script
    ├── predict.py      # Prediction logic
    ├── app.py          # FastAPI server
    └── requirements.txt
```

## 🚀 Getting Started

### Prerequisites

- Node.js (v18+)
- Python (v3.9+)
- MySQL (v8.0+)

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
PORT=5000
NODE_ENV=development

DB_HOST=localhost
DB_USER=root
DB_PASSWORD=your_password
DB_NAME=crop_disease_db

JWT_SECRET=your-secret-key
JWT_EXPIRES_IN=7d

ML_SERVICE_URL=http://localhost:8000
```

4. Setup database:
```bash
npm run db:setup
```

5. Start the server:
```bash
npm run dev
```

### ML Service Setup

1. Navigate to the ml-service directory:
```bash
cd ml-service
```

2. Create virtual environment:
```bash
python -m venv venv
source venv/bin/activate  # On Windows: venv\Scripts\activate
```

3. Install dependencies:
```bash
pip install -r requirements.txt
```

4. (Optional) Train the model:
```bash
python train.py /path/to/plantvillage/dataset
```

5. Start the ML service:
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

3. Start the development server:
```bash
npm run dev
```

The application will be available at `http://localhost:3000`

## 🔌 API Endpoints

### Authentication
| Method | Endpoint | Description |
|--------|----------|-------------|
| POST | /api/auth/register | Register new user |
| POST | /api/auth/login | Login user |
| GET | /api/auth/profile | Get user profile |
| PUT | /api/auth/profile | Update profile |

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
| GET | /api/diseases/:id | Get disease details |

### Admin
| Method | Endpoint | Description |
|--------|----------|-------------|
| GET | /api/admin/users | List all users |
| DELETE | /api/admin/users/:id | Delete user |
| POST | /api/admin/diseases | Create disease |
| PUT | /api/admin/diseases/:id | Update disease |
| DELETE | /api/admin/diseases/:id | Delete disease |
| GET | /api/admin/stats | Get system statistics |

## 🤖 AI/ML Model

The application uses a CNN model based on MobileNetV2 architecture trained on the PlantVillage dataset. The model can identify:

- **Tomato:** Healthy, Early Blight, Late Blight, Leaf Mold, Septoria Leaf Spot, Spider Mites, Target Spot, Mosaic Virus, Leaf Curl Virus
- **Potato:** Healthy, Early Blight, Late Blight
- **Corn:** Healthy, Northern Leaf Blight, Common Rust, Gray Leaf Spot
- **Apple:** Healthy, Apple Scab, Black Rot, Cedar Apple Rust

## 📝 Environment Variables

### Server (.env)
```
PORT=5000
NODE_ENV=development
DB_HOST=localhost
DB_USER=root
DB_PASSWORD=
DB_NAME=crop_disease_db
JWT_SECRET=your-secret-key
ML_SERVICE_URL=http://localhost:8000
```

## 🧪 Testing

To run tests (when implemented):
```bash
cd client
npm test
```

## 📦 Deployment

### Frontend
- Deploy to Vercel or Netlify

### Backend
- Deploy to Render, Railway, or AWS EC2

### ML Service
- Deploy to Render with Python support

### Database
- Use MongoDB Atlas for cloud database

## 📄 License

This project is for educational purposes.

## 🙏 Acknowledgments

- PlantVillage Dataset
- TensorFlow/Keras
- React.js
