# Fix Login 500 Error

## The Problem

You're getting a 500 (Internal Server Error) when trying to login. This usually means:
1. Database migrations haven't been run
2. Database tables don't exist yet
3. No users in the database

## ✅ Solution: Initialize the Database

After deploying to CapRover, you need to initialize the database.

### Step 1: Access Container Terminal

1. Go to CapRover Dashboard
2. Click on your app
3. Go to **"App Logs"** tab
4. Click **"Terminal"** button (or find "Connect to Container" / "Terminal" option)
5. This opens a terminal inside your container

### Step 2: Run Database Migrations

In the container terminal, run these commands:

```bash
# Generate Prisma Client (if needed)
npx prisma generate

# Run database migrations (creates all tables)
npx prisma migrate deploy

# Seed the database (creates admin user)
npm run seed
```

### Step 3: Verify It Worked

After running the commands, you should see:
- Migrations applied successfully
- Seed data created

### Step 4: Try Login Again

1. Go back to your application
2. Try logging in again
3. It should work now!

## 🔍 Check Server Logs

If it's still not working, check the server logs:
1. CapRover → Your App → **"App Logs"** tab
2. Look for error messages
3. Common errors:
   - `Table 'users' does not exist` → Run migrations
   - `Connection refused` → Check DATABASE_URL
   - `Authentication failed` → Wrong credentials or user doesn't exist

## 📋 Default Admin User

After running `npm run seed`, you can login with:
- **Email:** `swapnilbibrale99@gmail.com`
- **Password:** `Swap@2603`

(Or create a new account using the register page)

## 🚀 Automatic Migrations (Future)

The `start` script in package.json should run migrations automatically:
```json
"start": "prisma migrate deploy && node dist/index.js"
```

However, if this fails silently, you may need to run migrations manually as shown above.

## ⚠️ Common Issues

1. **"Table does not exist" error:**
   - Solution: Run `npx prisma migrate deploy`

2. **"No users found" or login fails:**
   - Solution: Run `npm run seed` to create the admin user

3. **"Prisma Client not generated":**
   - Solution: Run `npx prisma generate`

4. **All three commands fail:**
   - Check DATABASE_URL is set correctly
   - Verify PostgreSQL is running in CapRover
   - Check app logs for connection errors

