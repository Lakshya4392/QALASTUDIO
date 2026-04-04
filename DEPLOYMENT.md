# 🚀 Deployment Guide - Qala Studios

This guide covers deploying the Qala Studios application to Render (Backend) and Vercel (Frontend).

---

## 📋 Prerequisites

- GitHub repository pushed with your code
- Render account (https://render.com)
- Vercel account (https://vercel.com)
- PostgreSQL database (Neon, Supabase, or Render PostgreSQL)
- Cloudinary account (for image uploads)
- Google Cloud account (for Gemini API)
- Zoho email account (for sending emails)

---

## 🔧 Before You Start

### 1. Fix GitHub Remote (If Needed)

```bash
cd "/home/skull/Documents/projects/QALASTUDIO"
git init
git add .
git commit -m "Initial commit - ready for deployment"
git branch -M main
git remote add origin https://github.com/YOUR_USERNAME/YOUR_REPO.git
git push -u origin main
```

### 2. Update `.gitignore` ✓

Your `.env` files are already in `.gitignore`. Verify:

```bash
cat "Qala Studios/.gitignore" | grep ".env"
```

Should show:
```
.env
.env.local
.env.development.local
.env.test.local
.env.production.local
*.env
```

---

## ☁️ Deploy Backend to Render

### Step 1: Create PostgreSQL Database

**Option A: Neon PostgreSQL (Recommended - Free Tier)**
1. Go to https://neon.tech
2. Sign up and create a new project
3. Copy the connection string (Pooled connection)
4. Format: `postgresql://user:password@host/db?sslmode=require`

**Option B: Render PostgreSQL**
1. In Render dashboard, create "PostgreSQL" instance
2. Wait for it to be created
3. Copy the `DATABASE_URL` from the database details

### Step 2: Get Required API Keys

**Cloudinary** (for image uploads):
1. Go to https://cloudinary.com/console
2. Copy: `CLOUDINARY_CLOUD_NAME`, `CLOUDINARY_API_KEY`, `CLOUDINARY_API_SECRET`

**Google Gemini AI** (for AI chat):
1. Go to https://makersuite.google.com/app/apikey
2. Create a new API key
3. Copy the key

**Zoho Email** (for sending booking emails):
1. Ensure you have Zoho Mail account
2. Generate app-specific password (if using 2FA)
3. You'll need: `ZOHO_EMAIL` and `ZOHO_APP_PASSWORD`

**Redis (Optional - for caching)**:
- Get URL from Upstash or Redis Cloud: `REDIS_URL`
- Format: `rediss://...` (use TLS/SSL)

### Step 3: Create Render Web Service

1. Go to https://dashboard.render.com
2. Click "New +" → "Web Service"
3. Connect your GitHub repository
4. Configure:
   - **Name**: `qala-studios-backend` (or your preference)
   - **Region**: Choose closest to you (e.g., Singapore)
   - **Branch**: `main`
   - **Build Command**: `npm run render-build`
   - **Start Command**: `npm start`
   - **Plan**: Free (or paid for better performance)

5. **Environment Variables** - Add these:

| Key | Value | Source |
|-----|-------|--------|
| `NODE_ENV` | `production` | Fixed |
| `PORT` | `10000` | Fixed |
| `DATABASE_URL` | *Your database URL* | From Step 1 |
| `FRONTEND_URL` | *Will update after Vercel* | Leave empty for now, update later |
| `JWT_SECRET` | *Auto-generated* | Render: generateValue: true |
| `GEMINI_API_KEY` | *Your Gemini key* | From Step 2 |
| `REDIS_URL` | *Your Redis URL* | Optional, from Step 2 |
| `CLOUDINARY_CLOUD_NAME` | *Your Cloudinary cloud name* | From Step 2 |
| `CLOUDINARY_API_KEY` | *Your Cloudinary API key* | From Step 2 |
| `CLOUDINARY_API_SECRET` | *Your Cloudinary API secret* | From Step 2 |
| `ZOHO_EMAIL` | *your-email@zohomail.com* | From Step 2 |
| `ZOHO_APP_PASSWORD` | *Your Zoho app password* | From Step 2 |
| `ADMIN_EMAIL` | *admin@qalastudios.com* | Your admin email |
| `JWT_EXPIRES_IN` | `7d` | Fixed |

6. Click "Create Web Service"
7. Wait for build and deployment (5-10 minutes)

### Step 4: Verify Backend Deployment

After deployment, check:
- **Logs**: In Render dashboard → your service → Logs
- **Health endpoint**: `https://your-backend.onrender.com/api/health`
- **API docs**: `https://your-backend.onrender.com/api-docs`

If you see errors, check:
- Database connection (DATABASE_URL format, SSL mode)
- All environment variables are set
- JWT_SECRET length (should be auto-generated if using generateValue)

---

## 🌐 Deploy Frontend to Vercel

### Step 1: Create Vercel Project

1. Go to https://vercel.com
2. Click "Add New" → "Project"
3. Import your GitHub repository
4. Select the repository

### Step 2: Configure Vercel Project

1. **Project Settings**:
   - **Framework Preset**: Vite
   - **Root Directory**: `Qala Studios` (IMPORTANT - your frontend is in subdirectory)
   - **Build Command**: `npm run build`
   - **Output Directory**: `dist` (default for Vite)
   - **Install Command**: `npm install`

2. **Environment Variables** - Add these:

| Key | Value |
|-----|-------|
| `VITE_API_URL` | `https://qalastudio.onrender.com/api` (your Render backend URL) |
| `VITE_GA_TRACKING_ID` | `G-XXXXXXXXXX` (optional, for Google Analytics) |

3. Click "Deploy"

### Step 3: Wait for Deployment

Vercel will:
1. Build your frontend (2-3 minutes)
2. Deploy to production
3. Give you a URL like: `https://qala-studios.vercel.app`

---

## 🔗 Connect Both Services

### Update Backend's FRONTEND_URL

1. Go to Render dashboard → your backend service
2. Settings → Environment Variables
3. Edit `FRONTEND_URL` to your Vercel URL: `https://qala-studios.vercel.app`
4. Click "Save Changes"
5. Render will automatically restart your backend

### Update CORS (Already Configured ✓)

Your backend reads `FRONTEND_URL` and whitelists it for CORS. This is already implemented in `backend/src/index.ts`:

```typescript
const corsOrigins = process.env.FRONTEND_URL
  ? process.env.FRONTEND_URL.split(',').map((url: string) => url.trim())
  : ['http://localhost:5173'];
```

---

## ✅ Post-Deployment Checklist

### Backend (Render)
- [ ] Health endpoint returns 200 OK
- [ ] API docs accessible at `/api-docs`
- [ ] All environment variables loaded
- [ ] Database migrations ran successfully
- [ ] Email sending works (test contact form)
- [ ] Admin login works

### Frontend (Vercel)
- [ ] Homepage loads without errors
- [ ] API calls to backend succeed
- [ ] Studio listing shows data
- [ ] Booking flow works end-to-end
- [ ] Admin panel accessible at `/admin/login`
- [ ] Environment variable `VITE_API_URL` is set correctly

### Testing Workflow
1. **Test Frontend → Backend**:
   - Visit your Vercel URL
   - Open browser DevTools → Network tab
   - Try booking a studio
   - Check if API calls return 200 status

2. **Test Admin Panel**:
   - Go to `https://your-vercel-url/admin/login`
   - Login with admin credentials
   - Check bookings, studios, etc.

3. **Test Email**:
   - Submit a contact form
   - Check if email arrives at `ADMIN_EMAIL`
   - Check if booking confirmation emails work

---

## 🔄 Domain Configuration (Optional)

### Custom Domain on Vercel
1. Vercel → Project Settings → Domains
2. Add your domain (e.g., `qalastudios.com`)
3. Follow DNS configuration instructions

### Custom Domain on Render
1. Render → Service → Settings → Custom Domains
2. Add your domain (e.g., `api.qalastudios.com`)
3. Update `FRONTEND_URL` and frontend `VITE_API_URL` accordingly

---

## 🐛 Troubleshooting

### Backend Issues
**Error: "Missing required environment variables"**
- Solution: Check Render environment variables are set correctly
- Key names matter: `ZOHO_APP_PASSWORD` not `ZOHO_PASSWORD`

**Error: "Database connection failed"**
- Solution: Verify `DATABASE_URL` includes `?sslmode=require` for Neon
- Check database allows connections from Render IPs

**Build Fails: "Prisma generate"**
- Solution: Ensure `DATABASE_URL` is set before build
- Render runs `npx prisma migrate deploy` which requires DB connection

### Frontend Issues
**Error: "Failed to fetch"**
- Solution: Check `VITE_API_URL` is correct and backend is running
- Check CORS - FRONTEND_URL must match Vercel domain exactly

**Build Fails on Vercel**
- Solution: Ensure Root Directory is set to `Qala Studios`
- Check Node.js version (package.json should specify)

**Blank Page After Deploy**
- Solution: Check browser console for errors
- Ensure `index.html` exists in `dist/` (it does after build)
- Verify `vercel.json` rewrites are correct

---

## 📊 Monitoring

### Render Logs
- Dashboard → Service → Logs (real-time)
- Set up alerts for error spikes

### Vercel Analytics
- Vercel dashboard → Analytics tab
- View traffic, conversions, etc.

### Google Analytics
- Set up GA4 property
- Add `VITE_GA_TRACKING_ID` to Vercel env vars
- Use GoogleAnalytics component already included

---

## 🔐 Security Notes

✅ **Already Secured**:
- `.env` files in `.gitignore`
- Helmet security headers
- HTTPS enforcement in production
- Rate limiting on auth routes
- JWT authentication
- SQL injection prevention (Prisma ORM)
- Request size limits (10MB)
- CORS restricted to FRONTEND_URL

⚠️ **Remember**:
- Never commit `.env` files
- Rotate JWT_SECRET periodically
- Use strong passwords for Zoho
- Enable 2FA on all cloud accounts
- Regularly update dependencies

---

## 🎉 You're Done!

Your app should now be live at:
- **Frontend**: `https://your-project.vercel.app`
- **Backend API**: `https://your-backend.onrender.com`
- **API Docs**: `https://your-backend.onrender.com/api-docs`

---

## 📞 Need Help?

- **Backend Issues**: Check Render logs first
- **Frontend Issues**: Check Vercel deployment logs
- **Database Issues**: Verify Neon connection string
- **Email Issues**: Verify Zoho credentials and less-secure apps setting

---

**Last Updated**: 2026-04-04
**Project**: Qala Studios Booking System
