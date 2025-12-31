# Task Management System

A comprehensive task management, time tracking, and expense management application built with React, TypeScript, Express, and PostgreSQL.

## Features

### Core Features
- ✅ **User Authentication** - Secure login/register with JWT
- ✅ **Workspace Management** - Create and switch between multiple workspaces
- ✅ **Task Management** - Full CRUD with priorities, categories, and status tracking
- ✅ **Time Tracking** - Start/stop timer and manual time entry
- ✅ **Expense Management** - Track personal and business expenses
- ✅ **Budget Management** - Set budgets and track spending
- ✅ **Dashboard** - Real-time insights and productivity metrics
- ✅ **Reports & Analytics** - Task and expense reports
- ✅ **Habit Tracking** - Daily, weekly, and monthly habits

### Additional Productivity Features
- 🚀 **Quick Actions** - Keyboard shortcuts for common actions
- 📊 **Productivity Score** - Automated calculation based on task completion
- 🔔 **Overdue Task Detection** - Automatic status updates
- 📈 **Time Efficiency Reports** - Compare planned vs actual time
- 💰 **Budget Alerts** - Visual warnings when approaching limits
- 🎯 **Habit Streaks** - Track consecutive days of habit completion

## Tech Stack

### Frontend
- React 18 with TypeScript
- Vite
- Tailwind CSS
- Radix UI components
- Recharts for analytics

### Backend
- Node.js with Express
- TypeScript
- PostgreSQL with Prisma ORM
- JWT authentication
- bcryptjs for password hashing

## Getting Started

### Prerequisites
- Node.js 18+ and npm
- PostgreSQL 14+
- Git

### Backend Setup

1. Navigate to the server directory:
```bash
cd server
```

2. Install dependencies:
```bash
npm install
```

3. Create a `.env` file:
```bash
cp .env.example .env
```

4. Update `.env` with your PostgreSQL connection:
```env
DATABASE_URL="postgresql://user:password@localhost:5432/task_management?schema=public"
JWT_SECRET="your-super-secret-jwt-key-change-this-in-production"
JWT_EXPIRES_IN="7d"
PORT=3001
NODE_ENV=development
FRONTEND_URL=http://localhost:5173
```

5. Set up the database:
```bash
# Generate Prisma client
npm run prisma:generate

# Run migrations
npm run prisma:migrate

# Seed the database (creates super admin user)
npm run seed
```

6. Start the development server:
```bash
npm run dev
```

The backend will run on http://localhost:3001

### Frontend Setup

1. Install dependencies (from project root):
```bash
npm install
```

2. Create a `.env` file (optional, defaults to localhost:3001):
```env
VITE_API_URL=http://localhost:3001/api
```

3. Start the development server:
```bash
npm run dev
```

The frontend will run on http://localhost:5173

## Super Admin Account

After running the seed script, you can login with:
- **Email:** swapnilbibrale99@gmail.com
- **Password:** Swap@2603

## Project Structure

```
Task-Management/
├── server/                 # Backend server
│   ├── src/
│   │   ├── routes/        # API routes
│   │   ├── middleware/    # Auth and error handling
│   │   ├── utils/         # Validation schemas
│   │   └── scripts/       # Database seeding
│   ├── prisma/
│   │   └── schema.prisma  # Database schema
│   └── package.json
├── src/                    # Frontend application
│   ├── app/
│   │   ├── components/    # React components
│   │   └── App.tsx        # Main app component
│   ├── contexts/          # React contexts (Auth, Workspace)
│   ├── lib/               # API client
│   └── styles/            # CSS files
└── package.json
```

## API Endpoints

### Authentication
- `POST /api/auth/register` - Register new user
- `POST /api/auth/login` - Login
- `GET /api/auth/me` - Get current user
- `POST /api/auth/logout` - Logout

### Workspaces
- `GET /api/workspaces` - Get all workspaces
- `POST /api/workspaces` - Create workspace
- `PUT /api/workspaces/:id` - Update workspace
- `DELETE /api/workspaces/:id` - Delete workspace

### Tasks
- `GET /api/tasks/workspace/:workspaceId` - Get tasks
- `POST /api/tasks` - Create task
- `PUT /api/tasks/:id` - Update task
- `DELETE /api/tasks/:id` - Delete task
- `POST /api/tasks/:id/time/start` - Start time tracking
- `POST /api/tasks/:id/time/stop` - Stop time tracking

### Expenses
- `GET /api/expenses/workspace/:workspaceId` - Get expenses
- `POST /api/expenses` - Create expense
- `PUT /api/expenses/:id` - Update expense
- `DELETE /api/expenses/:id` - Delete expense
- `GET /api/expenses/workspace/:workspaceId/budgets` - Get budgets
- `POST /api/expenses/workspace/:workspaceId/budgets` - Create budget

### Dashboard
- `GET /api/dashboard/workspace/:workspaceId` - Get dashboard data

### Habits
- `GET /api/habits/workspace/:workspaceId` - Get habits
- `POST /api/habits` - Create habit
- `PUT /api/habits/:id` - Update habit
- `POST /api/habits/:id/entries` - Toggle habit entry

### Reports
- `GET /api/reports/tasks/workspace/:workspaceId` - Task reports
- `GET /api/reports/expenses/workspace/:workspaceId` - Expense reports

## Database Schema

The application uses PostgreSQL with the following main models:
- **User** - User accounts with roles (USER, ADMIN, SUPER_ADMIN)
- **Workspace** - Isolated data containers
- **Task** - Tasks with time tracking
- **TimeEntry** - Individual time tracking sessions
- **Expense** - Expense records
- **Budget** - Budget limits per category
- **Habit** - Habit definitions
- **HabitEntry** - Daily habit completions

## Development

### Backend Commands
```bash
npm run dev          # Start development server
npm run build        # Build for production
npm run start        # Start production server
npm run prisma:studio # Open Prisma Studio
npm run seed         # Seed database
```

### Frontend Commands
```bash
npm run dev          # Start development server
npm run build        # Build for production
npm run preview       # Preview production build
```

## Security Features

- Password hashing with bcryptjs
- JWT token-based authentication
- Rate limiting on auth endpoints
- Workspace-based data isolation
- Role-based access control (future)

## Future Enhancements

- [ ] Email notifications
- [ ] Task repeating/recurrence
- [ ] File attachments for expenses
- [ ] Team collaboration
- [ ] Mobile app
- [ ] Export to CSV/Excel
- [ ] Dark mode
- [ ] Advanced analytics
- [ ] Integration with calendar apps

## License

This project is private and proprietary.

## Support

For issues or questions, please contact the development team.
