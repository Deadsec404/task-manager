# ⚠️ URGENT: Fix DATABASE_URL Error

## The Problem

Your application is failing to start because `DATABASE_URL` environment variable is not set correctly in CapRover.

## ✅ THE FIX (Do This Now)

### Step 1: Go to CapRover Dashboard
1. Open your CapRover dashboard (e.g., `https://captain.yourdomain.com`)
2. Login

### Step 2: Open Your App
1. Click **"Apps"** in left sidebar
2. Click on your app name

### Step 3: Go to Environment Variables
1. Click **"App Configs"** tab (at the top)
2. Scroll down to **"Environment Variables (Optional)"** section

### Step 4: Set DATABASE_URL
1. Look for `DATABASE_URL` in the list
   - If it exists, click the **pencil/edit icon** next to it
   - If it doesn't exist, click **"+ New Env Var"**
2. Set the value to:
   ```
   postgresql://postgres:f0b3b4d8d29e8666@srv-captain--postgres:5432/postgres
   ```
   ⚠️ **Important:** 
   - Replace `f0b3b4d8d29e8666` with your actual PostgreSQL password if different
   - Make sure it starts with `postgresql://` (not `postgres://` is also OK)
   - Do NOT include `DATABASE_URL=` in the value (just the connection string)
3. Click **"Add"** or **"Update"**

### Step 5: Set All Required Variables
Make sure ALL these are set:

| Variable Name | Value |
|--------------|-------|
| `NODE_ENV` | `production` |
| `PORT` | `80` |
| `DATABASE_URL` | `postgresql://postgres:f0b3b4d8d29e8666@srv-captain--postgres:5432/postgres` |
| `JWT_SECRET` | (must be at least 32 characters) |
| `JWT_EXPIRES_IN` | `7d` |
| `FRONTEND_URL` | `https://your-app.captain.yourdomain.com` |

### Step 6: Save and Restart
1. **IMPORTANT:** Scroll all the way to the bottom of the page
2. Click **"Save & Update"** button
3. Wait 30-60 seconds for the app to restart
4. Check **"App Logs"** tab to verify it started successfully

## 🔍 Verify It's Working

After saving:
1. Go to **"App Logs"** tab
2. You should see: `🚀 Server running on http://localhost:80`
3. If you still see the error, check:
   - Did you click "Save & Update" at the bottom? (Not just "Add")
   - Is the value exactly `postgresql://postgres:password@srv-captain--postgres:5432/postgres`?
   - No extra spaces before/after the value?
   - Variable name is exactly `DATABASE_URL` (case-sensitive)

## ❌ Common Mistakes

1. **Not clicking "Save & Update"** - You MUST scroll down and click the button at the bottom
2. **Including "DATABASE_URL=" in the value** - Just put the connection string
3. **Wrong host name** - Must be `srv-captain--postgres` (internal CapRover name)
4. **Missing protocol** - Must start with `postgresql://` or `postgres://`
5. **Wrong password** - Check your PostgreSQL app in CapRover for the correct password

## 🆘 Still Not Working?

If you're still getting errors after following all steps:

1. **Check PostgreSQL is running:**
   - CapRover → Apps → PostgreSQL app should be green/running

2. **Verify PostgreSQL password:**
   - Go to PostgreSQL app → App Configs
   - Check the password there
   - Update DATABASE_URL if password is different

3. **Check the exact error message:**
   - App Logs will show the first 80 characters of the DATABASE_URL value
   - Compare it with what you set in environment variables

## 📸 Screenshot Guide

If you need visual help:
1. In CapRover, go to: Your App → App Configs → Environment Variables
2. You should see a list/table of variables
3. Each variable has an edit button (pencil icon)
4. Click edit, update the value, click Add/Update
5. **Scroll to bottom** and click "Save & Update"

---

**This error will NOT go away until you set DATABASE_URL in CapRover. The code changes I made just provide better error messages. You must configure it in CapRover dashboard.**

