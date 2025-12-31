import express from 'express';
import { PrismaClient } from '@prisma/client';
import { authenticate, AuthRequest } from '../middleware/auth.js';

const router = express.Router();
const prisma = new PrismaClient();

// Get dashboard data for workspace
router.get('/workspace/:workspaceId', authenticate, async (req: AuthRequest, res) => {
  try {
    const workspace = await prisma.workspace.findFirst({
      where: {
        id: req.params.workspaceId,
        userId: req.userId!
      }
    });

    if (!workspace) {
      return res.status(404).json({ error: 'Workspace not found' });
    }

    const now = new Date();
    const todayStart = new Date(now.getFullYear(), now.getMonth(), now.getDate());
    const weekStart = new Date(todayStart);
    weekStart.setDate(weekStart.getDate() - weekStart.getDay());
    const monthStart = new Date(now.getFullYear(), now.getMonth(), 1);

    // Today's tasks
    const todayTasks = await prisma.task.findMany({
      where: {
        workspaceId: req.params.workspaceId,
        dueDate: {
          gte: todayStart,
          lt: new Date(todayStart.getTime() + 24 * 60 * 60 * 1000)
        },
        status: { not: 'COMPLETED' }
      },
      orderBy: { priority: 'desc' }
    });

    // Overdue tasks
    const overdueTasks = await prisma.task.findMany({
      where: {
        workspaceId: req.params.workspaceId,
        status: 'OVERDUE'
      },
      orderBy: { dueDate: 'asc' }
    });

    // Time spent today
    const todayTimeEntries = await prisma.timeEntry.findMany({
      where: {
        task: {
          workspaceId: req.params.workspaceId
        },
        startTime: {
          gte: todayStart
        }
      },
      include: {
        task: true
      }
    });

    const timeSpentToday = todayTimeEntries.reduce((sum, entry) => {
      return sum + (entry.duration || 0);
    }, 0);

    // Tasks completed this week
    const tasksCompletedThisWeek = await prisma.task.count({
      where: {
        workspaceId: req.params.workspaceId,
        status: 'COMPLETED',
        completedAt: {
          gte: weekStart
        }
      }
    });

    // Monthly expenses
    const monthlyExpenses = await prisma.expense.aggregate({
      where: {
        workspaceId: req.params.workspaceId,
        date: {
          gte: monthStart
        }
      },
      _sum: {
        amount: true
      }
    });

    // Budget status
    const budgets = await prisma.budget.findMany({
      where: {
        workspaceId: req.params.workspaceId,
        period: 'monthly'
      }
    });

    const budgetStatus = await Promise.all(
      budgets.map(async (budget) => {
        const spent = await prisma.expense.aggregate({
          where: {
            workspaceId: req.params.workspaceId,
            category: budget.category,
            ...(budget.subCategory && { subCategory: budget.subCategory }),
            date: {
              gte: monthStart
            }
          },
          _sum: {
            amount: true
          }
        });

        return {
          ...budget,
          spent: spent._sum.amount || 0,
          remaining: budget.amount - (spent._sum.amount || 0),
          percentage: ((spent._sum.amount || 0) / budget.amount) * 100
        };
      })
    );

    // Productivity score (simple calculation)
    const totalTasks = await prisma.task.count({
      where: {
        workspaceId: req.params.workspaceId,
        createdAt: {
          gte: monthStart
        }
      }
    });

    const completedTasks = await prisma.task.count({
      where: {
        workspaceId: req.params.workspaceId,
        status: 'COMPLETED',
        completedAt: {
          gte: monthStart
        }
      }
    });

    const productivityScore = totalTasks > 0 ? Math.round((completedTasks / totalTasks) * 100) : 0;

    res.json({
      todayTasks,
      overdueTasks,
      timeSpentToday,
      tasksCompletedThisWeek,
      monthlyExpenses: monthlyExpenses._sum.amount || 0,
      budgetStatus,
      productivityScore
    });
  } catch (error) {
    console.error('Dashboard error:', error);
    res.status(500).json({ error: 'Failed to fetch dashboard data' });
  }
});

export { router as dashboardRoutes };

