import express from 'express';
import { PrismaClient } from '@prisma/client';
import { authenticate, AuthRequest, requireSuperAdmin } from '../middleware/auth.js';

const router = express.Router();
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
        preferredCurrency: true,
        createdAt: true,
        _count: {
          select: {
            workspaces: true
          }
        }
      },
      orderBy: { createdAt: 'desc' }
    });

    res.json({ users });
  } catch (error) {
    res.status(500).json({ error: 'Failed to fetch users' });
  }
});

// Get user by ID
router.get('/users/:id', authenticate, requireSuperAdmin, async (req: AuthRequest, res) => {
  try {
    const user = await prisma.user.findUnique({
      where: { id: req.params.id },
      select: {
        id: true,
        email: true,
        name: true,
        role: true,
        preferredCurrency: true,
        createdAt: true,
        workspaces: {
          select: {
            id: true,
            name: true,
            createdAt: true
          }
        }
      }
    });

    if (!user) {
      return res.status(404).json({ error: 'User not found' });
    }

    res.json({ user });
  } catch (error) {
    res.status(500).json({ error: 'Failed to fetch user' });
  }
});

// Create user (Super Admin only)
router.post('/users', authenticate, requireSuperAdmin, async (req: AuthRequest, res) => {
  try {
    const { email, password, name, role, preferredCurrency } = req.body;

    if (!email || !password) {
      return res.status(400).json({ error: 'Email and password are required' });
    }

    // Check if user exists
    const existingUser = await prisma.user.findUnique({
      where: { email }
    });

    if (existingUser) {
      return res.status(400).json({ error: 'User already exists' });
    }

    // Hash password
    const bcrypt = await import('bcryptjs');
    const hashedPassword = await bcrypt.default.hash(password, 10);

    const user = await prisma.user.create({
      data: {
        email,
        password: hashedPassword,
        name,
        role: role || 'USER',
        preferredCurrency: preferredCurrency || 'USD'
      },
      select: {
        id: true,
        email: true,
        name: true,
        role: true,
        preferredCurrency: true,
        createdAt: true
      }
    });

    res.status(201).json({ user });
  } catch (error: any) {
    res.status(500).json({ error: error.message || 'Failed to create user' });
  }
});

// Update user (Super Admin only)
router.put('/users/:id', authenticate, requireSuperAdmin, async (req: AuthRequest, res) => {
  try {
    const { name, role, preferredCurrency, password } = req.body;

    const updateData: any = {};
    if (name !== undefined) updateData.name = name;
    if (role !== undefined) updateData.role = role;
    if (preferredCurrency !== undefined) updateData.preferredCurrency = preferredCurrency;
    if (password) {
      const bcrypt = await import('bcryptjs');
      updateData.password = await bcrypt.default.hash(password, 10);
    }

    const user = await prisma.user.update({
      where: { id: req.params.id },
      data: updateData,
      select: {
        id: true,
        email: true,
        name: true,
        role: true,
        preferredCurrency: true,
        updatedAt: true
      }
    });

    res.json({ user });
  } catch (error: any) {
    res.status(500).json({ error: error.message || 'Failed to update user' });
  }
});

// Delete user (Super Admin only)
router.delete('/users/:id', authenticate, requireSuperAdmin, async (req: AuthRequest, res) => {
  try {
    // Prevent deleting yourself
    if (req.params.id === req.userId) {
      return res.status(400).json({ error: 'Cannot delete your own account' });
    }

    await prisma.user.delete({
      where: { id: req.params.id }
    });

    res.json({ message: 'User deleted successfully' });
  } catch (error: any) {
    res.status(500).json({ error: error.message || 'Failed to delete user' });
  }
});

// Get user statistics
router.get('/stats', authenticate, requireSuperAdmin, async (req: AuthRequest, res) => {
  try {
    const totalUsers = await prisma.user.count();
    const totalWorkspaces = await prisma.workspace.count();
    const totalTasks = await prisma.task.count();
    const totalExpenses = await prisma.expense.count();

    const usersByRole = await prisma.user.groupBy({
      by: ['role'],
      _count: true
    });

    res.json({
      totalUsers,
      totalWorkspaces,
      totalTasks,
      totalExpenses,
      usersByRole: usersByRole.reduce((acc, item) => {
        acc[item.role] = item._count;
        return acc;
      }, {} as Record<string, number>)
    });
  } catch (error) {
    res.status(500).json({ error: 'Failed to fetch statistics' });
  }
});

export { router as adminRoutes };

