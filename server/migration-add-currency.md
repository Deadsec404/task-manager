# Database Migration: Add Currency Field

After updating the schema, you need to create a migration:

```powershell
cd server
npm run prisma:migrate
# Name it: add_currency_to_expenses
```

Or if you want to reset and start fresh:

```powershell
cd server
Remove-Item dev.db -ErrorAction SilentlyContinue
Remove-Item -Recurse prisma/migrations -ErrorAction SilentlyContinue
npm run prisma:migrate
npm run seed
```

