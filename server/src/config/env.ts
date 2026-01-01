/**
 * Environment Variable Validation and Configuration
 * 
 * This module validates all required environment variables at startup.
 * It must be imported BEFORE Prisma Client is initialized to prevent
 * Prisma from running with invalid DATABASE_URL.
 * 
 * Why this is needed:
 * - Prisma requires valid DATABASE_URL at schema load time
 * - CapRover uses environment variables (not .env files)
 * - Local development uses .env files
 * - We need to validate before any database operations
 */

import dotenv from 'dotenv';

// Load .env file if it exists (for local development)
// In CapRover, environment variables are set directly, so this is optional
dotenv.config();

interface EnvConfig {
  NODE_ENV: string;
  PORT: number;
  DATABASE_URL: string;
  JWT_SECRET: string;
  JWT_EXPIRES_IN: string;
  FRONTEND_URL?: string;
}

function validateEnv(): EnvConfig {
  const errors: string[] = [];

  // NODE_ENV
  const NODE_ENV = process.env.NODE_ENV || 'development';

  // PORT
  const PORT = parseInt(process.env.PORT || '3001', 10);
  if (isNaN(PORT) || PORT < 1 || PORT > 65535) {
    errors.push('PORT must be a valid number between 1 and 65535');
  }

  // DATABASE_URL - CRITICAL: Must be valid PostgreSQL URL
  const DATABASE_URL = process.env.DATABASE_URL;
  if (!DATABASE_URL) {
    errors.push('DATABASE_URL is required but not set');
  } else if (!DATABASE_URL.startsWith('postgresql://') && !DATABASE_URL.startsWith('postgres://')) {
    const preview = DATABASE_URL.length > 50 ? DATABASE_URL.substring(0, 50) + '...' : DATABASE_URL;
    errors.push(
      `DATABASE_URL must start with 'postgresql://' or 'postgres://'. ` +
      `Current value: ${preview}`
    );
  }

  // JWT_SECRET
  const JWT_SECRET = process.env.JWT_SECRET;
  if (!JWT_SECRET) {
    errors.push('JWT_SECRET is required but not set');
  } else if (JWT_SECRET.length < 32) {
    errors.push('JWT_SECRET must be at least 32 characters long for security');
  }

  // JWT_EXPIRES_IN
  const JWT_EXPIRES_IN = process.env.JWT_EXPIRES_IN || '7d';

  // FRONTEND_URL (optional)
  const FRONTEND_URL = process.env.FRONTEND_URL;

  // If there are errors, throw before Prisma tries to connect
  if (errors.length > 0) {
    const errorMessage = [
      '❌ Environment variable validation failed:',
      ...errors.map(err => `  - ${err}`),
      '',
      '💡 For CapRover: Set these in App Configs → Environment Variables',
      '💡 For local dev: Create a .env file in the server directory',
      '',
      'Example DATABASE_URL:',
      '  postgresql://postgres:password@host:5432/dbname',
    ].join('\n');
    
    console.error(errorMessage);
    throw new Error('Environment variable validation failed');
  }

  // TypeScript assertion: At this point, DATABASE_URL and JWT_SECRET are guaranteed to be strings
  // because validation would have thrown if they were undefined
  return {
    NODE_ENV,
    PORT,
    DATABASE_URL: DATABASE_URL!,
    JWT_SECRET: JWT_SECRET!,
    JWT_EXPIRES_IN,
    FRONTEND_URL,
  };
}

// Validate and export config
export const env = validateEnv();

// Also export individual values for convenience
export const {
  NODE_ENV,
  PORT,
  DATABASE_URL,
  JWT_SECRET,
  JWT_EXPIRES_IN,
  FRONTEND_URL,
} = env;

