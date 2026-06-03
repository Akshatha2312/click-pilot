# ClickPilot - Advanced URL Shortener SaaS

A modern, feature-rich URL shortening service built with React, Express, and MongoDB. Transform long URLs into trackable short links with comprehensive analytics, visit history, device tracking, and more.

**This project is a part of a hackathon run by [https://katomaran.com](https://katomaran.com/)**

## 🎯 Features

### Core Features ✅
- **User Authentication** - Secure JWT-based authentication with email/password
- **URL Shortening** - Create custom or auto-generated short URLs
- **Click Tracking** - Track every single click on your short links
- **Protected Routes** - Secure dashboard only accessible to authenticated users
- **Link Management** - Create, update, delete, and search your links

### Analytics & Tracking ✅ (Mandatory Features)
- **Visit History** - Store every visit with timestamp, IP address, device, and browser
- **Last Visited Time** - Track when each link was last accessed
- **Recent Visits Table** - View detailed history of recent visits
- **Device Analytics** - Categorize visits by device type (Mobile/Tablet/Desktop)
- **Browser Analytics** - Track visitor browsers (Chrome, Firefox, Safari, Edge)
- **Advanced Metrics** - Device and browser distribution charts

### Bonus Features ✅
- **Custom Short Codes** - Create branded short URLs with custom codes
- **QR Code Generation** - Auto-generate QR codes for every link
- **Link Expiry** - Set expiration dates for temporary links
- **Bulk URL Shortening** - Create multiple short links at once (up to 100)
- **Public Stats Page** - Share statistics without authentication
- **Charts & Visualization** - 
  - Daily click trends
  - Device distribution (Doughnut chart)
  - Browser distribution (Doughnut chart)
- **Search & Pagination** - Find links easily with search and pagination
- **Sorting Options** - Sort by clicks or creation date
- **Dashboard Summary** - Overview of all your links and statistics

### UI/UX Features ✅
- **Modern SaaS Design** - Premium glassmorphism cards with gradients
- **Dark/Light Mode** - Automatic theme switching with localStorage persistence
- **Responsive Design** - Mobile-first responsive layout
- **Smooth Animations** - Framer Motion animations and transitions
- **Toast Notifications** - Real-time feedback for all actions
- **Loading States** - Skeleton loaders and spinners
- **Empty States** - Beautiful empty state components
- **Error Handling** - 404 pages and error messages

## 🏗 Tech Stack

### Frontend
- **React 19.1.0** - UI library
- **Vite 7.0.4** - Build tool
- **Tailwind CSS 3.4.13** - Styling
- **Framer Motion 12.40.0** - Animations
- **React Router 7.7.0** - Routing
- **Axios 1.10.0** - HTTP client
- **Chart.js 4.5.1** - Charts
- **React Icons 5.6.0** - Icon library
- **React Toastify 11.1.0** - Notifications
- **QRCode.react 4.2.0** - QR code generation

### Backend
- **Node.js** - Runtime
- **Express 4.18.2** - Web framework
- **MongoDB** - Database
- **Mongoose** - ODM
- **JWT (jsonwebtoken)** - Authentication
- **Bcryptjs** - Password hashing
- **Validator** - URL validation
- **Helmet** - Security headers
- **Express Rate Limit** - Rate limiting
- **UA Parser JS** - Device/browser detection
- **QRCode** - QR code generation

## 📋 Installation

### Prerequisites
- Node.js (v16+)
- MongoDB Atlas account or local MongoDB
- Git

### Backend Setup

```bash
cd server
npm install

# Create .env file
cp .env.example .env

# Update .env with your MongoDB URI and JWT secret
```

### Frontend Setup

```bash
cd client
npm install

# Create .env file with API base URL
echo 'VITE_API_BASE_URL=http://localhost:5000' > .env

```

## 🔧 Environment Variables

### Backend (.env)
```
PORT=5000
MONGODB_URI=mongodb+srv://user:password@cluster.mongodb.net/clickpilot
JWT_SECRET=your_super_secret_jwt_key_here_change_this
JWT_EXPIRE=7d
NODE_ENV=development
```

### Frontend (.env)
```
VITE_API_BASE_URL=http://localhost:5000
```

## 🚀 Running the Project

### Development

Backend:
```bash
cd server
npm start
# API available at http://localhost:5000
```

Frontend:
```bash
cd client
npm run dev
# App available at http://localhost:5173
```

### Production Build

Backend:
```bash
# Deploy to Render or Railway
npm start
```

Frontend:
```bash
cd client
npm run build
# Output in dist/ folder for Vercel
```

## 📚 API Documentation

### Authentication Endpoints

#### Register
```
POST /api/auth/register
Body: { name, email, password }
Response: { token, user }
```

#### Login
```
POST /api/auth/login
Body: { email, password }
Response: { token, user }
```

### Link Endpoints

#### Create Link
```
POST /api/links/create
Auth: Required
Body: { originalUrl, shortCode? }
Response: { link }
```

#### Get My Links
```
GET /api/links/my-links?page=1&limit=10&search=keyword&sort=createdAt
Auth: Required
Response: { links, total, totalPages }
```

#### Get Dashboard Stats
```
GET /api/links/dashboard
Auth: Required
Response: { totalLinks, totalClicks, latestLinks }
```

#### Get Link Analytics
```
GET /api/links/analytics/:id
Auth: Required
Response: { analytics: { originalUrl, shortCode, totalClicks, lastVisitedAt, recentVisits, deviceStats, browserStats } }
```

#### Update Link
```
PUT /api/links/:id
Auth: Required
Body: { originalUrl }
Response: { link }
```

#### Delete Link
```
DELETE /api/links/:id
Auth: Required
Response: { message }
```

#### Bulk Create Links
```
POST /api/links/bulk
Auth: Required
Body: { urls: [] }
Response: { createdCount, links, errors }
```

### Public Endpoints

#### Public Stats (No Auth)
```
GET /api/links/stats/:shortCode
Response: { stats: { shortCode, originalUrl, clicks, createdAt, lastVisitedAt, status } }
```

#### Redirect (No Auth)
```
GET /api/links/:shortCode
Response: Redirects to original URL + increments click counter + stores visit
```

## 🗄 Database Schema

### User Model
```javascript
{
  name: String,
  email: String (unique),
  password: String (hashed),
  createdAt: Date,
  updatedAt: Date
}
```

### Link Model
```javascript
{
  originalUrl: String (required),
  shortCode: String (unique, required),
  user: ObjectId (ref: User),
  clicks: Number (default: 0),
  lastVisitedAt: Date,
  expiresAt: Date (optional),
  visits: [
    {
      timestamp: Date,
      ipAddress: String,
      device: String (mobile|tablet|desktop),
      browser: String (chrome|firefox|safari|edge|other),
      country: String
    }
  ],
  deviceStats: {
    mobile: Number,
    tablet: Number,
    desktop: Number
  },
  browserStats: {
    chrome: Number,
    firefox: Number,
    safari: Number,
    edge: Number,
    other: Number
  },
  createdAt: Date,
  updatedAt: Date
}
```

## 🏗 Architecture

```
ClickPilot/
├── server/
│   ├── config/
│   │   └── db.js                 # MongoDB connection
│   ├── controllers/
│   │   ├── authController.js     # Auth logic
│   │   └── linkController.js     # Link CRUD + analytics
│   ├── middleware/
│   │   ├── authMiddleware.js     # JWT verification
│   │   └── logger.js             # Request logging
│   ├── models/
│   │   ├── User.js               # User schema
│   │   └── Link.js               # Link schema with analytics
│   ├── routes/
│   │   ├── authRoutes.js
│   │   └── linkRoutes.js
│   ├── utils/
│   │   └── analytics.js          # Device/browser detection, QR generation
│   ├── .env.example
│   ├── package.json
│   └── server.js                 # Express app
│
└── client/
    ├── src/
    │   ├── api/
    │   │   └── axios.js          # API client setup
    │   ├── components/           # Reusable components
    │   ├── context/
    │   │   ├── AuthContext.jsx   # Auth state
    │   │   └── ThemeContext.jsx  # Theme state
    │   ├── pages/
    │   │   ├── Landing.jsx       # Marketing page
    │   │   ├── Login.jsx
    │   │   ├── Register.jsx
    │   │   ├── Dashboard.jsx     # User dashboard
    │   │   ├── CreateLink.jsx    # Create short URL
    │   │   ├── MyLinks.jsx       # Link management
    │   │   ├── Analytics.jsx     # Detailed analytics
    │   │   ├── PublicStats.jsx   # Public stats page
    │   │   └── NotFound.jsx
    │   ├── App.jsx
    │   ├── main.jsx
    │   └── index.css
    ├── tailwind.config.js
    └── package.json
```

## 🔒 Security Features

- ✅ JWT-based authentication
- ✅ Bcrypt password hashing
- ✅ Helmet security headers
- ✅ CORS protection
- ✅ Rate limiting (10 req/15min for auth, 20 req/15min for link creation)
- ✅ URL validation
- ✅ Request logging
- ✅ Protected routes with ownership checks

## 📊 Assumptions

1. **Custom Short Codes** - Must be unique, alphanumeric with dashes/underscores
2. **Expiry Logic** - Expired links return 410 Gone status, not redirect
3. **Visit Tracking** - Limited to last 1000 visits per link (to avoid unbounded array growth)
4. **Public Stats** - Shows only click count, dates, and status (no user info)
5. **Device Detection** - Based on User-Agent header parsing
6. **IP Address** - Extracted from x-forwarded-for or request.connection
7. **Bulk Upload** - Max 100 URLs per request
8. **Pagination** - Default 10 items per page, max 100

## 🚀 Deployment Instructions

### Backend Deployment (Render)

1. Push code to GitHub
2. Go to [Render.com](https://render.com)
3. Create new Web Service
4. Connect your GitHub repository
5. Set environment variables:
   ```
   MONGODB_URI=your_atlas_uri
   JWT_SECRET=your_secret
   NODE_ENV=production
   ```
6. Build command: `npm install`
7. Start command: `npm start`

### Frontend Deployment (Vercel)

1. Push code to GitHub
2. Go to [Vercel.com](https://vercel.com)
3. Import your repository
4. Set build settings:
   - Framework: Vite
   - Build command: `npm run build` (in client directory)
   - Output directory: `client/dist`
5. Set environment variable:
   ```
   VITE_API_BASE_URL=your_backend_url
   ```
6. Deploy!

### Database Setup (MongoDB Atlas)

1. Create account at [mongodb.com/cloud](https://mongodb.com/cloud)
2. Create new cluster
3. Create database user
4. Get connection string
5. Add connection string to backend .env as MONGODB_URI

## 📸 Screenshots

### Landing Page
Beautiful hero section with features, stats, and call-to-action

### Dashboard
Overview of links, clicks, and recent activity with charts

### Create Link
Simple form to shorten URLs with custom code option

### My Links
Table view of all links with search, sort, and pagination

### Analytics
Detailed analytics with visit history, device/browser stats, and charts

### Public Stats
Shareable public stats page showing click count and creation date

## 🎬 Demo Video

[Loom Demo Link - To be added]

## 🐛 Known Limitations

- Visit history limited to 1000 most recent visits per link
- QR codes generated on-demand (not pre-generated)
- Bulk upload limited to 100 URLs per request
- Device detection based on User-Agent (not 100% accurate)
- Browser stats only track major browsers

## 🤝 Contributing

Contributions welcome! Please create a pull request with your changes.

## 📄 License

This project is free to use for educational and personal purposes.

## 📧 Support

For issues and questions, please create an issue in the GitHub repository.

---

**This project is a part of a hackathon run by [https://katomaran.com](https://katomaran.com/)**
"# ClickPilot" 
