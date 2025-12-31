# 💰 Currency Selection Feature Added!

## ✅ What's New

You can now select currency when adding expenses! The system supports multiple currencies:

- **USD** - US Dollar ($)
- **EUR** - Euro (€)
- **GBP** - British Pound (£)
- **INR** - Indian Rupee (₹)
- **JPY** - Japanese Yen (¥)
- **CAD** - Canadian Dollar (C$)
- **AUD** - Australian Dollar (A$)
- **CHF** - Swiss Franc (CHF)
- **CNY** - Chinese Yuan (¥)
- **SGD** - Singapore Dollar (S$)

## 🎯 How to Use

1. **Go to Expenses page**
2. **Click "Add Expense"**
3. **You'll see:**
   - Amount field (left side)
   - Currency dropdown (right side)
4. **Select your currency** from the dropdown
5. **Enter amount** and other details
6. **Save** - The expense will be stored with the selected currency

## 📊 Display

- Expenses now show with their currency symbol
- Example: ₹1,250.00 (INR) or €450.00 (EUR)
- Default currency is USD if not specified

## 🔧 Database Migration Required

After these changes, you need to update your database:

```powershell
cd server
npm run prisma:generate
npm run prisma:migrate
# Name it: add_currency
```

Or if you want to start fresh:

```powershell
cd server
Remove-Item dev.db -ErrorAction SilentlyContinue
Remove-Item -Recurse prisma/migrations -ErrorAction SilentlyContinue
npm run prisma:migrate
npm run seed
```

## 🎨 UI Changes

- Currency selector in Add Expense dialog
- Currency symbols displayed in expense list
- Workspace can have a default currency (future feature)

## 📝 Notes

- Each expense can have its own currency
- Currency is stored with the expense
- Future: Currency conversion and workspace default currency

