import express from 'express';
import { PrismaClient } from '@prisma/client';
import { authenticate, AuthRequest } from '../middleware/auth.js';

const router = express.Router();
const prisma = new PrismaClient();

// Task reports
router.get('/tasks/workspace/:workspaceId', authenticate, async (req: AuthRequest, res) => {
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

    const { period = 'month' } = req.query;
    const now = new Date();
    let startDate: Date;

    switch (period) {
      case 'week':
        startDate = new Date(now);
        startDate.setDate(startDate.getDate() - 7);
        break;
      case 'month':
        startDate = new Date(now.getFullYear(), now.getMonth(), 1);
        break;
      case 'year':
        startDate = new Date(now.getFullYear(), 0, 1);
        break;
      default:
        startDate = new Date(now.getFullYear(), now.getMonth(), 1);
    }

    // Task completion stats
    const totalTasks = await prisma.task.count({
      where: {
        workspaceId: req.params.workspaceId,
        createdAt: { gte: startDate }
      }
    });

    const completedTasks = await prisma.task.count({
      where: {
        workspaceId: req.params.workspaceId,
        status: 'COMPLETED',
        completedAt: { gte: startDate }
      }
    });

    // Category distribution
    const categoryStats = await prisma.task.groupBy({
      by: ['category'],
      where: {
        workspaceId: req.params.workspaceId,
        createdAt: { gte: startDate }
      },
      _count: true
    });

    // Time efficiency
    const tasksWithTime = await prisma.task.findMany({
      where: {
        workspaceId: req.params.workspaceId,
        expectedTime: { not: null },
        actualTimeSpent: { gt: 0 },
        createdAt: { gte: startDate }
      },
      select: {
        expectedTime: true,
        actualTimeSpent: true
      }
    });

    const timeEfficiency = tasksWithTime.reduce(
      (acc, task) => {
        if (task.expectedTime) {
          acc.totalExpected += task.expectedTime;
          acc.totalActual += task.actualTimeSpent;
        }
        return acc;
      },
      { totalExpected: 0, totalActual: 0 }
    );

    res.json({
      period,
      totalTasks,
      completedTasks,
      completionRate: totalTasks > 0 ? (completedTasks / totalTasks) * 100 : 0,
      categoryDistribution: categoryStats,
      timeEfficiency: {
        expected: timeEfficiency.totalExpected,
        actual: timeEfficiency.totalActual,
        efficiency: timeEfficiency.totalExpected > 0
          ? (timeEfficiency.totalExpected / timeEfficiency.totalActual) * 100
          : 0
      }
    });
  } catch (error) {
    res.status(500).json({ error: 'Failed to generate task report' });
  }
});

// Expense reports
router.get('/expenses/workspace/:workspaceId', authenticate, async (req: AuthRequest, res) => {
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

    const { period = 'month' } = req.query;
    const now = new Date();
    let startDate: Date;

    switch (period) {
      case 'week':
        startDate = new Date(now);
        startDate.setDate(startDate.getDate() - 7);
        break;
      case 'month':
        startDate = new Date(now.getFullYear(), now.getMonth(), 1);
        break;
      case 'year':
        startDate = new Date(now.getFullYear(), 0, 1);
        break;
      default:
        startDate = new Date(now.getFullYear(), now.getMonth(), 1);
    }

    // Total expenses
    const totalExpenses = await prisma.expense.aggregate({
      where: {
        workspaceId: req.params.workspaceId,
        date: { gte: startDate }
      },
      _sum: { amount: true },
      _count: true
    });

    // Category breakdown
    const categoryBreakdown = await prisma.expense.groupBy({
      by: ['category'],
      where: {
        workspaceId: req.params.workspaceId,
        date: { gte: startDate }
      },
      _sum: { amount: true },
      _count: true
    });

    // Personal vs Business
    const personalExpenses = await prisma.expense.aggregate({
      where: {
        workspaceId: req.params.workspaceId,
        category: 'PERSONAL',
        date: { gte: startDate }
      },
      _sum: { amount: true }
    });

    const businessExpenses = await prisma.expense.aggregate({
      where: {
        workspaceId: req.params.workspaceId,
        category: 'BUSINESS',
        date: { gte: startDate }
      },
      _sum: { amount: true }
    });

    // Monthly trend (last 6 months)
    const monthlyTrend = [];
    for (let i = 5; i >= 0; i--) {
      const monthStart = new Date(now.getFullYear(), now.getMonth() - i, 1);
      const monthEnd = new Date(now.getFullYear(), now.getMonth() - i + 1, 0);

      const monthExpenses = await prisma.expense.aggregate({
        where: {
          workspaceId: req.params.workspaceId,
          date: {
            gte: monthStart,
            lte: monthEnd
          }
        },
        _sum: { amount: true }
      });

      monthlyTrend.push({
        month: monthStart.toISOString().slice(0, 7),
        amount: monthExpenses._sum.amount || 0
      });
    }

    res.json({
      period,
      total: totalExpenses._sum.amount || 0,
      count: totalExpenses._count || 0,
      categoryBreakdown,
      personalVsBusiness: {
        personal: personalExpenses._sum.amount || 0,
        business: businessExpenses._sum.amount || 0
      },
      monthlyTrend
    });
  } catch (error) {
    res.status(500).json({ error: 'Failed to generate expense report' });
  }
});

export { router as reportRoutes };

