// Test setup file for Jest
// This file runs before each test file

// Set test environment variables
process.env.NODE_ENV = 'test';
process.env.JWT_SECRET = 'test-jwt-secret-min-32-chars-long-for-testing-only';
process.env.FRONTEND_URL = 'http://localhost:5173';

// Use the same database but with transaction rollback for isolation
// For proper isolation, tests should use Prisma transactions

// Global test timeout (30 seconds)
jest.setTimeout(30000);

// Mock console methods to reduce noise in tests
global.console = {
  ...console,
  log: jest.fn(),
  debug: jest.fn(),
  info: jest.fn(),
  warn: jest.fn(),
  error: jest.fn(),
};

// Mock Winston logger
jest.mock('./middleware/logger.middleware', () => ({
  __esModule: true,
  default: {
    info: jest.fn(),
    warn: jest.fn(),
    error: jest.fn(),
    debug: jest.fn(),
  },
  requestLogger: jest.fn((req, res, next) => next()),
  requestIdMiddleware: jest.fn((req, res, next) => next()),
}));

// Mock auth middleware
jest.mock('./middleware/auth.middleware', () => ({
  __esModule: true,
  authenticateToken: jest.fn((req, res, next) => {
    (req as any).user = { userId: 'test-user', username: 'testadmin', role: 'ADMIN' };
    next();
  }),
  requireRole: jest.fn((req, res, next) => next()),
}));

// Mock validation middleware
jest.mock('./middleware/validation.middleware', () => ({
  __esModule: true,
  validateEnvironment: jest.fn(),
  requestSizeLimit: jest.fn(() => (req, res, next) => next()),
  enforceHTTPS: jest.fn(() => (req, res, next) => next()),
}));

// Mock timeout middleware
jest.mock('./middleware/timeout.middleware', () => ({
  __esModule: true,
  timeout: jest.fn(() => (req, res, next) => next()),
  TIMEOUTS: {
    GENERAL: 30000,
    DATABASE: 10000,
    LONG: 60000,
    AUTH: 5000,
  },
}));

// Mock Prisma client
jest.mock('./config/db', () => ({
  __esModule: true,
  default: {
    studio: {
      findMany: jest.fn().mockResolvedValue([]),
      findUnique: jest.fn(),
      create: jest.fn(),
      update: jest.fn(),
      delete: jest.fn(),
      deleteMany: jest.fn(),
    },
    booking: {
      findMany: jest.fn().mockResolvedValue([]),
      findUnique: jest.fn(),
      create: jest.fn(),
      update: jest.fn(),
      delete: jest.fn(),
      deleteMany: jest.fn(),
      count: jest.fn().mockResolvedValue(0),
      aggregate: jest.fn().mockResolvedValue({ _sum: { total_price: 0 } }),
    },
    userDetails: {
      findMany: jest.fn().mockResolvedValue([]),
      findUnique: jest.fn(),
      create: jest.fn(),
      update: jest.fn(),
      delete: jest.fn(),
      deleteMany: jest.fn(),
    },
    adminUser: {
      findFirst: jest.fn(),
      findUnique: jest.fn(),
      create: jest.fn(),
      update: jest.fn(),
      deleteMany: jest.fn(),
    },
    content: {
      findMany: jest.fn().mockResolvedValue([]),
      findFirst: jest.fn(),
      upsert: jest.fn(),
      update: jest.fn(),
      create: jest.fn(),
      deleteMany: jest.fn(),
    },
    enquiry: {
      findMany: jest.fn().mockResolvedValue([]),
      findUnique: jest.fn(),
      create: jest.fn(),
      update: jest.fn(),
      delete: jest.fn(),
      deleteMany: jest.fn(),
      count: jest.fn().mockResolvedValue(0),
    },
    $disconnect: jest.fn(),
    $queryRaw: jest.fn(),
  },
}));

// Test utilities
export const testHelper = {
  // Generate test data
  generateEmail: () => `test${Date.now()}@example.com`,
  generatePhone: () => `+1${Math.floor(Math.random() * 10000000000)}`,
  generateName: () => `Test User ${Date.now()}`,

  // Sleep utility
  sleep: (ms: number) => new Promise(resolve => setTimeout(resolve, ms)),

  // Create valid admin credentials
  adminCredentials: {
    username: 'admin',
    password: 'AdminPass123!'
  }
};