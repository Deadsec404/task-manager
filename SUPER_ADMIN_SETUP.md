# TaskFlow Super Admin Setup Guide

## Overview

This guide explains how to add Super Admin functionality to TaskFlow. The database schema already supports roles (USER, ADMIN, SUPER_ADMIN), but we need to implement the UI, backend, and authorization logic.

## Current State

**What Already Exists:**
- ✅ User model has `role` field (String, default: "USER")
- ✅ Roles can be: "USER", "ADMIN", "SUPER_ADMIN"
- ❌ No middleware to enforce role-based access
- ❌ No UI for Super Admin panel
- ❌ No API endpoints for admin features

## Step-by-Step Implementation

### Step 1: Create Super Admin User (Database)

#### Option A: Direct Database Update
```sql
-- Update an existing user to SUPER_ADMIN
UPDATE "User" 
SET "role" = 'SUPER_ADMIN' 
WHERE "email" = 'swapnilbibrale99@gmail.com';
```

#### Option B: Using Prisma CLI
```bash
# Open Prisma Studio
npx prisma studio

# Then navigate to User table and edit the role field
# Change role from "USER" to "SUPER_ADMIN"
```

#### Option C: Create a Seed Script
Create `server/src/seed.ts`:
```typescript
import { PrismaClient } from '@prisma/client';
import bcrypt from 'bcryptjs';

const prisma = new PrismaClient();

async function main() {
  // Create Super Admin User
  const superAdmin = await prisma.user.upsert({
    where: { email: 'admin@taskflow.com' },
    update: { role: 'SUPER_ADMIN' },
    create: {
      email: 'admin@taskflow.com',
      password: await bcrypt.hash('SuperSecurePassword123!', 10),
      name: 'Super Administrator',
      role: 'SUPER_ADMIN',
      preferredCurrency: 'USD'
    },
  });

  console.log('Super Admin created:', superAdmin);
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
```

Run the seed script:
```bash
npx ts-node server/src/seed.ts
```

### Step 2: Create Role-Based Middleware

Create `server/src/middleware/roleAuth.ts`:
```typescript
import { Request, Response, NextFunction } from 'express';
import { AuthRequest } from './auth';

type UserRole = 'USER' | 'ADMIN' | 'SUPER_ADMIN';

// Higher order function to check role
export const requireRole = (allowedRoles: UserRole[]) => {
  return async (req: AuthRequest, res: Response, next: NextFunction) => {
    try {
      if (!req.userId) {
        return res.status(401).json({ error: 'Not authenticated' });
      }

      const { PrismaClient } = await import('@prisma/client');
      const prisma = new PrismaClient();

      const user = await prisma.user.findUnique({
        where: { id: req.userId },
        select: { role: true },
      });

      if (!user || !allowedRoles.includes(user.role as UserRole)) {
        return res.status(403).json({ error: 'Insufficient permissions' });
      }

      next();
    } catch (error) {
      res.status(500).json({ error: 'Authorization failed' });
    }
  };
};

// Specific role checkers
export const requireAdmin = requireRole(['ADMIN', 'SUPER_ADMIN']);
export const requireSuperAdmin = requireRole(['SUPER_ADMIN']);
```

### Step 3: Create Admin API Endpoints

Create `server/src/routes/admin.ts`:
```typescript
import express, { Router } from 'express';
import { PrismaClient } from '@prisma/client';
import { authenticate, AuthRequest } from '../middleware/auth';
import { requireSuperAdmin, requireAdmin } from '../middleware/roleAuth';

const router = Router();
const prisma = new PrismaClient();

// Get all users (Super Admin only)
router.get('/users', authenticate, requireSuperAdmin, async (req: AuthRequest, res) => {
  try {
    const users = await prisma.user.findMany({
      select: {
        id: true,
        email: true,
        name: true,
        role: true,
        createdAt: true,
      },
    });
    res.json({ users });
  } catch (error) {
    res.status(500).json({ error: 'Failed to fetch users' });
  }
});

// Update user role (Super Admin only)
router.patch('/users/:userId/role', authenticate, requireSuperAdmin, async (req: AuthRequest, res) => {
  try {
    const { userId } = req.params;
    const { role } = req.body;

    // Validate role
    if (!['USER', 'ADMIN', 'SUPER_ADMIN'].includes(role)) {
      return res.status(400).json({ error: 'Invalid role' });
    }

    // Prevent removing last super admin
    if (role !== 'SUPER_ADMIN') {
      const superAdminCount = await prisma.user.count({
        where: { role: 'SUPER_ADMIN' },
      });
      if (superAdminCount <= 1 && userId === req.userId) {
        return res.status(400).json({ error: 'Cannot remove last super admin' });
      }
    }

    const user = await prisma.user.update({
      where: { id: userId },
      data: { role },
      select: { id: true, email: true, role: true },
    });

    res.json({ user });
  } catch (error) {
    res.status(500).json({ error: 'Failed to update user role' });
  }
});

// Delete user (Super Admin only)
router.delete('/users/:userId', authenticate, requireSuperAdmin, async (req: AuthRequest, res) => {
  try {
    const { userId } = req.params;

    // Prevent deleting self
    if (userId === req.userId) {
      return res.status(400).json({ error: 'Cannot delete your own account' });
    }

    await prisma.user.delete({
      where: { id: userId },
    });

    res.json({ message: 'User deleted successfully' });
  } catch (error) {
    res.status(500).json({ error: 'Failed to delete user' });
  }
});

export { router as adminRoutes };
```

