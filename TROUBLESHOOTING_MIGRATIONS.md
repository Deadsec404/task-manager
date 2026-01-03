# TaskFlow Database Migration Troubleshooting Guide

## Problem: "Invalid email or password" Login Error with Database Migration Failures

### Symptoms
- Login fails with error: "Invalid email or password"
- Signup fails with error: "Failed to register user"
- Docker logs show migration errors with code `P3009`
- Error mentions SQLite types (DATETIME) being used with PostgreSQL

### Root Cause
Prisma-generated migrations use SQLite syntax (DATETIME, PRAGMA, PRIMARY KEY) but the app is deployed with **PostgreSQL** database. This mismatch causes:
1. Migrations to fail
2. Database tables never get created
3. Login system fails because User table doesn't exist

---

## Solution: Step-by-Step Fix

### Prerequisites
- SSH/Terminal access to VPS
- Docker installed
- GitHub repository access

### Step 1: Create Proper PostgreSQL Migration

**Location**: `server/prisma/migrations/20260103000000_init/migration.sql`

**Content**: Create a migration file with proper PostgreSQL syntax:

```sql
-- CreateTable User
CREATE TABLE "User" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "email" TEXT NOT NULL UNIQUE,
    "password" TEXT NOT NULL,
    "name" TEXT,
    "role" TEXT NOT NULL DEFAULT 'USER',
    "preferredCurrency" TEXT NOT NULL DEFAULT 'USD',
    "createdAt" TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP
);

CREATE INDEX "User_email_idx" ON "User"("email");

-- CreateTable Workspace
CREATE TABLE "Workspace" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "name" TEXT NOT NULL,
    "description" TEXT,
    "userId" TEXT NOT NULL,
    "createdAt" TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT "Workspace_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User" ("id") ON DELETE CASCADE ON UPDATE CASCADE
);

CREATE INDEX "Workspace_userId_idx" ON "Workspace"("userId");

-- CreateTable Task
CREATE TABLE "Task" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "title" TEXT NOT NULL,
    "description" TEXT,
    "status" TEXT NOT NULL DEFAULT 'TODO',
    "priority" TEXT NOT NULL DEFAULT 'MEDIUM',
    "dueDate" TIMESTAMP,
    "workspaceId" TEXT NOT NULL,
    "createdAt" TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT "Task_workspaceId_fkey" FOREIGN KEY ("workspaceId") REFERENCES "Workspace" ("id") ON DELETE CASCADE ON UPDATE CASCADE
);

CREATE INDEX "Task_workspaceId_idx" ON "Task"("workspaceId");
CREATE INDEX "Task_status_idx" ON "Task"("status");

-- CreateTable Expense
CREATE TABLE "Expense" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "amount" REAL NOT NULL,
    "currency" TEXT NOT NULL DEFAULT 'USD',
    "category" TEXT NOT NULL,
    "subCategory" TEXT,
    "paymentMethod" TEXT NOT NULL,
    "date" TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "notes" TEXT,
    "workspaceId" TEXT NOT NULL,
    "createdAt" TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT "Expense_workspaceId_fkey" FOREIGN KEY ("workspaceId") REFERENCES "Workspace" ("id") ON DELETE CASCADE ON UPDATE CASCADE
);

CREATE INDEX "Expense_workspaceId_idx" ON "Expense"("workspaceId");
CREATE INDEX "Expense_date_idx" ON "Expense"("date");
CREATE INDEX "Expense_category_idx" ON "Expense"("category");

-- CreateTable Habit
CREATE TABLE "Habit" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "name" TEXT NOT NULL,
    "description" TEXT,
    "frequency" TEXT NOT NULL DEFAULT 'DAILY',
    "streak" INTEGER NOT NULL DEFAULT 0,
    "lastCompletedAt" TIMESTAMP,
    "workspaceId" TEXT NOT NULL,
    "createdAt" TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT "Habit_workspaceId_fkey" FOREIGN KEY ("workspaceId") REFERENCES "Workspace" ("id") ON DELETE CASCADE ON UPDATE CASCADE
);

CREATE INDEX "Habit_workspaceId_idx" ON "Habit"("workspaceId");

-- CreateTable Session
CREATE TABLE "Session" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "userId" TEXT NOT NULL,
    "token" TEXT NOT NULL,
    "expiresAt" TIMESTAMP NOT NULL,
    "createdAt" TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT "Session_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User" ("id") ON DELETE CASCADE ON UPDATE CASCADE
);

CREATE INDEX "Session_userId_idx" ON "Session"("userId");
CREATE INDEX "Session_token_idx" ON "Session"("token");
```

