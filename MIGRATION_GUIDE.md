# 🚀 Vercel & Render Setup Guide (with Neon DB)

This guide explains how to complete your deployment after moving away from AWS.

---

## 1. Frontend (Vercel)

### Step 1.1: Connect Repository
1. Log in to [Vercel](https://vercel.com).
2. Click **"Add New"** → **"Project"**.
3. Import your GitHub repository.
4. Framework Preset: **Vite**.
5. Root Directory: **`./`**.

### Step 1.2: Add Environment Variables
Add these in the Vercel project settings:
- **`VITE_API_BASE_URL`**: Your Render backend URL + `/api` (e.g., `https://qala-studios-backend.onrender.com/api`).

---

## 2. Backend (Render)

### Step 2.1: Use Blueprint (Recommended)
1. Log in to [Render](https://render.com).
2. Click **"New"** → **"Blueprint"**.
3. Connect your GitHub repository.
4. Render will automatically detect the `render.yaml` and prompt you for secrets.

### Step 2.2: Set Environment Variables
The following variables are required in the Render dashboard:
- **`DATABASE_URL`**: Your Neon PostgreSQL connection string.
- **`FRONTEND_URL`**: Your Vercel production URL (e.g., `https://qala-studios.vercel.app`).
- **`JWT_SECRET`**: A random secure string.
- **`CLOUDINARY_URL`**: Your Cloudinary API key.
- **`ZOHO_EMAIL`**: Your email service username.
- **`ZOHO_PASSWORD`**: Your email service password.

---

## 🔄 How Auto-Deployment Works
- **Vercel** will automatically rebuild your frontend whenever you push to `main`.
- **Render** will automatically rebuild and restart your backend whenever you push to `main`.
- **Neon Database** remains the central data store—no action needed on your part!

---

## 🛠️ Verification Checklist
- [ ] Backend health check: `https://your-backend.onrender.com/api/health` returns `{"status":"healthy"}`.
- [ ] Frontend loads and connects to the new API.
- [ ] Admin login still works with your existing Neon user credentials.
