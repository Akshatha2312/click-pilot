# ClickPilot - Quick Start Guide

Get ClickPilot running locally in 5 minutes!

## 📋 Prerequisites

- Node.js v16+ ([download](https://nodejs.org/))
- MongoDB ([local](https://docs.mongodb.com/manual/installation/) or [Atlas free tier](https://mongodb.com/cloud/atlas))
- Git

## 🚀 Quick Start (Local Development)

### Step 1: Clone & Install

```bash
# Clone repository
git clone <your-repo-url>
cd ClickPilot

# Install backend dependencies
cd server
npm install

# Install frontend dependencies
cd ../client
npm install
```

### Step 2: Configure Environment

#### Backend (.env)

```bash
cd server
cat > .env << EOF
PORT=5000
NODE_ENV=development
MONGODB_URI=mongodb://localhost:27017/clickpilot
JWT_SECRET=dev-secret-key-change-in-production
JWT_EXPIRE=7d
CORS_ORIGIN=http://localhost:5173
EOF
```

#### Frontend (.env)

```bash
cd ../client
cat > .env << EOF
VITE_API_BASE_URL=http://localhost:5000
EOF
```

### Step 3: Start Services

#### Terminal 1 - Backend:
```bash
cd server
npm start
# Should see: "Server running on port 5000" ✅
```

#### Terminal 2 - Frontend:
```bash
cd client
npm run dev
# Should see: "Local: http://localhost:5173" ✅
```

### Step 4: Use the App

1. Open http://localhost:5173
2. Click "Sign Up"
3. Create an account
4. Create your first short link
5. View analytics!

## 🧪 Test the API

```bash
# Register
curl -X POST http://localhost:5000/api/auth/register \
  -H "Content-Type: application/json" \
  -d '{
    "name": "Test User",
    "email": "test@example.com",
    "password": "password123"
  }'

# Login (get token)
curl -X POST http://localhost:5000/api/auth/login \
  -H "Content-Type: application/json" \
  -d '{
    "email": "test@example.com",
    "password": "password123"
  }'

# Create link (replace TOKEN with your JWT)
curl -X POST http://localhost:5000/api/links/create \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer TOKEN" \
  -d '{
    "originalUrl": "https://github.com/example"
  }'
```

## 📊 Using MongoDB Atlas (Cloud)

### Setup Atlas
1. Go to https://mongodb.com/cloud/atlas
2. Create account → Create free cluster → Get connection string
3. Replace `MONGODB_URI` in `.env`:
   ```
   MONGODB_URI=mongodb+srv://user:password@cluster.mongodb.net/clickpilot
   ```

## 🏗️ Project Structure

```
ClickPilot/
├── server/              # Backend (Node/Express)
│   ├── models/          # Database schemas
│   ├── controllers/     # Business logic
│   ├── routes/          # API endpoints
│   ├── utils/           # Helper functions
│   └── server.js        # Main server file
│
├── client/              # Frontend (React/Vite)
│   ├── src/
│   │   ├── pages/       # React pages
│   │   ├── components/  # Reusable components
│   │   └── App.jsx      # Main app component
│   └── package.json
│
└── README.md            # Full documentation
```

## 🔑 Key Features

✅ User authentication (JWT)  
✅ URL shortening with custom codes  
✅ Click tracking  
✅ Visit history analytics  
✅ Device & browser detection  
✅ Charts & visualizations  
✅ Public stats page  
✅ QR code generation  
✅ Link expiry  
✅ Bulk upload  

## 🐛 Troubleshooting

### Port already in use
```bash
# Change port in server/.env or kill the process using it
lsof -i :5000
kill -9 <PID>
```

### MongoDB connection error
- Ensure MongoDB is running: `mongod` (local) or check Atlas connection string
- Verify MONGODB_URI in `.env`
- Check username/password if using Atlas

### Frontend build error
```bash
# Clear cache and rebuild
cd client
rm -rf node_modules package-lock.json
npm install
npm run build
```

### CORS error
- Ensure CORS_ORIGIN in backend `.env` matches frontend URL
- Default: `http://localhost:5173`

## 📚 Learn More

- **Full README**: See [README.md](./README.md)
- **Deployment**: See [DEPLOYMENT.md](./DEPLOYMENT.md)
- **Architecture**: See [AI_PLANNING.md](./AI_PLANNING.md)
- **Features**: See [FEATURES_CHECKLIST.md](./FEATURES_CHECKLIST.md)

## 🚀 Deploy to Production

### Backend (Render)
```bash
# Push to GitHub
git push origin main

# Go to Render.com → New Web Service
# Connect GitHub repo → Deploy
```

### Frontend (Vercel)
```bash
# Go to Vercel.com → Import Project
# Connect GitHub repo → Deploy
```

See [DEPLOYMENT.md](./DEPLOYMENT.md) for detailed steps.

## 📧 Need Help?

- Check error messages carefully
- Review `.env.example` files
- Read full documentation in README.md
- Check server logs: `server.js` console output
- Check browser dev tools: F12 → Console/Network tabs

---

**Enjoy building with ClickPilot!** 🎉

**This project is a part of a hackathon run by [https://katomaran.com](https://katomaran.com/)**
