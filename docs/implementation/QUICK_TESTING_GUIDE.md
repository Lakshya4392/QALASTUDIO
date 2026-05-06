# Quick Testing Guide - What You Can Test Right Now

**Date**: March 31, 2026
**Status**: Phase 5 Complete, Ready for Manual Testing

---

## 🎯 Quick Overview

**What's Working Now:**
- ✅ Backend API with full security (JWT auth, rate limiting, Helmet)
- ✅ Frontend with code splitting, error boundaries, SEO
- ✅ Database with booking system, studios, pricing
- ✅ Email integration (Zoho)
- ✅ Cookie-based authentication (secure)
- ✅ Complete booking flow

---

## 📋 Pre-Flight Checklist

### 1. Environment Setup

```bash
# Backend (.env in backend folder)
JWT_SECRET=your-super-secret-random-string-min-32-chars
DATABASE_URL=postgresql://...
ZOHO_EMAIL=your-email@zoho.com
ZOHO_APP_PASSWORD=your-app-password
NODE_ENV=development
FRONTEND_URL=http://localhost:5173

# Frontend (.env.local in root)
VITE_API_URL=http://localhost:3001/api
GEMINI_API_KEY=your-key
VITE_GA_TRACKING_ID=G-XXXXXXXXXX (optional)
```

---

## 🔧 Step 1: Start Backend

```bash
cd backend
npm run dev
```

**Expected Output:**
```
✅ Environment validation passed
Server running on port 3001
Database connected
Winston logging initialized
```

**Verify Health:**
```bash
curl http://localhost:3001/api/health
```
Should return:
```json
{
  "status": "healthy",
  "timestamp": "2026-03-31T...",
  "uptime": 12.45,
  "environment": "development",
  "checks": {
    "database": "healthy",
    "redis": "unavailable"
  }
}
```

---

## 🔧 Step 2: Start Frontend

```bash
# In new terminal (from project root)
npm run dev
```

**Expected:** Server starts on `http://localhost:5173`

**Open Browser:** Navigate to `http://localhost:5173`

---

## ✅ Step 3: Manual Testing Checklist

### A. Public Pages (No Login Required)

#### 1. Homepage
- [ ] Page loads with hero section
- [ ] All sections visible: About, Services, Virtual Production, Hospitality, Event Spaces, Recent Productions
- [ ] Smooth scrolling works
- [ ] Images load correctly (Unsplash)

#### 2. Studios Page (`/studios`)
- [ ] List all studios from database
- [ ] Studio cards display: name, tagline, description, features
- [ ] Images load with lazy loading
- [ ] Hover effects work (scale, grayscale removal)
- [ ] Clicking card navigates to book page

#### 3. Services Page (`/services`)
- [ ] Service grid displays
- [ ] All service cards present

#### 4. Book Page (`/book`) ⭐ **CRITICAL**
- [ ] Page loads with skeleton loaders initially
- [ ] Studios are fetched from API (not hardcoded)
- [ ] If API fails: error message with "Try Again" button
- [ ] Studio cards display correctly with dynamic pricing
- [ ] Click on studio card → opens BookingModal
- [ ] Keyboard navigation works (Tab + Enter)
- [ ] Focus rings visible on keyboard focus
- [ ] Images have lazy loading attribute
- [ ] Alt text present on images

#### 5. Contact Page (`/contact`)
- [ ] Contact form present
- [ ] Map/contact info displays

#### 6. Golden Hour Page (`/golden-hour`)
- [ ] Page content loads

#### 7. About Page (`/about`)
- [ ] About content displays

#### 8. 404 Page
- [ ] Navigate to `/nonexistent`
- [ ] Custom 404 page shows (not redirect to home)
- [ ] "Go to Homepage" and "Go Back" buttons work

### B. Admin Authentication Flow

#### 1. Admin Login (`/admin/login`)
- [ ] Login page loads with form
- [ ] Enter credentials (use seeded admin or create one)
- [ ] Submit → redirects to `/admin/dashboard`
- [ ] Browser receives `auth_token` cookie (check DevTools > Application > Cookies)
- [ ] localStorage should NOT have `admin_token` anymore

