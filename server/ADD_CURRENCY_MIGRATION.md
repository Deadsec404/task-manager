# Add Currency to Database

## Quick Migration Steps

After the code changes, update your database:

```powershell
cd server

# 1. Generate Prisma client with new schema
npm run prisma:generate

# 2. Create migration
npm run prisma:migrate
# When prompted, name it: add_currency

# 3. Done! The currency field is now in your database
```

## What Changed

- ✅ `Expense` model now has `currency` field (default: "USD")
- ✅ `Workspace` model now has `currency` field (default: "USD")
- ✅ All existing expenses will have "USD" as default
- ✅ New expenses can select any currency

## Verify It Works

1. Start backend: `npm run dev`
2. Go to expenses page
3. Click "Add Expense"
4. You should see currency dropdown next to amount field
5. Select a currency and add expense
6. The expense should display with the correct currency symbol

