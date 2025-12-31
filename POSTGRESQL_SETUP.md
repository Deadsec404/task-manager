# PostgreSQL Setup Guide for CapRover

This guide will help you set up PostgreSQL in CapRover and configure your Task Management application to use it.

## Step 1: Install PostgreSQL in CapRover

1. **Login to CapRover Dashboard**
   - Navigate to your CapRover instance (e.g., `https://captain.yourdomain.com`)
   - Login with your credentials

2. **Install PostgreSQL One-Click App**
   - Click on **"One-Click Apps/Databases"** in the left sidebar
   - Search for **"PostgreSQL"**
   - Click on **"PostgreSQL"** from the results
   - Click **"Install PostgreSQL"** button

3. **Configure PostgreSQL Installation**
   - **App Name:** `postgres` (recommended, or choose your preferred name)
   - **Root Password:** Enter a strong password (save this securely!)
   - **PostgreSQL Version:** Latest (or specific version if needed)
   - Click **"Install"**

4. **Wait for Installation**
   - CapRover will deploy PostgreSQL as a new app
   - Wait for the installation to complete (usually 1-2 minutes)
   - You'll see a green checkmark when it's ready

## Step 2: Get PostgreSQL Connection Details

After installation, CapRover will provide connection details. You can also find them:

1. Go to your PostgreSQL app in CapRover
2. Click on **"App Configs"** tab
3. Look for connection details or check the app logs

**Connection format:**
```
postgresql://postgres:PASSWORD@srv-captain--postgres:5432/postgres
```

Or if connecting from outside CapRover (from your main app):
```
postgresql://postgres:PASSWORD@postgres.captain.yourdomain.com:5432/postgres
```

## Step 3: Update Prisma Schema for PostgreSQL

You have two options:

### Option A: Simple Update (Recommended - Easiest)

Just change the provider in your existing schema:

1. Open `server/prisma/schema.prisma`
2. Change the datasource provider:
   ```prisma
   datasource db {
     provider = "postgresql"  // Changed from "sqlite"
     url      = env("DATABASE_URL")
   }
   ```
3. Update the `tags` field in the Task model (around line 71):
   ```prisma
   tags String[] @default([])  // Changed from String @default("[]")
   ```
   **Note:** If you keep `tags` as `String`, it will still work, but using `String[]` is more efficient in PostgreSQL.

That's it! This minimal change is sufficient to use PostgreSQL.

### Option B: Use Full PostgreSQL Schema (Advanced)

If you want to use PostgreSQL-specific features like enums:

1. **Backup current schema:**
   ```bash
   cp server/prisma/schema.prisma server/prisma/schema.sqlite.prisma.backup
   ```

2. **Use PostgreSQL schema:**
   ```bash
   cp server/prisma/schema.postgresql.prisma server/prisma/schema.prisma
   ```

3. **Important:** The PostgreSQL schema uses enums. Make sure your TypeScript code is compatible, or you may need to update your code accordingly.

**Recommendation:** Start with Option A (simple update). You can always switch to Option B later if needed.

## Step 4: Update Environment Variables

1. **In your Task Management app in CapRover:**
   - Go to **"App Configs"** tab
   - Scroll to **"Environment Variables"**

2. **Update DATABASE_URL:**
   ```env
   DATABASE_URL=postgresql://postgres:YOUR_PASSWORD@postgres.captain.yourdomain.com:5432/postgres
   ```
   
   Replace:
   - `YOUR_PASSWORD` with the password you set during PostgreSQL installation
   - `postgres.captain.yourdomain.com` with your actual CapRover domain
   - If using internal CapRover networking: `postgresql://postgres:PASSWORD@srv-captain--postgres:5432/postgres`

3. **Other environment variables should remain:**
   ```env
   NODE_ENV=production
   PORT=80
   JWT_SECRET=your-jwt-secret-here
   JWT_EXPIRES_IN=7d
   FRONTEND_URL=https://your-app.captain.yourdomain.com
   ```

## Step 5: Update Dockerfile (if needed)

The Dockerfile already supports PostgreSQL - no changes needed! The `DATABASE_URL` environment variable will be used.

## Step 6: Deploy/Redeploy Your Application

1. **If deploying for the first time:**
   - CapRover will automatically build and deploy
   - Monitor the build logs

2. **If updating existing deployment:**
   - Commit your Prisma schema changes
   - Push to your repository
   - CapRover will trigger a new deployment
   - Or click **"Trigger Build"** in CapRover dashboard