#### 2. Cookie Verification
- [ ] After login, refresh page
- [ ] Should stay logged in (cookie persists)
- [ ] Check network tab: `/auth/verify` called on page load
- [ ] Protected pages load without showing login again

#### 3. Logout
- [ ] Click logout in admin panel
- [ ] Cookie cleared (DevTools shows removed)
- [ ] Redirects to login page
- [ ] Protected pages redirect to login

### C. Booking Flow (End-to-End) ⭐ **MOST CRITICAL**

#### 1. Open Booking Page
- [ ] Select a studio (e.g., "Simple Studio Sets")
- [ ] Modal opens with datetime picker

#### 2. Select Date & Time
- [ ] Calendar shows available dates (no past dates)
- [ ] Select start datetime
- [ ] Select end datetime
- [ ] System calculates price based on duration
- [ ] "Hold Studio" button becomes enabled

#### 3. Hold Studio
- [ ] Click "Hold Studio"
- [ ] Shows loading state
- [ ] Success: Displays price summary, lock token generated
- [ ] Error: Shows validation (e.g., end before start, overlap)

#### 4. User Details
- [ ] Fill form: Full Name, Email, Phone, Company (optional), Special Requirements
- [ ] Validation: Email format, phone format
- [ ] "Proceed to Payment" button enabled after valid input

#### 5. Payment (Mock/Test Mode)
- [ ] Stripe Elements loads (if integrated) or mock payment form
- [ ] Enter test card: `4242 4242 4242 4242`, any future date, CVC 123
- [ ] Submit payment
- [ ] Success: "Booking Confirmed!" message
- [ ] Email sent (check Zoho inbox if configured)

#### 6. Confirmation
- [ ] Booking appears in admin panel (`/admin/bookings`)
- [ ] Booking status = "CONFIRMED"
- [ ] User receives confirmation email (if email configured)

---

## 🔍 Step 4: Testing Critical Security Features

### Rate Limiting
```bash
# Test login rate limit (5 attempts/hour)
for i in {1..6}; do
  curl -X POST http://localhost:3001/api/auth/login \
    -H "Content-Type: application/json" \
    -d '{"username":"admin","password":"wrong"}'
done
# 6th request should return 429 Too Many Requests
```

### Authentication Required
```bash
# Test protected endpoint without auth
curl http://localhost:3001/api/studios
# Should return 401 Unauthorized
```

### Security Headers
```bash
curl -I http://localhost:3001/api/health
# Should include:
# - X-Content-Type-Options: nosniff
# - X-Frame-Options: SAMEORIGIN
# - X-XSS-Protection: 1; mode=block
# - Strict-Transport-Security (if NODE_ENV=production)
# - Content-Security-Policy (if NODE_ENV=production)
```

### CORS Check
```bash
curl -H "Origin: http://evil-site.com" http://localhost:3001/api/health -I
# Should NOT include Access-Control-Allow-Origin: *
# Should only allow FRONTEND_URL from backend .env
```

---

## 🐛 Step 5: Testing Error Scenarios

### Frontend Error Boundary
1. Open browser console
2. Trigger error: `(() => { throw new Error('Test error'); })()`
3. Should see custom error page (not blank/crashed)

### Backend Error Logging
- Check `backend/logs/error.log` for errors
- Should have structured JSON with request ID, timestamp

### API Error Responses
```bash
# Invalid booking data
curl -X POST http://localhost:3001/api/bookings/hold \
  -H "Content-Type: application/json" \
  -d '{"studio_id":"invalid","start_datetime":"bad","end_datetime":"bad"}'
# Should return 400 with validation error
```

---

## 📊 Step 6: Performance Checks

### Bundle Analysis
```bash
npm run build:analyze
# Open dist/bundle-analysis.html in browser
# Check:
# - Total bundle size (should be <250KB gzipped)
# - Vendor chunk size (~180KB)
# - Code splitting working? (multiple chunks)
```

### Lighthouse Audit
1. Open Chrome DevTools
2. Lighthouse tab
3. Run audit for Performance, Accessibility, SEO, Best Practices
4. **Target scores:** >85 each, >90 overall

---

## 🧪 Step 7: Database Testing

