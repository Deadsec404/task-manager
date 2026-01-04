/**
 * Server Entry Point
 * 
 * IMPORTANT: Environment validation MUST happen before any imports that use Prisma.
 * The config/env module validates DATABASE_URL before Prisma Client is initialized.
 */

// Validate environment variables FIRST (before Prisma imports)
import { PORT, FRONTEND_URL } from './config/env.js';

import express from 'express';
import cors from 'cors';
import path from 'path';
import { fileURLToPath } from 'url';
import { authRoutes } from './routes/auth.js';
import { workspaceRoutes } from './routes/workspaces.js';
import { taskRoutes } from './routes/tasks.js';
import { expenseRoutes } from './routes/expenses.js';
import { dashboardRoutes } from './routes/dashboard.js';
import { habitRoutes } from './routes/habits.js';
import { reportRoutes } from './routes/reports.js';
import { adminRoutes } from './routes/admin.js';
import { errorHandler } from './middleware/errorHandler.js';

const app = express();

// Trust proxy - required when behind reverse proxy (CapRover/NGINX)
app.set('trust proxy', 1);

// Get directory paths for ES modules
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Middleware
const allowedOrigins = FRONTEND_URL 
  ? [FRONTEND_URL] 
  : ['http://localhost:5173', 'http://localhost:5174'];

app.use(cors({
  origin: (origin, callback) => {
    // Allow requests with no origin (like mobile apps or curl requests)
    if (!origin) return callback(null, true);
    if (allowedOrigins.indexOf(origin) !== -1) {
      callback(null, true);
    } else {
      callback(null, true); // Allow all origins in development
    }
  },
  credentials: true
}));
app.use(express.json());

// Routes
app.use('/api/auth', authRoutes);
app.use('/api/workspaces', workspaceRoutes);
app.use('/api/tasks', taskRoutes);
app.use('/api/expenses', expenseRoutes);
app.use('/api/dashboard', dashboardRoutes);
app.use('/api/habits', habitRoutes);
app.use('/api/reports', reportRoutes);
app.use('/api/admin', adminRoutes);

// Health check
app.get('/api/health', (req, res) => {
  res.json({ status: 'ok', timestamp: new Date().toISOString() });
});

// Serve static files from public directory (frontend build)
// Only in production - in development, frontend runs separately
const publicPath = path.join(__dirname, '../public');
if (process.env.NODE_ENV === 'production') {
  app.use(express.static(publicPath));
}

// API routes must be before the catch-all route
// Root route - serve frontend for non-API routes
app.get('/', (req, res) => {
  // In production, serve the frontend index.html
  if (process.env.NODE_ENV === 'production') {
    res.sendFile(path.join(publicPath, 'index.html'));
  } else {
    res.json({ 
      message: 'Task Management API Server',
      version: '1.0.0',
      endpoints: {
        health: '/api/health',
        auth: '/api/auth',
        workspaces: '/api/workspaces',
        tasks: '/api/tasks',
        expenses: '/api/expenses',
        dashboard: '/api/dashboard',
        habits: '/api/habits',
        reports: '/api/reports'
      },
      docs: 'Access the frontend at http://localhost:5173'
    });
  }
});

// Catch-all handler: send back React's index.html file for client-side routing
app.get('*', (req, res) => {
  // Only serve index.html for non-API routes in production
  if (!req.path.startsWith('/api')) {
    if (process.env.NODE_ENV === 'production') {
      res.sendFile(path.join(publicPath, 'index.html'));
    } else {
      // In development, frontend runs separately on port 5173
      res.status(404).json({ 
        error: 'Route not found',
        message: 'This is the API server. In development, access the frontend at http://localhost:5173',
        apiEndpoints: {
          health: '/api/health',
          auth: '/api/auth',
          workspaces: '/api/workspaces',
          tasks: '/api/tasks',
          expenses: '/api/expenses',
          dashboard: '/api/dashboard',
          habits: '/api/habits',
          reports: '/api/reports'
        }
      });
    }
  } else {
    res.status(404).json({ error: 'Route not found' });
  }
});

// Error handling
app.use(errorHandler);

app.listen(PORT, () => {
  console.log(`🚀 Server running on http://localhost:${PORT}`);
});

