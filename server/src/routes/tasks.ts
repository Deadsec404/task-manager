import express from 'express';
import { PrismaClient } from '@prisma/client';
import { authenticate, AuthRequest } from '../middleware/auth.js';
import { taskSchema } from '../utils/validation.js';

const router = express.Router();
const prisma = new PrismaClient();

// Get all tasks for workspace
router.get('/workspace/:workspaceId', authenticate, async (req: AuthRequest, res) => {
  try {
    // Verify workspace ownership
    const workspace = await prisma.workspace.findFirst({
      where: {
        id: req.params.workspaceId,
        userId: req.userId!
      }
    });

    if (!workspace) {
      return res.status(404).json({ error: 'Workspace not found' });
    }

    const { status, category, priority } = req.query;

    const tasks = await prisma.task.findMany({
      where: {
        workspaceId: req.params.workspaceId,
        ...(status && { status: status as any }),
        ...(category && { category: category as string }),
        ...(priority && { priority: priority as any }),
      },
      include: {
        timeEntries: {
          orderBy: { createdAt: 'desc' },
          take: 10
        }
      },
      orderBy: [
        { dueDate: 'asc' },
        { createdAt: 'desc' }
      ]
    });

    // Auto-update overdue tasks
    const now = new Date();
    for (const task of tasks) {
      if (task.dueDate && task.dueDate < now && task.status !== 'COMPLETED' && task.status !== 'OVERDUE') {
        await prisma.task.update({
          where: { id: task.id },
          data: { status: 'OVERDUE' }
        });
        task.status = 'OVERDUE';
      }
      // Parse tags from JSON string to array
      if (typeof task.tags === 'string') {
        (task as any).tags = JSON.parse(task.tags || '[]');
      }
    }

    res.json({ tasks });
  } catch (error) {
    res.status(500).json({ error: 'Failed to fetch tasks' });
  }
});

// Get task by ID
router.get('/:id', authenticate, async (req: AuthRequest, res) => {
  try {
    const task = await prisma.task.findUnique({
      where: { id: req.params.id },
      include: {
        workspace: {
          select: { userId: true }
        },
        timeEntries: {
          orderBy: { createdAt: 'desc' }
        }
      }
    });

    if (!task || task.workspace.userId !== req.userId!) {
      return res.status(404).json({ error: 'Task not found' });
    }

    // Parse tags from JSON string to array
    const taskResponse = {
      ...task,
      tags: typeof task.tags === 'string' ? JSON.parse(task.tags || '[]') : task.tags
    };

    res.json({ task: taskResponse });
  } catch (error) {
    res.status(500).json({ error: 'Failed to fetch task' });
  }
});

// Create task
router.post('/', authenticate, async (req: AuthRequest, res) => {
  try {
    const data = taskSchema.parse(req.body);
    const { workspaceId, ...taskData } = req.body;

    // Verify workspace ownership
    const workspace = await prisma.workspace.findFirst({
      where: {
        id: workspaceId,
        userId: req.userId!
      }
    });

    if (!workspace) {
      return res.status(404).json({ error: 'Workspace not found' });
    }

    // Convert tags array to JSON string for SQLite
    const tagsString = data.tags && Array.isArray(data.tags) 
      ? JSON.stringify(data.tags) 
      : '[]';

    const task = await prisma.task.create({
      data: {
        ...taskData,
        title: data.title,
        description: data.description,
        category: data.category || 'Personal',
        priority: data.priority || 'MEDIUM',
        status: data.status || 'NOT_STARTED',
        dueDate: data.dueDate ? new Date(data.dueDate) : null,
        expectedTime: data.expectedTime,
        tags: tagsString,
        workspaceId
      }
    });

    // Parse tags back to array for response
    const taskResponse = {
      ...task,
      tags: typeof task.tags === 'string' ? JSON.parse(task.tags || '[]') : task.tags
    };

    res.status(201).json({ task: taskResponse });
  } catch (error: any) {
    if (error.name === 'ZodError') {
      return res.status(400).json({ error: error.errors[0].message });
    }
    res.status(500).json({ error: 'Failed to create task' });
  }
});

