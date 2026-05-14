# GastoTrack

Intelligent expense tracking system that automatically captures e-wallet notifications and provides AI-powered spending insights.

## Tech Stack

| Layer | Technology |
|-------|-----------|
| Mobile | React Native + Expo + JavaScript |
| Backend | Node.js + Express.js + Prisma ORM |
| Database | PostgreSQL |
| AI Service | Python + FastAPI |
| Auth | JWT (JSON Web Tokens) |

## Project Structure

```
gastotrack/
├── mobile/          # React Native + Expo app
│   ├── src/
│   │   ├── screens/ # Dashboard, History, Analytics, Budget, AI Assistant
│   │   ├── services/# Axios API client
│   │   └── utils/
│   ├── .env         # EXPO_PUBLIC_API_URL (not committed)
│   └── package.json
├── backend/         # Express.js REST API
│   ├── controllers/ # Auth, Transaction logic
│   ├── routes/      # API route definitions
│   ├── middleware/  # JWT auth middleware
│   ├── prisma/      # Database schema
│   ├── .env         # DB credentials (not committed)
│   └── package.json
└── ai-service/      # Python FastAPI service
    └── Fast_API.py
```

## Getting Started

### Prerequisites
- Node.js 18+
- PostgreSQL 14+
- Python 3.10+ (for AI service)
- Expo Go app on your phone

### Backend Setup

```bash
cd backend
npm install
cp .env.example .env      # fill in your values
npx prisma db push        # create database tables
node index.js             # start the server
```

### Mobile Setup

```bash
cd mobile
npm install
cp .env.example .env      # set EXPO_PUBLIC_API_URL to your machine's IP
npx expo start --clear
```

Scan the QR code with Expo Go on your phone. Make sure your phone and PC are on the same Wi-Fi network.

### Find your local IP (Windows)

```bash
ipconfig
# Look for IPv4 Address under your active Wi-Fi adapter
```

## Features

- User registration and login with JWT authentication
- Dashboard with spending overview and bar chart
- Manual transaction entry
- Transaction history with search and filter
- Analytics with spending breakdown and daily trends
- Budget management with AI insights
- AI Assistant screen

## Security

- Passwords hashed with bcrypt
- JWT tokens with 7-day expiry
- Rate limiting on auth endpoints (10 requests / 15 min)
- Input validation on all endpoints
- Helmet.js security headers
- CORS restricted to known origins

## Team

Chris — Lead Developer

## Capstone

BS Information Technology — 2025–2026
