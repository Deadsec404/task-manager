# Quick Start Guide - Task Manager Project

## 🚀 Get Running in 5 Minutes

### Step 1: Clone & Install
```bash
git clone https://github.com/Deadsec404/task-manager.git
cd task-manager
npm install
cd server && npm install && cd ..
```

### Step 2: Setup Environment
```bash
cp .env.example .env.local
```

### Step 3: Database Setup
```bash
cd server
npx prisma migrate dev --name init
npm run seed
```

### Step 4: Run Services (Open 2 Terminals)

**Terminal 1 - Backend:**
```bash
cd server
npm run dev
```

**Terminal 2 - Frontend:**
```bash
npm run dev
```

### Step 5: Open in Browser
- Frontend: http://localhost:5173
- Backend API: http://localhost:3000/api

## 🔑 Default Admin Credentials

- **Email**: swapnilbibrale99@gmail.com
- **Password**: Swap@2603

## 📚 Full Documentation

For detailed setup, troubleshooting, and environment variables, see [LOCAL_SETUP.md](./LOCAL_SETUP.md)

## ⚡ Common Commands

```bash
# Run tests
npm test

# View database with GUI
cd server && npx prisma studio

# Reset database
cd server && npx prisma migrate reset

# Build for production
npm run build
```

## 🐛 Troubleshooting

### Port 3000 already in use?
```bash
cd server
PORT=3001 npm run dev
```
Then update API URL in `.env.local` to `http://localhost:3001/api`

### Database error?
```bash
cd server
npx prisma db push
```

### Need help?
Check [LOCAL_SETUP.md](./LOCAL_SETUP.md) for detailed troubleshooting steps.
