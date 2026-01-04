# Fix Local Setup Errors

## Issues Found:

1. ✅ **Node processes killed** - Port 3001 should be free now
2. ✅ **Old migrations removed** - Ready for fresh start
3. ⚠️ **Your .env still has SQLite** - Need to update to PostgreSQL

## Step-by-Step Fix:

### 1. Update Your `.env` File

Open `server/.env` and change:

**FROM:**
```env
DATABASE_URL="file:./dev.db"
```

**TO:**
```env
DATABASE_URL="postgresql://postgres:Swapnil%40123@localhost:5432/task_management?schema=public"
```

**Important:** Your password `Swapnil@123` contains `@`, so it must be URL-encoded as `%40`

### 2. Also Update JWT_SECRET

Change:
```env
JWT_SECRET="your-super-secret-jwt-key-change-this-in-production-min-32-chars-long"
```

To:
```env
JWT_SECRET="736aff9e2f4582a0126796ee2568e56a7f9f55720d042db3e56dc2c8f24b4e2b"
```

### 3. Clean Install

```powershell
cd server

# Remove Prisma cache
Remove-Item -Recurse -Force node_modules\.prisma -ErrorAction SilentlyContinue

# Install dependencies (will auto-detect PostgreSQL)
npm install

# Create fresh migrations for PostgreSQL
npm run prisma:migrate

# Seed database
npm run seed

# Start server
npm run dev
```

### 4. If Port 3001 Still in Use

```powershell
# Find what's using port 3001
netstat -ano | findstr :3001

# Kill the process (replace PID with the number from above)
Stop-Process -Id <PID> -Force
```

## Your Complete `.env` Should Look Like:

```env
DATABASE_URL="postgresql://postgres:Swapnil%40123@localhost:5432/task_management?schema=public"
JWT_SECRET="736aff9e2f4582a0126796ee2568e56a7f9f55720d042db3e56dc2c8f24b4e2b"
JWT_EXPIRES_IN=7d
PORT=3001
NODE_ENV=development
FRONTEND_URL=http://localhost:5173
```

## Verify Database Connection:

Make sure:
- ✅ PostgreSQL is running
- ✅ Database `task_management` exists in pgAdmin 4
- ✅ Username is `postgres`
- ✅ Password is `Swapnil@123`

