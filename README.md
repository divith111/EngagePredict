# EngagePredict 🚀

**Social Media Engagement Prediction System**

A full-stack web application that predicts social media post engagement using ML-powered analysis.

![Luxury Tech Design](https://img.shields.io/badge/Design-Luxury%20Tech-gold)
![React](https://img.shields.io/badge/Frontend-React%20%2B%20Vite-blue)
![Node.js](https://img.shields.io/badge/Backend-Node.js%20%2B%20Express-green)
![Python](https://img.shields.io/badge/ML-Python%20%2B%20FastAPI-yellow)
![Firebase](https://img.shields.io/badge/Database-Firebase-orange)

## ✨ Features

- **🎯 Engagement Prediction** - ML-powered score prediction (Low/Medium/High)
- **📹 Media Analysis** - Automatic resolution, orientation & aspect ratio detection
- **💡 Actionable Feedback** - Platform-specific recommendations to boost reach
- **📊 History Tracking** - Track your content improvements over time
- **🔐 Secure Auth** - Firebase Authentication with JWT
- **📱 Mobile-First** - Responsive "Luxury Tech" design

## 🛠️ Tech Stack

| Layer | Technology |
|-------|------------|
| Frontend | React 18, Vite, Tailwind CSS, Framer Motion |
| Backend | Node.js, Express, Firebase Admin SDK |
| ML Service | Python, FastAPI, scikit-learn |
| Database | Firebase Firestore |
| Auth | Firebase Authentication |
| Storage | Firebase Storage |

## 🚀 Quick Start

### Prerequisites

- Node.js 18+
- Python 3.9+
- Firebase Project (with Auth & Firestore enabled)

### 1. Clone & Setup

```bash
git clone https://github.com/yourusername/EngagePredict.git
cd EngagePredict

# Copy environment template
cp .env.example .env
# Fill in your Firebase credentials in .env
```

### 2. Frontend Setup

```bash
cd frontend
npm install
npm run dev
# Opens at http://localhost:5173
```

### 3. Backend Setup

```bash
cd backend
npm install
npm run dev
# Runs on http://localhost:5000
```

### 4. ML Service Setup

```bash
cd ml-service
pip install -r requirements.txt
python app.py
# Runs on http://localhost:8000
```

## 📁 Project Structure

```
EngagePredict/
├── frontend/                 # React + Vite frontend
│   ├── src/
│   │   ├── components/       # Reusable UI components
│   │   ├── pages/            # Page components
│   │   ├── context/          # React Context providers
│   │   ├── config/           # Firebase config
│   │   └── services/         # API service layer
│   └── tailwind.config.js    # Tailwind + design tokens
│
├── backend/                  # Node.js + Express API
│   └── src/
│       ├── config/           # Firebase Admin config
│       ├── routes/           # API routes
│       ├── middlewares/      # Auth middleware
│       └── controllers/      # Route handlers
│
├── ml-service/               # Python FastAPI ML service
│   ├── app.py                # FastAPI endpoints
│   ├── inference.py          # ML prediction engine
│   ├── media_analyzer.py     # Media quality analysis
│   └── recommendation_engine.py  # Tips generator
│
├── ML_IMPLEMENTATION.md      # Detailed breakdown of ML models
└── .env.example              # Environment template
```

## 🎨 Design System

The UI follows a **"Luxury Tech"** aesthetic:

- **Colors**: White (#FFFFFF), Light Gray (#F8F9FA), Metallic Gold gradient
- **Typography**: Inter (body), Libre Baskerville (brand)
- **Components**: Glass cards, soft shadows, rounded corners (20-24px)
- **Animations**: Micro-interactions, shimmer effects, gauge animations

## 📱 Screenshots

*(Add your screenshots here after running the app)*

## 🔧 API Endpoints

### Backend API (Port 5000)

| Method | Endpoint | Description |
|--------|----------|-------------|
| GET | `/health` | Health check |
| GET | `/api/auth/me` | Get current user |
| POST | `/api/predict` | Analyze content |
| GET | `/api/history` | Get prediction history |
| DELETE | `/api/history/:id` | Delete prediction |

### ML Service API (Port 8000)

| Method | Endpoint | Description |
|--------|----------|-------------|
| GET | `/health` | Health check |
| POST | `/predict` | Get ML prediction |
| POST | `/analyze-media` | Analyze uploaded media |

## 🚢 Deployment

### Frontend (Vercel)

```bash
cd frontend
npm run build
# Deploy to Vercel
```

### Backend (Render/Railway)

1. Set environment variables in dashboard
2. Start command: `npm start`

### ML Service (Render/Railway)

1. Set Python version: 3.9+
2. Start command: `uvicorn app:app --host 0.0.0.0 --port $PORT`

## 📄 License

GPL-3.0 License - See [LICENSE](LICENSE) for details.

## 👨‍💻 Author

**Divith**