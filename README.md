<<<<<<< HEAD
# QALASTUDIO
=======
<div align="center">
<img width="1200" height="475" alt="GHBanner" src="https://github.com/user-attachments/assets/0aa67016-6eaf-458a-adb2-6e31a0763ed6" />
</div>

# Qala Studios - Professional Studio Booking Platform

A full-stack booking platform for Qala Studios with email confirmation system, built with React, Node.js, Express, and PostgreSQL.

## Features

- 🎬 Studio booking system with real-time availability
- 📧 Email confirmation system with Zoho Mail integration
- 💳 Payment processing integration
- 📱 Responsive design for mobile and desktop
- 🔒 Secure user data handling
- ✅ Property-based testing with fast-check
- 🚀 CI/CD with GitHub Actions

## Tech Stack

**Frontend:**
- React 18 with TypeScript
- Vite for build tooling
- TailwindCSS for styling
- React Router for navigation

**Backend:**
- Node.js with Express
- PostgreSQL database
- Prisma ORM
- Zoho Mail for email delivery
- PM2 for process management

## Run Locally

### Prerequisites
- Node.js 20+
- PostgreSQL 14+
- npm or yarn

### Frontend Setup

1. Install dependencies:
   ```bash
   cd "Qala Studios"
   npm install
   ```

2. Set environment variables in `.env.local`:
   ```env
   VITE_API_URL=http://localhost:3001
   GEMINI_API_KEY=your_gemini_api_key
   ```

3. Run the app:
   ```bash
   npm run dev
   ```

Frontend runs on: http://localhost:5173

### Backend Setup

1. Install dependencies:
   ```bash
   cd "Qala Studios/backend"
   npm install
   ```

2. Set environment variables in `.env`:
   ```env
   DATABASE_URL="postgresql://user:password@localhost:5432/studio_booking_system"
   PORT=3001
   ZOHO_EMAIL="your_email@domain.com"
   ZOHO_APP_PASSWORD="your_zoho_app_password"
   ```

3. Run database migrations:
   ```bash
   npx prisma migrate dev
   npx prisma generate
   ```

4. Start the server:
   ```bash
   npm run dev
   ```

Backend runs on: http://localhost:3001

## Deploy to AWS

Complete deployment guide for AWS EC2 with S3 + CloudFront.

**Cost: ~$12/month** (4 months free with $50 credit)

### Quick Start

1. **Read the deployment guide:**
   - [DEPLOYMENT_GUIDE.md](DEPLOYMENT_GUIDE.md) - Complete step-by-step guide
   - [QUICK_DEPLOY.md](QUICK_DEPLOY.md) - Quick reference
   - [DEPLOYMENT_CHECKLIST.md](DEPLOYMENT_CHECKLIST.md) - Track your progress

2. **Understand the costs:**
   - [AWS_COST_CALCULATOR.md](AWS_COST_CALCULATOR.md) - Detailed cost breakdown

3. **Deploy:**
   - Follow the 9-phase deployment process
   - Setup CI/CD with GitHub Actions
   - Configure monitoring and backups

### Deployment Architecture

```
Internet → CloudFront (Frontend) → EC2 (Backend + PostgreSQL)
```

**Total deployment time:** ~1.5 hours  
**Difficulty:** Medium  
**Monthly cost:** $12 (with $50 credit = 4 months free)

## Documentation

- [EMAIL_SYSTEM_README.md](EMAIL_SYSTEM_README.md) - Email confirmation system details
- [SETUP_GUIDE.md](SETUP_GUIDE.md) - Development setup guide
- [DEPLOYMENT_SUMMARY.md](DEPLOYMENT_SUMMARY.md) - Deployment overview

## Testing

```bash
# Run unit tests
npm test

# Run property-based tests
npm test -- user-details.property.test.ts
```

## Project Structure

```
Qala Studios/
├── components/          # React components
├── pages/              # Page components
├── services/           # API services
├── backend/            # Express backend
│   ├── src/
│   │   ├── domains/    # Business logic
│   │   ├── services/   # Email, external services
│   │   └── routes/     # API routes
│   └── prisma/         # Database schema
├── scripts/            # Deployment scripts
└── .github/workflows/  # CI/CD pipelines
```

## Environment Variables

### Frontend (.env.local)
```env
VITE_API_URL=http://localhost:3001
GEMINI_API_KEY=your_gemini_api_key
```

### Backend (.env)
```env
DATABASE_URL="postgresql://user:password@localhost:5432/studio_booking_system"
PORT=3001
NODE_ENV=development
ZOHO_EMAIL="your_email@domain.com"
ZOHO_APP_PASSWORD="your_zoho_app_password"
JWT_SECRET="your_secret_key"
```

## Contributing

1. Fork the repository
2. Create your feature branch (`git checkout -b feature/amazing-feature`)
3. Commit your changes (`git commit -m 'Add amazing feature'`)
4. Push to the branch (`git push origin feature/amazing-feature`)
5. Open a Pull Request

## License

This project is private and proprietary.

## Support

For issues or questions:
- Create an issue in this repository
- Contact: harshdeepsingh@dronie.tech

---

**View in AI Studio:** https://ai.studio/apps/drive/1OrDscjAHwBzTWPixjcYQkre9V5tWrOvP
>>>>>>> 8009d01 (chore: migrate to Vercel and Render (with Neon DB))
