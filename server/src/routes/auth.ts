import express from 'express';
import rateLimit from 'express-rate-limit';
import bcrypt from 'bcryptjs';
import jwt, { SignOptions } from 'jsonwebtoken';
import { PrismaClient } from '@prisma/client';
import { registerSchema, loginSchema } from '../utils/validation.js';
import { authenticate, AuthRequest } from '../middleware/auth.js';
import { JWT_SECRET, JWT_EXPIRES_IN, NODE_ENV } from '../config/env.js';

const router = express.Router();
const prisma = new PrismaClient();

// Rate limiting for auth routes (more lenient in development)
// Note: Express must have trust proxy enabled (set in index.ts) for this to work behind CapRover/NGINX
const authLimiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: NODE_ENV === 'production' ? 5 : 100, // 5 in production, 100 in development
  message: 'Too many login attempts, please try again later',
  standardHeaders: true,
  legacyHeaders: false,
});

// Register
router.post('/register', authLimiter, async (req, res) => {
  try {
    const data = registerSchema.parse(req.body);
    
    // Check if user exists
    const existingUser = await prisma.user.findUnique({
      where: { email: data.email }
    });

    if (existingUser) {
      return res.status(400).json({ error: 'Email already registered' });
    }

    // Hash password
    const hashedPassword = await bcrypt.hash(data.password, 10);

    // Create user
    const user = await prisma.user.create({
      data: {
        email: data.email,
        password: hashedPassword,
        name: data.name,
      }
    });

    // Create default workspace
    const workspace = await prisma.workspace.create({
      data: {
        name: 'Personal',
        description: 'My personal workspace',
        userId: user.id,
      }
    });

    // Generate token
    const token = jwt.sign(
      { userId: user.id, role: user.role },
      JWT_SECRET,
      { expiresIn: JWT_EXPIRES_IN } as SignOptions
    );

    res.status(201).json({
      user: {
        id: user.id,
        email: user.email,
        name: user.name,
        role: user.role,
      },
      token,
      defaultWorkspace: {
        id: workspace.id,
        name: workspace.name,
      }
    });
  } catch (error: any) {
    if (error.name === 'ZodError') {
      return res.status(400).json({ error: error.errors[0].message });
    }
    res.status(500).json({ error: 'Failed to register user' });
  }
});

// Login
router.post('/login', authLimiter, async (req, res) => {
  try {
    const data = loginSchema.parse(req.body);

    // Find user
    const user = await prisma.user.findUnique({
      where: { email: data.email }
    });

    if (!user) {
      return res.status(401).json({ error: 'Invalid email or password' });
    }

    // Verify password
    const isValid = await bcrypt.compare(data.password, user.password);

    if (!isValid) {
      return res.status(401).json({ error: 'Invalid email or password' });
    }

    // Generate token
    const token = jwt.sign(
      { userId: user.id, role: user.role },
      JWT_SECRET,
      { expiresIn: JWT_EXPIRES_IN } as SignOptions
    );

    // Create session (optional - don't fail login if this fails)
    try {
      await prisma.session.create({
        data: {
          userId: user.id,
          token,
          expiresAt: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000), // 7 days
        }
      });
    } catch (sessionError: any) {
      // Log but don't fail login if session creation fails
      console.warn('Session creation failed (non-critical):', sessionError.message);
    }

    res.json({
      user: {
        id: user.id,
        email: user.email,
        name: user.name,
        role: user.role,
      },
      token
    });
  } catch (error: any) {
    // Log error for debugging
    console.error('Login error:', error);
    
    if (error.name === 'ZodError') {
      return res.status(400).json({ error: error.errors[0].message });
    }
    
    // Provide more details in development
    const errorMessage = process.env.NODE_ENV === 'production' 
      ? 'Failed to login' 
      : `Failed to login: ${error.message || error.toString()}`;
    
    res.status(500).json({ error: errorMessage });
  }
});

// Get current user
router.get('/me', authenticate, async (req: AuthRequest, res) => {
  try {
    const user = await prisma.user.findUnique({
      where: { id: req.userId! },
      select: {
        id: true,
        email: true,
        name: true,
        role: true,
        preferredCurrency: true,
        createdAt: true,
      }
    });

    res.json({ user });
  } catch (error) {
    res.status(500).json({ error: 'Failed to fetch user' });
  }
});

// Update user preferences
router.put('/preferences', authenticate, async (req: AuthRequest, res) => {
  try {
    const { preferredCurrency, name } = req.body;

    const updateData: any = {};
    if (preferredCurrency !== undefined) updateData.preferredCurrency = preferredCurrency;
    if (name !== undefined) updateData.name = name;

    const user = await prisma.user.update({
      where: { id: req.userId! },
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
    res.status(500).json({ error: error.message || 'Failed to update preferences' });
  }
});

// Logout
router.post('/logout', authenticate, async (req: AuthRequest, res) => {
  try {
    const token = req.headers.authorization?.replace('Bearer ', '');
    
    if (token) {
      await prisma.session.deleteMany({
        where: { token }
      });
    }

    res.json({ message: 'Logged out successfully' });
  } catch (error) {
    res.status(500).json({ error: 'Failed to logout' });
  }
});

export { router as authRoutes };