**Key Differences from SQLite**:
- ✅ `TIMESTAMP` instead of `DATETIME`
- ✅ No `PRAGMA` statements
- ✅ `TEXT NOT NULL PRIMARY KEY` for primary keys
- ✅ PostgreSQL-specific syntax

### Step 2: Delete Old Corrupted Migration Folders

**From GitHub**: Delete migration folders with incorrect migrations:
- `server/prisma/migrations/20251230070613_npm_run_seed/`
- `server/prisma/migrations/20251230083648_/`

**From Docker Container**:
```bash
# Get container ID
docker ps --filter name=task-management --format 'table {{.Names}}\t{{.ID}}'

# Delete old migrations
docker exec <CONTAINER_ID> rm -rf /app/prisma/migrations/20251230070613_npm_run_seed /app/prisma/migrations/20251230083648_
```

### Step 3: Reset Database

```bash
# Drop existing database
docker exec test-postgres dropdb -U postgres task_db --if-exists

# Create fresh database
docker exec test-postgres createdb -U postgres task_db
```

### Step 4: Apply Migrations

**Option A - Using Prisma db push (RECOMMENDED)**:
```bash
docker exec <CONTAINER_ID> npx prisma db push --skip-generate
```

**Option B - Using Prisma migrate deploy**:
```bash
docker exec <CONTAINER_ID> npx prisma migrate deploy
```

### Step 5: Verify Database Schema

```bash
# Connect to PostgreSQL and verify tables exist
docker exec test-postgres psql -U postgres -d task_db -c "\dt"
```

Expected output should show these tables:
- `User`
- `Workspace`
- `Task`
- `Expense`
- `Habit`
- `Session`

### Step 6: Test Login

1. Go to your app URL
2. Click "Sign up"
3. Create a test account
4. Verify account is created successfully
5. Logout and login again to verify

---

## Common Issues & Solutions

### Issue 1: "Error: P3009 - migrate found failed migrations"
**Cause**: Old migration records still in database
**Solution**: 
```bash
# Reset the database (Step 3 above)
docker exec test-postgres dropdb -U postgres task_db --if-exists
docker exec test-postgres createdb -U postgres task_db
```

### Issue 2: "Connection refused to PostgreSQL"
**Cause**: Database container not running
**Solution**:
```bash
docker ps | grep postgres
docker restart test-postgres
```

### Issue 3: "relation does not exist" after migration
**Cause**: Migrations didn't apply successfully
**Solution**: Verify with `\dt` command and re-run:
```bash
docker exec <CONTAINER_ID> npx prisma db push --skip-generate
```

### Issue 4: "password authentication failed"
**Cause**: Wrong PostgreSQL credentials
**Solution**: Check database connection string in `.env` file

---

## Prevention: Best Practices

1. **Always specify database provider in Prisma**:
   ```prisma
   datasource db {
     provider = "postgresql"
     url      = env("DATABASE_URL")
   }
   ```

2. **Use correct SQL syntax**:
   - ❌ SQLite: `DATETIME`, `PRAGMA`
   - ✅ PostgreSQL: `TIMESTAMP`, no pragmas

3. **Test migrations locally first**:
   ```bash
   npx prisma migrate dev --name init
   ```

4. **Keep migration files in version control**:
   - Don't delete old migrations manually
   - Let Prisma manage migration history

5. **Document schema changes**:
   - Write clear migration descriptions
   - Keep commit messages detailed

---

## Quick Reference Commands

```bash
# Get container ID
docker ps --filter name=task-management --format 'table {{.Names}}\t{{.ID}}'

# Run migrations
docker exec <CONTAINER_ID> npx prisma db push --skip-generate

# Reset database
docker exec test-postgres dropdb -U postgres task_db --if-exists && docker exec test-postgres createdb -U postgres task_db

# View database tables
docker exec test-postgres psql -U postgres -d task_db -c "\dt"

# View app logs
docker logs <CONTAINER_ID> --tail 100 -f

# Check database connection
docker exec test-postgres psql -U postgres -d task_db -c "SELECT version();"
```

---

## When to Use This Guide

✅ Use this guide when you see:
- Login fails with "Invalid email or password"
- Signup fails with "Failed to register user"
- Docker logs show P3009 migration errors
- `The column 'User.xxx' does not exist` errors
- SQLite/PostgreSQL mismatch errors

---

## Support

If issues persist:
1. Check CloudFormation logs in CapRover
2. Review Docker container logs
3. Verify PostgreSQL is running
4. Ensure DATABASE_URL is correctly configured
5. Check GitHub repository has latest migration files

**Last Updated**: January 4, 2026
**Status**: Tested and working ✅