## Step 7: Initialize Database

After deployment, initialize the PostgreSQL database:

1. **Access your app terminal in CapRover:**
   - Go to your Task Management app
   - Click on **"HTTP Settings"** tab
   - Enable **"Enable Terminal"** if available
   - Or use CapRover CLI to access container

2. **Run migrations:**
   ```bash
   # Generate Prisma client
   npx prisma generate

   # Run database migrations
   npx prisma migrate deploy

   # (Optional) Seed the database with admin user
   npm run seed
   ```

**Alternative: Using CapRover CLI**

```bash
# Install CapRover CLI (if not installed)
npm install -g caprover

# Login to CapRover
caprover login

# Get terminal access
caprover exec -a your-app-name sh

# Inside container, run:
npx prisma generate
npx prisma migrate deploy
npm run seed
```

## Step 8: Verify Database Connection

1. **Check app logs:**
   - Go to your app in CapRover
   - Click **"App Logs"** tab
   - Verify no database connection errors

2. **Test the API:**
   - Visit: `https://your-app.captain.yourdomain.com/api/health`
   - Should return: `{"status":"ok","timestamp":"..."}`

3. **Access Prisma Studio (optional):**
   ```bash
   # In container terminal
   npx prisma studio
   ```
   - Access at the URL shown (usually requires port forwarding)

## Troubleshooting

### Connection Refused Error

**Problem:** `Error: P1001: Can't reach database server`

**Solutions:**
1. Verify PostgreSQL is running:
   - Check PostgreSQL app status in CapRover
   - Ensure it shows as "Running"

2. Use internal CapRover DNS:
   - If apps are in same CapRover, use: `srv-captain--postgres:5432`
   - Connection string: `postgresql://postgres:PASSWORD@srv-captain--postgres:5432/postgres`

3. Check network settings:
   - Ensure apps are on same CapRover network
   - Check firewall rules

### Authentication Failed

**Problem:** `Error: password authentication failed`

**Solutions:**
1. Verify password is correct
2. Check for special characters in password (may need URL encoding)
3. Reset PostgreSQL password if needed:
   - Go to PostgreSQL app in CapRover
   - Check app logs or configs for connection details

### Migration Errors

**Problem:** `Error applying migration`

**Solutions:**
1. If migrating from SQLite, you need a fresh start:
   ```bash
   # This will create fresh tables (data will be lost)
   npx prisma migrate reset
   npx prisma migrate deploy
   npm run seed
   ```

2. For existing data migration, use Prisma's migration tools:
   ```bash
   npx prisma migrate dev --name init_postgresql
   ```

### Port Already in Use

**Problem:** PostgreSQL port conflict

**Solutions:**
1. CapRover handles port mapping automatically
2. Use service name instead of port: `srv-captain--postgres:5432`
3. Check if another PostgreSQL instance is running

## Best Practices

1. **Backup Regularly:**
   - Use CapRover's backup feature for PostgreSQL volumes
   - Or set up automated backups via cron jobs

2. **Secure Passwords:**
   - Use strong, randomly generated passwords
   - Store passwords securely (password manager)

3. **Connection Pooling:**
   - Prisma automatically handles connection pooling
   - For high-traffic apps, consider configuring pool size

4. **Monitor Performance:**
   - Use CapRover's app monitoring
   - Check PostgreSQL logs regularly
   - Monitor database size and performance

## Migration from SQLite to PostgreSQL

If you have existing SQLite data and want to migrate:

⚠️ **Warning:** Direct migration is complex. For production, consider:

1. **Fresh Start (Recommended for initial setup):**
   - Export important data manually if needed
   - Start fresh with PostgreSQL
   - Re-import data via API or seed scripts

2. **Data Migration Script (Advanced):**
   - Write a migration script to transfer data
   - Use Prisma to read from SQLite and write to PostgreSQL
   - Handle schema differences carefully

## Additional Resources

- [Prisma PostgreSQL Guide](https://www.prisma.io/docs/concepts/database-connectors/postgresql)
- [CapRover Documentation](https://caprover.com/docs/)
- [PostgreSQL Documentation](https://www.postgresql.org/docs/)

## Need Help?

- Check CapRover app logs
- Check PostgreSQL app logs
- Review Prisma migration logs
- Ensure all environment variables are set correctly

