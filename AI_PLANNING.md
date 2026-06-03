# ClickPilot - AI Planning Document

## Project Overview

ClickPilot is a modern, full-stack URL shortening service built for a hackathon. It combines essential URL shortening functionality with advanced analytics, visit tracking, and device/browser detection to provide a complete SaaS experience.

## Architecture Decisions

### Frontend Architecture

**Technology Choice: React + Vite + Tailwind CSS**
- React 19 for component-based UI with hooks
- Vite 7 for fast build times and dev experience
- Tailwind CSS for rapid UI development with consistent design

**Design System**
- Color palette: Indigo (primary), Cyan/Emerald/Pink/Orange (accents)
- Glassmorphism design with gradient backgrounds
- Responsive grid layout (mobile-first)
- Dark mode support with context-based theming

**Routing Strategy**
- React Router v7 for client-side navigation
- Protected routes with authentication wrapper
- Public stats page at /stats/:shortCode (no auth required)
- Authenticated dashboard at /app/* prefix

**State Management**
- React Context API for auth and theme (simple, no Redux needed)
- Axios with interceptors for API calls (adds Bearer token automatically)
- localStorage for persistence (token, theme preference)

**Animation & UX**
- Framer Motion for smooth animations (staggerChildren, whileTap, whileHover)
- React Toastify for notifications (success/error feedback)
- Skeleton loaders during data fetching
- Empty states for better UX

### Backend Architecture

**Technology Choice: Express + MongoDB + Mongoose**
- Express for minimal, fast HTTP server
- MongoDB Atlas for scalable NoSQL database
- Mongoose for schema validation and type safety

**Authentication Flow**
```
User Input → bcryptjs hash → Store in DB
Login → Compare hash → JWT token → Store in localStorage
Every Request → Extract token → Verify JWT → Get userId
```

**Analytics Pipeline**
```
Link Visit → Parse User-Agent → Extract device/browser
  ↓
Extract Client IP → Record timestamp
  ↓
Create visit object {timestamp, ip, device, browser}
  ↓
Push to visits array (trim to 1000) → Update deviceStats → Update browserStats
  ↓
Store in MongoDB → Ready for analytics queries
```

**Database Design**
- User model: Simple auth-focused
- Link model: Enhanced with analytics subdocuments
- Visits array: Capped at 1000 to prevent unbounded growth
- Stats objects: Aggregated counts for performance

**API Structure**
- RESTful endpoints following best practices
- Authentication middleware protects sensitive routes
- Public endpoints for shareable stats
- Error handling with proper HTTP status codes

### Security Considerations

1. **Authentication**
   - JWT tokens signed with secret
   - Passwords hashed with bcrypt (10 salt rounds)
   - Token stored in localStorage (vulnerable to XSS)
   - Should use httpOnly cookies in production

2. **Data Validation**
   - URL validation with validator library
   - Custom code alphanumeric validation
   - Email format validation
   - Request body size limits

3. **CORS & Headers**
   - Helmet.js for security headers
   - CORS configured per environment
   - Rate limiting on auth endpoints (10 req/15min)
   - Rate limiting on link endpoints (20 req/15min)

4. **Authorization**
   - Protected routes check user ownership
   - Public endpoints don't require auth
   - Dashboard stats scoped to authenticated user

## Feature Implementation Details

### Mandatory Features

**1. Visit History Analytics**
- Location: `server/models/Link.js` (visits array)
- Implementation: Each visit stored as subdocument with timestamp, IP, device, browser
- Limitation: Limited to last 1000 visits to prevent document size explosion

**2. Last Visited Time**
- Location: `server/controllers/linkController.js` (redirectLink function)
- Implementation: Update `lastVisitedAt` on every click
- Use case: Users can see when their links were last accessed

**3. Recent Visit History**
- Location: `client/src/pages/Analytics.jsx`
- Implementation: Display last 50 visits in table format
- Fields: Timestamp, device type, browser, IP address (masked)

**4. Device Analytics**
- Location: `server/utils/analytics.js` (parseUserAgent function)
- Categories: Mobile, Tablet, Desktop
- Visualization: Doughnut chart on Analytics page

**5. Browser Analytics**
- Location: `server/utils/analytics.js` (parseUserAgent function)
- Categories: Chrome, Firefox, Safari, Edge, Other
- Visualization: Doughnut chart on Analytics page

### Bonus Features

**1. Custom Short Codes**
- Location: `server/controllers/linkController.js` (createLink function)
- Validation: Alphanumeric with dash/underscore
- Uniqueness: Database index ensures no duplicates

**2. QR Code Generation**
- Location: `server/utils/analytics.js` (generateQRCode function)
- Frontend: `qrcode.react` library for display
- Use: Shareable QR code for short links

**3. Link Expiry**
- Location: `server/models/Link.js` (expiresAt field)
- Check: `server/controllers/linkController.js` (redirectLink checks expiry)
- Response: 410 Gone status for expired links

**4. Device Analytics (as chart)**
- Shows visit distribution across devices
- Helps identify mobile vs desktop traffic

**5. Browser Analytics (as chart)**
- Shows visit distribution across browsers
- Helps identify user's browser preference

**6. Charts & Visualization**
- Click Trend (Line chart - 7 days)
- Device Distribution (Doughnut chart)
- Browser Distribution (Doughnut chart)
- Traffic Distribution (Doughnut chart)

**7. Public Stats Page**
- Location: `client/src/pages/PublicStats.jsx`
- Route: `/stats/:shortCode` (no authentication)
- Data: Click count, creation date, original URL

**8. Bulk URL Shortening**
- Location: `server/controllers/linkController.js` (bulkCreateLinks function)
- Endpoint: POST `/api/links/bulk`
- Limit: Max 100 URLs per request
- Response: Success/error array for each URL

**9. Search**
- Location: `client/src/pages/MyLinks.jsx`
- Implemented: Real-time search by original URL or short code
- Backend support: Regex search in `getMyLinks` endpoint

**10. Pagination**
- Location: `client/src/pages/MyLinks.jsx`
- Implemented: Page-based pagination with prev/next buttons
- Backend support: Skip/limit in `getMyLinks` endpoint

**11. Sorting**
- Location: `client/src/pages/MyLinks.jsx`
- Options: "Newest" (createdAt -1) or "Most Clicks" (clicks -1)
- Real-time sorting in dropdown

### Dashboard Features

**Summary Stats**
- Total Links: Count of user's links
- Total Clicks: Sum of all clicks
- Average CTR: Calculated from data
- Growth: Trend indicator

**Charts**
- 7-day click trend (Line chart)
- Traffic sources (Bar chart with gradient colors)

## Data Flow

### User Registration
```
User → Register Page → Axios POST /api/auth/register
  ↓
Backend validates email → bcrypt hash password → Store User
  ↓
JWT token returned → localStorage stores token
  ↓
Redirect to dashboard
```

### Create Short Link
```
User → CreateLink Page → Input originalUrl + optional shortCode
  ↓
Frontend validates URL (http/https check)
  ↓
Axios POST /api/links/create with token
  ↓
Backend validates URL → Generate nanoid(6) if no custom code
  ↓
Store Link in MongoDB → Return shortCode
  ↓
Frontend shows success → Displays generated shortCode
```

### Visit Short Link
```
Browser → GET /api/links/:shortCode
  ↓
Backend finds Link in database
  ↓
Parse User-Agent → Extract device, browser
  ↓
Extract client IP from headers
  ↓
Increment clicks → Update lastVisitedAt
  ↓
Push to visits array → Update deviceStats → Update browserStats
  ↓
Redirect to originalUrl (302)
```

### View Analytics
```
User → Analytics Page → Axios GET /api/links/analytics/:id with token
  ↓
Backend finds Link → Check ownership
  ↓
Return all analytics data (visits, stats, computed fields)
  ↓
Frontend renders charts, tables, summaries
```

## Performance Considerations

1. **Database Indexing**
   - shortCode: unique index for O(1) lookups
   - user: for O(1) finding user's links
   - createdAt: for sorting

2. **Caching Strategy**
   - Frontend: Keep analytics in state (cache busting on tab focus)
   - Backend: No caching layer (small queries, MongoDB is fast)

3. **Visit Array Limitation**
   - Max 1000 visits per link
   - Prevents documents from growing indefinitely
   - Trade-off: Lose oldest visits when limit exceeded

4. **Query Optimization**
   - Dashboard uses MongoDB $facet for atomic query
   - MyLinks uses pagination to limit returned data

## Future Enhancement Opportunities

1. **Database**
   - Add Redis for caching popular links
   - Add Elasticsearch for advanced search
   - Archive old visits to separate collection

2. **Analytics**
   - Geographic location tracking (IP geolocation)
   - Referrer tracking
   - UTM parameter handling
   - A/B testing support

3. **Frontend**
   - Code splitting to reduce bundle size
   - Service worker for offline support
   - PWA support for mobile app feel
   - Real-time analytics updates (WebSocket)

4. **Backend**
   - GraphQL API alternative
   - Webhook support for link activity
   - API key support for third-party apps
   - Advanced user permissions (shared teams)

5. **Features**
   - API endpoint for link creation
   - Zapier/IFTTT integrations
   - Slack/Discord notifications
   - Custom domain support

## Testing Strategy

### Frontend Testing (Not Implemented)
- Unit tests: Jest + React Testing Library
- E2E tests: Cypress for user flows
- Visual regression: Percy or similar

### Backend Testing (Not Implemented)
- Unit tests: Jest for utils/controllers
- Integration tests: Supertest for API endpoints
- Load testing: Artillery for scalability

## Deployment Strategy

1. **Development**
   - Local Node.js with nodemon
   - Local MongoDB or MongoDB Atlas free tier
   - localhost:5173 frontend, localhost:5000 backend

2. **Staging**
   - Same as production but with test data
   - Staging database on MongoDB Atlas

3. **Production**
   - Backend: Render (auto-deploy from GitHub)
   - Frontend: Vercel (auto-deploy from GitHub)
   - Database: MongoDB Atlas M2+ tier
   - CDN: Vercel's built-in CDN for frontend

## Success Metrics

1. **Performance**
   - Page load time < 2s
   - API response time < 200ms
   - Uptime > 99.5%

2. **User Experience**
   - No console errors
   - Smooth animations (60fps)
   - Responsive on all devices

3. **Features**
   - All 5 mandatory features implemented ✅
   - All 11 bonus features implemented ✅
   - 100% test coverage for critical paths (future)

4. **Code Quality**
   - No ESLint warnings
   - DRY principles followed
   - Meaningful variable/function names

## Hackathon Submission Checklist

- ✅ Complete README.md
- ✅ .env.example files
- ✅ Deployment guide
- ✅ All mandatory features
- ✅ Multiple bonus features
- ✅ Professional UI/UX
- ✅ Database schema optimized
- ✅ API documentation
- ✅ Error handling
- ✅ Security measures
- ✅ Responsive design
- ✅ Clean, maintainable code

## Conclusion

ClickPilot demonstrates a complete, production-ready SaaS application with:
- Modern frontend architecture (React + Vite + Tailwind)
- Robust backend with analytics (Express + MongoDB)
- Professional design and UX
- Comprehensive feature set
- Deployment-ready code
- Clear documentation

The project follows industry best practices and is ready for scaling and further enhancement.

---

**This project is a part of a hackathon run by [https://katomaran.com](https://katomaran.com/)**
