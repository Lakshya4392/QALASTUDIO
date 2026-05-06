# Phase 1 Complete - Testing & Verification Guide

**Date**: April 1, 2026
**Status**: All critical security fixes implemented and compiled successfully

---

## ✅ Quick Verification Steps

### 1. Check TypeScript Build

```bash
cd backend
npm run build
```

**Expected**: Build completes with no errors.

---

### 2. Environment Setup

Before starting the server, ensure your `.env` file has these required variables:

```env
# Required (validation will fail without these)
JWT_SECRET=your-super-secret-random-string-min-32-chars
DATABASE_URL=postgresql://...
ZOHO_EMAIL=your-email@domain.com
ZOHO_APP_PASSWORD=your-app-password

# Optional but recommended
FRONTEND_URL=http://localhost:5173
NODE_ENV=development  # or 'production'
SEED_ADMIN_PASSWORD=  # Will auto-generate if not set
```

**Note**: If `JWT_SECRET` is shorter than 32 characters, server will not start (in production mode).

---

### 3. Start the Server

```bash
cd backend
npm run dev
```

**Expected Output**:
```
✅ Environment validation passed
🚀 Server running on port 3001
📊 Environment: development
📊 Frontend should be at http://localhost:5173
[Cleanup] Starting expired lock cleanup job
```

**Check for log files**:
- `logs/combined.log` - All request logs
- `logs/error.log` - Error logs only

---

### 4. Test Health Endpoint

```bash
curl http://localhost:3001/api/health
```

**Expected Response**:
```json
{
  "status": "ok",
  "timestamp": "2026-04-01T12:00:00.000Z"
}
```

**Check logs**: Should see request log entry in `logs/combined.log`

---

### 5. Test Admin Routes Require Auth

```bash
curl http://localhost:3001/api/studios
```

**Expected Response**:
```json
{
  "error": "Access token required"
}
```

**Status Code**: `401 Unauthorized`

---

### 6. Test Rate Limiting

```bash
# Make 6 rapid login attempts with wrong credentials
for i in {1..6}; do
  curl -X POST http://localhost:3001/api/auth/login \
    -H "Content-Type: application/json" \
    -d '{"username":"admin","password":"wrong"}' \
    -w "\nStatus: %{http_code}\n"
done
```

**Expected**: 6th request should return `429 Too Many Requests`

**Note**: Wait 1 hour for reset, or restart server to clear (in dev).

---

### 7. Test Security Headers

```bash
curl -I http://localhost:3001/api/health
```

**Expected Headers** (some may vary):
```
x-content-type-options: nosniff
x-frame-options: SAMEORIGIN
x-xss-protection: 1; mode=block
strict-transport-security: max-age=31536000; includeSubDomains; preload  (only in production)
x-request-id: req-1-1234567890
```

---

### 8. Test Request ID Tracing

```bash
curl http://localhost:3001/api/health -H "X-Request-ID: my-test-id"
```

**Response Headers** should include:
```
X-Request-ID: my-test-id
```

---

### 9. Test Graceful Shutdown

In a separate terminal:
```bash
# Get the PID
ps aux | grep node

# Send SIGTERM
kill -TERM <pid>
```

**Expected Logs**:
```
[info] Server started successfully...
[info] Received SIGTERM, starting graceful shutdown...
[info] Stopped lock cleanup job
[info] Database connection closed
[info] Graceful shutdown complete
```

---

### 10. Test Seed Password Generation

```bash
cd backend
npx prisma db seed
```

**Expected Output** (in development):
```
🌱 Starting database seed...
✅ Admin user created/updated: admin
⚠️  IMPORTANT: Generated admin password: Xy7$kL9@mP2!wQ5*
⚠️  Save this password! You will need it to login to the admin panel.
✅ Studio created: Simple Studio Sets
✅ Studio created: Golden Hour Studio
✅ Content created: HERO
...
🎉 Database seeding completed!
```

**Note**: In production, password won't be logged (only if SEED_ADMIN_PASSWORD is set).

---

### 11. Test Admin Login

```bash
curl -X POST http://localhost:3001/api/auth/login \
  -H "Content-Type: application/json" \
  -d '{"username":"admin","password":"THE_PASSWORD_FROM_SEED"}'
```

