# Task Management Server

Backend server for the Task Management application.

## Setup

1. Install dependencies:
```bash
npm install
```

2. Create a `.env` file based on `.env.example`:
```bash
DATABASE_URL="postgresql://user:password@localhost:5432/task_management?schema=public"
JWT_SECRET="your-super-secret-jwt-key-change-this-in-production"
JWT_EXPIRES_IN="7d"
PORT=3001
NODE_ENV=development
```

3. Set up the database:
```bash
# Generate Prisma client
npm run prisma:generate

# Run migrations
npm run prisma:migrate

# Seed the database (creates super admin user)
npm run seed
```

4. Start the development server:
```bash
npm run dev
```

The server will run on http://localhost:3001

## Super Admin User

After running the seed script, you can login with:
- Email: swapnilbibrale99@gmail.com
- Password: Swap@2603

## API Endpoints

- `/api/auth/*` - Authentication routes
- `/api/workspaces/*` - Workspace management
- `/api/tasks/*` - Task management
- `/api/expenses/*` - Expense management
- `/api/dashboard/*` - Dashboard data
- `/api/habits/*` - Habit tracking
- `/api/reports/*` - Reports and analytics

