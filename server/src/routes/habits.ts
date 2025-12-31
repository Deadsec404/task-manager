import express from 'express';
import { PrismaClient } from '@prisma/client';
import { authenticate, AuthRequest } from '../middleware/auth.js';
import { habitSchema } from '../utils/validation.js';

const router = express.Router();
const prisma = new PrismaClient();

// Get all habits for workspace
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

    const habits = await prisma.habit.findMany({
      where: { workspaceId: req.params.workspaceId },
      include: {
        entries: {
          orderBy: { date: 'desc' },
          take: 30
        }
      },
      orderBy: { createdAt: 'desc' }
    });

    res.json({ habits });
  } catch (error) {
    res.status(500).json({ error: 'Failed to fetch habits' });
  }
});

// Create habit
router.post('/', authenticate, async (req: AuthRequest, res) => {
  try {
    const data = habitSchema.parse(req.body);
    const { workspaceId, ...habitData } = req.body;

    const workspace = await prisma.workspace.findFirst({
      where: {
        id: workspaceId,
        userId: req.userId!
      }
    });

    if (!workspace) {
      return res.status(404).json({ error: 'Workspace not found' });
    }

    const habit = await prisma.habit.create({
      data: {
        ...habitData,
        name: data.name,
        description: data.description,
        frequency: data.frequency || 'DAILY',
        workspaceId
      }
    });

    res.status(201).json({ habit });
  } catch (error: any) {
    if (error.name === 'ZodError') {
      return res.status(400).json({ error: error.errors[0].message });
    }
    res.status(500).json({ error: 'Failed to create habit' });
  }
});

// Update habit
router.put('/:id', authenticate, async (req: AuthRequest, res) => {
  try {
    const habit = await prisma.habit.findUnique({
      where: { id: req.params.id },
      include: {
        workspace: {
          select: { userId: true }
        }
      }
    });

    if (!habit || habit.workspace.userId !== req.userId!) {
      return res.status(404).json({ error: 'Habit not found' });
    }

    const data = habitSchema.partial().parse(req.body);

    const updatedHabit = await prisma.habit.update({
      where: { id: req.params.id },
      data
    });

    res.json({ habit: updatedHabit });
  } catch (error: any) {
    if (error.name === 'ZodError') {
      return res.status(400).json({ error: error.errors[0].message });
    }
    res.status(500).json({ error: 'Failed to update habit' });
  }
});

// Delete habit
router.delete('/:id', authenticate, async (req: AuthRequest, res) => {
  try {
    const habit = await prisma.habit.findUnique({
      where: { id: req.params.id },
      include: {
        workspace: {
          select: { userId: true }
        }
      }
    });

    if (!habit || habit.workspace.userId !== req.userId!) {
      return res.status(404).json({ error: 'Habit not found' });
    }

    await prisma.habit.delete({
      where: { id: req.params.id }
    });

    res.json({ message: 'Habit deleted successfully' });
  } catch (error) {
    res.status(500).json({ error: 'Failed to delete habit' });
  }
});

// Toggle habit entry for date
router.post('/:id/entries', authenticate, async (req: AuthRequest, res) => {
  try {
    const { date, completed, notes } = req.body;

    const habit = await prisma.habit.findUnique({
      where: { id: req.params.id },
      include: {
        workspace: {
          select: { userId: true }
        }
      }
    });

    if (!habit || habit.workspace.userId !== req.userId!) {
      return res.status(404).json({ error: 'Habit not found' });
    }

    const entryDate = date ? new Date(date) : new Date();
    entryDate.setHours(0, 0, 0, 0);

    const entry = await prisma.habitEntry.upsert({
      where: {
        habitId_date: {
          habitId: req.params.id,
          date: entryDate
        }
      },
      update: {
        completed: completed !== undefined ? completed : true,
        notes
      },
      create: {
        habitId: req.params.id,
        date: entryDate,
        completed: completed !== undefined ? completed : true,
        notes
      }
    });

    res.json({ entry });
  } catch (error) {
    res.status(500).json({ error: 'Failed to update habit entry' });
  }
});

export { router as habitRoutes };