// Update task
router.put('/:id', authenticate, async (req: AuthRequest, res) => {
  try {
    const task = await prisma.task.findUnique({
      where: { id: req.params.id },
      include: {
        workspace: {
          select: { userId: true }
        }
      }
    });

    if (!task || task.workspace.userId !== req.userId!) {
      return res.status(404).json({ error: 'Task not found' });
    }

    const data = taskSchema.partial().parse(req.body);
    const updateData: any = { ...data };

    if (data.dueDate !== undefined) {
      updateData.dueDate = data.dueDate ? new Date(data.dueDate) : null;
    }

    // Convert tags array to JSON string for SQLite if provided
    if (data.tags !== undefined) {
      updateData.tags = Array.isArray(data.tags) 
        ? JSON.stringify(data.tags) 
        : '[]';
    }

    // Auto-update status to COMPLETED if marked
    if (data.status === 'COMPLETED' && task.status !== 'COMPLETED') {
      updateData.completedAt = new Date();
    } else if (data.status !== 'COMPLETED' && task.status === 'COMPLETED') {
      updateData.completedAt = null;
    }

    const updatedTask = await prisma.task.update({
      where: { id: req.params.id },
      data: updateData
    });

    // Parse tags back to array for response
    const taskResponse = {
      ...updatedTask,
      tags: typeof updatedTask.tags === 'string' ? JSON.parse(updatedTask.tags || '[]') : updatedTask.tags
    };

    res.json({ task: taskResponse });
  } catch (error: any) {
    if (error.name === 'ZodError') {
      return res.status(400).json({ error: error.errors[0].message });
    }
    res.status(500).json({ error: 'Failed to update task' });
  }
});

// Delete task
router.delete('/:id', authenticate, async (req: AuthRequest, res) => {
  try {
    const task = await prisma.task.findUnique({
      where: { id: req.params.id },
      include: {
        workspace: {
          select: { userId: true }
        }
      }
    });

    if (!task || task.workspace.userId !== req.userId!) {
      return res.status(404).json({ error: 'Task not found' });
    }

    await prisma.task.delete({
      where: { id: req.params.id }
    });

    res.json({ message: 'Task deleted successfully' });
  } catch (error) {
    res.status(500).json({ error: 'Failed to delete task' });
  }
});

// Start time tracking
router.post('/:id/time/start', authenticate, async (req: AuthRequest, res) => {
  try {
    const task = await prisma.task.findUnique({
      where: { id: req.params.id },
      include: {
        workspace: {
          select: { userId: true }
        }
      }
    });

    if (!task || task.workspace.userId !== req.userId!) {
      return res.status(404).json({ error: 'Task not found' });
    }

    // Check for active time entry
    const activeEntry = await prisma.timeEntry.findFirst({
      where: {
        taskId: req.params.id,
        endTime: null
      }
    });

    if (activeEntry) {
      return res.status(400).json({ error: 'Time tracking already active for this task' });
    }

    const timeEntry = await prisma.timeEntry.create({
      data: {
        taskId: req.params.id,
        startTime: new Date()
      }
    });

    res.status(201).json({ timeEntry });
  } catch (error) {
    res.status(500).json({ error: 'Failed to start time tracking' });
  }
});

// Stop time tracking
router.post('/:id/time/stop', authenticate, async (req: AuthRequest, res) => {
  try {
    const timeEntry = await prisma.timeEntry.findFirst({
      where: {
        taskId: req.params.id,
        endTime: null
      },
      include: {
        task: {
          include: {
            workspace: {
              select: { userId: true }
            }
          }
        }
      }
    });

    if (!timeEntry || timeEntry.task.workspace.userId !== req.userId!) {
      return res.status(404).json({ error: 'No active time tracking found' });
    }

    const endTime = new Date();
    const duration = Math.floor((endTime.getTime() - timeEntry.startTime.getTime()) / 60000); // minutes

    const updatedEntry = await prisma.timeEntry.update({
      where: { id: timeEntry.id },
      data: {
        endTime,
        duration
      }
    });

    // Update task's actual time spent
    await prisma.task.update({
      where: { id: req.params.id },
      data: {
        actualTimeSpent: {
          increment: duration
        }
      }
    });

    res.json({ timeEntry: updatedEntry });
  } catch (error) {
    res.status(500).json({ error: 'Failed to stop time tracking' });
  }
});

// Add manual time entry
router.post('/:id/time', authenticate, async (req: AuthRequest, res) => {
  try {
    const { duration, description } = req.body;

    if (!duration || duration <= 0) {
      return res.status(400).json({ error: 'Valid duration is required' });
    }

    const task = await prisma.task.findUnique({
      where: { id: req.params.id },
      include: {
        workspace: {
          select: { userId: true }
        }
      }
    });

    if (!task || task.workspace.userId !== req.userId!) {
      return res.status(404).json({ error: 'Task not found' });
    }

    const timeEntry = await prisma.timeEntry.create({
      data: {
        taskId: req.params.id,
        startTime: new Date(),
        endTime: new Date(),
        duration: parseInt(duration),
        description
      }
    });

    // Update task's actual time spent
    await prisma.task.update({
      where: { id: req.params.id },
      data: {
        actualTimeSpent: {
          increment: parseInt(duration)
        }
      }
    });

    res.status(201).json({ timeEntry });
  } catch (error) {
    res.status(500).json({ error: 'Failed to add time entry' });
  }
});

export { router as taskRoutes };