Add to main server file (`server/src/index.ts`):
```typescript
import { adminRoutes } from './routes/admin';

// Add admin routes
app.use('/api/admin', adminRoutes);
```

### Step 4: Create Admin Dashboard UI

Create React component `src/components/AdminPanel.tsx`:
```typescript
import React, { useState, useEffect } from 'react';

interface User {
  id: string;
  email: string;
  name: string;
  role: 'USER' | 'ADMIN' | 'SUPER_ADMIN';
  createdAt: string;
}

export const AdminPanel: React.FC = () => {
  const [users, setUsers] = useState<User[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    fetchUsers();
  }, []);

  const fetchUsers = async () => {
    try {
      const response = await fetch('/api/admin/users');
      if (!response.ok) throw new Error('Failed to fetch users');
      const data = await response.json();
      setUsers(data.users);
    } catch (err) {
      setError('Failed to load users');
    } finally {
      setLoading(false);
    }
  };

  const updateRole = async (userId: string, newRole: string) => {
    try {
      const response = await fetch(`/api/admin/users/${userId}/role`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ role: newRole }),
      });
      if (!response.ok) throw new Error('Failed to update role');
      fetchUsers();
    } catch (err) {
      setError('Failed to update user role');
    }
  };

  const deleteUser = async (userId: string) => {
    if (!confirm('Are you sure you want to delete this user?')) return;
    try {
      const response = await fetch(`/api/admin/users/${userId}`, {
        method: 'DELETE',
      });
      if (!response.ok) throw new Error('Failed to delete user');
      fetchUsers();
    } catch (err) {
      setError('Failed to delete user');
    }
  };

  if (loading) return <div>Loading...</div>;
  if (error) return <div className="text-red-500">{error}</div>;

  return (
    <div className="p-6">
      <h1 className="text-2xl font-bold mb-4">Super Admin Panel</h1>
      <table className="w-full border">
        <thead>
          <tr className="bg-gray-200">
            <th className="border p-2">Email</th>
            <th className="border p-2">Name</th>
            <th className="border p-2">Role</th>
            <th className="border p-2">Actions</th>
          </tr>
        </thead>
        <tbody>
          {users.map((user) => (
            <tr key={user.id} className="border">
              <td className="border p-2">{user.email}</td>
              <td className="border p-2">{user.name}</td>
              <td className="border p-2">
                <select
                  value={user.role}
                  onChange={(e) => updateRole(user.id, e.target.value)}
                  className="border p-1"
                >
                  <option value="USER">User</option>
                  <option value="ADMIN">Admin</option>
                  <option value="SUPER_ADMIN">Super Admin</option>
                </select>
              </td>
              <td className="border p-2">
                <button
                  onClick={() => deleteUser(user.id)}
                  className="bg-red-500 text-white px-3 py-1 rounded"
                >
                  Delete
                </button>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
};
```

### Step 5: Add Super Admin Route to Navigation

Update `src/App.tsx`:
```typescript
import { AdminPanel } from './components/AdminPanel';
import { requireSuperAdmin } from './middleware/roleAuth';

// Add route in your router
<Route 
  path="/admin" 
  element={<ProtectedRoute><AdminPanel /></ProtectedRoute>} 
/>
```

### Step 6: Test Super Admin Functionality

```bash
# 1. Login as super admin
# Email: admin@taskflow.com
# Password: SuperSecurePassword123!

# 2. Navigate to /admin panel

# 3. Test user management features:
# - View all users
# - Update user roles
# - Delete users
```

## API Endpoints

### Get All Users
```bash
GET /api/admin/users
Headers: Authorization: Bearer <token>
Response: { "users": [...] }
```

### Update User Role
```bash
PATCH /api/admin/users/:userId/role
Headers: Authorization: Bearer <token>
Body: { "role": "ADMIN" | "USER" | "SUPER_ADMIN" }
Response: { "user": {...} }
```

### Delete User
```bash
DELETE /api/admin/users/:userId
Headers: Authorization: Bearer <token>
Response: { "message": "User deleted successfully" }
```

## Security Checklist

- ✅ Role-based middleware for protected routes
- ✅ Cannot remove last super admin
- ✅ Cannot delete your own account
- ✅ Proper error handling and validation
- ✅ Token-based authentication required
- ✅ Input sanitization for role updates

## Future Enhancements

1. **Activity Logging** - Log all admin actions
2. **Two-Factor Authentication** - Require 2FA for super admins
3. **Audit Trail** - Track who modified what and when
4. **Permission System** - Granular permissions (manage users, manage expenses, etc.)
5. **Admin Dashboard** - Statistics, graphs, analytics
6. **Email Notifications** - Notify admins of important events
7. **IP Whitelisting** - Restrict admin access to specific IPs

## Troubleshooting

### Issue: "Insufficient permissions" error
**Solution**: Verify your user's role is set to "SUPER_ADMIN" in the database

### Issue: Cannot access admin endpoints
**Solution**: Ensure you're authenticated (valid JWT token)

### Issue: Routes not working
**Solution**: Make sure admin routes are registered in `index.ts`

---

**Last Updated**: January 4, 2026
**Status**: Ready for Implementation
