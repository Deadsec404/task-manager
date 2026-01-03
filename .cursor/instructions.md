# TaskFlow - Cursor AI Development Instructions

You are an expert full-stack web developer AI assistant helping to build and maintain the TaskFlow application.

## Project Overview

**TaskFlow** is a comprehensive productivity management dashboard built with:
- **Frontend**: React.js (TypeScript)
- **Backend**: Node.js with Express
- **Database**: PostgreSQL with Prisma ORM
- **Deployment**: Docker containerized, CapRover orchestration
- **Features**: Task Management, Time Tracking, Expense Tracking, Habit Tracking, Analytics

## Technology Stack

```json
{
  "frontend": {
    "framework": "React 18+",
    "language": "TypeScript",
    "styling": "Tailwind CSS",
    "state": "Context API / Redux",
    "build": "Vite"
  },
  "backend": {
    "runtime": "Node.js",
    "framework": "Express.js",
    "language": "TypeScript",
    "orm": "Prisma",
    "auth": "JWT",
    "validation": "Zod",
    "database": "PostgreSQL"
  },
  "devops": {
    "containerization": "Docker",
    "orchestration": "CapRover",
    "ci": "GitHub Actions",
    "vcs": "Git"
  }
}
```

## Database Schema

### Core Tables
- **User**: Authentication and user profiles (id, email, password, name, role, preferredCurrency)
- **Workspace**: User workspaces for organizing tasks (id, name, description, userId)
- **Task**: Task management (id, title, description, status, priority, dueDate, workspaceId)
- **Expense**: Expense tracking (id, amount, currency, category, date, workspaceId)
- **Habit**: Habit tracking (id, name, frequency, streak, workspaceId)
- **Session**: User sessions (id, userId, token, expiresAt)

### Key Constraints
- All foreign keys use CASCADE delete for data consistency
- Proper indexes on frequently queried columns (email, status, date, workspaceId)
- Timestamps (createdAt, updatedAt) for audit trail

## Development Guidelines

### Code Style
1. **TypeScript First**: All new code must use TypeScript (strict mode)
2. **Naming Conventions**:
   - Components: PascalCase (`TaskCard.tsx`)
   - Functions/Methods: camelCase (`getTasks()`)
   - Constants: UPPER_SNAKE_CASE (`DEFAULT_WORKSPACE`)
   - Database tables: PascalCase (`User`, `Workspace`)
3. **File Organization**:
   ```
   /src
   ├── /components      (React components)
   ├── /pages          (Page components)
   ├── /hooks          (Custom hooks)
   ├── /services       (API services)
   ├── /utils          (Utilities)
   ├── /types          (TypeScript types)
   └── /styles         (Global styles)
   ```

### API Guidelines
1. **REST Conventions**: Use proper HTTP methods (GET, POST, PUT, DELETE)
2. **Error Handling**: Return meaningful error messages with proper status codes
3. **Authentication**: All protected routes require JWT verification
4. **Validation**: Use Zod for request body validation
5. **Rate Limiting**: Implement rate limiting for auth endpoints (5 attempts in 15 min for production)

### Database Migrations
1. **PostgreSQL Only**: Never use SQLite syntax
2. **SQL Syntax**:
   - ✅ Use `TIMESTAMP` for datetime fields
   - ✅ Use `TEXT NOT NULL PRIMARY KEY` for UUIDs
   - ❌ Avoid SQLite `DATETIME` and `PRAGMA` statements
3. **Migration Process**:
   ```bash
   npx prisma migrate dev --name describe_change
   npx prisma migrate deploy  # For production
   ```
4. **Testing**: Always test migrations locally before pushing

### Testing
1. **Unit Tests**: Test business logic and utilities
2. **Integration Tests**: Test API endpoints
3. **E2E Tests**: Test user workflows
4. **Coverage Goal**: Aim for 80%+ coverage

## Common Issues & Solutions

### Database Migration Failures
**Problem**: "Error: P3009 - migrate found failed migrations"
**Cause**: SQLite syntax used with PostgreSQL
**Solution**: See `TROUBLESHOOTING_MIGRATIONS.md` for detailed fix

### Login/Auth Issues
**Problem**: "Invalid email or password" despite correct credentials
**Cause**: Often database table issues
**Solution**: Verify User table exists with correct schema

