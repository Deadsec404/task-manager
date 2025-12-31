# CapRover Environment Variables Example

This file contains example environment variables for your CapRover deployment with PostgreSQL.

## PostgreSQL Configuration

Your PostgreSQL connection string (internal CapRover networking):
```
postgresql://postgres:f0b3b4d8d29e8666@srv-captain--postgres:5432/postgres
```

## Complete Environment Variables for CapRover

Add these environment variables in your CapRover app settings (App Configs → Environment Variables):

```env
# Application Environment
NODE_ENV=production
PORT=80

# Database (PostgreSQL)
DATABASE_URL=postgresql://postgres:f0b3b4d8d29e8666@srv-captain--postgres:5432/postgres

# JWT Authentication
JWT_SECRET=your-super-secret-jwt-key-change-this-in-production-min-32-chars-long
JWT_EXPIRES_IN=7d

# Frontend URL (update with your actual app URL)
FRONTEND_URL=https://your-app-name.captain.yourdomain.com
```

## Important Notes

1. **PostgreSQL Connection**: The connection string uses `srv-captain--postgres` which is the internal CapRover service name. This ensures your app can communicate with PostgreSQL on the same CapRover instance.

2. **JWT_SECRET**: Generate a secure secret using:
   ```bash
   node -e "console.log(require('crypto').randomBytes(32).toString('hex'))"
   ```

3. **FRONTEND_URL**: Replace with your actual CapRover app URL after deployment.

4. **Password Security**: The PostgreSQL password (`f0b3b4d8d29e8666`) is included in the connection string. Keep this secure and never commit it to public repositories.

## Setting Environment Variables in CapRover

1. Go to your app in CapRover dashboard
2. Click on **"App Configs"** tab
3. Scroll to **"Environment Variables (Optional)"** section
4. Add each variable one by one:
   - Click **"+ New Env Var"**
   - Enter variable name (e.g., `DATABASE_URL`)
   - Enter variable value (e.g., `postgresql://postgres:f0b3b4d8d29e8666@srv-captain--postgres:5432/postgres`)
   - Click **"Add"**
5. Repeat for all variables
6. Click **"Save & Update"** at the bottom
7. Your app will automatically restart with new environment variables

## After Setting Environment Variables

1. Make sure your Prisma schema is configured for PostgreSQL:
   - Check `server/prisma/schema.prisma` has `provider = "postgresql"`

2. After deployment, initialize the database:
   - Access container terminal via CapRover
   - Run:
     ```bash
     npx prisma generate
     npx prisma migrate deploy
     npm run seed
     ```

## Troubleshooting

**Connection refused errors:**
- Verify PostgreSQL app is running in CapRover
- Check that you're using `srv-captain--postgres` format (not external domain)
- Ensure password is correct

**Migration errors:**
- Make sure Prisma schema provider is set to `postgresql`
- Run `npx prisma generate` before migrations
- Check app logs for detailed error messages

