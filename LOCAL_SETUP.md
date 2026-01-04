# Local Development Setup Guide

## Prerequisites

Before you begin, make sure you have the following installed:

- **Node.js**: v18+ (https://nodejs.org/)
- **npm**: v9+ (comes with Node.js)
- **Git**: (https://git-scm.com/)
- **SQLite**: Optional (database is included in the project)

## Quick Start

### 1. Clone the Repository

```bash
git clone https://github.com/Deadsec404/task-manager.git
cd task-manager
```

### 2. Setup Environment Variables

Copy the `.env.example` file to `.env.local`:

```bash
cp .env.example .env.local
```

Edit `.env.local` and update the values as needed (defaults are fine for local development):

```env
DATABASE_URL="file:./dev.db"
NODE_ENV=development
PORT=3000
JWT_SECRET="your-secret-key"
JWT_EXPIRES_IN="7d"
FRONTEND_URL="http://localhost:5173"
VITE_API_URL="http://localhost:3000/api"
```

### 3. Install Dependencies

```bash
# Install root dependencies
npm install

# Install frontend dependencies
cd [frontend-directory]
npm install
cd ..

# Install server dependencies
cd server
npm install
cd ..
```

### 4. Setup Database

Initialize the database and run migrations:

```bash
cd server
npx prisma migrate dev --name init
```

This will:
- Create the SQLite database file (`dev.db`)
- Run all migrations
- Generate Prisma Client

### 5. Seed the Database (Optional)

Populate the database with initial data including super admin users:

```bash
cd server
npm run seed
```

This creates:
- Email: `swapnilbibrale99@gmail.com`
- Password: `Swap@2603`
- Role: SUPER_ADMIN

### 6. Start the Development Server

Run both frontend and backend servers:

#### Terminal 1 - Backend Server:

```bash
cd server
npm run dev
```

This starts the backend API at `http://localhost:3000`

#### Terminal 2 - Frontend Server:

```bash
npm run dev
```

This starts the frontend at `http://localhost:5173`

## Available Scripts

### Server Scripts

```bash
cd server

npm run dev      # Start development server with auto-reload
npm run build    # Build TypeScript
npm run start    # Start production server
npm run seed     # Seed database with initial data

# Prisma commands
npx prisma db push         # Sync database with schema
npx prisma studio         # Open Prisma Studio (database GUI)
npx prisma migrate dev     # Create and run migrations
```

### Frontend Scripts

```bash
npm run dev      # Start Vite dev server
npm run build    # Build for production
npm run preview  # Preview production build
npm run lint     # Run ESLint
```

## Project Structure

```
task-manager/
├── server/                 # Backend (Node.js + Express + Prisma)
│   ├── src/               # Source code
│   ├── prisma/            # Database schema and migrations
│   ├── package.json
│   └── tsconfig.json
├── src/                   # Frontend (React + Vite)
│   ├── components/
│   ├── pages/
│   └── App.tsx
├── .env.example           # Environment template
├── .env.local             # Your local config (git-ignored)
├── Dockerfile             # Production Docker config
├── package.json           # Root package.json
└── vite.config.ts         # Vite configuration
```

## Environment Variables Explained

| Variable | Purpose | Local Dev Value |
|----------|---------|------------------|
| DATABASE_URL | Database connection string | `file:./dev.db` (SQLite) |
| NODE_ENV | Environment mode | `development` |
| PORT | Server port | `3000` |
| JWT_SECRET | JWT signing key | Any random string |
| JWT_EXPIRES_IN | Token expiration time | `7d` |
| FRONTEND_URL | Frontend base URL | `http://localhost:5173` |
| VITE_API_URL | API endpoint for frontend | `http://localhost:3000/api` |

## Production Database Configuration

For production (CapRover/Cloud):

```env
DATABASE_URL="postgresql://user:password@host:5432/task_manager"
NODE_ENV=production
PORT=80
```

## Database Management

### View Database in UI (Prisma Studio)

```bash
cd server
npx prisma studio
```

Opens a web interface to browse and edit your database at `http://localhost:5555`

### Reset Database

```bash
cd server
npx prisma migrate reset
```

⚠️ **Warning**: This deletes all data and resets migrations

## Troubleshooting

### Port Already in Use

If port 3000 is already in use:

```bash
cd server
PORT=3001 npm run dev
```

Then update `VITE_API_URL` in `.env.local` to match the new port.

### Database Connection Error

1. Ensure `dev.db` file exists in the `server/` directory
2. Check `DATABASE_URL` in `.env.local` is correct
3. Run: `npx prisma db push` to sync schema

### Migrations Failed

```bash
cd server
npx prisma migrate reset
npm run seed
```

### Frontend Can't Connect to Backend

1. Make sure backend is running on the correct port
2. Check `VITE_API_URL` matches the backend URL
3. Check CORS is enabled in the server (should be by default)

## Git Workflow

After making changes:

```bash
git add .
git commit -m "feat: Your feature description"
git push origin main
```

## Additional Resources

- [Node.js Documentation](https://nodejs.org/docs/)
- [React Documentation](https://react.dev/)
- [Prisma Documentation](https://www.prisma.io/docs/)
- [Vite Documentation](https://vitejs.dev/)
- [Express Documentation](https://expressjs.com/)

## Getting Help

If you encounter issues:

1. Check the error message carefully
2. Review the `.env.local` file configuration
3. Check if all dependencies are installed
4. Try deleting `node_modules` and `package-lock.json`, then run `npm install` again
5. Ask in the project discussions or issues

Happy coding! 🚀