### Check Studios in DB
```bash
npx prisma studio
# Or manually:
curl -H "Authorization: Bearer <ADMIN_TOKEN>" http://localhost:3001/api/studios
```

### Create Test Studio (if needed)
```bash
curl -X POST http://localhost:3001/api/studios \
  -H "Authorization: Bearer <ADMIN_TOKEN>" \
  -H "Content-Type: application/json" \
  -d '{
    "name": "Test Studio",
    "description": "Test description",
    "hourly_rate": 5000,
    "features": ["WiFi", "AC"],
    "images": ["https://example.com/image.jpg"]
  }'
```

---

## 🧪 Step 8: Seeding Admin User

If you don't have admin credentials:

```bash
cd backend
npx prisma db seed
```

This will:
- Create admin user with random secure password
- Print password to console (development only)
- Hash with bcrypt 12 rounds

**Login:**
- Username: `admin`
- Password: (printed by seed command)

---

## ⚠️ Known Issues & Limitations

### What May Not Work:

1. **Email Not Configured**
   - If Zoho credentials not set, email sending fails silently
   - Check logs for email errors
   - Solution: Set ZOHO_EMAIL + ZOHO_APP_PASSWORD in backend .env

2. **Redis Not Configured**
   - Booking locks use DB (not Redis), so fine
   - Health check shows redis: "unavailable" (expected)

3. **Stripe Payment**
   - Payment integration may be incomplete
   - Test mode: Use sandbox keys or mock
   - Booking can be confirmed without real payment (test flow)

4. **Studio Images**
   - Using Unsplash URLs (external dependency)
   - If Unsplash blocked, images won't load

---

## 📸 Step 9: Screenshots for Verification

Take screenshots of these:

1. Homepage fully loaded
2. Book page with studio cards
3. Booking modal open
4. Successful booking confirmation
5. Admin dashboard with bookings list
6. 404 page
7. Error boundary triggered
8. Lighthouse scores

---

## 🚨 Step 10: What to Watch For

### In Browser Console:
- No red errors (warnings okay)
- No failed API calls (404, 500)
- No CORS errors
- No Mixed Content warnings (HTTPS vs HTTP)

### In Network Tab:
- API calls return correct status codes (200, 201, 400, 401, 429)
- Request IDs in headers (X-Request-ID)
- Response times <200ms for API calls

### In Backend Terminal:
- Clean logs with structured JSON
- No uncaught exceptions
- Graceful shutdown on Ctrl+C (SIGTERM)

---

## ✅ Quick Test Script

Run this automated test to verify basic connectivity:

```bash
#!/bin/bash
echo "=== API Health Check ==="
curl -s http://localhost:3001/api/health | jq .

echo -e "\n=== Get Studios (Public) ==="
curl -s http://localhost:3001/api/studios | jq '.studios | length'

echo -e "\n=== Get Studios (Admin - should fail without token) ==="
curl -s -o /dev/null -w "%{http_code}" http://localhost:3001/api/studios

echo -e "\n=== Login (with test credentials) ==="
curl -s -X POST http://localhost:3001/api/auth/login \
  -H "Content-Type: application/json" \
  -d '{"username":"admin","password":"YOUR_PASSWORD"}' | jq '.success, .user.username'

echo -e "\n=== All Checks Complete ==="
```

---

## 🎯 Next Steps After Testing

Once you confirm everything works:

1. **Create test account data**: Add sample studios, bookings
2. **Run full booking flow end-to-end**: Complete 2-3 test bookings
3. **Test edge cases**: Cancellation, rescheduling, overlapping bookings
4. **Verify email delivery**: Check Zoho inbox for booking confirmations
5. **Test on mobile**: Responsive design verification
6. **Run Lighthouse**: Document scores
7. **Consider Phase 3**: Add automated tests so you don't have to manually test every change

---

## 📞 Support

If something doesn't work:

1. **Check backend logs** (`backend/logs/` or terminal)
2. **Check browser console** (F12)
3. **Check network tab** for failed API calls
4. **Verify .env variables** are set correctly
5. **Database connected?** Check Prisma studio shows tables

---

**Ready to test?** Start your backend and frontend servers and work through the checklist above!

Koi specific feature test karna hai to batao, main detailed steps bata sakta hoon.
