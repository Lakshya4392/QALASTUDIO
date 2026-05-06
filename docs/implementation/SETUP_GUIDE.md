# Qala Studios - Manual Setup Guide

## Project Overview
Qala Studios is a full-stack booking system with:
- **Frontend**: React + TypeScript + Vite (Port 3003)
- **Backend**: Node.js + Express + TypeScript (Port 3001)
- **Database**: PostgreSQL with Prisma ORM
- **Cache**: Redis for session management
- **AI Integration**: Google Gemini API

## Prerequisites

Before running the project, ensure you have:

1. **Node.js** (v18 or higher)
2. **PostgreSQL** database running
3. **Redis** server running
4. **Google Gemini API Key**

## Manual Setup Steps

### 1. Database Setup

First, ensure PostgreSQL is running and create the database:

```bash
# Connect to PostgreSQL
psql -U your_username

# Create database
CREATE DATABASE studio_booking_system;

# Exit PostgreSQL
\q
```

### 2. Redis Setup

Ensure Redis is running on the default port (6379):

```bash
# Start Redis (macOS with Homebrew)
brew services start redis

# Or start Redis manually
redis-server
```

### 3. Backend Setup

Navigate to the backend directory and install dependencies:

```bash
cd "Qala Studios/backend"

# Install dependencies
npm install

# Set up environment variables
# Edit .env file with your database credentials:
# DATABASE_URL="postgresql://your_username@localhost:5432/studio_booking_system"
# REDIS_URL="redis://localhost:6379"
# PORT=3001
# GEMINI_API_KEY="your-actual-gemini-api-key"

# Push database schema
npm run db:push

# Seed the database (optional)
npx ts-node prisma/seed.ts

# Start backend development server
npm run dev
```

The backend will start on **http://localhost:3001**

### 4. Frontend Setup

Open a new terminal and navigate to the frontend directory:

```bash
cd "Qala Studios"

# Install dependencies
npm install

# Set up environment variables
# Edit .env.local file:
# GEMINI_API_KEY=your-actual-gemini-api-key

# Start frontend development server
npm run dev
```

The frontend will start on **http://localhost:3003** (or next available port)

## Current Running Status

✅ **Backend**: Running on http://localhost:3001
✅ **Frontend**: Running on http://localhost:3003

## Available Scripts

### Backend Scripts
- `npm run dev` - Start development server with hot reload
- `npm run build` - Build for production
- `npm run start` - Start production server
- `npm run db:push` - Push schema changes to database
- `npm run db:studio` - Open Prisma Studio (database GUI)

### Frontend Scripts
- `npm run dev` - Start development server
- `npm run build` - Build for production
- `npm run preview` - Preview production build

## Key Features Implemented

1. **Secure AI Integration**: Gemini API calls proxied through backend
2. **Booking System**: Full booking flow with availability checking
3. **Concurrency Safety**: Serializable transactions prevent double-bookings
4. **Smart Suggestions**: Alternative slot recommendations
5. **Lock Cleanup**: Automated cleanup of expired booking holds
6. **Premium UI**: High-end design with interactive elements

## Troubleshooting

### Port Already in Use
If you get "EADDRINUSE" errors:

```bash
# Find process using the port
lsof -ti:3001

# Kill the process
kill -9 <process_id>
```

### Database Connection Issues
- Ensure PostgreSQL is running
- Check DATABASE_URL in .env file
- Verify database exists and user has permissions

### Redis Connection Issues
- Ensure Redis is running: `redis-cli ping` should return "PONG"
- Check REDIS_URL in .env file

## Environment Variables

### Backend (.env)
```
DATABASE_URL="postgresql://username@localhost:5432/studio_booking_system"
REDIS_URL="redis://localhost:6379"
PORT=3001
GEMINI_API_KEY="your-gemini-api-key"
```

### Frontend (.env.local)
```
GEMINI_API_KEY=your-gemini-api-key
```

## Next Steps

The project is ready for development. You can:
1. Access the frontend at http://localhost:3003
2. Test the booking system
3. Use the AI assistant feature
4. View database with Prisma Studio: `npm run db:studio`

## Production Deployment

For production deployment:
1. Build both frontend and backend: `npm run build`
2. Set up production database and Redis
3. Configure environment variables for production
4. Deploy using your preferred hosting service