### Docker Build Failures
**Problem**: Container fails to start
**Solutions**:
1. Check Dockerfile for correct Node version
2. Verify environment variables are set
3. Check database connection string
4. Review Docker logs: `docker logs <container_id>`

## Deployment Process

### Development
```bash
# Start development environment
npm run dev          # Frontend (Vite)
npm run server:dev   # Backend (Node with nodemon)

# Database
npx prisma studio   # Prisma Studio for DB exploration
```

### Production (CapRover)
1. Push changes to GitHub main branch
2. CapRover automatically builds Docker image
3. Migrations run on container startup (via npm start)
4. App deployed to production URL

## Key Commands

```bash
# Prisma
npx prisma migrate dev --name feature_name
npx prisma migrate deploy
npx prisma db push
npx prisma studio

# Docker
docker build -t task-manager .
docker run -p 3000:80 task-manager
docker-compose up -d

# Package Management
npm install
npm run build
npm start
npm run lint
npm run format

# Git
git add .
git commit -m "type: description"
git push origin main
```

## Commit Message Convention

Use conventional commits for consistency:
```
type(scope): description

- feat: new feature
- fix: bug fix
- docs: documentation
- style: formatting/styling
- refactor: code restructuring
- perf: performance improvements
- test: test additions/updates
- chore: build process, dependencies

Example: feat(auth): add JWT token refresh
```

## Feature Development Checklist

When adding new features:

- [ ] Create feature branch: `git checkout -b feature/name`
- [ ] Update Prisma schema if database changes needed
- [ ] Generate/run migrations: `npx prisma migrate dev`
- [ ] Implement API endpoints with validation
- [ ] Add TypeScript types for responses
- [ ] Implement React components
- [ ] Add error handling and loading states
- [ ] Test locally before pushing
- [ ] Create pull request with clear description
- [ ] Ensure all tests pass
- [ ] Merge to main (auto-deploys)

## Performance Optimization

1. **Database**: Use indexes on frequently queried columns
2. **Frontend**: Implement lazy loading for components
3. **API**: Cache responses where appropriate
4. **Images**: Optimize and compress images
5. **Bundles**: Monitor bundle size with build analysis

## Security Best Practices

1. **Authentication**: Use strong password hashing (bcryptjs)
2. **Secrets**: Never commit API keys or secrets
3. **Validation**: Always validate user input on backend
4. **HTTPS**: Always use HTTPS in production
5. **CORS**: Configure CORS appropriately
6. **SQL Injection**: Use parameterized queries (Prisma handles this)
7. **Rate Limiting**: Implement on auth and sensitive endpoints

## Documentation Standards

1. **Code Comments**: Explain WHY, not WHAT
2. **README**: Keep updated with setup instructions
3. **API Docs**: Document all endpoints with examples
4. **Troubleshooting**: Update when issues are discovered

## When Creating New Features

### Database Changes
1. Update Prisma schema
2. Create migration: `npx prisma migrate dev --name feature_name`
3. Test migration works: `npx prisma db push`
4. Commit migration files

### API Endpoints
1. Define TypeScript types for request/response
2. Create validation schema using Zod
3. Implement route handler with proper error handling
4. Add authentication middleware if needed
5. Document endpoint with example

### Frontend Components
1. Create component with TypeScript types
2. Handle loading and error states
3. Use Tailwind CSS for styling
4. Add proper TypeScript props interface
5. Export with proper type exports

## Debugging Tips

1. **Backend Logs**: Check Docker logs: `docker logs <container>`
2. **Database**: Use Prisma Studio: `npx prisma studio`
3. **Frontend**: Chrome DevTools for debugging
4. **Network**: Check Network tab for API calls
5. **Database Connections**: Verify DATABASE_URL is correct

## Version Control

- Main branch is always production-ready
- Create feature branches for new work
- Require clean history before merge
- Review code before merging

## Resources

- Prisma Docs: https://www.prisma.io/docs/
- Express Guide: https://expressjs.com/
- React Documentation: https://react.dev/
- TypeScript: https://www.typescriptlang.org/docs/
- CapRover: https://caprover.com/documentation

## Contact & Support

For issues, refer to:
1. `TROUBLESHOOTING_MIGRATIONS.md` - Database issues
2. GitHub Issues - Feature requests and bug reports
3. Project Documentation - General guidance

---

**Last Updated**: January 4, 2026
**Version**: 1.0
**Status**: Active Development
