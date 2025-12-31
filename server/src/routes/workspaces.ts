import express from 'express';
import { PrismaClient } from '@prisma/client';
import { authenticate, AuthRequest } from '../middleware/auth.js';
import { workspaceSchema } from '../utils/validation.js';

const router = express.Router();
const prisma = new PrismaClient();

// Get all workspaces for user
router.get('/', authenticate, async (req: AuthRequest, res) => {
  try {
    const workspaces = await prisma.workspace.findMany({
      where: { userId: req.userId! },
      orderBy: { createdAt: 'desc' }
    });

    res.json({ workspaces });
  } catch (error) {
    res.status(500).json({ error: 'Failed to fetch workspaces' });
  }
});

// Get workspace by ID
router.get('/:id', authenticate, async (req: AuthRequest, res) => {
  try {
    const workspace = await prisma.workspace.findFirst({
      where: {
        id: req.params.id,
        userId: req.userId!
      }
    });

    if (!workspace) {
      return res.status(404).json({ error: 'Workspace not found' });
    }

    res.json({ workspace });
  } catch (error) {
    res.status(500).json({ error: 'Failed to fetch workspace' });
  }
});

// Create workspace
router.post('/', authenticate, async (req: AuthRequest, res) => {
  try {
    const data = workspaceSchema.parse(req.body);

    const workspace = await prisma.workspace.create({
      data: {
        ...data,
        userId: req.userId!
      }
    });

    res.status(201).json({ workspace });
  } catch (error: any) {
    if (error.name === 'ZodError') {
      return res.status(400).json({ error: error.errors[0].message });
    }
    res.status(500).json({ error: 'Failed to create workspace' });
  }
});

// Update workspace
router.put('/:id', authenticate, async (req: AuthRequest, res) => {
  try {
    const data = workspaceSchema.parse(req.body);

    // Verify ownership
    const existing = await prisma.workspace.findFirst({
      where: {
        id: req.params.id,
        userId: req.userId!
      }
    });

    if (!existing) {
      return res.status(404).json({ error: 'Workspace not found' });
    }

    const workspace = await prisma.workspace.update({
      where: { id: req.params.id },
      data
    });

    res.json({ workspace });
  } catch (error: any) {
    if (error.name === 'ZodError') {
      return res.status(400).json({ error: error.errors[0].message });
    }
    res.status(500).json({ error: 'Failed to update workspace' });
  }
});

// Delete workspace
router.delete('/:id', authenticate, async (req: AuthRequest, res) => {
  try {
    // Verify ownership
    const existing = await prisma.workspace.findFirst({
      where: {
        id: req.params.id,
        userId: req.userId!
      }
    });

    if (!existing) {
      return res.status(404).json({ error: 'Workspace not found' });
    }

    await prisma.workspace.delete({
      where: { id: req.params.id }
    });

    res.json({ message: 'Workspace deleted successfully' });
  } catch (error) {
    res.status(500).json({ error: 'Failed to delete workspace' });
  }
});

export { router as workspaceRoutes };

