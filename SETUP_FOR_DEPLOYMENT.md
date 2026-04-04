# ⚡ Quick Setup for Deployment

## 1 Minute Checklist Before You Push to GitHub

### ✅ Already Fixed:
- [x] `.env` files added to `.gitignore`
- [x] Backend `render.yaml` corrected (ZOHO_APP_PASSWORD fixed)
- [x] All required environment vars documented
- [x] Build verified (frontend + backend compile)
- [x] Prisma migrations ready

### 📝 What You Need to Do:

#### 1. Initialize Git & Push
```bash
cd "/home/skull/Documents/projects/QALASTUDIO"
git init
git add .
git commit -m "feat: prepare for deployment"
git branch -M main
git remote add origin https://github.com/YOUR_USERNAME/YOUR_REPO.git
git push -u origin main
```

#### 2. Deploy Backend to Render
- Go to https://dashboard.render.com → New Web Service
- Connect your GitHub repo
- Build: `npm run render-build`
- Start: `npm start`
- Set environment variables (see DEPLOYMENT.md)
- Deploy

#### 3. Deploy Frontend to Vercel
- Go to https://vercel.com → New Project
- Import your repo
- Root: `Qala Studios`
- Build: `npm run build`
- Set `VITE_API_URL` to `https://qalastudio.onrender.com/api`
- Deploy

#### 4. Update Backend FRONTEND_URL
- After Vercel gives you URL (e.g., `https://qala-studios.vercel.app`)
- Go to Render → Service → Environment Variables
- Set `FRONTEND_URL` to your Vercel URL
- Save (backend restarts automatically)

---

## 🎯 Required Environment Variables Summary

### Render (Backend)
```
DATABASE_URL = your-postgres-connection-string
GEMINI_API_KEY = AIzaSy...
CLOUDINARY_CLOUD_NAME = your-name
CLOUDINARY_API_KEY = your-key
CLOUDINARY_API_SECRET = your-secret
ZOHO_EMAIL = your-email@domain.com
ZOHO_APP_PASSWORD = your-zoho-password
ADMIN_EMAIL = admin@yourdomain.com
```

**Note**: `JWT_SECRET`, `PORT`, `NODE_ENV` already auto-configured

### Vercel (Frontend)
```
VITE_API_URL = https://qalastudio.onrender.com/api
VITE_GA_TRACKING_ID = G-XXXXXX (optional)
```

---

## 🔍 Testing After Deploy

1. **Check Backend Health**: `https://qalastudio.onrender.com/api/health`
2. **Check API Docs**: `https://qalastudio.onrender.com/api-docs`
3. **Test Frontend**: Visit your Vercel URL
4. **Test Booking**: Try booking a studio
5. **Admin Login**: `https://your-vercel-url/admin/login`

---

❓ Issues? Read full `DEPLOYMENT.md` for detailed troubleshooting.
