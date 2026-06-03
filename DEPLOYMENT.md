# ClickPilot - Deployment Guide

This guide covers deploying ClickPilot to production using:
- **Backend**: Render (Node.js/Express)
- **Frontend**: Vercel (React/Vite)
- **Database**: MongoDB Atlas

## 📋 Prerequisites

1. GitHub repository with your code pushed
2. Accounts on:
   - [Render.com](https://render.com)
   - [Vercel.com](https://vercel.com)
   - [MongoDB Atlas](https://mongodb.com/cloud/atlas)

## 🗄️ Step 1: MongoDB Atlas Setup

### 1.1 Create MongoDB Atlas Account
1. Go to [mongodb.com/cloud/atlas](https://mongodb.com/cloud/atlas)
2. Sign up or log in
3. Create a new organization

### 1.2 Create Cluster
1. Click "Create Deployment"
2. Choose "M0 Sandbox" (free tier)
3. Select your preferred cloud provider (AWS, Google Cloud, Azure)
4. Select a region closest to your users
5. Click "Create Deployment"
6. Wait 2-5 minutes for cluster to be ready

### 1.3 Create Database User
1. Click "Database Access" in left sidebar
2. Click "Add new database user"
3. Choose "Username and Password" authentication
4. Enter username: `clickpilot_user`
5. Generate secure password (save it!)
6. Set privileges to "Admin"
7. Click "Add User"

### 1.4 Get Connection String
1. Click "Databases" in left sidebar
2. Click "Connect" button on your cluster
3. Choose "Drivers"
4. Copy the connection string (looks like: `mongodb+srv://user:password@cluster.mongodb.net/`)
5. Replace `<password>` with your database user password
6. Replace `myFirstDatabase` with `clickpilot`
7. Final format: `mongodb+srv://clickpilot_user:PASSWORD@cluster.mongodb.net/clickpilot?retryWrites=true&w=majority`

### 1.5 Allow Network Access
1. Click "Network Access" in left sidebar
2. Click "Add IP Address"
3. Select "Allow access from anywhere" (0.0.0.0/0) for development
4. Click "Confirm"

**Note**: For production, restrict to specific IPs only

## 🚀 Step 2: Backend Deployment (Render)

### 2.1 Prepare Backend Code
1. Ensure `.env.example` exists in server folder
2. Verify `package.json` has correct `start` script:
   ```json
   "scripts": {
     "start": "node server.js",
     "dev": "nodemon server.js"
   }
   ```

### 2.2 Create Render Web Service
1. Go to [Render.com](https://render.com)
2. Log in with GitHub account
3. Click "New +" → "Web Service"
4. Select your repository
5. Fill in details:
   - **Name**: `clickpilot-api`
   - **Environment**: `Node`
   - **Build Command**: `npm install`
   - **Start Command**: `npm start`
   - **Publish directory**: (leave blank)

### 2.3 Configure Environment Variables
1. Scroll down to "Environment"
2. Add these variables:
   ```
   PORT=5000
   NODE_ENV=production
   MONGODB_URI=mongodb+srv://clickpilot_user:PASSWORD@cluster.mongodb.net/clickpilot
   JWT_SECRET=your_super_secret_jwt_key_change_this_to_something_secure
   JWT_EXPIRE=7d
   CORS_ORIGIN=https://your-vercel-domain.vercel.app
   ```

3. Generate secure JWT_SECRET (use: `node -e "console.log(require('crypto').randomBytes(32).toString('hex'))"`)

### 2.4 Deploy
1. Click "Create Web Service"
2. Wait for deployment (usually 2-5 minutes)
3. You'll get a URL like: `https://clickpilot-api.onrender.com`
4. Keep this URL for frontend setup

### 2.5 Verify Backend
```bash
# Test the API
curl https://clickpilot-api.onrender.com/api/auth/login

# Should return error about missing body, which is normal
```

## 🎨 Step 3: Frontend Deployment (Vercel)

### 3.1 Prepare Frontend Code
1. Ensure `vite.config.js` exists
2. Verify `package.json` build script:
   ```json
   "scripts": {
     "build": "vite build",
     "dev": "vite"
   }
   ```

### 3.2 Deploy on Vercel
1. Go to [Vercel.com](https://vercel.com)
2. Click "Add New..." → "Project"
3. Import your GitHub repository
4. Fill in project details:
   - **Framework Preset**: `Vite`
   - **Root Directory**: `client`

### 3.3 Configure Build Settings
1. **Build Command**: `npm run build`
2. **Output Directory**: `dist`
3. **Install Command**: `npm install`

### 3.4 Set Environment Variables
1. Under "Environment Variables" add:
   ```
   VITE_API_BASE_URL=https://clickpilot-api.onrender.com
   ```

2. Click "Deploy"

### 3.5 Verify Deployment
1. Wait for build to complete (usually 2-3 minutes)
2. Visit your Vercel URL: `https://your-project.vercel.app`
3. Test logging in and creating a link

## 🔗 Step 4: Configure CORS

After getting your Vercel URL:

1. Go back to Render dashboard
2. Find your `clickpilot-api` service
3. Click "Environment"
4. Update `CORS_ORIGIN` to your Vercel URL:
   ```
   CORS_ORIGIN=https://your-project.vercel.app
   ```
5. Click "Deploy" to redeploy with new settings

## 🧪 Step 5: Testing

### Test Backend
```bash
# Register
curl -X POST https://clickpilot-api.onrender.com/api/auth/register \
  -H "Content-Type: application/json" \
  -d '{"name":"Test","email":"test@example.com","password":"password123"}'

# Login
curl -X POST https://clickpilot-api.onrender.com/api/auth/login \
  -H "Content-Type: application/json" \
  -d '{"email":"test@example.com","password":"password123"}'
```

### Test Frontend
1. Visit your Vercel URL
2. Click "Sign Up"
3. Create an account
4. Create a short link
5. Click the link to verify redirect works

## 📊 Monitoring

### Render
1. Go to your service dashboard
2. Click "Metrics" to see:
   - CPU usage
   - Memory usage
   - Request logs

### Vercel
1. Go to your project dashboard
2. View:
   - Build history
   - Function logs
   - Analytics

### MongoDB Atlas
1. Go to your cluster
2. Click "Metrics" to see:
   - Database stats
   - Connection info
   - Query performance

## 🔧 Troubleshooting

### Backend Won't Deploy on Render
- Check build logs in Render dashboard
- Ensure `package.json` is in server root
- Verify all dependencies are in package.json
- Check environment variables are set correctly

### Frontend Build Fails on Vercel
- Check build logs
- Ensure Root Directory is set to `client`
- Verify all npm dependencies are installed
- Check for missing env variables (VITE_*)

### CORS Errors
- Verify CORS_ORIGIN matches your Vercel domain
- Check that both backend and frontend are using correct URLs
- Remember to redeploy backend after updating CORS_ORIGIN

### Database Connection Issues
- Verify MONGODB_URI is correct
- Check IP whitelist in MongoDB Atlas (should be 0.0.0.0/0 or specific IPs)
- Test connection string with local MongoDB client
- Check MongoDB Atlas status page for outages

### Deployment Takes Too Long
- Render first deployment can take 3-5 minutes
- Subsequent deployments are faster
- Check for large node_modules (should be minimal)

## 📈 Scaling Recommendations

1. **Database**: Upgrade from M0 to M2 as traffic increases
2. **Backend**: Upgrade Render plan from free to paid when needed
3. **Frontend**: Vercel Pro for increased build time/analytics
4. **Caching**: Add Redis for session caching
5. **CDN**: Enable Cloudflare for faster content delivery

## 🔒 Security Checklist

- ✅ JWT_SECRET is unique and secure
- ✅ CORS_ORIGIN is set to frontend URL only
- ✅ MongoDB IP whitelist is restrictive
- ✅ No sensitive data in .env.example
- ✅ HTTPS is enforced (Render/Vercel do this by default)
- ✅ Rate limiting is configured

## 📞 Support

For deployment issues:
1. Check Render logs: Dashboard → Logs
2. Check Vercel logs: Project → Deployments → Logs
3. Check MongoDB Atlas logs: Databases → Activity
4. Review error messages carefully
5. Verify all environment variables are set

---

Good luck with your deployment! 🚀