**Expected Response**:
```json
{
  "success": true,
  "token": "eyJhbG...",
  "user": {
    "id": "...",
    "username": "admin",
    "email": "admin@qalastudios.com",
    "role": "SUPER_ADMIN",
    "created_at": "..."
  }
}
```

---

### 12. Test Protected Endpoint with Token

```bash
TOKEN="eyJhbG..."  # from previous login

curl http://localhost:3001/api/studios \
  -H "Authorization: Bearer $TOKEN"
```

**Expected**: List of studios (2 studios from seed)

---

### 13. Test Booking Flow (Hold)

```bash
curl -X POST http://localhost:3001/api/bookings/hold \
  -H "Content-Type: application/json" \
  -d '{
    "studio_id": "qala-studio",
    "start_datetime": "2026-04-01T10:00:00.000Z",
    "end_datetime": "2026-04-01T12:00:00.000Z"
  }'
```

**Expected**: Lock token and pricing preview

---

## 🐛 Known Issues After Phase 1

1. **Booking `pricingService` bug** - FIXED (in this Phase 1 implementation)
2. **Frontend API URL** - Not yet fixed (frontend uses localhost hardcoded)
3. **CSRF protection** - Not implemented (medium priority)
4. **Complete pricing engine** - WEEKEND/PEAK/SEASONAL rules incomplete
5. **Health check** - Doesn't check DB/Redis status yet

---

## 📊 Test Checklist

- [ ] TypeScript build passes (`npm run build`)
- [ ] Environment validation passes on startup
- [ ] Server starts without errors
- [ ] Health endpoint returns 200 OK
- [ ] Security headers present in response
- [ ] Admin routes return 401 without token
- [ ] Rate limiting blocks after 5 auth attempts
- [ ] Request ID tracing works (echo header)
- [ ] Graceful shutdown handles SIGTERM
- [ ] Winston logs written to files
- [ ] Seed generates/uses secure password
- [ ] Login works with generated password
- [ ] Token obtained from login grants access to protected routes

---

## 🔧 Troubleshooting

### "Environment validation failed" on startup
- Check JWT_SECRET exists in .env
- Ensure JWT_SECRET is at least 32 characters (in production)
- Verify DATABASE_URL, ZOHO_EMAIL, ZOHO_APP_PASSWORD are set

### "Cannot find module 'helmet'" or similar
- Run `npm install` again to ensure all packages installed

### Build errors about `winston.transports`
- Ensure `winston` package is installed: `npm list winston`

### Port 3001 already in use
- Kill the existing process: `pkill -f "node.*index.ts"` or use different PORT

### Database connection errors
- Verify DATABASE_URL is correct and database is accessible
- Check Neon dashboard for connection status

### Login fails with valid credentials
- Check if admin user exists: `npx prisma studio` or direct DB query
- Verify password hash: re-run seed if needed

---

## 🎯 Next Phase Priority

Once Phase 1 is verified working, move to:

**Phase 2: Production-Ready Backend** (Estimated 2-3 days)
1. Complete pricing engine (WEEKEND, PEAK_HOUR, SEASONAL)
2. Database connection pooling configuration
3. Request timeout handling
4. Database constraints (check constraints)
5. Enhanced health check (DB ping, uptime)
6. Remove hardcoded Zoho email from service

---

## 📝 Notes for Production Deployment

When deploying to production:

1. **Set strong JWT_SECRET**:
   ```bash
   openssl rand -base64 48
   ```

2. **Set NODE_ENV=production**:
   - Enables HTTPS enforcement
   - Enables strict CSP
   - Disables development warnings
   - Hides stack traces from errors

3. **Configure FRONTEND_URL**:
   ```
   FRONTEND_URL=https://yourdomain.com,https://www.yourdomain.com
   ```

4. **Prepare logs directory**:
   ```bash
   mkdir -p logs
   chmod 755 logs
   ```

5. **Setup log rotation** (use logrotate on Linux)

6. **Monitor logs**:
   ```bash
   tail -f logs/combined.log
   tail -f logs/error.log
   ```

---

**Phase 1 Implementation Complete!** 🎉

All critical security vulnerabilities have been addressed.
Your backend is now production-locked down with proper authentication, rate limiting, security headers, structured logging, and graceful shutdown.

**Report any issues to your development team before proceeding to Phase 2.**
