# Production Environment Setup

This document explains the production-safe environment variable validation system implemented in this application.

## Overview

The application now validates all required environment variables **before** Prisma Client is initialized, preventing runtime errors with invalid DATABASE_URL or missing configuration.

## Key Features

1. **Early Validation**: Environment variables are validated at application startup, before any database operations
2. **Clear Error Messages**: If validation fails, you get clear, actionable error messages
3. **CapRover Compatible**: Works seamlessly with CapRover's environment variable system
4. **Local Development Support**: Also supports `.env` files for local development
5. **Automatic Prisma Setup**: `postinstall` script automatically runs `prisma generate`, and `start` script runs migrations before starting

## File Structure

```
server/
├── src/
│   ├── config/
│   │   └── env.ts          # Environment validation (VALIDATED FIRST)
│   ├── index.ts            # Entry point (imports env.ts FIRST)
│   ├── routes/
│   └── middleware/
├── .env.example            # Template for local development
└── package.json            # Scripts configured for production
```

## Required Environment Variables

All these must be set in CapRover (App Configs → Environment Variables):

```env
NODE_ENV=production
PORT=80
DATABASE_URL=postgresql://postgres:PASSWORD@srv-captain--postgres:5432/postgres
JWT_SECRET=your-super-secret-jwt-key-minimum-32-characters-long
JWT_EXPIRES_IN=7d
FRONTEND_URL=https://your-app.captain.yourdomain.com
```

### Validation Rules

- **DATABASE_URL**: 
  - Must be set
  - Must start with `postgresql://` or `postgres://`
  - Format: `postgresql://username:password@host:port/database`

- **JWT_SECRET**:
  - Must be set
  - Minimum 32 characters (enforced for security)
  - Generate one: `node -e "console.log(require('crypto').randomBytes(32).toString('hex'))"`

- **PORT**:
  - Must be a valid number between 1 and 65535
  - Default: 3001 (development), 80 (production/CapRover)

- **JWT_EXPIRES_IN**:
  - Optional, defaults to `7d`
  - Format: number + unit (e.g., `7d`, `24h`, `3600s`)

- **FRONTEND_URL**:
  - Optional
  - Used for CORS configuration

## How It Works

### Startup Flow

1. **`index.ts` imports `config/env.ts` FIRST** (before any Prisma imports)
2. **`config/env.ts` validates all environment variables**
3. If validation fails → **Application exits with clear error message**
4. If validation passes → **Application continues to load routes, middleware, etc.**
5. **Prisma Client** is initialized in routes/middleware (DATABASE_URL is already validated)

### Package.json Scripts

```json
{
  "postinstall": "prisma generate",        // Auto-run after npm install
  "start": "prisma migrate deploy && node dist/index.js"  // Run migrations, then start
}
```

**Why `postinstall`?**
- CapRover runs `npm install` during build
- `prisma generate` must run after `npm install` to generate Prisma Client
- This ensures Prisma Client is always available when the app starts

**Why migrations in `start`?**
- `prisma migrate deploy` applies pending migrations in production
- Runs before the server starts to ensure database schema is up-to-date
- Safe to run multiple times (only applies new migrations)

## Error Messages

If environment validation fails, you'll see:

```
❌ Environment variable validation failed:
  - DATABASE_URL is required but not set

💡 For CapRover: Set these in App Configs → Environment Variables
💡 For local dev: Create a .env file in the server directory

Example DATABASE_URL:
  postgresql://postgres:password@host:5432/dbname
```

## Local Development

1. Copy `.env.example` to `.env`:
   ```bash
   cd server
   cp .env.example .env
   ```

2. Edit `.env` with your local values

3. Run the app:
   ```bash
   npm run dev
   ```

## CapRover Deployment

1. **Set Environment Variables** in CapRover:
   - Go to your app → App Configs
   - Add all required environment variables
   - Click "Save & Update"

2. **Deploy**: CapRover will:
   - Build the Docker image
   - Run `npm install` (which triggers `postinstall` → `prisma generate`)
   - Run `npm start` (which runs `prisma migrate deploy` then starts server)

3. **First Deployment**:
   - After first deploy, database migrations will run automatically
   - Optional: Run `npm run seed` in container terminal to seed initial data

## Troubleshooting

### Error: "DATABASE_URL must start with 'postgresql://' or 'postgres://'"

**Solution**: Check your DATABASE_URL format in CapRover. Make sure it's:
- Not empty
- Starts with `postgresql://` or `postgres://`
- Uses `srv-captain--postgres` for internal CapRover PostgreSQL

### Error: "JWT_SECRET must be at least 32 characters long"

**Solution**: Generate a new JWT_SECRET:
```bash
node -e "console.log(require('crypto').randomBytes(32).toString('hex'))"
```
Set it in CapRover environment variables.

### Error: "Prisma Client could not locate the Query Engine"

**Solution**: This should not happen with the new setup, but if it does:
1. Make sure `prisma generate` ran (check build logs)
2. Verify `binaryTargets` in `schema.prisma` includes `linux-musl-openssl-3.0.x` for Alpine Linux

### Migrations not running?

**Solution**: Check that your `start` script includes `prisma migrate deploy`:
```json
"start": "prisma migrate deploy && node dist/index.js"
```

## Benefits

✅ **Fail Fast**: Invalid configuration is caught immediately at startup  
✅ **Clear Errors**: Actionable error messages tell you exactly what's wrong  
✅ **Production Safe**: No more runtime errors from missing env vars  
✅ **Automatic Setup**: Prisma Client and migrations run automatically  
✅ **CapRover Ready**: Works seamlessly with CapRover's deployment system  

