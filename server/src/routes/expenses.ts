import express from 'express';
import { PrismaClient } from '@prisma/client';
import { authenticate, AuthRequest } from '../middleware/auth.js';
import { expenseSchema, budgetSchema } from '../utils/validation.js';

const router = express.Router();
const prisma = new PrismaClient();

// Get all expenses for workspace
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

    const { category, startDate, endDate } = req.query;

    const expenses = await prisma.expense.findMany({
      where: {
        workspaceId: req.params.workspaceId,
        ...(category && { category: category as any }),
        ...(startDate && endDate && {
          date: {
            gte: new Date(startDate as string),
            lte: new Date(endDate as string)
          }
        })
      },
      orderBy: { date: 'desc' }
    });

    res.json({ expenses });
  } catch (error) {
    res.status(500).json({ error: 'Failed to fetch expenses' });
  }
});

// Get expense by ID
router.get('/:id', authenticate, async (req: AuthRequest, res) => {
  try {
    const expense = await prisma.expense.findUnique({
      where: { id: req.params.id },
      include: {
        workspace: {
          select: { userId: true }
        }
      }
    });

    if (!expense || expense.workspace.userId !== req.userId!) {
      return res.status(404).json({ error: 'Expense not found' });
    }

    res.json({ expense });
  } catch (error) {
    res.status(500).json({ error: 'Failed to fetch expense' });
  }
});

// Create expense
router.post('/', authenticate, async (req: AuthRequest, res) => {
  try {
    const data = expenseSchema.parse(req.body);
    const { workspaceId, ...expenseData } = req.body;

    const workspace = await prisma.workspace.findFirst({
      where: {
        id: workspaceId,
        userId: req.userId!
      }
    });

    if (!workspace) {
      return res.status(404).json({ error: 'Workspace not found' });
    }

    const expense = await prisma.expense.create({
      data: {
        ...expenseData,
        amount: data.amount,
        currency: data.currency || 'USD',
        category: data.category,
        subCategory: data.subCategory,
        paymentMethod: data.paymentMethod,
        date: data.date ? new Date(data.date) : new Date(),
        notes: data.notes,
        workspaceId
      }
    });

    res.status(201).json({ expense });
  } catch (error: any) {
    if (error.name === 'ZodError') {
      return res.status(400).json({ error: error.errors[0].message });
    }
    res.status(500).json({ error: 'Failed to create expense' });
  }
});

// Update expense
router.put('/:id', authenticate, async (req: AuthRequest, res) => {
  try {
    const expense = await prisma.expense.findUnique({
      where: { id: req.params.id },
      include: {
        workspace: {
          select: { userId: true }
        }
      }
    });

    if (!expense || expense.workspace.userId !== req.userId!) {
      return res.status(404).json({ error: 'Expense not found' });
    }

    const data = expenseSchema.partial().parse(req.body);
    const updateData: any = { ...data };

    if (data.date !== undefined) {
      updateData.date = new Date(data.date);
    }

    const updatedExpense = await prisma.expense.update({
      where: { id: req.params.id },
      data: updateData
    });

    res.json({ expense: updatedExpense });
  } catch (error: any) {
    if (error.name === 'ZodError') {
      return res.status(400).json({ error: error.errors[0].message });
    }
    res.status(500).json({ error: 'Failed to update expense' });
  }
});

// Delete expense
router.delete('/:id', authenticate, async (req: AuthRequest, res) => {
  try {
    const expense = await prisma.expense.findUnique({
      where: { id: req.params.id },
      include: {
        workspace: {
          select: { userId: true }
        }
      }
    });

    if (!expense || expense.workspace.userId !== req.userId!) {
      return res.status(404).json({ error: 'Expense not found' });
    }

    await prisma.expense.delete({
      where: { id: req.params.id }
    });

    res.json({ message: 'Expense deleted successfully' });
  } catch (error) {
    res.status(500).json({ error: 'Failed to delete expense' });
  }
});

// Budget routes
router.get('/workspace/:workspaceId/budgets', authenticate, async (req: AuthRequest, res) => {
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

    const budgets = await prisma.budget.findMany({
      where: { workspaceId: req.params.workspaceId }
    });

    res.json({ budgets });
  } catch (error) {
    res.status(500).json({ error: 'Failed to fetch budgets' });
  }
});

router.post('/workspace/:workspaceId/budgets', authenticate, async (req: AuthRequest, res) => {
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

    const data = budgetSchema.parse(req.body);

    const budget = await prisma.budget.create({
      data: {
        ...data,
        workspaceId: req.params.workspaceId
      }
    });

    res.status(201).json({ budget });
  } catch (error: any) {
    if (error.name === 'ZodError') {
      return res.status(400).json({ error: error.errors[0].message });
    }
    res.status(500).json({ error: 'Failed to create budget' });
  }
});

router.put('/budgets/:id', authenticate, async (req: AuthRequest, res) => {
  try {
    const budget = await prisma.budget.findUnique({
      where: { id: req.params.id },
      include: {
        workspace: {
          select: { userId: true }
        }
      }
    });

    if (!budget || budget.workspace.userId !== req.userId!) {
      return res.status(404).json({ error: 'Budget not found' });
    }

    const data = budgetSchema.partial().parse(req.body);

    const updatedBudget = await prisma.budget.update({
      where: { id: req.params.id },
      data
    });

    res.json({ budget: updatedBudget });
  } catch (error: any) {
    if (error.name === 'ZodError') {
      return res.status(400).json({ error: error.errors[0].message });
    }
    res.status(500).json({ error: 'Failed to update budget' });
  }
});

router.delete('/budgets/:id', authenticate, async (req: AuthRequest, res) => {
  try {
    const budget = await prisma.budget.findUnique({
      where: { id: req.params.id },
      include: {
        workspace: {
          select: { userId: true }
        }
      }
    });

    if (!budget || budget.workspace.userId !== req.userId!) {
      return res.status(404).json({ error: 'Budget not found' });
    }

    await prisma.budget.delete({
      where: { id: req.params.id }
    });

    res.json({ message: 'Budget deleted successfully' });
  } catch (error) {
    res.status(500).json({ error: 'Failed to delete budget' });
  }
});

export { router as expenseRoutes };

