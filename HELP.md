# Task Manager - Complete Help & Documentation

## Table of Contents
1. [Getting Started](#getting-started)
2. [Installation & Setup](#installation--setup)
3. [Running the Project](#running-the-project)
4. [Features](#features)
5. [API Documentation](#api-documentation)
6. [Database Information](#database-information)
7. [Troubleshooting](#troubleshooting)
8. [FAQ](#faq)
9. [Support](#support)

---

## Getting Started

### What is Task Manager?
Task Manager is a full-stack web application built with:
- **Frontend**: React + Vite + TypeScript
- **Backend**: Node.js + Express + Prisma ORM
- **Database**: PostgreSQL (Production) / SQLite (Local)

### System Requirements
- Node.js v18 or higher
- npm v9 or higher
- Git for version control
- 500 MB free disk space

---

## Installation & Setup

### Step 1: Clone the Repository
```bash
git clone https://github.com/Deadsec404/task-manager.git
cd task-manager
```

### Step 2: Install Dependencies
```bash
# Root dependencies
npm install

# Backend dependencies
cd server
npm install
cd ..
```

### Step 3: Configure Environment
```bash
# Copy environment template
cp .env.example .env.local
```

Edit `.env.local` with your settings:
```env
DATABASE_URL="file:./dev.db"
NODE_ENV=development
PORT=3000
JWT_SECRET="your-secret-key"
FRONTEND_URL="http://localhost:5173"
VITE_API_URL="http://localhost:3000/api"
```

### Step 4: Setup Database
```bash
cd server
npx prisma migrate dev --name init
npm run seed
cd ..
```

---

## Running the Project

### Development Mode (with auto-reload)

**Terminal 1 - Backend Server:**
```bash
cd server
npm run dev
```
- API runs on http://localhost:3000
- API endpoints at http://localhost:3000/api

**Terminal 2 - Frontend Server:**
```bash
npm run dev
```
- Frontend runs on http://localhost:5173

### Production Mode
```bash
# Build both frontend and backend
npm run build

# Run production build
cd server
npm start
```

### Database Management

**View & Edit Database (GUI):**
```bash
cd server
npx prisma studio
```
Opens at http://localhost:5555

**Reset Database:**
```bash
cd server
npx prisma migrate reset
npm run seed
```
⚠️ Warning: This deletes all data

---

## Features

### User Management
- User registration and authentication
- JWT-based session management
- Role-based access control (RBAC)
- Super admin accounts

### Task Management
- Create, read, update, delete tasks
- Task status tracking (pending, in progress, completed)
- Task categories and priorities
- Due dates and reminders

### Workspace Management
- Create multiple workspaces
- Invite team members
- Workspace-level permissions
- Share tasks within workspace

### Dashboard
- Overview of all tasks
- Task statistics
- Recent activity log
- Quick add new task

---

## API Documentation

### Base URL
```
http://localhost:3000/api
```

### Authentication
All protected endpoints require JWT token in header:
```
Authorization: Bearer {token}
```

### User Endpoints

#### Register User
```
POST /auth/register
Content-Type: application/json

{
  "email": "user@example.com",
  "password": "securepassword",
  "name": "User Name"
}
```

#### Login
```
POST /auth/login
Content-Type: application/json

{
  "email": "user@example.com",
  "password": "securepassword"
}

Response:
{
  "token": "jwt_token_here",
  "user": { ... }
}
```

#### Get Current User
```
GET /auth/me
Authorization: Bearer {token}
```

### Task Endpoints

#### Get All Tasks
```
GET /tasks?page=1&limit=10
Authorization: Bearer {token}
```

#### Create Task
```
POST /tasks
Authorization: Bearer {token}
Content-Type: application/json

{
  "title": "Task Title",
  "description": "Task description",
  "priority": "high",
  "status": "pending",
  "dueDate": "2026-01-15T00:00:00Z",
  "workspaceId": "workspace-id"
}
```

#### Update Task
```
PUT /tasks/{taskId}
Authorization: Bearer {token}
Content-Type: application/json

{
  "title": "Updated Title",
  "status": "completed"
}
```

#### Delete Task
```
DELETE /tasks/{taskId}
Authorization: Bearer {token}
```

### Workspace Endpoints

#### Get All Workspaces
```
GET /workspaces
Authorization: Bearer {token}
```

#### Create Workspace
```
POST /workspaces
Authorization: Bearer {token}
Content-Type: application/json

{
  "name": "Workspace Name",
  "description": "Workspace description"
}
```

#### Add Member to Workspace
```
POST /workspaces/{workspaceId}/members
Authorization: Bearer {token}
Content-Type: application/json

{
  "userId": "user-id",
  "role": "member"
}
```

---

## Database Information

### Local Development (SQLite)
- Database file: `server/dev.db`
- No server needed
- Perfect for development
- Reset with: `npx prisma migrate reset`

### Production (PostgreSQL)
- Set DATABASE_URL in CapRover environment
- Requires PostgreSQL server
- High performance and scalability
- Automatic backups recommended

### Database Schema

**Users Table**
- id: UUID
- email: String (unique)
- password: String (hashed)
- name: String
- role: ENUM (USER, ADMIN, SUPER_ADMIN)
- createdAt: DateTime
- updatedAt: DateTime

**Tasks Table**
- id: UUID
- title: String
- description: Text
- status: ENUM (PENDING, IN_PROGRESS, COMPLETED)
- priority: ENUM (LOW, MEDIUM, HIGH)
- dueDate: DateTime
- createdBy: UUID (FK)
- workspaceId: UUID (FK)
- createdAt: DateTime
- updatedAt: DateTime

**Workspaces Table**
- id: UUID
- name: String
- description: Text
- createdBy: UUID (FK)
- createdAt: DateTime
- updatedAt: DateTime

---

## Troubleshooting

### Port Already in Use

**Error**: `EADDRINUSE: address already in use :::3000`

**Solution**:
```bash
# Find process using port 3000
lsof -i :3000

# Kill the process
kill -9 <PID>

# Or use different port
cd server
PORT=3001 npm run dev
```

### Database Connection Error

**Error**: `Error: Can't reach database server`

**Solutions**:
1. Check DATABASE_URL in .env.local
2. Ensure dev.db exists: `ls server/dev.db`
3. Reset database:
   ```bash
   cd server
   npx prisma db push
   npm run seed
   ```

### npm install Fails

**Error**: `npm ERR! code ERESOLVE`

**Solution**:
```bash
# Delete node_modules and lock file
rm -rf node_modules package-lock.json

# Reinstall
npm install
```

### Frontend Can't Connect to Backend

**Error**: `CORS error` or `API not responding`

**Solutions**:
1. Ensure backend is running: `http://localhost:3000/api`
2. Check VITE_API_URL in .env.local
3. Check CORS settings in server code
4. Use browser DevTools → Network tab to debug

### Login Issues

**Error**: `Invalid credentials`

**Default Admin:**
- Email: `swapnilbibrale99@gmail.com`
- Password: `Swap@2603`

If you forget password, reset database:
```bash
cd server
npm run seed
```

### Migrations Failed

**Error**: `Error: Migration lock in use`

**Solution**:
```bash
cd server
npx prisma migrate reset
npm run seed
```

---

## FAQ

### Q: How do I change the database to PostgreSQL locally?
**A**: Update DATABASE_URL in .env.local:
```env
DATABASE_URL="postgresql://user:password@localhost:5432/task_manager"
```
Then run migrations again.

### Q: How do I add more admin users?
**A**: Edit `server/src/seed.ts` and add new users, then run:
```bash
cd server
npm run seed
```

### Q: Can I deploy this to production?
**A**: Yes! The project includes Dockerfile and CapRover configuration. Check DEPLOYMENT.md for details.

### Q: How do I backup my database?
**A**: For SQLite:
```bash
cp server/dev.db server/dev.db.backup
```
For PostgreSQL: Use pg_dump command.

### Q: How do I run tests?
**A**: Currently, you can add tests. Recommended:
```bash
npm install --save-dev jest @testing-library/react
npm test
```

### Q: How do I contribute?
**A**:
1. Fork the repository
2. Create feature branch: `git checkout -b feature/amazing-feature`
3. Commit changes: `git commit -m 'Add amazing feature'`
4. Push to branch: `git push origin feature/amazing-feature`
5. Open Pull Request

### Q: Where can I find API documentation?
**A**: Check the docs folder or visit `/api/docs` when the server is running.

### Q: Is my data secure?
**A**: 
- Passwords are hashed with bcrypt
- JWT tokens expire after 7 days
- Use HTTPS in production
- Never share your JWT secret

---

## Support

### Getting Help
1. Check the documentation files:
   - QUICK_START.md (5-minute setup)
   - LOCAL_SETUP.md (detailed guide)
   - HELP.md (this file)

2. Search existing issues on GitHub

3. Create a new issue with:
   - Error message
   - Steps to reproduce
   - Your environment (OS, Node version, etc.)

### Reporting Bugs
Create an issue on GitHub with:
```
Title: Brief description
Environment: Node v18, npm v9, Windows 10
Steps to reproduce:
1. ...
2. ...
Expected result: ...
Actual result: ...
Error message: ...
```

### Feature Requests
Open an issue with:
```
Feature: What you want
Why: Why it's useful
How: How it might work
```

### Additional Resources
- [GitHub Issues](https://github.com/Deadsec404/task-manager/issues)
- [Discussions](https://github.com/Deadsec404/task-manager/discussions)
- [Email](mailto:swapnilbibrale99@gmail.com)

---

## Security Notes

⚠️ **Important Security Guidelines**:

1. **Never commit `.env.local`** - It contains sensitive data
2. **Change JWT_SECRET** - Generate a new secure secret
3. **Use HTTPS in production** - Never use HTTP for sensitive data
4. **Keep dependencies updated** - Run `npm audit` regularly
5. **Validate all inputs** - On both frontend and backend
6. **Use strong passwords** - Min 8 chars, mix of letters, numbers, symbols

---

## Version Information

- **Project**: Task Manager v1.0.0
- **Node**: v18+
- **npm**: v9+
- **React**: 18+
- **Vite**: 4+
- **Prisma**: 5+
- **Express**: 4+

---

## License

This project is licensed under the MIT License - see the LICENSE file for details.

---

## Quick Reference

| Command | Purpose |
|---------|----------|
| `npm install` | Install all dependencies |
| `npm run dev` | Start frontend dev server |
| `cd server && npm run dev` | Start backend dev server |
| `npx prisma studio` | Open database GUI |
| `npx prisma migrate dev --name init` | Create & run migration |
| `npm run seed` | Populate database with seed data |
| `npm run build` | Build for production |
| `npx prisma migrate reset` | Reset database |

---

**Last Updated**: January 4, 2026
**Created by**: Development Team
**Contact**: swapnilbibrale99@gmail.com
