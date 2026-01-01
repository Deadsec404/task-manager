# Fix DATABASE_URL Error

The error means the `DATABASE_URL` environment variable is not set or has the wrong format in your CapRover container.

## Quick Fix

### Step 1: Check Environment Variables in CapRover

1. Go to CapRover Dashboard
2. Click on your app
3. Go to **"App Configs"** tab
4. Scroll to **"Environment Variables (Optional)"** section
5. Check if `DATABASE_URL` exists

### Step 2: Add/Update DATABASE_URL

If it doesn't exist or is wrong, add/update it:

**For PostgreSQL (your setup):**
```env
DATABASE_URL=postgresql://postgres:f0b3b4d8d29e8666@srv-captain--postgres:5432/postgres
```

**Important:** 
- Replace `f0b3b4d8d29e8666` with your actual PostgreSQL password
- Use `srv-captain--postgres` (internal CapRover service name) not external domain
- Must start with `postgresql://` or `postgres://`

### Step 3: Save and Restart

1. Click **"Save & Update"** at the bottom
2. Wait for the app to restart
3. Try the migration command again

### Step 4: Verify in Container

After setting the environment variable, verify it's available:

```bash
# In container terminal
echo $DATABASE_URL
```

Should show:
```
postgresql://postgres:f0b3b4d8d29e8666@srv-captain--postgres:5432/postgres
```

---

## Complete Environment Variables Checklist

Make sure ALL these are set in CapRover:

```env
NODE_ENV=production
PORT=80
DATABASE_URL=postgresql://postgres:f0b3b4d8d29e8666@srv-captain--postgres:5432/postgres
JWT_SECRET=your-super-secret-jwt-key-change-this-in-production-min-32-chars-long
JWT_EXPIRES_IN=7d
FRONTEND_URL=https://your-app.captain.yourdomain.com
```

---

## After Setting DATABASE_URL

Once `DATABASE_URL` is set correctly, run:

```bash
npx prisma generate
npx prisma migrate deploy
npm run seed
```

---

## Troubleshooting

**Still getting the error?**
1. Make sure you clicked "Save & Update" in CapRover
2. Wait for app to fully restart
3. Check container logs to see if env var is loaded
4. Try accessing container terminal again

**Wrong password?**
- Check PostgreSQL app in CapRover
- Look at PostgreSQL app configs or logs for the password
- Or reset PostgreSQL password if needed


